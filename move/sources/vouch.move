module vouch::vouch;

use sui::clock::{Self, Clock};
use sui::event;
use sui::object::{Self, ID, UID};
use sui::tx_context::{Self, TxContext};
use sui::transfer;
use std::string::String;
use std::bcs;

const E_NOT_OWNER: u64 = 1;
const E_SEAL_FORBIDDEN: u64 = 2;

public struct VouchProject has key, store {
    id: UID,
    owner: address,
    title: String,
    tagline: String,
    category: String,
    manifest_blob_id: String,
    manifest_hash: String,
    latest_version: u64,
    created_at_ms: u64,
    updated_at_ms: u64,
    active: bool,
}

public struct VouchVersion has copy, drop, store {
    version_number: u64,
    manifest_blob_id: String,
    manifest_hash: String,
    note: String,
    created_at_ms: u64,
}

public struct ProjectCreated has copy, drop {
    project_id: ID,
    owner: address,
    title: String,
    manifest_blob_id: String,
    manifest_hash: String,
    created_at_ms: u64,
}

public struct ProjectUpdated has copy, drop {
    project_id: ID,
    owner: address,
    version_number: u64,
    manifest_blob_id: String,
    manifest_hash: String,
    updated_at_ms: u64,
}

public entry fun create_project(
    title: String,
    tagline: String,
    category: String,
    manifest_blob_id: String,
    manifest_hash: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let owner = tx_context::sender(ctx);
    let now = clock::timestamp_ms(clock);
    let project = VouchProject {
        id: object::new(ctx),
        owner,
        title,
        tagline,
        category,
        manifest_blob_id,
        manifest_hash,
        latest_version: 1,
        created_at_ms: now,
        updated_at_ms: now,
        active: true,
    };
    event::emit(ProjectCreated {
        project_id: object::id(&project),
        owner,
        title: project.title,
        manifest_blob_id: project.manifest_blob_id,
        manifest_hash: project.manifest_hash,
        created_at_ms: now,
    });
    transfer::public_transfer(project, owner);
}

public entry fun update_project(
    project: &mut VouchProject,
    manifest_blob_id: String,
    manifest_hash: String,
    note: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(project.owner == sender, E_NOT_OWNER);
    let now = clock::timestamp_ms(clock);
    project.latest_version = project.latest_version + 1;
    project.manifest_blob_id = manifest_blob_id;
    project.manifest_hash = manifest_hash;
    project.updated_at_ms = now;
    let _version = VouchVersion {
        version_number: project.latest_version,
        manifest_blob_id: project.manifest_blob_id,
        manifest_hash: project.manifest_hash,
        note,
        created_at_ms: now,
    };
    event::emit(ProjectUpdated {
        project_id: object::id(project),
        owner: sender,
        version_number: project.latest_version,
        manifest_blob_id: project.manifest_blob_id,
        manifest_hash: project.manifest_hash,
        updated_at_ms: now,
    });
}

public entry fun deactivate_project(project: &mut VouchProject, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    assert!(project.owner == sender, E_NOT_OWNER);
    project.active = false;
}

/// Returns the owner address of a VouchProject (for cross-module ownership checks).
public fun owner(project: &VouchProject): address {
    project.owner
}

/// Seal key servers call this (via dry-run) to authorize decryption.
/// id = ownerAddress (32 bytes) ++ random nonce — only the original owner can decrypt.
public entry fun seal_approve(id: vector<u8>, ctx: &TxContext) {
    let caller_bytes = bcs::to_bytes(&tx_context::sender(ctx));
    let n = vector::length(&caller_bytes);
    assert!(vector::length(&id) >= n, E_SEAL_FORBIDDEN);
    let mut i = 0;
    while (i < n) {
        assert!(*vector::borrow(&id, i) == *vector::borrow(&caller_bytes, i), E_SEAL_FORBIDDEN);
        i = i + 1;
    };
}
