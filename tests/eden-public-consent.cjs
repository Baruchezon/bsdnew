const {JSDOM}=require('jsdom');
const fs=require('fs'),assert=require('node:assert/strict');
const dir='eden-center-v2/';
const tick=()=>new Promise(r=>setTimeout(r,0));
async function setup(name,stored,fail=false){
 const dom=new JSDOM(fs.readFileSync(dir+name,'utf8'),{url:'https://eden-center.co.il/'+name+'?private=secret#token',runScripts:'outside-only'});
 const w=dom.window,calls=[];
 if(stored)w.localStorage.setItem('edenPrivacyChoice',stored);
 w.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:!fail||url.includes('formsubmit'),json:async()=>({ok:true})};};
 w.eval(fs.readFileSync(dir+'privacy-controls.js','utf8'));
 if(name!=='privacy.html')w.eval(fs.readFileSync(dir+'app.js','utf8'));
 await tick();return {dom,w,d:w.document,calls};
}
(async()=>{
 let t=await setup('index.html');
 assert.equal(t.w.sessionStorage.getItem('edenThoughtIndex'),null);
 assert.equal(t.d.querySelector('.privacy-banner').hidden,false);
 assert.equal(t.calls.length,0);
 t.d.querySelector('[data-choice="preferences"]').click();
 assert.equal(t.w.EdenPrivacy.allowsPreferences(),true);
 assert.equal(t.d.querySelector('.privacy-banner').hidden,true);
 let stored=t.w.localStorage.getItem('edenPrivacyChoice');t.dom.window.close();
 t=await setup('index.html',stored);assert.notEqual(t.w.sessionStorage.getItem('edenThoughtIndex'),null);
 t.d.querySelector('[data-privacy-settings]').click();assert.equal(t.d.querySelector('.privacy-banner').hidden,false);
 t.d.querySelector('[data-choice="necessary"]').click();assert.equal(t.w.sessionStorage.getItem('edenThoughtIndex'),null);
 assert.equal(t.w.EdenPrivacy.allowsPreferences(),false);t.dom.window.close();
 for(const bad of ['broken',JSON.stringify({version:'2026-09-13',preferences:true,savedAt:0})]){
  t=await setup('index.html',bad);assert.equal(t.w.EdenPrivacy.allowsPreferences(),false);assert.equal(t.w.sessionStorage.getItem('edenThoughtIndex'),null);t.dom.window.close();
 }
 for(const name of ['index.html','contact.html','services.html','about.html']){
  t=await setup(name);const f=t.d.querySelector('form');
  f.querySelector('[name="parentName"]').value='בדיקה מקומית בלבד';f.querySelector('[name="phone"]').value='0500000000';
  f.dispatchEvent(new t.w.Event('submit',{cancelable:true}));await tick();assert.equal(t.calls.length,0,'consent required');
  f.querySelector('[name="contactConsent"]').checked=true;
  f.dispatchEvent(new t.w.Event('submit',{cancelable:true}));await tick();
  assert.equal(t.calls.length,2);assert.equal(t.calls[0].body.contactConsent,'yes');assert.equal(t.calls[0].body.privacyVersion,'2026-09-13');
  assert(!t.calls[0].body.sourcePage.includes('secret'));
  assert(!JSON.stringify(t.calls[1]).includes('0500000000'));assert(!JSON.stringify(t.calls[1]).includes('בדיקה מקומית'));
  assert(t.d.querySelector('.formMsg.ok'));assert.equal(f.querySelector('[name="contactConsent"]').checked,false);
  assert.equal(t.d.querySelectorAll('main').length,1);assert.equal(t.d.querySelectorAll('body > .whyEden').length,0);
  t.dom.window.close();
 }
 t=await setup('contact.html',null,true);let f=t.d.querySelector('form');f.querySelector('[name="parentName"]').value='test';f.querySelector('[name="phone"]').value='0500000000';f.querySelector('[name="contactConsent"]').checked=true;f.dispatchEvent(new t.w.Event('submit',{cancelable:true}));await tick();assert.equal(t.calls.length,1);assert(t.d.querySelector('.formMsg.bad'));t.dom.window.close();
 t=await setup('privacy.html');assert(t.d.querySelector('.privacy-banner'));t.dom.window.close();
 console.log('PASS: consent default, opt-in, reload, withdrawal, malformed/expired storage, 4 forms, required consent, query stripping, notification minimization, failure, legal page controls. No external requests were sent.');
})().catch(e=>{console.error(e);process.exit(1)});
