export type PixelSize = { width: number; height: number };

function readUint32BE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 4 > bytes.length) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(offset);
}

function readUint16BE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 2 > bytes.length) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(offset);
}

function readUint16LE(bytes: Uint8Array, offset: number): number | null {
  if (offset + 2 > bytes.length) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint16(offset, true);
}

function readUint24LE(bytes: Uint8Array, offset: number): number | null {
  const b0 = bytes[offset];
  const b1 = bytes[offset + 1];
  const b2 = bytes[offset + 2];
  if (b0 === undefined || b1 === undefined || b2 === undefined) return null;
  return b0 + b1 * 256 + b2 * 65536;
}

function pngSize(bytes: Uint8Array): PixelSize | null {
  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);
  if (width == null || height == null || width === 0 || height === 0)
    return null;
  return { width, height };
}

function gifSize(bytes: Uint8Array): PixelSize | null {
  const width = readUint16LE(bytes, 6);
  const height = readUint16LE(bytes, 8);
  if (width == null || height == null || width === 0 || height === 0)
    return null;
  return { width, height };
}

function jpegSize(bytes: Uint8Array): PixelSize | null {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === undefined) return null;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = readUint16BE(bytes, offset + 2);
    if (length == null || length < 2) return null;
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      const height = readUint16BE(bytes, offset + 5);
      const width = readUint16BE(bytes, offset + 7);
      if (width == null || height == null || width === 0 || height === 0)
        return null;
      return { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(bytes: Uint8Array): PixelSize | null {
  const chunk = String.fromCharCode(
    bytes[12] ?? 0,
    bytes[13] ?? 0,
    bytes[14] ?? 0,
    bytes[15] ?? 0,
  );
  if (chunk === 'VP8X') {
    const width = readUint24LE(bytes, 24);
    const height = readUint24LE(bytes, 27);
    if (width == null || height == null) return null;
    return { width: width + 1, height: height + 1 };
  }
  if (chunk === 'VP8 ') {
    const width = readUint16LE(bytes, 26);
    const height = readUint16LE(bytes, 28);
    if (width == null || height == null) return null;
    return { width: width & 0x3fff, height: height & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const b1 = bytes[21];
    const b2 = bytes[22];
    const b3 = bytes[23];
    const b4 = bytes[24];
    if (
      b1 === undefined ||
      b2 === undefined ||
      b3 === undefined ||
      b4 === undefined
    )
      return null;
    const width = 1 + (((b2 & 0x3f) << 8) | b1);
    const height = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
    return { width, height };
  }
  return null;
}

export function imageSize(bytes: Uint8Array): PixelSize | null {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50)
    return pngSize(bytes);
  if (bytes.length >= 10 && bytes[0] === 0x47 && bytes[1] === 0x49)
    return gifSize(bytes);
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8)
    return jpegSize(bytes);
  if (
    bytes.length >= 30 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45
  ) {
    return webpSize(bytes);
  }
  return null;
}
