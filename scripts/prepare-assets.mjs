import fs from 'node:fs/promises';
import sharp from 'sharp';
import { scenes, finalEdits } from './image-plan.mjs';
const files = JSON.parse(await fs.readFile('generation-paths.local.json', 'utf8'));
await fs.mkdir('public/images', {recursive:true});
await fs.mkdir('public/data', {recursive:true});
const rounds = [];
for (const scene of scenes) {
  const original = await sharp(`assets/${scene.source}`).removeAlpha().toColourspace('srgb').raw().toBuffer();
  const channels = 3;
  const raw = { width:scene.width, height:scene.height, channels };
  await sharp(original, {raw}).webp({lossless:true, effort:4}).toFile(`public/images/${scene.id}-original.webp`);
  await sharp(original,{raw}).resize(360,240,{fit:'cover'}).webp({quality:82}).toFile(`public/images/${scene.id}-thumb.webp`);
  for (const variant of [1,2]) {
    const file = files.find(f=>f.id===scene.id && f.variant===variant);
    if(!file) throw new Error(`Missing ${scene.id}-${variant}`);
    const generated = await sharp(file.path).resize(scene.width,scene.height,{fit:'fill'}).removeAlpha().toColourspace('srgb').raw().toBuffer();
    const output = Buffer.from(original);
    for (const [x,y,w,h] of finalEdits(scene,variant)) {
      for(let py=0;py<h;py++) for(let px=0;px<w;px++) {
        // Feather the outer three pixels to avoid hard cutout edges.
        const alpha=Math.min(1,Math.min(px,py,w-1-px,h-1-py)/3);
        const offset=((y+py)*scene.width+x+px)*channels;
        for(let c=0;c<channels;c++) output[offset+c]=Math.round(original[offset+c]*(1-alpha)+generated[offset+c]*alpha);
      }
    }
    const image=`images/${scene.id}-v${variant}.webp`;
    await sharp(output,{raw}).webp({lossless:true,effort:4}).toFile(`public/${image}`);
    rounds.push({id:`${scene.id}-${variant}`,sceneId:scene.id,variant,title:scene.title,subtitle:scene.subtitle,original:`images/${scene.id}-original.webp`,image,thumbnail:`images/${scene.id}-thumb.webp`,width:scene.width,height:scene.height,differences:finalEdits(scene,variant).map(([x,y,w,h,label,a,b],i)=>({id:`difference-${i+1}`,label,description:variant===1?a:b,x:(x+w/2)/scene.width,y:(y+h/2)/scene.height,radius:Math.max(w/scene.width,h/scene.height)/2,bounds:{x:x/scene.width,y:y/scene.height,width:w/scene.width,height:h/scene.height},pixelBounds:{x,y,width:w,height:h}}))});
    console.log(`Prepared ${scene.id}-${variant}`);
  }
}
await fs.writeFile('public/data/puzzles.json',JSON.stringify({version:1,coordinateSystem:'normalized-0-to-1',description:'Each round pairs an original with exactly one of its two variants. Never compare two variants to each other.',rounds},null,2)+'\n');
