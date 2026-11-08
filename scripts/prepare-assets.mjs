import fs from 'node:fs/promises';
import sharp from 'sharp';
import { scenes, finalEdits } from './image-plan.mjs';
const { generations: files } = JSON.parse(await fs.readFile('assets/generation-prompts.json', 'utf8'));
await fs.mkdir('public/images', {recursive:true});
await fs.mkdir('public/data', {recursive:true});
const rounds = [];
for (const scene of scenes) {
  const original = await sharp(`assets/${scene.source}`).removeAlpha().toColourspace('srgb').raw().toBuffer();
  const channels = 3;
  const raw = { width:scene.width, height:scene.height, channels };
  await sharp(original, {raw}).webp({lossless:true, effort:4}).toFile(`public/images/${scene.id}-original.webp`);
  await sharp(original,{raw}).resize(360,240,{fit:'cover'}).webp({quality:82}).toFile(`public/images/${scene.id}-thumb.webp`);
  const file = files.find(f=>f.id===scene.id);
  if(!file) throw new Error(`Missing generated source for ${scene.id}`);
  const metadata = await sharp(file.path).metadata();
  if (metadata.width !== scene.width || metadata.height !== scene.height) throw new Error(`${scene.id}: generated source must retain original dimensions`);
  const generated = await sharp(file.path).removeAlpha().toColourspace('srgb').raw().toBuffer();
  const output = Buffer.from(original);
  for (const [x,y,w,h] of finalEdits(scene)) {
    for(let py=0;py<h;py++) for(let px=0;px<w;px++) {
      const alpha=Math.min(1,Math.min(px,py,w-1-px,h-1-py)/3);
      const offset=((y+py)*scene.width+x+px)*channels;
      for(let c=0;c<channels;c++) output[offset+c]=Math.round(original[offset+c]*(1-alpha)+generated[offset+c]*alpha);
    }
  }
  const image=`images/${scene.id}-v1.webp`;
  await sharp(output,{raw}).webp({lossless:true,effort:4}).toFile(`public/${image}`);
  rounds.push({id:`${scene.id}-1`,sceneId:scene.id,title:scene.title,subtitle:scene.subtitle,original:`images/${scene.id}-original.webp`,image,thumbnail:`images/${scene.id}-thumb.webp`,width:scene.width,height:scene.height,differences:finalEdits(scene).map(([x,y,w,h,label,description],i)=>({id:`difference-${i+1}`,label,description,x:(x+w/2)/scene.width,y:(y+h/2)/scene.height,radius:Math.max(w/scene.width,h/scene.height)/2,bounds:{x:x/scene.width,y:y/scene.height,width:w/scene.width,height:h/scene.height},pixelBounds:{x,y,width:w,height:h}}))});
  console.log(`Prepared ${scene.id}: five object replacements`);
}
await fs.writeFile('public/data/puzzles.json',JSON.stringify({version:3,coordinateSystem:'normalized-0-to-1',description:'Nine harder puzzles, each with five small, context-appropriate object replacements in the original watercolor style.',rounds},null,2)+'\n');
