import fs from 'node:fs/promises';
import sharp from 'sharp';
import {scenes,finalEdits} from './image-plan.mjs';
await fs.mkdir('qa',{recursive:true});
for(const scene of scenes){
  const tiles=[];
  for(const [row,suffix] of ['original','v1','v2'].entries())for(const [col,[x,y,width,height]] of finalEdits(scene,row===2?2:1).entries()){
    const meta={left:Math.max(0,x-6),top:Math.max(0,y-6),width:Math.min(width+12,scene.width-Math.max(0,x-6)),height:Math.min(height+12,scene.height-Math.max(0,y-6))};
    const input=await sharp(`public/images/${scene.id}-${suffix}.webp`).extract(meta).resize(190,150,{fit:'contain',background:'#f7f6ee'}).png().toBuffer();
    tiles.push({input,left:col*210+10,top:row*185+45});
  }
  const labels=`<svg width="1050" height="600"><rect width="1050" height="600" fill="#f7f6ee"/><text x="10" y="23" font-family="sans-serif" font-size="16" fill="#233d2f">${scene.id}: original / variant A / variant B</text>${scene.edits.map((e,i)=>`<text x="${i*210+10}" y="588" font-family="sans-serif" font-size="11" fill="#233d2f">${i+1}. ${e[4].replaceAll('&','&amp;')}</text>`).join('')}</svg>`;
  await sharp(Buffer.from(labels)).composite(tiles).png().toFile(`qa/${scene.id}-details.png`);
}
