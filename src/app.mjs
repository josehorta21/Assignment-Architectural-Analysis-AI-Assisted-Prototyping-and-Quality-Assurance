import {NODES,SCENARIOS,AUDIT,SOURCES,validateRequestPath,getScenario,simulateRequest} from './model.mjs';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let activePage = 'overview';
let activeScenario = 'public';

function setPage(page, updateHash=true) {
  if (!['overview','trace','audit','quality'].includes(page)) return;
  activePage=page;
  $$('.page').forEach(el => el.classList.toggle('hidden', el.id !== `page-${page}`));
  $$('.nav-link').forEach(btn => {
    const selected=btn.dataset.page===page;
    btn.classList.toggle('active',selected);
    if (selected) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current');
  });
  $('#crumb-current').textContent=({overview:'Overview',trace:'Request trace',audit:'AI verification',quality:'QA workspace'})[page];
  if (updateHash && location.hash !== `#${page}`) history.replaceState(null,'',`#${page}`);
  window.scrollTo({top:0,behavior:'instant'});
}

function setScenario(key) {
  if (!getScenario(key)) return;
  activeScenario=key;
  $$('.scenario').forEach(btn=>{
    const selected=btn.dataset.scenario===key;
    btn.classList.toggle('active', selected);
    btn.setAttribute('aria-pressed',String(selected));
  });
  const path=SCENARIOS[key].path;
  $$('.arch-node').forEach(btn=>{
    btn.classList.toggle('is-active',path.includes(btn.dataset.node));
    btn.classList.toggle('is-muted',!path.includes(btn.dataset.node));
  });
  $('#active-path-description').textContent=path.map((node)=>NODES[node].title).join(' → ');
  $('#request-scenario').value=key;
  $('#request-path').value=SCENARIOS[key].example;
}

function showNode(key){
  const node=NODES[key];if(!node)return;
  $('#dialog-zone').textContent=node.zone.toUpperCase();
  $('#dialog-title').textContent=node.title;
  $('#dialog-description').textContent=node.description;
  $('#node-dialog').showModal();
}

function clearTrace(){
  $('#trace-results').classList.add('hidden');
  $('#trace-empty').classList.remove('hidden');
  $('#request-error').textContent='';
  $('#request-path').removeAttribute('aria-invalid');
}

function displayTrace(result){
  $('#trace-empty').classList.add('hidden');
  $('#trace-results').classList.remove('hidden');
  $('#trace-latency').textContent=`${result.totalMs} ms`;
  $('#trace-count').textContent=String(result.steps.length);
  $('#trace-status').textContent=result.status;
  $('#trace-summary').textContent=`${result.method} ${result.requestPath} · ${result.summary}${result.cacheHit?' · Hypothetical CDN cache hit.':''}`;
  const list=$('#trace-steps');list.replaceChildren();
  result.steps.forEach((step,index)=>{
    const li=document.createElement('li');
    const number=document.createElement('span');number.className='trace-step-index';number.textContent=String(index+1).padStart(2,'0');
    const name=document.createElement('span');name.className='trace-step-name';name.textContent=step.title;
    const zone=document.createElement('small');zone.className='trace-step-zone';zone.textContent=step.zone;name.append(zone);
    const time=document.createElement('span');time.className='trace-step-time';time.textContent=`${step.durationMs} ms`;
    li.append(number,name,time);list.append(li);
  });
}

function mountAudit(){
  const list=$('#audit-list');
  AUDIT.forEach(entry=>{
    const article=document.createElement('article');article.className='audit-item';
    const left=document.createElement('div');left.className='audit-col';
    const leftTitle=document.createElement('div');leftTitle.className='audit-col-title';leftTitle.textContent=`AI DRAFT CLAIM / ${entry.id.toUpperCase()}`;
    const leftP=document.createElement('p');leftP.textContent=entry.initial;
    const label=document.createElement('span');label.className='audit-verdict';label.textContent=entry.verdict;
    left.append(leftTitle,leftP,label);
    const right=document.createElement('div');right.className='audit-col corrected';
    const rightTitle=document.createElement('div');rightTitle.className='audit-col-title';rightTitle.textContent='VERIFIED CORRECTION';
    const rightP=document.createElement('p');rightP.textContent=entry.corrected;
    const link=document.createElement('a');link.href=entry.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Inspect primary source ↗';
    right.append(rightTitle,rightP,link);article.append(left,right);list.append(article);
  });
  const ul=$('#source-list');
  SOURCES.forEach(item=>{const li=document.createElement('li');const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.label;li.append(a);ul.append(li);});
}

function browserChecks(){
  const tests=[
    ['Valid route accepted',()=>validateRequestPath('/welcome/').ok===true],
    ['Empty request rejected',()=>validateRequestPath('   ').ok===false],
    ['Missing leading slash rejected',()=>validateRequestPath('welcome/').ok===false],
    ['Very long path rejected',()=>validateRequestPath('/'+'a'.repeat(190)).ok===false],
    ['Unexpected markup rejected',()=>validateRequestPath('/<script>').ok===false],
    ['Public theme flow avoids Content API',()=>!simulateRequest({scenario:'public',requestPath:'/welcome/'}).path.includes('contentapi')],
    ['Admin publish crosses Admin API',()=>simulateRequest({scenario:'publish',requestPath:'/ghost/api/admin/posts/'}).path.includes('adminapi')],
    ['Headless request crosses Content API',()=>simulateRequest({scenario:'headless',requestPath:'/ghost/api/content/posts/'}).path.includes('contentapi')],
    ['Cache hit bypasses simulated database',()=>!simulateRequest({scenario:'public',requestPath:'/',cacheHit:true}).path.includes('database')],
    ['Unknown scenario is handled',()=>simulateRequest({scenario:'unknown',requestPath:'/'}).ok===false],
    ['Form fields have accessible labels',()=>['request-scenario','request-path','cache-hit'].every(id=>document.querySelector(`label[for="${id}"]`))],
    ['All four application pages exist',()=>['overview','trace','audit','quality'].every(key=>document.getElementById(`page-${key}`))],
    ['Architecture component metadata exists',()=>Object.keys(NODES).length>=12],
    ['External source links are safe',()=>[...document.querySelectorAll('a[target="_blank"]')].every(a=>a.rel.includes('noopener'))]
  ];
  return tests.map(([name,run])=>{try{return {name,pass:Boolean(run())};}catch(error){return {name,pass:false,error:String(error)};}});
}

function showChecks(){
  const results=browserChecks();const passed=results.filter(result=>result.pass).length;
  $('#qa-counter').textContent=`${passed} / ${results.length} PASS`;
  $('#qa-status').textContent=passed===results.length?'All implemented self-checks passed. Manual cross-browser and responsive tests remain separate.':'Some self-checks failed. Inspect the results and correct the implementation.';
  const container=$('#qa-check-list');container.replaceChildren();
  results.forEach(result=>{
    const el=document.createElement('div');el.className=`qa-check ${result.pass?'pass':'fail'}`;
    const title=document.createElement('span');title.textContent=result.name;
    const badge=document.createElement('strong');badge.textContent=result.pass?'PASS':'FAIL';
    el.append(title,badge);container.append(el);
  });
}

function updateManualCount(){
  const checks=$$('#manual-checks input[type="checkbox"]');
  $('#manual-progress').textContent=`${checks.filter(c=>c.checked).length} / ${checks.length} manually confirmed in this browser`;
}

function initialize(){
  mountAudit();setScenario('public');
  $$('.nav-link').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.page)));
  $$('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.jump)));
  $$('.scenario').forEach(btn=>btn.addEventListener('click',()=>setScenario(btn.dataset.scenario)));
  $$('.arch-node').forEach(btn=>btn.addEventListener('click',()=>showNode(btn.dataset.node)));
  $('#dialog-ok').addEventListener('click',()=>$('#node-dialog').close());
  $('#request-scenario').addEventListener('change',event=>{
    const key=event.target.value;setScenario(key);clearTrace();
  });
  $('#trace-form').addEventListener('submit',event=>{
    event.preventDefault();
    const result=simulateRequest({scenario:$('#request-scenario').value,requestPath:$('#request-path').value,cacheHit:$('#cache-hit').checked});
    if(!result.ok){clearTrace();$('#request-error').textContent=result.error;$('#request-path').setAttribute('aria-invalid','true');$('#request-path').focus();return;}
    $('#request-error').textContent='';$('#request-path').removeAttribute('aria-invalid');displayTrace(result);
  });
  $('#request-path').addEventListener('input',()=>{$('#request-error').textContent='';$('#request-path').removeAttribute('aria-invalid');});
  $('#reset-trace').addEventListener('click',()=>{setScenario('public');$('#cache-hit').checked=false;clearTrace();});
  $('#run-checks').addEventListener('click',showChecks);
  $$('#manual-checks input[type="checkbox"]').forEach(box=>box.addEventListener('change',updateManualCount));
  window.addEventListener('hashchange',()=>setPage(location.hash.replace('#',''),false));
  setPage(location.hash.replace('#','')||'overview',false);
}
initialize();
