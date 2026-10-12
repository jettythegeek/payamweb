import json,re,html,hashlib
from pathlib import Path
root=Path('website'); content=root/'content'
answers=json.loads((content/'faq.json').read_text(encoding='utf-8'))
answers={k:v.replace("\\'", "'") for k,v in answers.items()}
no=[k for k in answers if k.startswith(('Hva','Hvordan','Kan','Hvem'))];en=[k for k in answers if k not in no]
translations={k:v for k,v in zip(no,en)}
translations.update({answers[k]:answers[v] for k,v in zip(no,en)})
translations.update({
'Blogg':'Blog','Tips, historier og innsikt fra BIMM-teamet':'Tips, stories and insights from the BIMM team',
'17. mars 2026':'March 17, 2026','12. mars 2026':'March 12, 2026','9. mars 2026':'March 9, 2026',
'Beste kafeer i Oslo sentrum — med deals du kan bruke i dag':'The best cafés in central Oslo — with deals you can use today',
'Oslos kafescene er en av de beste i Skandinavia — og med BIMM har du faktisk råd til å nyte den. Her er 6 kafeer i sentrum med deals og lojalitetsbelønninger du kan bruke i dag.':'Oslo has one of the best café scenes in Scandinavia — and BIMM makes it affordable to enjoy. Here are six cafés in the city centre with deals and loyalty rewards you can use today.',
'Deal- og spareguider':'Deals and savings guides','Merkevare og historie':'Brand and story',
'De 10 beste restaurantdealene i Oslo akkurat nå (Mars 2026)':'The 10 best restaurant deals in Oslo right now (March 2026)',
'Vi rangerte de 10 beste dealene på BIMM akkurat nå etter hvor mye de sparer deg. Fra steakhouse-middager til 2-for-1 pizza — her får du mest igjen for dine 49 kr/mnd.':'We ranked the 10 best deals on BIMM by how much they save you. From steakhouse dinners to two-for-one pizza — here is how to get the most from your 49 NOK monthly subscription.',
'Hva er BIMM? Slik sparer du penger når du spiser ute i Oslo':'What is BIMM? How to save money when eating out in Oslo',
'BIMM er appen som gir deg eksklusive deals og lojalitetskort på restauranter og kafeer i Oslo. Spar penger hver gang du spiser ute — for bare 49 kr/mnd. Prøv gratis i 7 dager.':'BIMM gives you exclusive deals and loyalty cards at restaurants and cafés in Oslo. Save money whenever you eat out — for 49 NOK a month. Try it free for seven days.',
'Spørsmål og svar':'FAQs','Fant du ikke det du lette etter?':"Couldn't find what you were looking for?",'Kontakt oss':'Contact us',
'Klar for å spise smartere?':'Ready to Dine Smarter?','Last ned BIMM':'Download BIMM','og begynn å spare i dag!':'and start saving today!','GRATIS':'FREE',
})
(content/'english-translations.json').write_text(json.dumps(translations,ensure_ascii=False,indent=2),encoding='utf-8')

def translate_text(markup):
 def replace(m):
  text=m[0]; stripped=html.unescape(text).strip(); new=translations.get(stripped)
  return text if new is None else text.replace(text.strip(),html.escape(new,quote=False))
 return re.sub(r'(?<=>)[^<>]+(?=<)',replace,markup)

home=json.loads((content/'home.json').read_text(encoding='utf-8'))
nav=re.search(r'<nav\b.*?</nav>',home['html'],re.S)[0]
nav=re.sub(r'<li\b[^>]*>.*?</li>',lambda m:'' if 'min-w-[62px]' in m[0] else m[0],nav,flags=re.S)
footer=re.search(r'<footer\b.*?</footer>',home['html'],re.S)[0]
for f in content.glob('*.json'):
 d=json.loads(f.read_text(encoding='utf-8'))
 if not isinstance(d,dict) or 'html' not in d:continue
 markup=d['html'].replace('<div style="visibility:hidden">','<div>')
 markup=re.sub(r'<nav\b.*?</nav>',lambda _:nav,markup,count=1,flags=re.S)
 markup=re.sub(r'<footer\b.*?</footer>',lambda _:footer,markup,count=1,flags=re.S)
 if f.stem in ['blog','help']:
  markup=translate_text(markup)
  for a,b in translations.items():markup=markup.replace('aria-label="'+html.escape(a,quote=True)+'"','aria-label="'+html.escape(b,quote=True)+'"')
  d['title']='Blog | BIMM' if f.stem=='blog' else 'Help & FAQs | BIMM'
 def faq(m):
  chunk=m[0];question=html.unescape(re.sub('<[^>]+>','',chunk)).strip(); answer=answers.get(question)
  if not answer or 'aria-controls=' in chunk:return chunk
  id='faq-'+hashlib.sha256(question.encode()).hexdigest()[:12]
  return chunk.replace('aria-expanded="false"','aria-expanded="false" aria-controls="'+id+'"')+'<div hidden id="'+id+'" class="py-2 pb-[16px] text-[16px] lg:text-[18px] text-black" role="region">'+html.escape(answer)+'</div>'
 markup=re.sub(r'<h2 data-slot="heading">.*?</h2>',faq,markup)
 def link(m):
  url=html.unescape(m[1]);url=url.replace('https://bimm.app','')
  if not url.startswith('/'):return m[0]
  if url=='/en' or url.startswith('/en/') or url.startswith('/en#'):url=url[3:] or '/'
  url=url.replace('/bedrift','/business').replace('/student','/students') if not url.startswith('/students') else url
  url=url.replace('/hvor-skal-vi-spise','/where-to-eat-in-oslo')
  if url=='/download':url='/#download'
  key=url.split('?')[0].split('#')[0].strip('/').replace('/','__') or 'home'
  return 'href="'+html.escape(url if (content/(key+'.json')).exists() else 'https://bimm.app'+url,quote=True)+'"'
 markup=re.sub(r'href="([^"]+)"',link,markup)
 if 'id="download"' not in markup:markup=markup.replace('>Ready to Dine Smarter?</h2>',' id="download">Ready to Dine Smarter?</h2>',1)
 d['html']=markup;d['locale']='en';f.write_text(json.dumps(d,ensure_ascii=False),encoding='utf-8')
print('English content and shared navigation prepared')
