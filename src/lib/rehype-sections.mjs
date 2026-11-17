// Layered posts (15 Nov 2026): wrap each "## Heading" section of a long post in <details>,
// so readers see a short page of headings and open only what they need.
// - University profiles with a `glance` card: every section starts closed (the card answers
//   the first questions), except "Talk to me".
// - Reference guides with 5 or more sections (Courses and Countries posts, or any post with
//   `fold: true` in its frontmatter): the first section starts open, the rest closed.
// Essays and shorter posts are left as they are. All text stays in the HTML, so search, Ctrl+F (Chrome
// and Edge open a closed section to show a match) and printing still find everything.
const ALWAYS_OPEN = /^talk to me$/i;

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  return (node.children || []).map(textOf).join('');
}

export default function rehypeSections() {
  return (tree, file) => {
    const fm = (file.data && file.data.astro && file.data.astro.frontmatter) || {};
    const kids = tree.children;
    const heads = [];
    kids.forEach((n, i) => {
      if (n.type === 'element' && n.tagName === 'h2') heads.push(i);
    });
    const profile = fm.main_category === 'universities' && fm.glance;
    const guide = fm.fold === true || ['courses', 'countries'].includes(fm.main_category);
    if (fm.fold === false || !heads.length || (!profile && !(guide && heads.length >= 5))) return;

    const out = kids.slice(0, heads[0]);
    heads.forEach((start, k) => {
      const end = k + 1 < heads.length ? heads[k + 1] : kids.length;
      const h2 = kids[start];
      const open = ALWAYS_OPEN.test(textOf(h2).trim()) || (!profile && k === 0);
      out.push({
        type: 'element',
        tagName: 'details',
        properties: open ? { className: ['sec'], open: true } : { className: ['sec'] },
        children: [
          { type: 'element', tagName: 'summary', properties: { className: ['sec-summary'] }, children: [h2] },
          { type: 'element', tagName: 'div', properties: { className: ['sec-body'] }, children: kids.slice(start + 1, end) },
        ],
      });
    });
    tree.children = out;
  };
}
