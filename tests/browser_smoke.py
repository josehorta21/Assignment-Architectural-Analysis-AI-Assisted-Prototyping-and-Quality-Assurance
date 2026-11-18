"""Optional Chromium smoke QA. Requires pip install playwright and a Chromium binary.
Run while npm run dev is serving localhost:4173.
Cross-browser testing must be performed manually when Firefox/Safari are unavailable.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
URL='http://localhost:4173/'
EVIDENCE=ROOT/'evidence'
EVIDENCE.mkdir(exist_ok=True)
results=[]

with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for label,w,h in [('desktop',1920,1080),('tablet',768,1024),('mobile',390,844)]:
    page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.on('response',lambda r: errors.append(f'HTTP {r.status}: {r.url}') if r.status>=400 else None)
    page.goto(URL,wait_until='networkidle')
    page.screenshot(path=str(EVIDENCE/f'{label}.png'),full_page=True)
    overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
    assert not overflow,(label,'horizontal overflow')
    assert page.get_by_role('heading',name='See the system. Verify the boundaries.').count()==1
    page.get_by_role('button',name='Headless API').click()
    assert page.locator('#active-path-description').inner_text().find('Content API')!=-1
    page.get_by_role('button',name='Request trace',exact=True).click()
    page.get_by_role('button',name='Run simulated trace').click()
    assert page.locator('#trace-latency').inner_text().endswith('ms')
    assert page.locator('#trace-count').inner_text()!='—'
    page.locator('#request-path').fill('')
    page.get_by_role('button',name='Run simulated trace').click()
    assert 'cannot be empty' in page.locator('#request-error').inner_text()
    page.locator('#request-path').fill('/<script>')
    page.get_by_role('button',name='Run simulated trace').click()
    assert 'unsupported characters' in page.locator('#request-error').inner_text()
    page.locator('#request-path').fill('/welcome/')
    page.get_by_role('button',name='Run simulated trace').click()
    assert page.locator('#request-error').inner_text()==''
    page.get_by_role('button',name='AI verification',exact=True).click()
    assert page.locator('.audit-item').count()==4
    page.get_by_role('button',name='QA workspace',exact=True).click()
    page.get_by_role('button',name='Run browser checks').click()
    assert '14 / 14 PASS' in page.locator('#qa-counter').inner_text()
    page.screenshot(path=str(EVIDENCE/f'{label}_qa.png'),full_page=True)
    assert not errors,(label,errors)
    results.append({'viewport':label,'pixels':f'{w}x{h}','horizontal_overflow':overflow,'console_and_http_errors':errors,'browser_self_checks':'14/14','workflows':'overview, trace validation, audit, QA'})
    page.close()
  browser.close()

(EVIDENCE/'chromium_results.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print(json.dumps(results,indent=2))
