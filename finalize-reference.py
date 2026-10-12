import re,json,html
from pathlib import Path
root=Path('website');t=(root/'content/reference-interactions.txt').read_text(encoding='utf-8'); answers={}
# Translation strings in the public bundle are escaped JSON.
for q,a in re.findall(r'\\"question\\":\\"(.*?)\\",\\"answer\\":\\"(.*?)\\"',t):
 try: answers[json.loads('"'+q+'"')]=json.loads('"'+a+'"')
 except: pass
if not answers:
 for q,a in re.findall(r'"question":"(.*?)","answer":"(.*?)"',t):answers[q]=a
(root/'content/faq.json').write_text(json.dumps(answers,ensure_ascii=False),encoding='utf-8');print('FAQ answers',len(answers))
for f in (root/'content').glob('*.json'):
 data=json.loads(f.read_text(encoding='utf-8'))
 if not isinstance(data,dict) or 'html' not in data:continue
 markup=data['html'].replace('<div style="visibility:hidden">','<div>')
 def faq(m):
  chunk=m[0];question=html.unescape(re.sub('<[^>]+>','',chunk))
  answer=answers.get(question)
  if not answer or 'aria-controls=' in chunk:return chunk
  id='faq-'+str(abs(hash(question)))
  chunk=chunk.replace('aria-expanded="false"','aria-expanded="false" aria-controls="'+id+'"')
  return chunk+'<div hidden id="'+id+'" class="py-2 pb-[16px] text-[16px] lg:text-[18px] text-black" role="region">'+html.escape(answer)+'</div>'
 markup=re.sub(r'<h2 data-slot="heading">.*?</h2>',faq,markup)
 def link(m):
  url=m[1]; key=url.split('?')[0].strip('/').replace('/','__') or 'home'
  if url=='/download':return 'href="/#download"'
  return m[0] if (root/'content'/ (key+'.json')).exists() else 'href="https://bimm.app'+url+'"'
 markup=re.sub(r'href="(/[^"#]*)"',link,markup)
 markup=markup.replace('<section','<section',1)
 # Give download CTAs a stable local target.
 idx=markup.find('Klar for å spise smartere?')
 if idx!=-1:
  start=markup.rfind('<',0,idx);markup=markup[:start]+markup[start:].replace('<h2','<h2 id="download"',1)
 data['html']=markup;f.write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
