import json,subprocess,time,urllib.request,urllib.parse,os
from pathlib import Path
r=Path(os.environ.get('CLASHPARTY_TEST_OUTPUT','/tmp/clashparty-engine-test'));c=json.loads((r/'merged.json').read_text());c['external-controller']='127.0.0.1:19959';c['mixed-port']=19958
base='http://127.0.0.1:19959'
def get():
 with urllib.request.urlopen(base+'/proxies',timeout=1) as v:return json.load(v)['proxies']
def start(cfg):
 (r/'cache-migration.json').write_text(json.dumps(cfg,ensure_ascii=False));p=subprocess.Popen([os.environ.get('MIHOMO_BIN','/tmp/mihomo-v3'),'-d',str(r),'-f',str(r/'cache-migration.json')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 for _ in range(50):
  try:get();return p
  except Exception:time.sleep(.1)
 p.terminate();p.wait();raise AssertionError('engine startup timeout')
c['profile']['store-selected']=True;p=start(c)
try:
 req=urllib.request.Request(base+'/proxies/'+urllib.parse.quote('默认代理'),data=json.dumps({'name':'香港'}).encode(),headers={'Content-Type':'application/json'},method='PUT')
 with urllib.request.urlopen(req,timeout=2) as v:assert v.status==204
 assert get()['默认代理']['now']=='香港'
finally:p.terminate();p.wait(timeout=5)
c['profile']['store-selected']=False;p=start(c)
try:
 assert get()['默认代理']['now']=='自动选择'
 print('PASS: old persisted Hong Kong selection ignored by desktop automatic preset after restart')
finally:p.terminate();p.wait(timeout=5)
