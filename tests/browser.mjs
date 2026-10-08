import { chromium } from 'playwright';
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const compiled = await build({entryPoints:['tests/fixture.jsx'],bundle:true,write:false,format:'iife',jsx:'automatic',loader:{'.css':'text'}});
const html = `<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#151517;color:#fafafa;margin:0}#app{position:absolute;bottom:60px;right:40px;display:flex;max-width:calc(100vw - 30px)}</style><div id="app"></div><script src="/fixture.js"></script></html>`;
const server = createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/fixture.js'?'text/javascript':'text/html; charset=utf-8');res.end(req.url==='/fixture.js'?compiled.outputFiles[0].text:html)});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
await mkdir('test-results',{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const results=[], errors=[];
const page = await browser.newPage({viewport:{width:1000,height:760}});
page.on('pageerror',e=>errors.push(String(e)));
const check = (value,label)=>{assert.ok(value,label);results.push(label)};
try {
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  // Reproduce the host's global corner treatment before inspecting our geometry.
  await page.addStyleTag({content:'*{corner-shape:superellipse(2)}'});
  await page.locator('.drs-trigger').click();
  await page.waitForFunction(()=>document.querySelector('.drs-panel')?.getBoundingClientRect().width===330);
  await page.evaluate(()=>{
    fixture.capErrors=[]; fixture.trackFrames=[]; fixture.watchCap=true;
    const sample=()=>{
      const fill=document.querySelector('.drs-fill'),thumb=document.querySelector('.drs-thumb');
      if(fill&&thumb){const f=fill.getBoundingClientRect(),t=thumb.getBoundingClientRect();fixture.capErrors.push(Math.abs(f.right-f.height/2-(t.x+t.width/2)));const track=document.querySelector('.drs-track');fixture.trackFrames.push({opacity:getComputedStyle(track).opacity,disabled:track.getAttribute('aria-disabled'),pending:fixture.state().pending!==null});}
      if(fixture.watchCap)requestAnimationFrame(sample);
    };sample();
  });
  check(await page.locator('.drs-thumb').evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.cornerShape==='round'&&r.width===r.height&&s.borderRadius==='50%'}),'thumb remains circular under host superellipse styling');
  check(await page.locator('.drs-track').evaluate(el=>getComputedStyle(el).cornerShape==='round'),'track keeps capsule corners under host global styling');
  check(await page.locator('.drs-track').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el&&document.elementFromPoint(r.x+r.width/2,r.y-4)!==el}),'track receives pointer directly and no invisible layer extends above it');
  await page.locator('.drs-bolt').click();
  check(await page.evaluate(()=>fixture.calls.length===0),'decorative lightning sends no model RPC');
  await page.locator('.drs-bolt').click();
  const alignment=await page.evaluate(()=>{const p=document.querySelector('.drs-panel').getBoundingClientRect(),b=document.querySelector('.drs-bolt').getBoundingClientRect(),i=document.querySelector('.drs-bolt svg').getBoundingClientRect();return {x:Math.round(i.x-p.x),y:Math.round(i.y-p.y),bw:b.width,bh:b.height}});
  check(alignment.x===19 && alignment.y===13 && alignment.bw===28 && alignment.bh===28,'lightning placement and centered hit area match reference');
  check(await page.locator('.drs-panel').evaluate(el=>!getComputedStyle(el).backgroundImage.includes('conic-gradient')&&getComputedStyle(el.querySelector('.drs-edge-glow')).opacity==='0'),'non-Ultra tiers have neither gradient border nor glow');
  await page.evaluate(()=>{fixture.rects=[];fixture.edgeFrames=[];fixture.watchLayout=true;const sample=()=>{const r=document.querySelector('.drs-panel').getBoundingClientRect();fixture.rects.push([r.x,r.y,r.width,r.height]);fixture.edgeFrames.push({time:performance.now(),notice:document.querySelector(".drs-notice").dataset.visible,opacity:Number(getComputedStyle(document.querySelector(".drs-edge-ring")).opacity)});if(fixture.watchLayout)requestAnimationFrame(sample)};sample()});
  await page.locator('.drs-hit').focus(); await page.keyboard.press('End');
  await page.waitForFunction(()=>fixture.state().current.reasoningEffort==='max');
  check(await page.evaluate(()=>{fixture.watchLayout=false;return fixture.rects.every(r=>r.every((v,i)=>Math.abs(v-fixture.rects[0][i])<1))}),'loading during effort selection leaves card position and size unchanged');
  check(await page.evaluate(()=>{const f=fixture.edgeFrames.filter(f=>f.notice==='true');return f.length>0&&f.filter(s=>s.time-f[0].time<150).every(s=>s.opacity===0)}),'border stays hidden during the first 150ms of the quota animation');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.drs-edge-glow')).opacity==='0.9');
  check(await page.locator('.drs-panel').evaluate(el=>{const glow=el.querySelector('.drs-edge-glow'),a=getComputedStyle(el),b=getComputedStyle(glow,'::before');return getComputedStyle(el.querySelector('.drs-edge-ring')).backgroundImage.includes('conic-gradient')&&a.getPropertyValue('--drs-border-angle')===b.getPropertyValue('--drs-border-angle')&&getComputedStyle(glow).pointerEvents==='none'&&getComputedStyle(el,'::after').zIndex==='-1'}),'Ultra border and outer glow share their animated angle behind an opaque interior');
  check(await page.locator('.drs-notice').evaluate(el=>getComputedStyle(el).color==='rgb(192, 92, 255)'&&getComputedStyle(el).backgroundImage==='none'),'full purple notice stays painted beneath animated white overlay');
  await page.locator('.drs-notice-glint').evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=1250});
  await page.locator('.drs-panel').screenshot({path:'test-results/shimmer-exit.png'});
  check(await page.locator('.drs-title').evaluate(el=>getComputedStyle(el).visibility==='hidden'),'quota notice fully hides Ultra and model text');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.drs-ticks i')).opacity==='0');
  await page.locator('.drs-panel').screenshot({path:'test-results/quota.png'});
  await page.waitForFunction(()=>!document.querySelector('.drs-notice').classList.contains('drs-shimmer'));
  check(await page.locator('.drs-notice').evaluate(el=>getComputedStyle(el).backgroundImage==='none'),'one-shot shimmer leaves no static highlight');
  await page.waitForFunction(()=>document.querySelector('.drs-panel').dataset.notice==='false');
  check(await page.locator('.drs-title').textContent()==='Ultra','title returns after quota notice');
  check(await page.locator('.drs-ultra-burst').count()===0,'one-shot burst removes itself after fading');
  check(await page.locator('.drs-particles').evaluate(el=>Number(getComputedStyle(el).opacity)<=.65),'whole particle layer caps alpha including overlaps');
  await page.locator('.drs-panel').screenshot({path:'test-results/ultra.png'});
  const haloRect=await page.locator('.drs-panel').boundingBox(); await page.screenshot({path:'test-results/ultra-outer-glow.png',clip:{x:haloRect.x-25,y:haloRect.y-25,width:haloRect.width+50,height:haloRect.height+50}});
  const r=await page.locator('.drs-track').boundingBox();
  const before=await page.evaluate(()=>fixture.calls.length);
  await page.mouse.move(r.x+r.width-14,r.y+14); await page.mouse.down();
  await page.mouse.move(r.x+14+(r.width-28)/3,r.y+14,{steps:12});
  check(await page.evaluate(()=>fixture.calls.length)===before,'drag previews without repeated model requests');
  await page.mouse.up();
  await page.waitForFunction(()=>fixture.state().current.reasoningEffort==='low');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.drs-edge-glow')).opacity==='0');
  check(true,'leaving Ultra fades out the border glow');
  check(await page.evaluate(()=>fixture.calls.length)===before+1,'release commits one supported native effort');
  // Drag continuously through both intervals, retaining the same particle field.
  await page.locator('.drs-particles').evaluate(el=>window.particleCanvas=el);
  const at=value=>r.x+14+(r.width-28)*value/3;
  await page.mouse.move(at(1),r.y+14); await page.mouse.down();
  const samples=[];
  for(const value of [1.5,2,2.25,2.75,3,2.5,1.5,1]) {
    await page.mouse.move(at(value),r.y+14);
    if(value===2.75) check(await page.locator('.drs-ultra-burst').count()===0,'burst waits until the thumb reaches the Ultra endpoint');
    if(value===3) {
      await page.locator('.drs-ultra-burst').waitFor();
      check(await page.locator('.drs-burst-flight i').evaluateAll(points=>points.length===13&&points.every(p=>{const s=getComputedStyle(p);return s.backgroundColor==='rgb(192, 92, 255)'&&s.borderRadius==='50%'&&s.cornerShape==='round'&&s.pointerEvents==='none'})),'Ultra burst uses circular purple noninteractive particles');
      await page.locator('.drs-ultra-burst').evaluate(el=>window.currentBurst=el);
      await page.mouse.move(at(3),r.y+14);
      check(await page.locator('.drs-ultra-burst').evaluate(el=>el===window.currentBurst),'holding the endpoint does not restart the burst');
      await page.waitForTimeout(180);
      const p=await page.locator('.drs-panel').boundingBox();
      await page.screenshot({path:'test-results/ultra-burst.png',clip:{x:p.x-60,y:p.y-25,width:p.width+100,height:p.height+90}});
    }
    samples.push(await page.evaluate(()=>({alpha:Number(getComputedStyle(document.querySelector('.drs-particles')).opacity),gradient:Number(getComputedStyle(document.querySelector('.drs-aurora')).opacity),same:window.particleCanvas===document.querySelector('.drs-particles')})));
  }
  await page.mouse.up();

  check(await page.evaluate(()=>{fixture.watchCap=false;return fixture.capErrors.length>5&&fixture.capErrors.every(error=>error<1)}),'fill cap stays centered beneath the thumb during animated snapping and dragging');
  check(await page.evaluate(()=>fixture.trackFrames.every(f=>f.opacity==='1')&&fixture.trackFrames.some(f=>f.pending&&f.disabled==='true')),'track, fill and thumb keep full opacity through dragging and saving while pending input stays locked');
  check(samples.every(s=>s.same)&&Math.abs(samples[0].alpha-.32)<.02&&samples[1].alpha===.64&&samples[1].gradient<.01&&samples[2].gradient<samples[3].gradient&&samples[4].gradient===1&&samples[7].alpha===0,'particles fade in both directions, High has no gradient, and High-to-Ultra gradient follows continuous position without remounting');
  await page.evaluate(()=>{fixture.fail=true}); await page.locator('.drs-hit').focus(); await page.keyboard.press('End');
  await page.waitForFunction(()=>document.querySelector('.drs-error'));
  check(await page.locator('.drs-title').textContent()==='轻度','host rejection rolls back slider');
  await page.evaluate(()=>{fixture.fail=false});
  await page.locator('.drs-model').click();
  await page.getByRole('menuitemradio',{name:'DeepSeek V4 Pro'}).click();
  await page.waitForFunction(()=>fixture.state().current.model==='model-1');
  check(await page.evaluate(()=>fixture.state().current.reasoningEffort==='low'),'model switch preserves a supported effort');
  await page.evaluate(()=>fixture.emit({current:{provider:'test',model:'model-1',reasoningEffort:'high'}}));
  check(await page.locator('.drs-title').textContent()==='高','external model setting update synchronizes');
  await page.evaluate(()=>fixture.emit({routable:false}));
  check(await page.locator('.drs-track').evaluate(el=>getComputedStyle(el).opacity==='0.55'&&el.getAttribute('aria-disabled')==='true'),'genuinely unavailable models still show a dimmed disabled slider');
  await page.evaluate(()=>fixture.emit({routable:true}));
  await page.waitForTimeout(350);
  check(await page.locator('.drs-particles').evaluate(canvas=>{
    const r=canvas.getBoundingClientRect(),thumb=document.querySelector('.drs-thumb').getBoundingClientRect();
    const x=Math.ceil((thumb.x+thumb.width/2-r.x)*canvas.width/r.width);
    const data=canvas.getContext('2d').getImageData(x,0,canvas.width-x,canvas.height).data;
    return data.every((value,i)=>i%4!==3||value===0);
  }),'High leaves all canvas pixels to the right of the thumb transparent');
  await page.locator('.drs-panel').screenshot({path:'test-results/high-particles.png'});
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:740});
    await page.waitForTimeout(150); await page.locator('.drs-model').click();
    const inside=await page.locator('.drs-panel').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight});
    check(inside,`${width}px: model menu remains inside viewport`);
    await page.keyboard.press('Escape');
  }
  await page.emulateMedia({reducedMotion:'reduce'}); await page.locator('.drs-hit').focus(); await page.keyboard.press('End');
  await page.waitForFunction(()=>fixture.state().current.reasoningEffort==='max');
  check(await page.locator('.drs-aurora').evaluate(el=>getComputedStyle(el).animationName==='none'),'reduced-motion preference disables animation');
  check(await page.locator('.drs-ultra-burst').count()===0,'reduced-motion preference suppresses the burst');
  await page.keyboard.press('Escape');
  check(await page.locator('.drs-panel').count()===0,'Escape closes portal and unmounts particles');
  check(errors.length===0,'no browser JavaScript errors');
  await writeFile('test-results/browser.json',JSON.stringify({pass:true,results,errors},null,2));
  console.log(JSON.stringify({pass:true,results},null,2));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
