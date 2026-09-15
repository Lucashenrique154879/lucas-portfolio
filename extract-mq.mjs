import { readFileSync } from 'node:fs';
const css = readFileSync('client/src/index.css', 'utf8');

function extractTopLevelMedia() {
  const out = [];
  const re = /(@media[^{]+)\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(css))) {
    out.push({ cond: m[1].trim(), body: m[2] });
  }
  return out;
}

const blocks = extractTopLevelMedia();
console.log('TOTAL TOP-LEVEL MEDIA BLOCKS:', blocks.length);
for (const b of blocks) {
  const cond = b.cond;
  const labels = ['editorial-hero','hero-layout','hero-title','hero-person','about-layout','about-portrait','about-details','content-cards','process-steps','project-editorial','projects-editorial','editorial-nav','mini-contact','content-card','trust-strip'];
  const parts = b.body.split('}').filter(s => labels.some(l => s.includes(l)));
  if (parts.length === 0 && !cond.includes('850') && !cond.includes('600')) continue;
  console.log('\n######## ' + cond + ' ########');
  for (const p of parts) console.log('  ' + p.trim().replace(/\n\s*/g, ' ') + ' }');
}
