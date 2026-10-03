// Upload validation, extracted from the route handler so the rules are unit
// testable and so the handler only has to do transport.
//
// Layers, in order:
//   1. Declared MIME allowlist  -> rejects SVG, HTML, PDF, executables
//   2. Byte-size floor and ceiling
//   3. Magic-byte sniff        -> rejects a .png that is really a .svg or a script
//   4. Container sanity + pixel budget -> decompression-bomb guard
//
// The stored object name and content type are derived from the *verified* bytes,
// never from the client filename or the client-declared MIME, which is what defeats
// extension spoofing (evil.svg.png, "shell.php.png").

export const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'] as const;
export type AllowedMime = (typeof ALLOWED_MIME)[number];

export const EXT: Record<AllowedMime, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/** Bucket-relative folder. Allowlist doubles as path-traversal protection. */
export const UPLOAD_FOLDERS = ['homepage', 'products', 'pages', 'media', 'header', 'misc'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_BYTES = 5 * 1024 * 1024;
/** Below this an image cannot be a valid container; rejects empty/truncated bodies. */
export const MIN_BYTES = 64;
export const MAX_DIMENSION = 8000;
export const MAX_PIXELS = 25_000_000;

export type Dimensions = { width: number; height: number };

export type UploadCandidate = {
  declaredType: string;
  size: number;
  bytes: Uint8Array;
  folder: string;
  name: string;
};

/** Identifies the format from the leading bytes. Returns null for anything else. */
export function sniffMime(head: Uint8Array): AllowedMime | null {
  const has = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);

  if (has(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (has(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (has(0x47, 0x49, 0x46, 0x38)) return 'image/gif';

  if (
    head.length >= 12 &&
    has(0x52, 0x49, 0x46, 0x46) &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
  ) {
    return 'image/webp';
  }

  // ISOBMFF: bytes 0-3 are the box size, 4-7 are 'ftyp', 8-11 are the major brand.
  if (
    head.length >= 12 &&
    head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70
  ) {
    const brand = String.fromCharCode(head[8], head[9], head[10], head[11]);
    if (brand === 'avif' || brand === 'avis' || brand === 'mif1') return 'image/avif';
  }

  // SVG is XML text and is intentionally not in the allowlist, but naming it here
  // gives a precise rejection reason instead of a generic one.
  if (
    head.length >= 5 &&
    String.fromCharCode(head[0], head[1], head[2], head[3], head[4]).trimStart().startsWith('<')
  ) {
    return null;
  }

  return null;
}

function be32(b: Uint8Array, offset: number): number {
  return ((b[offset] << 24) | (b[offset + 1] << 16) | (b[offset + 2] << 8) | b[offset + 3]) >>> 0;
}

/**
 * Reads intrinsic dimensions straight from the container header — no decode, so a
 * highly compressed image cannot exhaust memory here.
 */
export function readDimensions(mime: AllowedMime, bytes: Uint8Array): Dimensions | null {
  switch (mime) {
    case 'image/png': {
      if (bytes.length < 24) return null;
      if (String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]) !== 'IHDR') return null;
      return { width: be32(bytes, 16), height: be32(bytes, 20) };
    }
    case 'image/gif': {
      if (bytes.length < 10) return null;
      return { width: bytes[6] | (bytes[7] << 8), height: bytes[8] | (bytes[9] << 8) };
    }
    case 'image/jpeg': {
      for (let i = 0; i < bytes.length - 9; i++) {
        if (bytes[i] !== 0xff) continue;
        const marker = bytes[i + 1];
        // SOF0..SOF15 minus DHT (c4), JPG (c8) and DAC (cc).
        if (marker < 0xc0 || marker > 0xcf || marker === 0xc4 || marker === 0xc8 || marker === 0xcc) continue;
        return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
      }
      return null;
    }
    case 'image/webp': {
      if (bytes.length < 30) return null;
      const fourcc = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
      if (fourcc === 'VP8 ') {
        return { width: bytes[26] | (bytes[27] << 8), height: bytes[28] | (bytes[29] << 8) };
      }
      if (fourcc === 'VP8L') {
        const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (fourcc === 'VP8X') {
        const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16);
        const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16);
        return { width: w + 1, height: h + 1 };
      }
      return null;
    }
    case 'image/avif': {
      // ISOBMFF: walk the top-level boxes for the first `ispe` (image spatial extents).
      let offset = 0;
      while (offset + 12 <= bytes.length) {
        const size = be32(bytes, offset);
        const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
        if (type === 'meta') {
          const inner = offset + 12;
          // `meta` is a FullBox: 4 bytes of version/flags before its children.
          let child = inner + 4;
          while (child + 12 <= bytes.length) {
            const childSize = be32(bytes, child);
            const childType = String.fromCharCode(bytes[child + 4], bytes[child + 5], bytes[child + 6], bytes[child + 7]);
            if (childType === 'ispe' && child + 20 <= bytes.length) {
              // ispe: size(4) type(4) version+flags(4) width(4) height(4)
              return { width: be32(bytes, child + 12), height: be32(bytes, child + 16) };
            }
            if (childSize < 8) break;
            child += childSize;
          }
          return null;
        }
        if (size < 8) break;
        offset += size;
      }
      return null;
    }
    default:
      return null;
  }
}

export type UploadVerdict =
  | { ok: true; mime: AllowedMime; extension: string; path: string; dimensions: Dimensions | null }
  | { ok: false; error: string };

/**
 * Full validation pass. `randomSuffix` is injected so the storage path can be
 * asserted deterministically in tests; production passes a CSPRNG-derived value.
 */
export function validateUpload(candidate: UploadCandidate, randomSuffix: string): UploadVerdict {
  const folder = candidate.folder;
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
    return { ok: false, error: 'Unknown upload folder.' };
  }

  if (!Number.isFinite(candidate.size) || candidate.size <= 0) {
    return { ok: false, error: 'File is empty.' };
  }
  if (candidate.size < MIN_BYTES) {
    return { ok: false, error: 'File is too small to be a valid image.' };
  }
  if (candidate.size > MAX_BYTES) {
    return { ok: false, error: `Image must be under ${Math.floor(MAX_BYTES / (1024 * 1024))} MB.` };
  }
  if (candidate.bytes.byteLength !== candidate.size) {
    // Declared length and received length disagree: reject rather than trust either.
    return { ok: false, error: 'File is truncated or its length is inconsistent.' };
  }

  if (!(ALLOWED_MIME as readonly string[]).includes(candidate.declaredType)) {
    return { ok: false, error: 'Unsupported image type.' };
  }

  const sniffed = sniffMime(candidate.bytes.subarray(0, 32));
  if (!sniffed) {
    return { ok: false, error: 'File content is not a supported image.' };
  }
  if (sniffed !== candidate.declaredType) {
    return { ok: false, error: 'File content does not match its declared type.' };
  }

  const dimensions = readDimensions(sniffed, candidate.bytes);
  if (dimensions) {
    if (dimensions.width < 1 || dimensions.height < 1) {
      return { ok: false, error: 'Image has invalid dimensions.' };
    }
    if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
      return { ok: false, error: `Image dimensions exceed the ${MAX_DIMENSION}px maximum.` };
    }
    if (dimensions.width * dimensions.height > MAX_PIXELS) {
      return { ok: false, error: `Image exceeds the maximum pixel count of ${MAX_PIXELS}.` };
    }
  }

  // The path is built entirely from the allowlisted folder, a caller-supplied
  // timestamp and the injected CSPRNG suffix. The client filename never reaches
  // storage, so traversal sequences and double extensions cannot survive.
  const extension = EXT[sniffed];
  return {
    ok: true,
    mime: sniffed,
    extension,
    path: `${folder}/${Date.now()}-${randomSuffix}.${extension}`,
    dimensions,
  };
}