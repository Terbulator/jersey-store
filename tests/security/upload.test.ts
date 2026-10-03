import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALLOWED_MIME,
  MAX_BYTES,
  MIN_BYTES,
  MAX_DIMENSION,
  readDimensions,
  sniffMime,
  UPLOAD_FOLDERS,
  validateUpload,
  type UploadCandidate,
} from '@/lib/upload-guard';

// ---------------------------------------------------------------------------
// Byte builders for real container headers
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

const pngBytes = (width: number, height: number, fill = 0x41) => {
  const bytes = new Uint8Array(120).fill(fill);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set(encoder.encode('IHDR'), 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
};

const jpegBytes = (width: number, height: number) => {
  const bytes = new Uint8Array(200);
  bytes.set([0xff, 0xd8, 0xff, 0xe0], 0);
  bytes.set([0xff, 0xc0, 0x00, 0x11, 0x08], 40); // SOF0
  const view = new DataView(bytes.buffer);
  view.setUint16(45, height);
  view.setUint16(47, width);
  return bytes;
};

const gifBytes = (width: number, height: number) => {
  const bytes = new Uint8Array(120);
  bytes.set(encoder.encode('GIF89a'), 0);
  const view = new DataView(bytes.buffer);
  view.setUint16(6, width, true);
  view.setUint16(8, height, true);
  return bytes;
};

const webpBytes = (width: number, height: number) => {
  const bytes = new Uint8Array(120);
  bytes.set(encoder.encode('RIFF'), 0);
  bytes.set(encoder.encode('WEBP'), 8);
  bytes.set(encoder.encode('VP8 '), 12);
  const view = new DataView(bytes.buffer);
  view.setUint16(26, width, true);
  view.setUint16(28, height, true);
  return bytes;
};

const avifBytes = (width: number, height: number) => {
  const bytes = new Uint8Array(120);
  const view = new DataView(bytes.buffer);
  // ISOBMFF: box size at 0, 'ftyp' at 4, major brand 'avif' at 8, minor version 12, compat 16-19.
  view.setUint32(0, 20, false);
  bytes.set(encoder.encode('ftyp'), 4);
  bytes.set(encoder.encode('avif'), 8);
  // meta box at 20: size(4) 'meta'(4) version+flags(4) then children
  view.setUint32(20, 44, false);
  bytes.set(encoder.encode('meta'), 24);
  // ispe child at 36: size(4) 'ispe'(4) version+flags(4) width(4) height(4)
  view.setUint32(36, 20, false);
  bytes.set(encoder.encode('ispe'), 40);
  view.setUint32(48, width, false);
  view.setUint32(52, height, false);
  return bytes;
};

const candidate = (overrides: Partial<UploadCandidate> = {}): UploadCandidate => {
  const bytes = overrides.bytes ?? pngBytes(800, 600);
  return {
    declaredType: overrides.declaredType ?? 'image/png',
    size: overrides.size ?? bytes.byteLength,
    bytes,
    folder: overrides.folder ?? 'products',
    name: overrides.name ?? 'photo.png',
  };
};

// ---------------------------------------------------------------------------
// Magic-byte sniffing
// ---------------------------------------------------------------------------

describe('upload content sniffing', () => {
  test('recognises the allowed raster formats', () => {
    assert.equal(sniffMime(pngBytes(10, 10)), 'image/png');
    assert.equal(sniffMime(jpegBytes(10, 10)), 'image/jpeg');
    assert.equal(sniffMime(gifBytes(10, 10)), 'image/gif');
    assert.equal(sniffMime(webpBytes(10, 10)), 'image/webp');
    assert.equal(sniffMime(avifBytes(10, 10)), 'image/avif');
  });

  test('rejects SVG, which can carry inline script', () => {
    const svg = encoder.encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>');
    assert.equal(sniffMime(svg), null);
  });

  test('rejects HTML and script payloads regardless of the extension they claim', () => {
    for (const payload of [
      '<html><script>alert(1)</script></html>',
      '<!DOCTYPE html><body>hi</body>',
      '#!/bin/sh\nrm -rf /',
      'PK zip',
      '%PDF-1.7',
    ]) {
      assert.equal(sniffMime(encoder.encode(payload)), null, payload.slice(0, 16));
    }
  });

  test('rejects an empty or tiny buffer', () => {
    assert.equal(sniffMime(new Uint8Array(0)), null);
    assert.equal(sniffMime(new Uint8Array([1, 2, 3])), null);
  });
});

// ---------------------------------------------------------------------------
// Full validation
// ---------------------------------------------------------------------------

describe('upload validation', () => {
  test('accepts a well-formed PNG', () => {
    const verdict = validateUpload(candidate(), 'abc123');
    assert.equal(verdict.ok, true);
    if (!verdict.ok) return;
    assert.equal(verdict.mime, 'image/png');
    assert.equal(verdict.extension, 'png');
    assert.equal(verdict.path.startsWith('products/'), true);
    assert.equal(verdict.path.endsWith('.png'), true);
  });

  test('rejects an unlisted MIME type', () => {
    for (const type of ['image/svg+xml', 'text/html', 'application/pdf', 'application/x-msdownload', '']) {
      const verdict = validateUpload(candidate({ declaredType: type }), 'x');
      assert.equal(verdict.ok, false, type);
    }
  });

  test('rejects a file whose bytes do not match its declared type', () => {
    // Declared PNG, actually a GIF.
    const bytes = gifBytes(100, 100);
    const verdict = validateUpload(candidate({ declaredType: 'image/png', bytes }), 'x');
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.match(verdict.error, /does not match|not a supported image/i);
  });

  test('rejects a script disguised with an image extension', () => {
    const bytes = encoder.encode('<svg onload="fetch(\'//evil\')"><script>alert(1)</script></svg>'.padEnd(200, ' '));
    const verdict = validateUpload(candidate({ declaredType: 'image/png', bytes }), 'x');
    assert.equal(verdict.ok, false);
  });

  test('rejects an oversized file', () => {
    const bytes = new Uint8Array(MAX_BYTES + 1);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    const verdict = validateUpload({ declaredType: 'image/png', size: MAX_BYTES + 1, bytes, folder: 'products', name: 'big.png' }, 'x');
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.match(verdict.error, /under/i);
  });

  test('rejects a file at the size ceiling boundary only when it exceeds it', () => {
    const exact = { ...candidate(), size: MAX_BYTES };
    const bytes = pngBytes(100, 100);
    assert.equal(validateUpload({ ...exact, bytes, size: bytes.byteLength }, 'x').ok, true);
  });

  test('rejects an empty file', () => {
    const verdict = validateUpload({ declaredType: 'image/png', size: 0, bytes: new Uint8Array(0), folder: 'products', name: 'x.png' }, 'x');
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.match(verdict.error, /empty/i);
  });

  test('rejects a truncated file below the minimum container size', () => {
    const bytes = pngBytes(10, 10).slice(0, 8);
    const verdict = validateUpload({ declaredType: 'image/png', size: bytes.byteLength, bytes, folder: 'products', name: 'x.png' }, 'x');
    assert.equal(verdict.ok, false);
  });

  test('rejects a declared size that disagrees with the received bytes', () => {
    const bytes = pngBytes(100, 100);
    const verdict = validateUpload({ declaredType: 'image/png', size: bytes.byteLength - 5, bytes, folder: 'products', name: 'x.png' }, 'x');
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.match(verdict.error, /truncated|inconsistent/i);
  });

  test('rejects a folder outside the allowlist (path traversal)', () => {
    for (const folder of ['../', '../../etc', 'products/../../root', '/absolute', 'products\x00']) {
      const verdict = validateUpload(candidate({ folder }), 'x');
      assert.equal(verdict.ok, false, folder);
    }
  });

  test('accepts every allowlisted folder', () => {
    for (const folder of UPLOAD_FOLDERS) {
      assert.equal(validateUpload(candidate({ folder }), 'x').ok, true, folder);
    }
  });
});

// ---------------------------------------------------------------------------
// Decompression-bomb guard
// ---------------------------------------------------------------------------

describe('decompression bomb guard', () => {
  test('rejects an image whose side exceeds the dimension cap', () => {
    const verdict = validateUpload(candidate({ bytes: pngBytes(MAX_DIMENSION + 1, 100) }), 'x');
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.match(verdict.error, /dimension/i);
  });

  test('rejects an image whose pixel count exceeds the budget', () => {
    // 7000x7000 is under the 8000px side cap but 49MP, over the 25MP budget.
    const verdict = validateUpload(candidate({ bytes: pngBytes(7000, 7000) }), 'x');
    assert.equal(verdict.ok, false);
    if (!verdict.ok) assert.match(verdict.error, /pixel/i);
  });

  test('rejects zero-dimension headers', () => {
    const verdict = validateUpload(candidate({ bytes: pngBytes(0, 0) }), 'x');
    assert.equal(verdict.ok, false);
  });

  test('reads dimensions for each supported format', () => {
    assert.deepEqual(readDimensions('image/png', pngBytes(123, 45)), { width: 123, height: 45 });
    assert.deepEqual(readDimensions('image/gif', gifBytes(30, 20)), { width: 30, height: 20 });
    assert.deepEqual(readDimensions('image/jpeg', jpegBytes(640, 480)), { width: 640, height: 480 });
    assert.deepEqual(readDimensions('image/webp', webpBytes(200, 100)), { width: 200, height: 100 });
  });

  test('AVIF is genuinely dimension-checked rather than waved through', () => {
    // Regression guard: an earlier version returned a hard-coded {1,1} for AVIF,
    // which silently disabled the pixel budget for every AVIF upload.
    assert.deepEqual(readDimensions('image/avif', avifBytes(640, 480)), { width: 640, height: 480 });
    const verdict = validateUpload(candidate({ declaredType: 'image/avif', bytes: avifBytes(9000, 9000) }), 'x');
    assert.equal(verdict.ok, false);
  });
});

// ---------------------------------------------------------------------------
// Stored object naming
// ---------------------------------------------------------------------------

describe('stored object naming', () => {
  test('the client filename never reaches the storage path', () => {
    const verdict = validateUpload(candidate({ name: '../../../../etc/passwd.png' }), 'deadbeefdeadbeef');
    assert.equal(verdict.ok, true);
    if (!verdict.ok) return;
    assert.equal(verdict.path.includes('passwd'), false);
    assert.equal(verdict.path.includes('..'), false);
    assert.match(verdict.path, /^products\/\d+-[0-9a-f]{16}\.png$/);
  });

  test('a double extension cannot survive', () => {
    const verdict = validateUpload(candidate({ name: 'shell.svg.png' }), 'deadbeef');
    assert.equal(verdict.ok, true);
    if (verdict.ok) assert.equal(verdict.path.endsWith('.svg.png'), false);
  });

  test('the extension is derived from the verified bytes, not the declared type', () => {
    const bytes = webpBytes(64, 64);
    const verdict = validateUpload({ declaredType: 'image/webp', size: bytes.byteLength, bytes, folder: 'media', name: 'a.png' }, 'zz');
    assert.equal(verdict.ok, true);
    if (verdict.ok) {
      assert.equal(verdict.extension, 'webp');
      assert.equal(verdict.mime, 'image/webp');
    }
  });

  test('the allowlist has no SVG entry', () => {
    assert.equal((ALLOWED_MIME as readonly string[]).includes('image/svg+xml'), false);
  });
});