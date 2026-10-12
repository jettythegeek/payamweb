import re,json,html,shutil
from pathlib import Path
root=Path('website');content=root/'content';backup=content/'before-payam-copy';backup.mkdir(exist_ok=True)
(root/'public/payam').mkdir(exist_ok=True)
shutil.copyfile('mobile/assets/images/payam-logo.png',root/'public/payam/logo.png')
copy={
'BIMM':'Payam','What is BIMM':'What is Payam','What is BIMM?':'What is Payam?',
'Our Deals':'Explore Payam','View deals':'Explore Payam','View more deals':'Explore more','Browse Our Deals':'Explore your everyday','All deals':'All categories',
'Trusted by 10,000 people':'Everyday life, in one app','Available on iOS and Android':'Payments, shopping and local services',
'Save money at your':'Get everyday things done','favorite places -':'with local possibilities —','just swipe':'all in one','the deal':'Payam',
'BIMM is an app for people who love going out. It gives you access to exclusive deals and special offers from your favorite restaurants and cafes — all in one place.':'Payam helps you pay bills, shop local and request everyday services. Discover products, providers and useful money tools — all in one app.',
'Scan your QR':'Choose what you need','and enjoy rewards':'and take the next step','Free matcha':'Everyday payments','Collect 6 stamps and get a free matcha':'Airtime, data and household bills','3 of 6 scans':'Pay in the app','3 more':'View history',
'Exclusive Deals':'Local possibilities','Access deals at top-rated restaurants and local cafes':'Explore products and services from local sellers and providers',
'Loyalty Cards':'Money tools','Forget about the hassle with paper stamp cards':'Request money or coordinate shared payments',
'Easy to Use':'One familiar place','Save time with a streamlined process that works in seconds':'Keep your payments, orders and requests together',
'How It Works':'How Payam works',
"Find a deal, book it, and check in when you arrive. We've removed all the friction so you can focus on enjoying your meal.":'Choose what you need, review the details and follow it through. Payam brings your next payment, purchase or service request into one place.',
'Find a deal in BIMM':'Find what you need','Book a deal':'Review the details','Two menu = Two discounts':'A meal for your day','Save 150 NOK':'Explore Food',
'Enjoy a regular or vegetarian share menu for two or more people and get a 15 % discount.':'Browse restaurant options through available partners. Check the meal, price and fulfilment details before ordering.',
'Get this deal':'Explore Payam','3 Taco Deal!':'Help for your home','Valid today until 21:00':'Products and local services','Save 100 NOK':'Explore Services',
'Stop by every day after 12:00 and get 3 tacos for 259 kr!':'Find local help for cleaning, repairs and other tasks. Explain what you need before agreeing to the work.',
'2h 15m left':'Check availability','Check in and get your deal':'Follow your order or request',
'OFFERS':'EVERYDAY LIFE','Dining out should feel easy, not expensive':'Your day has enough moving parts',
'BIMM brings exclusive restaurant and café deals into one app — helping you dine more often and spend less.':'Payam brings payments, local shopping and service requests together — giving you one place to handle more of your everyday.',
'Hot & Cold Drinks':'Food and groceries','Great deals for your daily routine':'Meals and essentials for your day','Everyday Meals':'Shopping and services','Affordable lunches and casual spots':'Local products and practical help',
'WHY BIMM?':'WHY PAYAM?','Enjoy Dining Without Overthinking It':'More of your everyday, together','Monthly Savings':'Everyday payments',
'Save on every meal and see your bank balance grow month after month.':'Top up airtime and data, pay supported bills and keep track of your payment history.',
'One Membership, Infinite Venues':'Local people, useful services','A single subscription unlocks access to a diverse range of partner restaurants and cafes.':'Discover local sellers and providers. Read their offerings and choose what fits your needs.',
'Zero Friction':'Clear next steps','No physical cards, just a seamless experience.':'Review the details and follow your payment, order or request in the app.',
'REVIEWS':'EVERYDAY USES','Real Stories. Real Savings.':'Real life. Everyday possibilities.',
'Join thousands of members who elevate their dining experience every day with BIMM.':'From the bills you pay to the help you need at home, explore ways Payam can fit into your day.',
'A game changer for my morning coffee. I save every single day without any hassle at the counter.':'Top up your line, buy data and pay supported household bills from one place.','Henrik':'Payments',
"Love how simple it is — just swipe and you're done. I've been recommending BIMM to all my friends.":'Browse local products, check the details and choose available delivery or pickup options.','Ingrid':'Shopping',
'One subscription for all my favorite spots. It paid for itself in the first week!':'Shop for foodstuffs, groceries and the household essentials on your list.','Lars':'Grocery',
"BIMM makes dining out so much more affordable. I've discovered amazing new places I never would have tried.":'Find help with cleaning, repairs and other tasks. Share the details that matter to the job.','Oliver':'Services',
'I use BIMM almost every day. The variety of restaurants keeps growing, and the savings are unreal.':'Explore food options through participating partners and check availability before ordering.','Amalie':'Food',
'Perfect for date nights. We save enough to eat out twice as often as before!':'Explore SplitPay, Pay4Me and money requests for payments you coordinate with others.','Kwame':'Money tools',
"The best subscription I've ever had. It literally pays for itself after two meals.":'Show what you sell or the services you offer. Manage customer orders and requests with Payam for Business.','Sofia':'For business',
'Ready to Dine Smarter?':'Ready for an easier everyday?','Download BIMM':'Discover Payam','and start saving today!':'and get everyday things done!',
'How does BIMM work?':'How does Payam work?','How much does BIMM cost?':'How do I check the cost?','Can I cancel my subscription?':'Can I buy for someone else?','How do I redeem a deal?':'How do I request a service?','Who is behind BIMM?':'Who is Payam for?',
'BIMM is an app that gives you access to exclusive deals and offers at restaurants and cafes. Just subscribe, browse deals near you, and save on every meal.':'Payam brings everyday payments, local shopping and service requests into one app. Find the products, providers and tools that help you get things done.',
"Download the app, enable subscription, and start browsing deals. When you find one you like, book it for a date and time, then show up and swipe to check in — it's that simple.":'Choose a category, review the details and follow the steps for your payment, order or request. Available options depend on your location and the provider or partner.',
"Loyalty cards are free, but you'll need to pay for the subscription to get access to Deals. Premium costs 49 NOK a month, or 295 NOK a year (24.58 NOK/month) — both with a 7-day free trial. You can cancel at any time.":'Review the price, any applicable fees and the total shown in the app before confirming. Service requests may need a quote before you agree to the work.',
'Yes, you can cancel anytime. Your access stays active until the end of your current billing period — no hidden fees or cancellation penalties.':'Supported journeys let you pay or buy for another person. Check their mobile number, recipient details and location before confirming.',
'Open the BIMM app, find a deal you want, and book it for a date and time. At the venue, swipe to check in and show it to the staff.':'Explore Services, review a provider’s offering and explain the task, location and timing. Check the scope and price before agreeing to the work.',
'BIMM is developed by a team of passionate developers from Oslo, Norway. We believe in making dining out more accessible and enjoyable for everyone.':'Payam is for people managing everyday needs, and for the local businesses, vendors and providers who help them do it.',
'Explore BIMM':'Explore Payam','Student Deals':'For students','Norway on a Budget':'Everyday with Payam','Norway on a budget':'Everyday with Payam','Where to Eat in Oslo':'Local life with Payam','© 2026 BIMM AS':'© 2026 Payam',
'Student deals in Oslo':'Payam for students','Where to eat in Oslo tonight':'Everyday life with Payam','Eating out in Norway on a budget':'Handle everyday needs with Payam','BIMM for companies & universities':'Payam for businesses and providers',
'Last ned appen':'Download the App','2FOR1':'EXPLORE','FREE':'LOCAL','support@bimm.app':'support@payam.ng',
'Our Deals in':'Everyday possibilities in','Your City':'one Payam','Restaurant & café deals by city':'Explore everyday needs',
'Explore exclusive deals and loyalty programs at restaurants and cafés in these cities. Tap a city for every venue.':'Explore payments, products and service requests. These cards show example tasks, not a live catalogue of Payam sellers.',
'Some deals may have specific availability hours. Always check the app for the latest details before visiting.':'Products, services and partner options vary by location. Check the app for availability, prices and fulfilment details.',
'Open':'Explore','750m':'Local options','TASTING MENU':'FOOD OPTIONS','50 KR OFF KING CRAB':'CHECK DETAILS','2FOR1 PIZZA':'MEAL OPTIONS','FREE DESSERT':'ORDER DETAILS','FREE COFFEE':'ESSENTIALS','2FOR1 DESSERT':'LOCAL SHOPPING',
'Tips, stories and insights from the BIMM team':'Practical guides for everyday life with Payam','March 17, 2026':'Payments guide','March 12, 2026':'Services guide','March 9, 2026':'Business guide','Anton Katyrenchuk':'Payam',
'The best cafés in central Oslo — with deals you can use today':'Everyday payments, with the details in front of you',
'Oslo has one of the best café scenes in Scandinavia — and BIMM makes it affordable to enjoy. Here are six cafés in the city centre with deals and loyalty rewards you can use today.':'Choose the right bill, check the recipient and review the amount before paying for airtime, data or a household bill.',
'The 10 best restaurant deals in Oslo right now (March 2026)':'A clearer brief for your next service request',
'We ranked the 10 best deals on BIMM by how much they save you. From steakhouse dinners to two-for-one pizza — here is how to get the most from your 49 NOK monthly subscription.':'Help a local provider understand the task, your location and preferred timing. Review the offering and agree on the scope and price.',
'What is BIMM? How to save money when eating out in Oslo':'Make your products and services easier to find',
'BIMM gives you exclusive deals and loyalty cards at restaurants and cafés in Oslo. Save money whenever you eat out — for 49 NOK a month. Try it free for seven days.':'Present what you offer with useful photos, descriptions and pricing. Manage customer orders and requests with Payam for Business.',
'Deals and savings guides':'Everyday guides','Brand and story':'Local business',
}

copy.update({
'For organisations':'For businesses','BIMM for':'Payam for','companies and universities':'local sellers and providers',
'We approve your email domain':'Set up your business profile','Your people unlock Premium':'Publish what you offer','For companies':'For local sellers','For universities & colleges':'For service providers',
'What your people get with Premium':'What you can do with Payam','2-for-1 meals, fixed-krone discounts and free items at partner restaurants and cafés':'Publish products and services in the right category','Free stamp-card loyalty — no subscription needed to collect stamps':'Keep your profile, prices and availability current','New deals added regularly, primarily across Oslo and a few other cities':'Receive and follow customer orders and requests','Book a deal, show up and swipe to check in — no coupons, no codes':'Make the scope, fulfilment and next step clear',
'BIMM deals right now':'Your business, in one place','A live snapshot of what your team would get access to in Oslo today.':'Useful tools for presenting your offerings and managing customer work.','Bring BIMM to your organisation':'Bring your business to Payam','How do we give our team or students BIMM Premium?':'How can my business use Payam?','What does it cost our organisation?':'Where do I check the charges?','Is it free for our employees or students?':'Can I offer products and services?','What do they get with Premium?':'What can I manage?',
'How students':'Handle your','eat out cheap':'everyday needs','in Oslo':'with Payam','Updated October 2026':'Everyday uses for student life','What students get':'Ways to use Payam','All deals for 49 NOK a month':'Airtime, data and bills','Free stamp cards':'Local shopping','Your uni email may unlock Premium':'Practical help','Invite a friend':'Shared payments','The math':'Check the details','Cheap eats for campus life':'Everyday needs for campus life','See all deals in Oslo':'Explore Payam','Student FAQ':'Student questions','Do restaurants in Oslo offer student discounts?':'How can I use Payam as a student?','Is BIMM free for students?':'Where do I check prices and fees?','How do I eat out cheap in Oslo as a student?':'Can I coordinate payments with others?','What kinds of deals are on BIMM?':'What can I explore on Payam?','Can I cancel anytime?':'Where can I get help?',
'Eating out in Norway':'Everyday life','on a budget':'in one Payam','BIMM in Oslo, by the numbers':'Ways to handle your everyday','Updated October 2026 · live counts from the BIMM app':'Choose the category that fits your day','How BIMM works for visitors':'How to use Payam','Download the free app':'Start with your everyday need','Subscribe to BIMM Premium':'Review the details','Browse deals and book a time':'Place your order or request','Show up and swipe to check in':'Follow the next step','Get the app:':'Explore the app:',
'Practical ways to eat well for less in Norway':'Practical ways to handle your everyday','Time your meals around deal windows':'Keep the essentials together','Share 2-for-1 meals':'Shop with the details in front of you','Collect loyalty stamps at coffee shops and bakeries':'Give providers a useful brief','Drink tap water — and watch the bar tab':'Check who a payment is for','Go big at lunch':'Keep track of your next step','Real deals on BIMM right now':'Everyday tasks to explore','A live sample of what members can book in Oslo — sorted by the amount you save per visit.':'Examples of needs you can explore through Payam’s categories. Check availability in the app.','Browse all deals':'Explore Payam','Where BIMM works':'Explore Payam categories','Traveler FAQ: eating out in Norway on a budget':'Questions about everyday life with Payam','Is Norway expensive for eating out?':'What is Payam for?','How can I save money on food as a tourist in Norway?':'How do I check the cost?','Does BIMM work for visitors, or only locals?':'Can I buy for someone else?','Which cities does BIMM cover?':'Where are services available?','What kinds of restaurant deals are on BIMM?':'What can I explore?','Do I need coupons or vouchers to use the deals?':'How do I get help?',
'100':'Pay','Active deals':'Everyday bills','48':'Shop','Venues with deals':'Local products','20–478 NOK':'Find','Savings per visit':'Services','≈ 109 NOK':'Share','Average saving':'Payments','10':'Order','2-for-1 deals':'Food','62':'Buy','Fixed discounts':'Groceries','28':'Explore','Free items':'Local help','103':'Follow','Loyalty stamp cards':'Your requests',
})
city_names=['Oslo','Lillestrøm','Moss','Sandvika','Tromsø','Budapest','Sandefjord','Budaörs','Drammen','Vestby','Veszprém']
category_names=['Payments','Food','Shopping','Grocery','Transport','Services','Health','Business','Money tools','Local sellers','Help']
for city,category in zip(city_names,category_names):
 copy['Deals in '+city]=category;copy['Venues in '+city]=category;copy[city]=category
tasks=['Airtime top-up','Data bundles','Electricity bills','TV payments','Food options','Local groceries','Household essentials','Cleaning requests','Home repairs','Printing services','Creative services','Professional support']
places=['Dumpling AS','Mamma Pizza Vika','Fjær Konfekt','Sweetmint Grünerløkka','Twintea','The Fragrance of the Heart - Majorstuen','Dirty Taco','Johnny Rockets Storo','Bloom & Brew Stenersgata','Sabrura Sticks & Sushi Valkyrien','Mamma Pizza Osteria Italiana','Spillbaren Lillestrøm',"O'Learys Moss",'Johnny Rockets  Sandvika','Hard Rock Cafe Tromsø','Nor/ma Bartók','nor/ma','fekete - brew & food bar','fekete - telekom campus','Norma Grand','Kollab Revamp','Kollab','Leopard nordic pizza studio','Kafka Sandefjord AS','1.ETAGE Café & Bar Sandefjord','major - korty es falat','U.S. Iceplace Drammen','The Laughing Brewdha Vestby','FOTON KÁVÉZÓ','BonBon Oslo','Boulangerie M Skøyen','Encore Kafe & Konditori Oslo','Haus di Gusto','Café Laundromat','Vine&Olive','Venue Bar & Restaurant','Spillbaren Majorstuen','Mamma Pizza Nydalen']
copy.update({place:tasks[i%len(tasks)] for i,place in enumerate(places)})
copy.update({'Italian':'Food options','Bubble Tea':'Meals','Vegetarian':'Food options','Mexican':'Local meals','American':'Food options','Coffee Shop':'Everyday essentials','Sushi':'Food options','Game Bar':'Local services','Bakery':'Groceries','Coworking Space':'Business support','Pizza':'Food','Food Truck':'Food options','Coffee shops':'Payments','Bakeries':'Groceries','Burgers':'Services','venues':'example tasks'})

# Replace source-specific paragraphs with Payam copy, without changing their markup.
paragraph_rules=[
 (r'^Give your employees','Sell products or offer services? Payam for Business helps you present what you do, keep prices and availability clear, and manage customer orders and requests.'),
 (r'^Email us at','Tell us about your business and the products or services you offer. Contact support@payam.ng with your questions.'),
 (r'^We add your organisation','Add your business details and provide the information required for your category and account.'),
 (r'^Everyone with a work','Create clear product or service listings. Keep your pricing, availability and fulfilment details up to date.'),
 (r'^A perk your team','Show your products with useful descriptions, photos and prices. Help customers understand what you sell and how they can receive it.'),
 (r'^Give students a real','Explain your services, where you work and what is included. Receive customer requests with details relevant to the task.'),
 (r'^As of October','Explore Payments, Food, Shopping, Grocery, Transport, Services, Health and Business. Check available products and services in the app.'),
 (r'^Tell us who you are','Tell us what you sell or the services you provide. Ask the Payam team about the next step for your business.'),
 (r'^Get in touch at','Set up a business profile and publish products or services in the relevant category. Contact support@payam.ng if you need help.'),
 (r'^It depends on your size','Review the fees and terms that apply to your business and transactions. Ask the Payam team if you need clarification before proceeding.'),
 (r'^Yes — once your email','Choose the categories relevant to what you offer. Each listing should clearly describe its product or service, price and fulfilment requirements.'),
 (r'^All BIMM deals','Manage your profile, offerings, availability and customer orders or requests with the tools available for your category.'),
 (r'^Email support@bimm','Email support@payam.ng with your business type and the products or services you offer.'),
 (r'^Eating out in Oslo','Data for your coursework, essentials for your room and help with everyday tasks. Payam brings payments, local shopping and service requests together for your day.'),
 (r'^How it works: find a deal','Choose what you need, review the price and details, and follow your payment, order or request in the app.'),
 (r'^One subscription unlocks every','Top up airtime and data or pay a supported household bill. Review the recipient and amount before confirming.'),
 (r'^Loyalty stamp cards at','Browse products and groceries from local sellers. Check prices, descriptions and available delivery or pickup options.'),
 (r'^Some universities and employers','Explore cleaning, repairs, printing and other services. Tell a provider what you need and review the scope and quote.'),
 (r'^Invite a friend to','Explore SplitPay, Pay4Me and money requests for payments you coordinate with others.'),
 (r'^75 of the','Review prices, fees, recipients and fulfilment details before confirming. Available options vary by location and provider.'),
 (r'^Coffee for the reading','A top-up, groceries or a service request — explore categories that fit your day. These are example uses, not live seller availability.'),
 (r'^A few places run','Use Payments for airtime, data and supported bills. Explore local shopping, groceries and services for the things you need during student life.'),
 (r'^The app is free to download','Check the price, fees and total in the app before confirming. Services may require a quote before the scope and price are agreed.'),
 (r'^Plan around the deals','Explore SplitPay, Pay4Me and money requests. Review the participants, amounts and status for the tool you choose.'),
 (r'^Deals are 2-for-1','Explore Payments, Food, Shopping, Grocery, Transport, Services, Health and Business. Options depend on location and participating providers.'),
 (r'^Yes\. BIMM Premium','Use Help in the app or contact support@payam.ng. Include the relevant reference, but never share your password or transaction PIN.'),
 (r'^Norway — and Oslo','Life comes with bills to pay, things to buy and tasks that need a helping hand. Payam brings more of those everyday needs together in one app.'),
 (r'^BIMM is a subscription','Explore Payments, Food, Shopping, Grocery, Transport, Services, Health and Business. Products, service options and partner availability depend on your location.'),
 (r'^BIMM is free to download','Choose the category for the bill, product or service you need.'),
 (r'^Deals require the subscription','Check the amount, recipient, scope and applicable fees before confirming.'),
 (r'^Pick a deal','Choose what you need and provide the relevant details, location and timing. Services may require an agreed quote.'),
 (r'^At the venue, swipe','Check the status of your payment, order or request in Payam. Use Help when you need support.'),
 (r'^Traveling with someone','Coordinating with someone else? Explore SplitPay, Pay4Me and money requests for supported shared-payment needs.'),
 (r'^Studying or working','Buying for someone else? Supported journeys let you provide a different recipient. Check their details before confirming.'),
 (r'^Many restaurant deals','Use Payments for airtime, data and supported bills. Check each payment status and keep the reference when you need help.'),
 (r'^Two-for-one deals','Read product descriptions and prices. Check available delivery or pickup options before placing an order.'),
 (r'^Stamp cards on BIMM','Describe the task, location and preferred timing. Useful details help a provider understand what you need.'),
 (r'^Tap water in Norway','Confirm the mobile number, meter, account or recipient before paying. Check the details rather than relying on a familiar name.'),
 (r'^Many restaurants offer lunch','Review your payment, order or request status in the app. If you need support, include the relevant reference.'),
 (r'^Deals change','Products, services and partner options vary by location. Check the details and availability in the app.'),
 (r'^BIMM works primarily','Find the category that fits your task. Availability depends on your location, the provider and the participating partner.'),
 (r'^Eating out in Norway','Payam brings everyday payments, local shopping and service requests into one app.'),
 (r'^Combine a few habits','Check the price, applicable fees and total before confirming. Services may require an agreed quote.'),
 (r'^It works exactly the same','Supported journeys let you buy or pay for another person. Check their recipient details and location before confirming.'),
 (r'^Primarily Oslo','Available products, services and partner options depend on your location. Check what is shown in the app.'),
 (r'^Four main kinds','Explore the eight main categories, from Payments and Shopping to Services and Business support.'),
 (r'^No\. There are no coupons','Use Help in the app or email support@payam.ng with the relevant reference. Never share your password or transaction PIN.'),
]

def replacement(text,selected):
 text=text.replace("\\'", "'")
 if text in copy:return copy[text]
 if not selected:return text
 for pattern,new in paragraph_rules:
  if re.search(pattern,text):return new
 for city,category in zip(city_names,category_names):
  if re.match('Deals in '+re.escape(city)+' —',text):return category+' — explore in the app'
 if re.search(r'(Save \d+ NOK|save approx|Every \d+(?:th|st|nd|rd).+free|venues in this category)',text,re.I):return 'Check details in the app'
 if re.match(r'^· (?:\+\d|Sun|Fri|Mon)',text):return '· Check availability'
 if re.match(r'^Available:',text):return 'Availability varies'
 if re.match(r'^See all \d+',text):return 'Explore more options'
 if re.search(r'— (?:Save|2 for 1)',text):return 'Review the offering and price'
 if re.match(r'^, \d+ with active deals',text):return ' in the app'
 if re.match(r'^\d+ venues?$',text):return 'Explore options'
 if re.fullmatch(r'\d+',text) and text not in ['1','2','3','4']:return 'Explore'
 if re.search(r'BIMM|Oslo|Norway|\bNOK\b|\bPremium\b',text):return 'Explore Payam for everyday payments, local products and service requests.'
 return text

report=[]
for f in content.glob('*.json'):
 data=json.loads(f.read_text(encoding='utf-8'))
 if not isinstance(data,dict) or 'html' not in data:continue
 name=f.stem.removeprefix('en__')
 selected=name in ['home','business','students','norway-on-a-budget','deals','blog','help','where-to-eat-in-oslo'] or name.startswith('deals__')
 before=data['html']
 def replace(m):
  value=html.unescape(m[0]);text=value.strip();new=replacement(text,selected)
  if new==text:return m[0]
  return value[:len(value)-len(value.lstrip())]+html.escape(new,quote=False)+value[len(value.rstrip()):]
 after=re.sub(r'(?<=>)[^<>]+(?=<)',replace,before)
 logo_sources=['/reference/2845d56155219054.png','/reference/85d5cf1438fe1490.webp']
 for src in logo_sources:after=after.replace('src="'+src+'"','src="/payam/logo.png"')
 after=after.replace('alt="BIMM"','alt="Payam"')
 if after==before:continue
 if not (backup/f.name).exists():shutil.copyfile(f,backup/f.name)
 assert re.findall(r'</?([a-zA-Z][\w:-]*)\b',after)==re.findall(r'</?([a-zA-Z][\w:-]*)\b',before),f.name
 assert re.findall(r'class="[^"]*"|style="[^"]*"',after)==re.findall(r'class="[^"]*"|style="[^"]*"',before),f.name
 old_images=re.findall(r'<img\b[^>]*src="([^"]+)"',before);new_images=re.findall(r'<img\b[^>]*src="([^"]+)"',after)
 assert len(old_images)==len(new_images)
 assert all(a==b or (a in logo_sources and b=='/payam/logo.png') for a,b in zip(old_images,new_images))
 assert re.findall(r'href="[^"]*"',after)==re.findall(r'href="[^"]*"',before)
 data['html']=after
 if selected:data['title']={'home':'Payam — Everyday life, in one app','business':'Payam for Business','students':'Payam for students','norway-on-a-budget':'Everyday with Payam','deals':'Explore Payam','blog':'Payam guides','help':'Payam help'}.get(name,'Explore Payam')
 f.write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8');report.append(f.name)
(content/'payam-copy-report.json').write_text(json.dumps({'changed':report,'verification':'Identical tags, classes, styles, links and non-logo image sources.'},indent=2),encoding='utf-8')
print('Text/logo updated:',len(report),'pages. Layout, styles, links and other images unchanged.')
