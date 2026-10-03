import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const htaccess = readFileSync('public/.htaccess', 'utf8');

describe('public/.htaccess', () => {
  it('sends www to the apex before the HTTP upgrade, with a loop guard', () => {
    const www = htaccess.indexOf('www\\.playhubplace\\.com');
    const httpsOff = htaccess.indexOf('%{HTTPS} off');
    const forwarded = htaccess.indexOf('%{HTTP:X-Forwarded-Proto} !https');
    expect(www).toBeGreaterThan(-1);
    expect(httpsOff).toBeGreaterThan(www);
    expect(forwarded).toBeGreaterThan(httpsOff);
    expect(htaccess).toContain('https://playhubplace.com%{REQUEST_URI}');
    expect(htaccess).not.toContain('/index.html');
    expect(htaccess).toContain('ErrorDocument 404 /404.html');
    expect(htaccess).not.toContain('X-Robots-Tag');
  });

  it('sends the reaction and CPS tools to originals before the generic tool rule', () => {
    const reaction = htaccess.indexOf('tool-reaction|reaction-test');
    const cps = htaccess.indexOf('tool-cps|cps-test');
    const generic = htaccess.indexOf('page=tool-');
    expect(reaction).toBeGreaterThan(-1);
    expect(cps).toBeGreaterThan(reaction);
    expect(generic).toBeGreaterThan(cps);
    expect(htaccess).toContain(
      'https://playhubplace.com/originals/reaction-time-test/?',
    );
    expect(htaccess).toContain('https://playhubplace.com/originals/cps-test/?');
    expect(htaccess).toContain('https://workutilities.com/?');
  });

  it('allows the game frame the five features, for this site and GamePix only', () => {
    const line = htaccess
      .split('\n')
      .find((row) => row.includes('Permissions-Policy'));
    expect(line).toBeDefined();
    expect(line).not.toContain('\\');
    const value = line?.slice(line.indexOf("'") + 1, line.lastIndexOf("'")) ?? '';
    for (const feature of [
      'fullscreen',
      'autoplay',
      'gamepad',
      'accelerometer',
      'gyroscope',
    ]) {
      expect(value).toContain(
        `${feature}=(self "https://play.gamepix.com")`,
      );
    }
    expect(value.split(',').length).toBe(5);
  });
});
