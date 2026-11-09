import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = `C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome-icon-build-${Date.now()}`;
const DEBUG_PORT = 9228;

try {
  fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
} catch {}

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${TEMP_PROFILE}`,
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForPort() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data[0];
      }
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome remote debugging did not respond');
}

/**
 * Generates the SVG for Nusuk Keys icon.
 * @param {object} opts
 * @param {boolean} opts.fullBleed - true for iOS apple-touch-icon and Android maskable icons (no transparent corners, 100% full background bleed).
 * @param {number} opts.keyScale - scale factor for key geometry to fit Android / iOS safe zones perfectly.
 */
export function buildIconSvg({ fullBleed = false, keyScale = 1.0 } = {}) {
  const bgRect = fullBleed
    ? `<rect width="512" height="512" fill="url(#sqBg)"/>
       <rect width="512" height="512" fill="url(#ambientCore)"/>`
    : `<rect x="16" y="16" width="480" height="480" rx="124" fill="url(#sqBg)"/>
       <rect x="17" y="17" width="478" height="478" rx="123" fill="none" stroke="url(#sqBevel)" stroke-width="2"/>
       <rect x="16" y="16" width="480" height="480" rx="124" fill="url(#ambientCore)"/>`;

  // Scale key around center (256, 256)
  const transform = keyScale !== 1.0
    ? `transform="translate(256, 256) scale(${keyScale}) translate(-256, -256)"`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Deep Obsidian / Dark Slate Background -->
    <radialGradient id="sqBg" cx="50%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#161822"/>
      <stop offset="50%" stop-color="#0c0e14"/>
      <stop offset="100%" stop-color="#050608"/>
    </radialGradient>

    <!-- Luxury Ambient Core Glow -->
    <radialGradient id="ambientCore" cx="42%" cy="40%" r="62%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.18"/>
      <stop offset="45%" stop-color="#10b981" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Squircle Edge Soft Bevel -->
    <linearGradient id="sqBevel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="70%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.7"/>
    </linearGradient>

    <!-- 3D Gold Extrusion Base (Volumetric Bronze Shadow) -->
    <linearGradient id="bronzeExtrusion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="40%" stop-color="#78350f"/>
      <stop offset="80%" stop-color="#542407"/>
      <stop offset="100%" stop-color="#2d1202"/>
    </linearGradient>

    <!-- 3D Gold Front Face (Radiant Polished Metallic Gold) -->
    <linearGradient id="goldPolish" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="16%" stop-color="#fde047"/>
      <stop offset="44%" stop-color="#eab308"/>
      <stop offset="76%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>

    <!-- Specular Ridge Glint -->
    <linearGradient id="goldGlint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="30%" stop-color="#fef9c3" stop-opacity="0.75"/>
      <stop offset="65%" stop-color="#fde047" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
    </linearGradient>

    <!-- Emerald Gem Core (Rich Gemstone Depth) -->
    <radialGradient id="emeraldGem" cx="35%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="25%" stop-color="#34d399"/>
      <stop offset="55%" stop-color="#10b981"/>
      <stop offset="85%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>

    <!-- Realistic Drop Shadow -->
    <filter id="keyDropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="10" dy="20" stdDeviation="16" flood-color="#000000" flood-opacity="0.75"/>
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- 1. Canvas Background -->
  ${bgRect}

  <!-- 2. Volumetric 3D Key Object with Safe-Zone Scaling -->
  <g ${transform} filter="url(#keyDropShadow)">

    <!-- LAYER A: 3D EXTRUSION SIDES -->
    <g fill="url(#bronzeExtrusion)">
      <!-- Head Cylinder Side (extruded down-right) -->
      <path d="M 109 180 
               A 90 90 0 0 0 252 236 
               L 262 246 
               A 90 90 0 0 1 119 190 Z"/>

      <!-- Stem Underbody Depth -->
      <polygon points="214,236 364,386 374,376 224,226"/>
      
      <!-- Tooth 1 Underbody -->
      <polygon points="300,284 350,234 360,244 310,294"/>

      <!-- Tooth 2 Underbody -->
      <polygon points="340,324 390,274 400,284 350,334"/>

      <!-- Tip Extrusion -->
      <polygon points="364,386 386,364 396,374 374,396"/>
    </g>

    <!-- LAYER B: FRONT 3D GEOMETRY -->
    <!-- Stem Top Surface (Chiseled 3D Rod) -->
    <polygon points="214,226 364,376 374,366 224,216" fill="url(#goldPolish)"/>
    <!-- Stem Chamfer Ridge -->
    <polygon points="214,226 364,376 368,372 218,222" fill="#d97706"/>
    <!-- Specular Highlight Line -->
    <line x1="220" y1="219" x2="368" y2="367" stroke="url(#goldGlint)" stroke-width="4.5" stroke-linecap="round"/>

    <!-- Tooth 1 (Challenge Bit) -->
    <polygon points="296,280 346,230 358,242 308,292" fill="url(#goldPolish)"/>
    <polygon points="308,292 358,242 360,244 310,294" fill="#92400e"/>
    <line x1="297" y1="279" x2="347" y2="229" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

    <!-- Tooth 2 (Key Tip Bit) -->
    <polygon points="336,320 386,270 398,282 348,332" fill="url(#goldPolish)"/>
    <polygon points="348,332 398,282 400,284 350,334" fill="#78350f"/>
    <line x1="337" y1="319" x2="387" y2="269" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>

    <!-- Tip End Cap -->
    <polygon points="364,376 386,354 390,358 368,380" fill="url(#goldPolish)"/>

    <!-- LAYER C: 3D KEY HEAD (Royal Islamic Ring) -->
    <!-- Base Ring Rim -->
    <circle cx="170" cy="170" r="90" fill="#78350f"/>
    <circle cx="166" cy="166" r="88" fill="url(#goldPolish)"/>
    
    <!-- Top-left Specular Bevel Arc -->
    <ellipse cx="162" cy="162" rx="84" ry="84" fill="none" stroke="url(#goldGlint)" stroke-width="5.5"/>
    
    <!-- Inner Recessed Dark Cavity -->
    <circle cx="166" cy="166" r="60" fill="#3f1902"/>
    <circle cx="167" cy="167" r="56" fill="#13141b"/>

    <!-- LAYER D: THE EMERALD 8-POINTED STAR JEWEL CORE (Rub el Hizb) -->
    <g transform="translate(167, 167)">
      <!-- Outer Jewel Glow -->
      <circle cx="0" cy="0" r="46" fill="#10b981" opacity="0.15"/>
      
      <!-- 8-Pointed Star: 2 Interlocking Beveled Squares -->
      <rect x="-32" y="-32" width="64" height="64" rx="7" fill="url(#emeraldGem)" transform="rotate(0)"/>
      <rect x="-32" y="-32" width="64" height="64" rx="7" fill="url(#emeraldGem)" transform="rotate(45)"/>
      
      <!-- Inner Diamond Facet Highlights -->
      <rect x="-30" y="-30" width="60" height="60" rx="6" fill="none" stroke="#a7f3d0" stroke-width="1.8" stroke-opacity="0.55" transform="rotate(0)"/>
      <rect x="-30" y="-30" width="60" height="60" rx="6" fill="none" stroke="#a7f3d0" stroke-width="1.8" stroke-opacity="0.55" transform="rotate(45)"/>

      <!-- 3D Jewel Specular Glints -->
      <ellipse cx="-7" cy="-9" rx="14" ry="9" fill="#ffffff" opacity="0.5" transform="rotate(-30)" filter="blur(2px)"/>
      <circle cx="-5" cy="-7" r="5.5" fill="#ffffff" opacity="0.95"/>
      <circle cx="8" cy="8" r="3" fill="#6ee7b7" opacity="0.6"/>
    </g>

    <!-- LAYER E: ORNAMENTAL CROWN ACCENT -->
    <circle cx="103" cy="103" r="7" fill="url(#goldPolish)"/>
    <circle cx="102" cy="102" r="3.5" fill="#ffffff" opacity="0.95"/>
  </g>
</svg>`;
}

function createPngIco(png32, png16) {
  // Create an ICO containing 16x16 and 32x32 images
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(2, 4); // 2 images

  const offset0 = 6 + (16 * 2); // 38
  const offset1 = offset0 + png16.length;

  const entry0 = Buffer.alloc(16);
  entry0.writeUInt8(16, 0); // width
  entry0.writeUInt8(16, 1); // height
  entry0.writeUInt8(0, 2);  // color count
  entry0.writeUInt8(0, 3);  // reserved
  entry0.writeUInt16LE(1, 4); // color planes
  entry0.writeUInt16LE(32, 6); // bpp
  entry0.writeUInt32LE(png16.length, 8);
  entry0.writeUInt32LE(offset0, 12);

  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(32, 0); // width
  entry1.writeUInt8(32, 1); // height
  entry1.writeUInt8(0, 2);  // color count
  entry1.writeUInt8(0, 3);  // reserved
  entry1.writeUInt16LE(1, 4); // color planes
  entry1.writeUInt16LE(32, 6); // bpp
  entry1.writeUInt32LE(png32.length, 8);
  entry1.writeUInt32LE(offset1, 12);

  return Buffer.concat([header, entry0, entry1, png16, png32]);
}

async function run() {
  try {
    const target = await waitForPort();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');

    const repoRoot = path.resolve(import.meta.dirname, '..');

    // Helper to render and capture PNG
    async function renderPng(svgString, size) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: size,
        height: size,
        deviceScaleFactor: 1,
        mobile: false
      });

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: ${size}px;
    height: ${size}px;
    overflow: hidden;
    background: transparent;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
  ${svgString}
</body>
</html>`;

      await send('Page.navigate', { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` });
      await sleep(150);

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      return Buffer.from(shot.data, 'base64');
    }

    console.log('Generating pixel-perfect multi-device icons...');

    // 1. Vector SVG (Standard with subtle squircle bevel for desktop/browser)
    const standardSvg = buildIconSvg({ fullBleed: false, keyScale: 0.96 });
    fs.writeFileSync(path.join(repoRoot, 'src/app/icon.svg'), standardSvg, 'utf8');
    fs.writeFileSync(path.join(repoRoot, 'public/icon.svg'), standardSvg, 'utf8');
    console.log('✓ Vector SVG written to src/app/icon.svg & public/icon.svg');

    // 2. Full-bleed SVG for Apple Touch Icon & Android Maskable icons
    // Key scale: 0.80 fits strictly within Android 80% circle safe zone & Apple squircle safe area
    const fullBleedMaskableSvg = buildIconSvg({ fullBleed: true, keyScale: 0.80 });
    // Standard Any SVG (Full bleed edge for crisp modern PWA standard)
    const anySvg = buildIconSvg({ fullBleed: true, keyScale: 0.88 });

    // 3. Apple Touch Icon (180x180, Full Bleed, NO transparency, tailored for iOS HIG)
    const apple180 = await renderPng(buildIconSvg({ fullBleed: true, keyScale: 0.82 }), 180);
    fs.writeFileSync(path.join(repoRoot, 'src/app/apple-icon.png'), apple180);
    fs.writeFileSync(path.join(repoRoot, 'public/apple-touch-icon.png'), apple180);
    console.log('✓ Apple Touch Icon (180x180) rendered with 100% full-bleed opaque canvas');

    // 4. Android Maskable Icons (192x192 & 512x512 with safe-zone inset)
    const maskable192 = await renderPng(fullBleedMaskableSvg, 192);
    fs.writeFileSync(path.join(repoRoot, 'public/icon-maskable-192.png'), maskable192);
    console.log('✓ Android Maskable Icon (192x192) rendered with safe-zone inset');

    const maskable512 = await renderPng(fullBleedMaskableSvg, 512);
    fs.writeFileSync(path.join(repoRoot, 'public/icon-maskable-512.png'), maskable512);
    console.log('✓ Android Maskable Icon (512x512) rendered with safe-zone inset');

    // 5. Standard PWA "any" Icons (192x192 & 512x512 for Chrome, Edge, Windows, macOS)
    const any192 = await renderPng(anySvg, 192);
    fs.writeFileSync(path.join(repoRoot, 'public/icon-192.png'), any192);
    console.log('✓ Standard PWA Icon (192x192) rendered');

    const any512 = await renderPng(anySvg, 512);
    fs.writeFileSync(path.join(repoRoot, 'public/icon-512.png'), any512);
    console.log('✓ Standard PWA Icon (512x512) rendered');

    // 6. Favicons (32x32, 16x16, and multi-resolution ICO)
    const png32 = await renderPng(anySvg, 32);
    fs.writeFileSync(path.join(repoRoot, 'public/favicon-32x32.png'), png32);

    const png16 = await renderPng(anySvg, 16);
    fs.writeFileSync(path.join(repoRoot, 'public/favicon-16x16.png'), png16);

    const icoBuffer = createPngIco(png32, png16);
    fs.writeFileSync(path.join(repoRoot, 'src/app/favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(repoRoot, 'public/favicon.ico'), icoBuffer);
    console.log('✓ Multi-resolution favicon.ico (16x16, 32x32) generated');

    ws.close();
    chrome.kill();
    console.log('ALL ICONS GENERATED SUCCESSFULLY!');
  } catch (err) {
    console.error('Icon build error:', err);
    chrome.kill();
  }
}

run();
