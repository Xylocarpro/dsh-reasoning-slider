import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const url = process.env.DSH_TEST_URL;
if (!url) throw new Error('Set DSH_TEST_URL to the isolated Harness test instance URL.');
await mkdir('test-results', {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const results=[], errors=[];
try {
  const page = await browser.newPage({viewport:{width:1200,height:900}});
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text().split('\n')[0])});
  await page.goto(url);
  await page.locator('.drs-trigger').waitFor();
  await page.waitForTimeout(700);
  for (const name of ['继续','稍后配置']) {
    const button=page.getByRole('button',{name,exact:true});
    if(await button.isVisible()) { await button.click(); await page.waitForTimeout(500); }
  }
  await page.locator('.drs-trigger').click();
  await page.locator('.drs-hit[aria-disabled=false]').waitFor();
  results.push('Installed Harness 0.2.0-rc.2 discovers the bundle and renders the native slot override.');
  for (const [key,name] of [['Home','关'],['ArrowRight','轻度'],['ArrowRight','高'],['End','Ultra']]) {
    await page.locator('.drs-hit').focus();await page.keyboard.press(key);
    await page.waitForFunction(label=>document.querySelector('.drs-pill-tier')?.textContent===label,name);
    await page.waitForFunction(()=>document.querySelector('.drs-hit')?.getAttribute('aria-disabled')==='false');
    results.push(`Host accepted effort ${name}.`);
  }
  await page.waitForFunction(()=>document.querySelector('.drs-panel')?.dataset.notice==='false');
  await page.screenshot({path:'test-results/host-ultra.png'});
  await page.locator('.drs-model').click();
  const options=page.getByRole('menuitemradio');
  const names=await options.allTextContents();
  if(names.length>1){await options.nth(1).click();await page.waitForFunction(()=>!document.querySelector('.drs-spinner'));results.push('Host accepted selection of the second catalog model.');}
  const before=await page.locator('.drs-trigger').innerText();
  await page.reload();await page.locator('.drs-trigger').waitFor();
  await page.waitForFunction(()=>!document.querySelector('.drs-spinner') && document.querySelector('.drs-pill-tier')?.textContent==='Ultra');
  assert.equal(await page.locator('.drs-trigger').innerText(),before);
  results.push('Model and max effort persist after browser reload.');
  assert.deepEqual(errors,[]);
  await writeFile('test-results/host.json',JSON.stringify({pass:true,results,models:names,errors},null,2));
  console.log(JSON.stringify({pass:true,results,models:names},null,2));
}finally{await browser.close()}
