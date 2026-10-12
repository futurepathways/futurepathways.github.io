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
  { key: 'careers', name: 'Careers', accent: '#B5D4F4' },
  { key: 'opportunities', name: 'Internships & Opportunities', accent: '#C9A84C' },
  { key: 'courses', name: 'Courses', accent: '#7FD3C4' },
  { key: 'countries', name: 'Countries', accent: '#CFA6EA' },
  { key: 'universities', name: 'Universities', accent: '#F0A5A5' },
  { key: 'default', name: 'For every TIPS student and parent', accent: '#C9A84C' },
];

const esc = (s) => s.replace(/&/g, '&amp;');

function svg({ name, accent }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0C447C"/>
      <stop offset="1" stop-color="#185FA5"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="1040" cy="120" r="260" fill="${accent}" fill-opacity="0.16"/>
  <circle cx="1120" cy="560" r="180" fill="${accent}" fill-opacity="0.12"/>
  <rect x="80" y="372" width="120" height="10" rx="5" fill="${accent}"/>
  <text x="80" y="300" font-family="Georgia, 'DejaVu Serif', serif" font-size="92" font-weight="700" fill="#FFFFFF">Future Pathways</text>
  <text x="80" y="450" font-family="Georgia, 'DejaVu Serif', serif" font-size="52" fill="${accent}">${esc(name)}</text>
  <text x="80" y="560" font-family="Arial, 'DejaVu Sans', sans-serif" font-size="30" fill="#E8F0FA" fill-opacity="0.9">by the TIPS FP (Future Pathway) team</text>
</svg>`;
}

for (const c of categories) {
  const buffer = Buffer.from(svg(c));
  const file = c.key === 'default' ? 'preview-default.png' : `preview-${c.key}.png`;
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(out + file);
  console.log('made', file);
}
