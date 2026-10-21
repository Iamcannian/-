"""Validate both independent platforms and Party v2.0.4 settings ownership."""
from pathlib import Path
import json,zipfile,tempfile,hashlib
p=Path(__file__).resolve().parents[1]
assert (p/'mobile/bettbox.js').read_bytes()==(p/'mihomoScript-bettbox-next.js').read_bytes()
assert (p/'desktop/clash-party.js').read_bytes()==(p/'mihomoScript-clashparty.js').read_bytes()
phone=(p/'mobile/bettbox.js').read_bytes()
assert hashlib.sha1(b'blob '+str(len(phone)).encode()+b'\0'+phone).hexdigest()=='e0fda64415e482c8fa6745c2f43bfa58dae21054'
assert (p/'desktop/ClashParty-Windows-Settings.zip').read_bytes()==(p/'ClashParty-Windows-Settings.zip').read_bytes()
with zipfile.ZipFile(p/'desktop/ClashParty-Windows-Settings.zip') as z:
 assert set(z.namelist())=={'config.yaml','mihomo.yaml'}
 app=json.loads(z.read('config.yaml'));core=json.loads(z.read('mihomo.yaml'))
 assert app['operationMode']=='standard' and app['modeSelected']
 assert app['core']=='mihomo' and not app['enableSmartCore'] and not app['enableSmartOverride']
 assert not app['controlDns'] and not app['controlSniff'] and not app['disableDnsOverrideGuard']
 assert app['sysProxy']['enable'] and app['sysProxy']['host']=='127.0.0.1'
 assert not core['tun']['enable'] and core['ipv6']
 assert not core['profile']['store-selected'] and core['profile']['store-fake-ip']
 assert not core['allow-lan'] and core['mixed-port']==app['showMixedPort']
 assert app['enableMixedPort'] and not app['enableHttpPort'] and not app['enableSocksPort']
 with tempfile.TemporaryDirectory() as d:
  dest=Path(d)
  for n in ['profile.yaml','override.yaml','cache.db']: (dest/n).write_bytes(b'preserve-sentinel')
  z.extractall(dest)
  for n in ['profile.yaml','override.yaml','cache.db']: assert (dest/n).read_bytes()==b'preserve-sentinel'
 assert {'appSettings':app,'coreSettings':core}==json.loads((p/'desktop/settings-reference.json').read_text())
print('PASS: phone fingerprint unchanged; separate entrypoints; settings ownership; ZIP scope and existing subscriptions retained')
