import re,json,html,hashlib,urllib.request,concurrent.futures
from pathlib import Path
root=Path('website'); (root/'content').mkdir(exist_ok=True); (root/'public/reference').mkdir(parents=True,exist_ok=True)
origin='https://bimm.app'; assets={}; errors=[]
def asset(url):
 url=html.unescape(url)
 if url.startswith('/_next/image?'):
  from urllib.parse import parse_qs,urlparse
  url=parse_qs(urlparse(url).query)['url'][0]
 if not url.startswith('/') or url.startswith('//'): return url
 if url in assets:return assets[url]
 suffix=Path(url.split('?')[0]).suffix or '.bin'; dest='/reference/'+hashlib.sha256(url.encode()).hexdigest()[:16]+suffix
 assets[url]=dest
 try:
  data=urllib.request.urlopen(origin+url,timeout=45).read()
  if suffix=='.css':
   css=data.decode(); css=re.sub(r'url\([\"\']?([^\)\"\']+)[\"\']?\)',lambda m:'url('+asset('/_next/static/'+m[1][3:] if m[1].startswith('../') else m[1])+')',css);data=css.encode()
  (root/'public'/dest.lstrip('/')).write_bytes(data)
 except Exception as e:errors.append({'url':url,'error':str(e)})
 return dest
h=(root/'reference.html').read_text(encoding='utf-8-sig')
paths=sorted(set(html.unescape(x) for x in re.findall(r'href="(/[^"?#]*)"',h) if not x.startswith('/_next/') and '.' not in x))
paths=['/']+[p for p in paths if p!='/']
def page(path):
 try:
  raw=h if path=='/' else urllib.request.urlopen(origin+path,timeout=40).read().decode()
  styles=[asset(x) for x in re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"',raw)]
  body=re.search(r'<body([^>]*)>(.*)</body>',raw,re.S); markup=re.sub(r'<script\b[^>]*>.*?</script>','',body[2],flags=re.S)
  markup=re.sub(r'\s+srcSet="[^"]*"','',markup,flags=re.I)
  markup=re.sub(r'\bsrc="([^"]+)"',lambda m:'src="'+asset(m[1])+'"',markup)
  markup=re.sub(r'url\(&quot;([^&]+)&quot;\)',lambda m:'url(&quot;'+asset(m[1])+'&quot;)',markup)
  # Preserve links as local routes; external links remain external.
  title=html.unescape(re.search(r'<title>(.*?)</title>',raw)[1])
  record={'path':path,'title':title,'styles':styles,'bodyClass':re.search(r'class="([^"]*)"',body[1])[1],'html':markup}
  (root/'content'/('home.json' if path=='/' else path.strip('/').replace('/','__')+'.json')).write_text(json.dumps(record,ensure_ascii=False),encoding='utf-8')
  print('Saved '+path,flush=True)
 except Exception as e:errors.append({'page':path,'error':str(e)})
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(page,paths))
(root/'content/assets.json').write_text(json.dumps(assets,indent=2),encoding='utf-8')
(root/'content/import-report.json').write_text(json.dumps({'pages':paths,'assets':len(assets),'errors':errors},indent=2),encoding='utf-8')
print('Assets:',len(assets),'Errors:',len(errors))
