import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const NIGHT = [0x14, 0x0b, 0x33];

async function corner(file: string) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  return { channels: info.channels, width: info.width, height: info.height, rgb: [data[0], data[1], data[2]] };
}

describe('brand assets', () => {
  it('keeps the full logo on a night background', async () => {
    const logo = await corner('public/logo.png');
    expect(logo).toMatchObject({ channels: 3, width: 512, height: 512, rgb: NIGHT });
    const icon = await corner('public/icon-512.png');
    expect(icon).toMatchObject({ width: 512, height: 512, rgb: NIGHT });
    const small = await corner('public/icon-192.png');
    expect(small).toMatchObject({ width: 192, height: 192, rgb: NIGHT });
    const apple = await corner('public/apple-touch-icon.png');
    expect(apple).toMatchObject({ width: 180, height: 180, rgb: NIGHT });
    const mask = await corner('public/icon-maskable-512.png');
    expect(mask).toMatchObject({ width: 512, height: 512, rgb: NIGHT });
    const card = await corner('public/og-default.png');
    expect(card).toMatchObject({ channels: 3, width: 1200, height: 630, rgb: NIGHT });
  });

  it('uses a separate maskable icon and the new favicon', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as {
      icons: { src: string; purpose?: string }[];
    };
    const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable');
    expect(maskable.map((icon) => icon.src)).toEqual(['/icon-maskable-512.png']);
    expect(manifest.icons.some((icon) => icon.src === '/logo.png')).toBe(false);
    const ico = readFileSync('public/favicon.ico');
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(2);
    expect(ico.readUInt8(6)).toBe(16);
    expect(ico.readUInt8(22)).toBe(32);
    const svg = readFileSync('public/favicon.svg', 'utf8');
    expect(svg).toContain('rx="22"');
    expect(svg).toContain('#140B33');
    const layout = readFileSync('app/layout.tsx', 'utf8');
    expect(layout).toContain('/favicon.svg');
    expect(layout).not.toContain('playlogo.svg');
  });
});
