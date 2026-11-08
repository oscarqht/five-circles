import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {scenes} from './image-plan.mjs';
import {hitDifference} from '../src/geometry.mjs';
const {rounds}=JSON.parse(await fs.readFile('public/data/puzzles.json','utf8'));
assert.equal(rounds.length,9);
const sceneIds=new Set(rounds.map(r=>r.sceneId));assert.equal(sceneIds.size,9);
for(const id of sceneIds)assert.equal(rounds.filter(r=>r.sceneId===id).length,1);
let totalChanged=0;
for(const round of rounds){
  assert.equal(round.differences.length,5,`${round.id}: exactly five regions`);
  const [a,b]=await Promise.all([sharp(`public/${round.original}`).removeAlpha().raw().toBuffer({resolveWithObject:true}),sharp(`public/${round.image}`).removeAlpha().raw().toBuffer({resolveWithObject:true})]);
  assert.equal(a.info.width,round.width);assert.equal(a.info.height,round.height);assert.deepEqual(a.info,b.info);
  const scene=scenes.find(s=>s.id===round.sceneId);
  const source=await sharp(`assets/${scene.source}`).removeAlpha().toColourspace('srgb').raw().toBuffer();
  assert(a.data.equals(source),`${round.id}: original must match supplied source exactly`);
  for(const d of round.differences){
    assert.equal(hitDifference({x:d.x,y:d.y},round.differences,[],{width:600,height:400},1)?.id,d.id,`${round.id}: answer center must hit its own target`);
  }
  const regions=round.differences.map(d=>d.pixelBounds), counts=regions.map(()=>0), magnitudes=regions.map(()=>0);
  for(const rect of regions){assert(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=round.width&&rect.y+rect.height<=round.height);}
  for(let i=0;i<regions.length;i++)for(let j=i+1;j<regions.length;j++){
    const p=regions[i],q=regions[j];assert(p.x+p.width<=q.x||q.x+q.width<=p.x||p.y+p.height<=q.y||q.y+q.height<=p.y,`${round.id}: regions must not overlap`);
  }
  for(let y=0;y<round.height;y++)for(let x=0;x<round.width;x++){
    const o=(y*round.width+x)*a.info.channels;
    const delta=Math.max(...Array.from({length:a.info.channels},(_,c)=>Math.abs(a.data[o+c]-b.data[o+c])));
    if(delta){const index=regions.findIndex(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height);assert(index>=0,`${round.id}: pixel outside the five regions changed at ${x},${y}`);counts[index]++;magnitudes[index]+=delta;}
  }
  for(let i=0;i<counts.length;i++){assert(counts[i]>=250,`${round.id}: region ${i+1} has no meaningful edit`);assert(magnitudes[i]/counts[i]>=10,`${round.id}: region ${i+1} is imperceptible`);}
  totalChanged+=counts.reduce((a,b)=>a+b,0);console.log(`${round.id}: 5/5 edited regions; zero changed pixels outside them (${counts.join(', ')} pixels)`);
}
console.log(`Validated ${rounds.length} rounds, ${rounds.length*5} regions, ${totalChanged} changed pixels.`);
