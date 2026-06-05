module vouch_grants::grants;

use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::event;
use sui::object::{Self, ID, UID};
use sui::sui::SUI;
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use std::string::String;
use vouch::vouch::VouchProject;

const E_NOT_BUILDER: u64 = 1;
const E_NOT_FUNDER: u64 = 2;
const E_WRONG_STATUS: u64 = 3;
const E_WRONG_AMOUNT: u64 = 4;

const STATUS_OPEN: u8 = 0;
const STATUS_FUNDED: u8 = 1;
const STATUS_SUBMITTED: u8 = 2;
const STATUS_RELEASED: u8 = 3;
const STATUS_CANCELLED: u8 = 4;

public struct Milestone has key {
    id: UID,
    project_id: ID,
    builder: address,
    funder: address,
    title: String,
    description: String,
    reward_mist: u64,
    escrow: Balance<SUI>,
    status: u8,
    proof_blob_id: String,
    proof_hash: String,
    created_at_ms: u64,
    funded_at_ms: u64,
    submitted_at_ms: u64,
    released_at_ms: u64,
}

public struct MilestoneCreated has copy, drop {
    milestone_id: ID,
    project_id: ID,
    builder: address,
    title: String,
    reward_mist: u64,
    created_at_ms: u64,
}

public struct MilestoneFunded has copy, drop {
    milestone_id: ID,
    funder: address,
    reward_mist: u64,
    funded_at_ms: u64,
}

public struct ProofSubmitted has copy, drop {
    milestone_id: ID,
    project_id: ID,
    builder: address,
    proof_blob_id: String,
    proof_hash: String,
    submitted_at_ms: u64,
}

public struct FundsReleased has copy, drop {
    milestone_id: ID,
    builder: address,
    funder: address,
    reward_mist: u64,
    released_at_ms: u64,
}

public struct MilestoneCancelled has copy, drop {
    milestone_id: ID,
    funder: address,
    cancelled_at_ms: u64,
}

/// Builder creates a milestone linked to one of their VouchProject objects.
/// The builder must pass the actual VouchProject object they own, proving ownership on-chain.
public entry fun create_milestone(
    project: &VouchProject,
    title: String,
    description: String,
    reward_mist: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let builder = tx_context::sender(ctx);
    assert!(vouch::vouch::owner(project) == builder, E_NOT_BUILDER);
    let project_id = object::id(project);
    let now = clock::timestamp_ms(clock);
    let milestone = Milestone {
        id: object::new(ctx),
        project_id,
        builder,
        funder: @0x0,
        title,
        description,
        reward_mist,
        escrow: balance::zero(),
        status: STATUS_OPEN,
        proof_blob_id: std::string::utf8(b""),
        proof_hash: std::string::utf8(b""),
        created_at_ms: now,
        funded_at_ms: 0,
        submitted_at_ms: 0,
        released_at_ms: 0,
    };
    event::emit(MilestoneCreated {
        milestone_id: object::id(&milestone),
        project_id,
        builder,
        title: milestone.title,
        reward_mist,
        created_at_ms: now,
    });
    transfer::share_object(milestone);
}

/// Funder deposits exact SUI into the milestone escrow.
public entry fun fund_milestone(
    milestone: &mut Milestone,
    payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(milestone.status == STATUS_OPEN, E_WRONG_STATUS);
    assert!(coin::value(&payment) == milestone.reward_mist, E_WRONG_AMOUNT);
    let funder = tx_context::sender(ctx);
    let now = clock::timestamp_ms(clock);
    milestone.funder = funder;
    milestone.funded_at_ms = now;
    milestone.status = STATUS_FUNDED;
    balance::join(&mut milestone.escrow, coin::into_balance(payment));
    event::emit(MilestoneFunded {
        milestone_id: object::id(milestone),
        funder,
        reward_mist: milestone.reward_mist,
        funded_at_ms: now,
    });
}

/// Builder submits completion proof (Walrus blob ID + manifest hash).
public entry fun submit_proof(
    milestone: &mut Milestone,
    proof_blob_id: String,
    proof_hash: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(milestone.status == STATUS_FUNDED, E_WRONG_STATUS);
    assert!(tx_context::sender(ctx) == milestone.builder, E_NOT_BUILDER);
    let now = clock::timestamp_ms(clock);
    milestone.proof_blob_id = proof_blob_id;
    milestone.proof_hash = proof_hash;
    milestone.submitted_at_ms = now;
    milestone.status = STATUS_SUBMITTED;
    event::emit(ProofSubmitted {
        milestone_id: object::id(milestone),
        project_id: milestone.project_id,
        builder: milestone.builder,
        proof_blob_id: milestone.proof_blob_id,
        proof_hash: milestone.proof_hash,
        submitted_at_ms: now,
    });
}

/// Funder approves and releases SUI to the builder.
public entry fun release_funds(
    milestone: &mut Milestone,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(milestone.status == STATUS_SUBMITTED, E_WRONG_STATUS);
    assert!(tx_context::sender(ctx) == milestone.funder, E_NOT_FUNDER);
    let now = clock::timestamp_ms(clock);
    milestone.released_at_ms = now;
    milestone.status = STATUS_RELEASED;
    let payout = coin::from_balance(balance::withdraw_all(&mut milestone.escrow), ctx);
    event::emit(FundsReleased {
        milestone_id: object::id(milestone),
        builder: milestone.builder,
        funder: milestone.funder,
        reward_mist: milestone.reward_mist,
        released_at_ms: now,
    });
    transfer::public_transfer(payout, milestone.builder);
}

/// Funder cancels and reclaims SUI (only if builder has not yet submitted proof).
public entry fun cancel_and_refund(
    milestone: &mut Milestone,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(milestone.status == STATUS_FUNDED, E_WRONG_STATUS);
    assert!(tx_context::sender(ctx) == milestone.funder, E_NOT_FUNDER);
    let now = clock::timestamp_ms(clock);
    milestone.status = STATUS_CANCELLED;
    let refund = coin::from_balance(balance::withdraw_all(&mut milestone.escrow), ctx);
    event::emit(MilestoneCancelled {
        milestone_id: object::id(milestone),
        funder: milestone.funder,
        cancelled_at_ms: now,
    });
    transfer::public_transfer(refund, milestone.funder);
}
