/**
 * Draws the public brand files from public/brand/playlogo.svg.
 * The PNGs and favicon.ico are committed. `npm run build` does not run this.
 *
 * The caption uses Anek Latin weight 500. Regenerating it needs Python
 * packages fonttools and uharfbuzz, and network access for the font file.
 * Set BRAND_PYTHON to that interpreter.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import sharp, { type OverlayOptions } from 'sharp';

const NIGHT = '#140B33';
const NIGHT_RGB = [0x14, 0x0b, 0x33] as const;
const SOURCE = 'public/brand/playlogo.svg';
const LOGO_RATIO = 61 / 147;
const SIDE_PAD = 0.12;
const MASK_RATIO = 0.6;

function woffToSfnt(woff: Buffer): Buffer {
  if (woff.toString('ascii', 0, 4) !== 'wOFF') throw new Error('Anek download was not a WOFF file.');
  const flavor = woff.subarray(4, 8);
  const numTables = woff.readUInt16BE(12);
  const tables: { tag: Buffer; checksum: number; data: Buffer }[] = [];
  for (let index = 0; index < numTables; index += 1) {
    const at = 44 + index * 20;
    const tag = woff.subarray(at, at + 4);
    const offset = woff.readUInt32BE(at + 4);
    const compLength = woff.readUInt32BE(at + 8);
    const origLength = woff.readUInt32BE(at + 12);
    const checksum = woff.readUInt32BE(at + 16);
    const compressed = woff.subarray(offset, offset + compLength);
    const data = compLength === origLength ? Buffer.from(compressed) : inflateSync(compressed);
    if (data.length !== origLength) throw new Error(`Bad font table ${tag.toString()}.`);
    tables.push({ tag, checksum, data });
  }
  tables.sort((a, b) => Buffer.compare(a.tag, b.tag));
  let cursor = 12 + 16 * numTables;
  const placed = tables.map((table) => {
    const offset = cursor;
    cursor += table.data.length + ((4 - (table.data.length % 4)) % 4);
    return { ...table, offset };
  });
  const out = Buffer.alloc(cursor);
  flavor.copy(out, 0);
  out.writeUInt16BE(numTables, 4);
  const searchRange = 2 ** Math.floor(Math.log2(numTables)) * 16;
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(Math.floor(Math.log2(numTables)), 8);
  out.writeUInt16BE(numTables * 16 - searchRange, 10);
  placed.forEach((table, index) => {
    const at = 12 + index * 16;
    table.tag.copy(out, at);
    out.writeUInt32BE(table.checksum, at + 4);
    out.writeUInt32BE(table.offset, at + 8);
    out.writeUInt32BE(table.data.length, at + 12);
    table.data.copy(out, table.offset);
  });
  return out;
}

async function anekFile(): Promise<string> {
  const css = await fetch('https://fonts.googleapis.com/css2?family=Anek+Latin:wght@500&display=swap', {
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko' },
  }).then((response) => {
    if (!response.ok) throw new Error(`Anek CSS failed (${response.status}).`);
    return response.text();
  });
  const url = css.match(/url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error('Anek CSS had no font file.');
  const woff = Buffer.from(await (await fetch(url)).arrayBuffer());
  mkdirSync('/tmp/ph-brand', { recursive: true });
  const path = '/tmp/ph-brand/AnekLatin-500.ttf';
  writeFileSync(path, woffToSfnt(woff));
  return path;
}

async function caption(height: number): Promise<Buffer> {
  const font = await anekFile();
  const svgPath = '/tmp/ph-brand/caption.svg';
  const python = process.env.BRAND_PYTHON ?? 'python3';
  const run = spawnSync(python, ['scripts/brand-caption.py', font, 'Free online games', svgPath], {
    stdio: 'inherit',
  });
  if (run.status !== 0) {
    throw new Error('Caption failed. Install fonttools and uharfbuzz, then set BRAND_PYTHON.');
  }
  return sharp(readFileSync(svgPath)).resize({ height }).png().toBuffer();
}

async function rasterLogo(width: number): Promise<Buffer> {
  const height = Math.max(1, Math.round(width * LOGO_RATIO));
  return sharp(readFileSync(SOURCE), { density: 600 })
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();
}

async function plate(width: number, height: number, layers: OverlayOptions[]): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: NIGHT },
  })
    .composite(layers)
    .flatten({ background: NIGHT })
    .removeAlpha()
    .png()
    .toBuffer();
}

async function square(size: number, contentRatio: number): Promise<Buffer> {
  const logo = await rasterLogo(Math.round(size * contentRatio));
  return plate(size, size, [{ input: logo, gravity: 'centre' }]);
}

function faviconSvg(source: string): string {
  const inner = source.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  const width = 100 * (1 - SIDE_PAD * 2);
  const height = width * LOGO_RATIO;
  const x = 100 * SIDE_PAD;
  const y = (100 - height) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="${NIGHT}"/>
  <svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" viewBox="0 0 147 61">
    ${inner}
  </svg>
</svg>
`;
}

function ico(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  const parts: Buffer[] = [header];
  images.forEach((image, index) => {
    const at = 6 + index * 16;
    header.writeUInt8(image.size, at);
    header.writeUInt8(image.size, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(image.png.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += image.png.length;
    parts.push(image.png);
  });
  return Buffer.concat(parts);
}

async function assertNight(file: string, clearRatio: number) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 3) throw new Error(`${file} has an alpha channel.`);
  const pixel = (x: number, y: number): number[] => {
    const at = (y * info.width + x) * 3;
    return [data[at] ?? 0, data[at + 1] ?? 0, data[at + 2] ?? 0];
  };
  const night = (rgb: readonly number[]) =>
    rgb[0] === NIGHT_RGB[0] && rgb[1] === NIGHT_RGB[1] && rgb[2] === NIGHT_RGB[2];
  for (const point of [
    pixel(0, 0),
    pixel(info.width - 1, 0),
    pixel(0, info.height - 1),
    pixel(info.width - 1, info.height - 1),
  ]) {
    if (!night(point)) throw new Error(`${file} corner is not night.`);
  }
  const margin = Math.floor(Math.min(info.width, info.height) * clearRatio);
  for (let y = 0; y < info.height; y += 4) {
    for (const x of [2, margin - 1, info.width - margin, info.width - 3]) {
      if (x < 0 || x >= info.width) continue;
      if (!night(pixel(x, y))) throw new Error(`${file} draws into the padding.`);
    }
  }
}

const source = readFileSync(SOURCE, 'utf8');
const favicon = faviconSvg(source);
writeFileSync('public/favicon.svg', favicon);

writeFileSync('public/logo.png', await square(512, 1 - SIDE_PAD * 2));
writeFileSync('public/icon-192.png', await square(192, 1 - SIDE_PAD * 2));
writeFileSync('public/icon-512.png', await square(512, 1 - SIDE_PAD * 2));
writeFileSync('public/apple-touch-icon.png', await square(180, 1 - SIDE_PAD * 2));
writeFileSync('public/icon-maskable-512.png', await square(512, MASK_RATIO));

const logo = await rasterLogo(840);
const line = await caption(44);
const logoMeta = await sharp(logo).metadata();
const lineMeta = await sharp(line).metadata();
const gap = 28;
const block = (logoMeta.height ?? 0) + gap + (lineMeta.height ?? 0);
const top = Math.round((630 - block) / 2);
writeFileSync(
  'public/og-default.png',
  await plate(1200, 630, [
    { input: logo, left: Math.round((1200 - (logoMeta.width ?? 0)) / 2), top },
    {
      input: line,
      left: Math.round((1200 - (lineMeta.width ?? 0)) / 2),
      top: top + (logoMeta.height ?? 0) + gap,
    },
  ]),
);

const faviconPng = async (size: number) =>
  sharp(Buffer.from(favicon)).resize(size, size).flatten({ background: NIGHT }).removeAlpha().png().toBuffer();
writeFileSync(
  'public/favicon.ico',
  new Uint8Array(
    ico([
      { size: 16, png: await faviconPng(16) },
      { size: 32, png: await faviconPng(32) },
    ]),
  ),
);

await assertNight('public/logo.png', SIDE_PAD);
await assertNight('public/icon-192.png', SIDE_PAD);
await assertNight('public/icon-512.png', SIDE_PAD);
await assertNight('public/apple-touch-icon.png', SIDE_PAD);
await assertNight('public/icon-maskable-512.png', (1 - MASK_RATIO) / 2);
await assertNight('public/og-default.png', 0.02);
console.log('brand assets written');
