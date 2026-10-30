from PIL import Image, ImageDraw, ImageFont
names=['01-hero','02-form','03-success','04-errors-duplicate','05-for-businesses','06-admin-login','06-admin-empty','06-admin-populated','06-admin-delete','07-footer']
F='html/assets/fonts/nacelle-600.otf'; f=ImageFont.truetype(F,34); fs=ImageFont.truetype(F,22)
colw=720; mw=300; pad=40; gap=40; cells=[]
for n in names:
    d=Image.open(f'{n}-desktop.png').convert('RGB'); m=Image.open(f'{n}-mobile.png').convert('RGB')
    d=d.resize((colw,int(d.height*colw/d.width))); m=m.resize((mw,int(m.height*mw/m.width)))
    h=min(max(d.height,m.height),1100); cells.append((n,d.crop((0,0,colw,min(d.height,h))),m.crop((0,0,mw,min(m.height,h))),h))
# two columns of cells
cw=colw+24+mw; W=pad*2+cw*2+gap
cols=[[],[]]; hs=[0,0]
for c in cells:
    i=0 if hs[0]<=hs[1] else 1; cols[i].append(c); hs[i]+=c[3]+90
H=pad+70+max(hs)
im=Image.new('RGB',(W,H),'#eef1f6'); dr=ImageDraw.Draw(im)
dr.text((pad,pad),'Payam waitlist — mockups (desktop 1440 · mobile 390). Admin "populated" uses EXAMPLE DATA (mockup only).',font=f,fill='#0c1425')
for ci,col in enumerate(cols):
    x=pad+ci*(cw+gap); y=pad+70
    for n,d,m,h in col:
        dr.text((x,y),n,font=fs,fill='#2851cb'); y+=36; im.paste(d,(x,y)); im.paste(m,(x+colw+24,y)); y+=h+54
im.save('overview.png'); print(im.size)
