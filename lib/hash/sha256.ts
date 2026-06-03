function toHex(buffer: ArrayBuffer) { return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
export async function sha256File(file: File): Promise<string> { return toHex(await crypto.subtle.digest("SHA-256", await file.arrayBuffer())); }
export async function sha256String(value: string): Promise<string> { return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))); }
