import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import crc from "crc";

import { Key } from "./keys";
import { toIdentity } from "./cose";

export type Identity = Buffer;

const ANONYMOUS = Buffer.from([0x00]);

export function anonymous(): Identity {
  return ANONYMOUS;
}

export function fromBuffer(buffer: Uint8Array): Identity {
  return Buffer.from(buffer);
}

export function toBuffer(identity?: Identity): Buffer {
  return identity as Buffer;
}

export function fromPublicKey(key: Key): Identity {
  return toIdentity(key);
}

export function fromString(string: string): Identity {
  if (string === "oaa") {
    return ANONYMOUS;
  }
  const base32Identity = string.slice(1, -2).toUpperCase();
  const identity = base32Decode(base32Identity, "RFC4648");
  return Buffer.from(identity);
}

export function toString(identity?: Identity): string {
  if (!identity || identity === ANONYMOUS) {
    return "oaa";
  }
  const checksum = Buffer.allocUnsafe(3);
  checksum.writeUInt16BE(crc.crc16(identity), 0);

  const leader = "o";
  const base32Identity = base32Encode(identity, "RFC4648").slice(0, -1);
  const base32Checksum = base32Encode(checksum, "RFC4648").slice(0, 2);
  return (leader + base32Identity + base32Checksum).toLowerCase();
}

export function fromHex(hex: string): Identity {
  return Buffer.from(hex, "hex");
}

export function toHex(identity?: Identity): string {
  if (!identity) {
    return "00";
  }
  return identity.toString("hex");
}

export function subresource(identity: Identity, id: number): Identity {
  let bytes = Buffer.from(identity.slice(0, 29));
  bytes[0] = 0x80 + ((id & 0x7f000000) >> 24);
  const subresourceBytes = Buffer.from([
    (id & 0x00ff0000) >> 16,
    (id & 0x0000ff00) >> 8,
    id & 0x000000ff,
  ]);
  return Buffer.concat([bytes, subresourceBytes]);
}
