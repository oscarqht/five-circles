import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const {rounds}=JSON.parse(fs.readFileSync('public/data/puzzles.json','utf8'));
async function start(page,id='sunset-1'){
  await page.addInitScript(id=>localStorage.setItem('little-differences-v1',JSON.stringify({roundId:id,found:[],seconds:0,completed:[],hints:0})),id);
  await page.goto('/');await expect(page.locator('#load-state')).toBeHidden();
}
async function clickDetail(page,round,index,panel=0){
  const d=round.differences[index];const img=page.locator('.image-world>img').nth(panel);const box=await img.boundingBox();
  await page.mouse.click(box.x+d.x*box.width,box.y+d.y*box.height);
}
test('all rounds load; hits on either picture complete a round',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await start(page);
  await expect(page.locator('#board')).toHaveClass(/stacked/);
  const round=rounds.find(r=>r.id==='sunset-1');
  await clickDetail(page,round,0,0);await expect(page.locator('#found-count')).toHaveText('1');
  await clickDetail(page,round,0,1);await expect(page.locator('#found-count')).toHaveText('1');
  for(let i=1;i<5;i++)await clickDetail(page,round,i,i%2);
  await expect(page.locator('#completion')).toBeVisible();await expect(page.locator('#found-count')).toHaveText('5');
  await expect(page.locator('.found-marker')).toHaveCount(10);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('little-differences-v1')));expect(stored.completed).toContain('sunset-1');
  await page.reload();await expect(page.locator('#load-state')).toBeHidden();
  // Init script resets this test's fixture on reload; persistence is checked separately below.
  await page.locator('#collection-nav').click();await expect(page.locator('.collection-card')).toHaveCount(9);
  for(const r of rounds){
    await page.locator(`[data-round="${r.id}"]`).click();await expect(page.locator('#load-state')).toBeHidden();
    await expect(page.locator('.image-world>img')).toHaveCount(2);
    if(r.id!==rounds.at(-1).id)await page.locator('#collection-nav').click();
  }
  await page.locator('#collection-nav').click();await page.locator('[data-round="balcony-1"]').click();await expect(page.locator('#load-state')).toBeHidden();
  await expect(page.locator('#board')).toHaveClass(/side-by-side/);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`qa/${testInfo.project.name}-portrait.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('zoom and pan stay synchronized; drags never score; transformed hits work',async({page},testInfo)=>{
  await start(page);const round=rounds.find(r=>r.id==='sunset-1');
  const el=page.locator('.viewport').first(),box=await el.boundingBox();
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.5+30,box.y+box.height*.5+20,{steps:8});await page.mouse.up();
  await expect(page.locator('#found-count')).toHaveText('0');
  await page.locator('#zoom-in').click();await expect(page.locator('#zoom-level')).toHaveText('150%');
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.wheel(0,-200);
  await expect.poll(()=>page.locator('#zoom-level').textContent()).not.toBe('150%');
  await page.mouse.down();await page.mouse.move(box.x+box.width*.5-30,box.y+box.height*.5-20,{steps:5});await page.mouse.up();
  const transforms=await page.locator('.image-world').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));expect(transforms[0]).toBe(transforms[1]);
  await expect(page.locator('#found-count')).toHaveText('0');
  await page.locator('#hint').click();await expect(page.locator('#zoom-level')).toHaveText('200%');
  await clickDetail(page,round,0,1);await expect(page.locator('#found-count')).toHaveText('1');
  await page.locator('#reset-view').click();await expect(page.locator('#zoom-level')).toHaveText('100%');
  await page.screenshot({path:`qa/${testInfo.project.name}-landscape.png`,fullPage:true});
  // Remove init fixture hook before reloading to verify real persisted progress.
  const state=await page.evaluate(()=>localStorage.getItem('little-differences-v1'));
  await page.context().clearCookies();
  const second=await page.context().newPage();await second.goto('/');await expect(second.locator('#load-state')).toBeHidden();
  await expect(second.locator('#found-count')).toHaveText('1');
  expect(JSON.parse(state).found).toHaveLength(1);await second.close();
});
test('two-finger pinch preserves found markers without registering another guess',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='phone');
  await start(page);
  const round=rounds.find(r=>r.id==='sunset-1'),target=round.differences[1];
  await clickDetail(page,round,1);
  await page.locator('.found-marker').evaluateAll(markers=>Promise.all(markers.flatMap(marker=>marker.getAnimations().map(animation=>animation.finished))));
  const box=await page.locator('.viewport').first().boundingBox();
  const x=box.x+box.width*target.x,y=box.y+box.height*target.y;
  const client=await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-25,y,id:1},{x:x+25,y,id:2}]});
  for(const offset of [35,45,55,65])await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-offset,y,id:1},{x:x+offset,y,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(()=>page.locator('#zoom-level').textContent()).not.toBe('100%');
  await expect(page.locator('#found-count')).toHaveText('1');
  await expect(page.locator('.found-marker')).toHaveCount(2);
  const opacities=await page.locator('.found-marker').evaluateAll(markers=>markers.map(marker=>Number(getComputedStyle(marker).opacity)));
  expect(opacities).toEqual([1,1]);
  const transforms=await page.locator('.image-world').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));expect(transforms[0]).toBe(transforms[1]);
});

test('found circles and ticks stay visible throughout camera changes',async({page})=>{
  await start(page);
  const round=rounds.find(r=>r.id==='sunset-1');
  await clickDetail(page,round,1);
  await expect(page.locator('#found-count')).toHaveText('1');
  // Let the one-time discovery animation finish before moving the camera.
  await page.locator('.found-marker').evaluateAll(markers=>Promise.all(markers.flatMap(marker=>marker.getAnimations().map(animation=>animation.finished))));
  async function expectSteadyMarkers(){
    const states=await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>resolve([...document.querySelectorAll('.found-marker')].map(marker=>({
      opacity:Number(getComputedStyle(marker).opacity),
      tickOpacity:Number(getComputedStyle(marker.querySelector('span')).opacity),
      tickWidth:marker.querySelector('span').getBoundingClientRect().width,
    }))))));
    expect(states).toHaveLength(2);
    for(const state of states){expect(state.opacity).toBe(1);expect(state.tickOpacity).toBe(1);expect(state.tickWidth).toBeCloseTo(15,1);}
  }
  await expectSteadyMarkers();
  await page.locator('#zoom-in').click();
  await expectSteadyMarkers();
  const el=page.locator('.viewport').first();await el.scrollIntoViewIfNeeded();const box=await el.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  for(const delta of [4,8,12,16,20]){
    await page.mouse.move(box.x+box.width/2-delta,box.y+box.height/2-delta);
    await expectSteadyMarkers();
  }
  await page.mouse.up();
  for(let i=0;i<3;i++){
    await page.mouse.wheel(0,-30);
    await expectSteadyMarkers();
  }
  await page.locator('#reset-view').click();await expectSteadyMarkers();
  const transforms=await page.locator('.image-world').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));expect(transforms[0]).toBe(transforms[1]);
  await expect(page.locator('#found-count')).toHaveText('1');
});

test('finding another difference leaves existing circles and ticks fixed',async({page})=>{
  await start(page);
  const round=rounds.find(r=>r.id==='sunset-1');
  await clickDetail(page,round,0);
  await page.locator('.found-marker').evaluateAll(markers=>Promise.all(markers.flatMap(marker=>marker.getAnimations().map(animation=>animation.finished))));
  const existing=await page.locator('.found-marker').elementHandles();
  const positions=await Promise.all(existing.map(marker=>marker.boundingBox()));
  for(let i=1;i<5;i++){
    await clickDetail(page,round,i,i%2);
    await expect(page.locator('#found-count')).toHaveText(String(i+1));
    await expect(page.locator('.found-marker')).toHaveCount((i+1)*2);
    for(const [index,marker] of existing.entries()){
      const state=await marker.evaluate(el=>({
        connected:el.isConnected,
        opacity:Number(getComputedStyle(el).opacity),
        activeAnimations:el.getAnimations().filter(animation=>animation.playState==='running').length,
      }));
      expect(state).toEqual({connected:true,opacity:1,activeAnimations:0});
      expect(await marker.boundingBox()).toEqual(positions[index]);
    }
  }
  await expect(page.locator('#completion')).toBeVisible();
});

test('opposite-image crosshair tracks the cursor through zoom and pan',async({page},testInfo)=>{
  await start(page);
  for(const id of ['sunset-1','balcony-1']){
    if(id==='balcony-1'){
      await page.locator('#collection-nav').click();await page.locator(`[data-round="${id}"]`).click();await expect(page.locator('#load-state')).toBeHidden();
    }
    async function checkCrosshair(sourceIndex){
      const source=page.locator('.viewport').nth(sourceIndex),target=page.locator('.viewport').nth(1-sourceIndex);
      await source.scrollIntoViewIfNeeded();const sourceBox=await source.boundingBox();
      const cursor={x:sourceBox.x+sourceBox.width*.4,y:sourceBox.y+sourceBox.height*.6};
      await page.mouse.move(cursor.x,cursor.y);
      await expect(source.locator('.mirror-crosshair')).toBeHidden();
      const cross=target.locator('.mirror-crosshair');await expect(cross).toBeVisible();
      const [targetBox,crossBox,sourceImage,targetImage]=await Promise.all([target.boundingBox(),cross.boundingBox(),source.locator('img').boundingBox(),target.locator('img').boundingBox()]);
      const center={x:crossBox.x+crossBox.width/2,y:crossBox.y+crossBox.height/2};
      expect(center.x).toBeCloseTo(targetBox.x+targetBox.width*.4,1);
      expect(center.y).toBeCloseTo(targetBox.y+targetBox.height*.6,1);
      expect((center.x-targetImage.x)/targetImage.width).toBeCloseTo((cursor.x-sourceImage.x)/sourceImage.width,3);
      expect((center.y-targetImage.y)/targetImage.height).toBeCloseTo((cursor.y-sourceImage.y)/sourceImage.height,3);
      expect(crossBox.width).toBe(18);expect(crossBox.height).toBe(18);
      return cursor;
    }
    await checkCrosshair(0);await checkCrosshair(1);
    await page.locator('#zoom-in').click();await page.locator('#zoom-in').click();
    const cursor=await checkCrosshair(0);
    await page.mouse.down();await page.mouse.move(cursor.x-20,cursor.y-10,{steps:5});await page.mouse.up();
    await checkCrosshair(0);await checkCrosshair(1);
    await expect(page.locator('#found-count')).toHaveText('0');
    await page.mouse.move(2,2);await expect(page.locator('.mirror-crosshair:visible')).toHaveCount(0);
    if(testInfo.project.name==='phone'){
      const point=await checkCrosshair(0);await page.touchscreen.tap(point.x,point.y);
      await expect(page.locator('.mirror-crosshair:visible')).toHaveCount(0);
    }
    await page.locator('#reset-view').click();
  }
});

test('completion marks the scene and plays fullscreen confetti once',async({page},testInfo)=>{
  await start(page);
  const round=rounds.find(r=>r.id==='sunset-1');
  const badge=page.locator('[data-scene="sunset"] .scene-status.completed');
  await expect(badge).toHaveCount(0);
  for(let i=0;i<4;i++)await clickDetail(page,round,i,i%2);
  await expect(page.locator('.confetti-canvas')).toHaveCount(0);
  await expect(badge).toHaveCount(0);
  await clickDetail(page,round,4);
  await expect(page.locator('#found-count')).toHaveText('5');
  await expect(badge).toHaveCount(1);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('little-differences-v1')));
  expect(state.completed).toEqual(['sunset-1']);
  const canvas=page.locator('.confetti-canvas');await expect(canvas).toBeVisible();
  const viewport=page.viewportSize(),box=await canvas.boundingBox();
  expect(box).toEqual({x:0,y:0,width:viewport.width,height:viewport.height});
  await expect(canvas).toHaveCSS('pointer-events','none');
  // Confirm actual paper particles reach the upper half of the screen.
  await expect.poll(()=>canvas.evaluate(el=>new Uint32Array(el.getContext('2d').getImageData(0,0,el.width,Math.floor(el.height/2)).data.buffer).some(pixel=>pixel!==0))).toBe(true);
  await page.screenshot({path:`qa/${testInfo.project.name}-confetti.png`});
  await expect(canvas).toHaveCount(0,{timeout:6500});
  // Reopening persisted completion shows the check, without replaying the celebration.
  const restored=await page.context().newPage();
  await restored.goto('/');await expect(restored.locator('#load-state')).toBeHidden();
  await expect(restored.locator('#found-count')).toHaveText('5');
  await expect(restored.locator('[data-scene="sunset"] .scene-status.completed')).toHaveCount(1);
  await expect(restored.locator('.confetti-canvas')).toHaveCount(0);
  await restored.locator('#collection-nav').click();
  await expect(restored.locator('[data-round="sunset-1"]')).toHaveClass(/done/);
  await expect(restored.locator('[data-round="sunset-2"]')).not.toHaveClass(/done/);
  await restored.close();
  // Switching scenes immediately also cleans up an active celebration.
  await page.locator('#collection-nav').click();await page.locator('[data-round="sunset-2"]').click();await expect(page.locator('#load-state')).toBeHidden();
  const variant=rounds.find(r=>r.id==='sunset-2');
  for(let i=0;i<5;i++)await clickDetail(page,variant,i,i%2);
  await expect(page.locator('.confetti-canvas')).toBeVisible();
  await page.locator('#next-round').click();
  await expect(page.locator('.confetti-canvas')).toHaveCount(0);
  await expect(badge).toHaveCount(1);
});
