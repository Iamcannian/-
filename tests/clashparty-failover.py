import json,threading,time,subprocess,urllib.request,os
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
root=Path(os.environ.get('CLASHPARTY_TEST_OUTPUT','/tmp/clashparty-engine-test'));cfg=json.loads((root/'merged.json').read_text());cfg['external-controller']='127.0.0.1:19949';cfg['mixed-port']=19948
state={'first':True,'requests':{19941:0,19942:0}}
class Handler(BaseHTTPRequestHandler):
 def do_CONNECT(self):
  self.wfile.write(b'HTTP/1.1 200 Connection established\r\n\r\n');self.wfile.flush()
  self.connection.settimeout(2)
  line=self.rfile.readline()
  while line and line.strip():line=self.rfile.readline()
  state['requests'][self.server.server_port]+=1
  status=b'200 OK' if self.server.server_port==19942 or state['first'] else b'503 Unavailable'
  self.wfile.write(b'HTTP/1.1 '+status+b'\r\nContent-Length: 0\r\nConnection: close\r\n\r\n')
  self.wfile.flush()
 def do_GET(self):
  status=200 if self.server.server_port==19942 or state['first'] else 503
  self.send_response(status);self.send_header('Content-Length','2');self.end_headers();self.wfile.write(b'ok')
 do_HEAD=do_GET
 def log_message(self,*a):pass
servers=[ThreadingHTTPServer(('127.0.0.1',port),Handler) for port in [19941,19942]]
for server in servers:threading.Thread(target=server.serve_forever,daemon=True).start()
first=next(p['name'] for p in cfg['proxies'] if '美国' in p['name'] and p['type']!='direct')
for i,p in enumerate(cfg['proxies']):
 if p['type']!='direct':cfg['proxies'][i]={'name':p['name'],'type':'http','server':'127.0.0.1','port':19941}
second='美国 本地备用测试';cfg['proxies'].append({'name':second,'type':'http','server':'127.0.0.1','port':19942})
for g in cfg['proxy-groups']:
 if g['name']=='美国-故障转移':g['proxies']=[first,second]
 if g['type'] in ['url-test','fallback','load-balance']:g.update({'url':'http://local-test.invalid/ping','interval':1,'lazy':False,'expected-status':'200','timeout':1000})
(root/'local-failover.json').write_text(json.dumps(cfg,ensure_ascii=False));log=(root/'local-failover.log').open('w');p=subprocess.Popen([os.environ.get('MIHOMO_BIN','/tmp/mihomo-v3'),'-d',str(root),'-f',str(root/'local-failover.json')],stdout=log,stderr=log)
def groups():
 with urllib.request.urlopen('http://127.0.0.1:19949/proxies',timeout=1) as r:return json.load(r)['proxies']
def wait_now(expected):
 for i in range(70):
  try:
   if groups()['美国-故障转移']['now']==expected:return
  except Exception:pass
  time.sleep(.1)
 raise AssertionError('fallback did not select '+expected+'; requests='+str(state['requests'])+'; state='+str(groups()['美国-故障转移']))
try:
 wait_now(first)
 assert groups()['默认代理']['now']=='自动选择', 'old cached selection must not override preset'
 assert groups()['OpenAI']['now']=='美国-故障转移'
 state['first']=False;wait_now(second)
 state['first']=True;wait_now(first)
 report={'test':'local HTTP proxy health fixture','firstHealthy':first,'afterFirstFails':second,'afterRecovery':first,'defaultSelection':'自动选择','windowsClientTested':False,'healthIntervalForTestOnly':1}
 (root/'local-failover-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS:',json.dumps(report,ensure_ascii=False))
finally:
 p.terminate();p.wait(timeout=5);log.close()
 for server in servers:server.shutdown();server.server_close()
