// Makes the branded link-preview images (PRD 6.8) and the default cover image per
// category (PRD 7.7) as 1200x630 PNGs in public/images/. Run once: `node scripts/make-images.mjs`
// Re-run after changing colours or category names.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../public/images/', import.meta.url));
mkdirSync(out, { recursive: true });

const W = 1200;
const H = 630;

const categories = [
  { key: 'careers', name: 'Careers', accent: '#5EE7FF' },
  { key: 'opportunities', name: 'Internships & Opportunities', accent: '#F0D68A' },
  { key: 'courses', name: 'Courses', accent: '#6EE7B7' },
  { key: 'countries', name: 'Countries', accent: '#C4B5FD' },
  { key: 'universities', name: 'Universities', accent: '#FDA4AF' },
  { key: 'default', name: 'For students and parents in India', accent: '#5EE7FF' },
];

const esc = (s) => s.replace(/&/g, '&amp;');

function svg({ name, accent }) {
  // "Dark sci-fi glow" style (Nov 2026): matches the site's dark theme.
  const grid = [];
  for (let x = 0; x <= W; x += 60) grid.push(`<path d="M${x} 0V${H}"/>`);
  for (let y = 0; y <= H; y += 60) grid.push(`<path d="M0 ${y}H${W}"/>`);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g1" cx="0.05" cy="0" r="0.8"><stop offset="0" stop-color="#38BDF8" stop-opacity="0.28"/><stop offset="1" stop-color="#38BDF8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="1" cy="0.1" r="0.7"><stop offset="0" stop-color="#8B5CF6" stop-opacity="0.3"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5EE7FF"/><stop offset="0.5" stop-color="#818CF8"/><stop offset="1" stop-color="#C084FC"/></linearGradient>
    <radialGradient id="core" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${accent}" stop-opacity="0.75"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#050912"/>
  <g stroke="#7896DC" stroke-opacity="0.08" stroke-width="1">${grid.join('')}</g>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>
  <g transform="translate(960 300)" fill="none" stroke="url(#t)">
    <circle r="78" fill="url(#core)" stroke="none"/>
    <circle r="110" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle r="165" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="4 9"/>
    <circle r="220" stroke-opacity="0.35" stroke-width="1.5"/>
    <circle r="24" fill="#0B1222" stroke-width="2.5"/>
    <circle cx="110" cy="0" r="7" fill="${accent}" stroke="none"/>
    <circle cx="-117" cy="-117" r="6" fill="#C4B5FD" stroke="none"/>
    <circle cx="0" cy="220" r="6" fill="#F0D68A" stroke="none"/>
  </g>
  <text x="80" y="150" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="24" letter-spacing="5" fill="${accent}">CAREER GUIDANCE · INDIA</text>
  <rect x="80" y="178" width="64" height="3" rx="1.5" fill="${accent}"/>
  <text x="80" y="300" font-family="'Segoe UI Semibold', 'Segoe UI', Arial, 'DejaVu Sans', sans-serif" font-size="84" font-weight="700" fill="#F5F8FF" letter-spacing="-2">Future Pathways</text>
  <text x="80" y="390" font-family="'Segoe UI', Arial, 'DejaVu Sans', sans-serif" font-size="46" font-weight="600" fill="url(#t)">${esc(name)}</text>
  <text x="80" y="550" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="24" letter-spacing="3" fill="#9CABC7">BY MADAN KUMAR PC · CAREER COUNSELLOR</text>
</svg>`;
}

for (const c of categories) {
  const buffer = Buffer.from(svg(c));
  const file = c.key === 'default' ? 'preview-default.png' : `preview-${c.key}.png`;
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(out + file);
  console.log('made', file);
}
