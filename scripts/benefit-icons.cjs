const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Smartphone, ShoppingBag, Wrench, Store, HandCoins, ClipboardList, LayoutGrid, MapPin, ListChecks } = require('lucide-react');
const svg = (icon, size = 28) => renderToStaticMarkup(React.createElement(icon, { size, strokeWidth: 2.2, 'aria-hidden': true }));
const file = path.join(__dirname, '../content/home.json');
const page = JSON.parse(fs.readFileSync(file, 'utf8'));
let h = page.html;
let start = h.indexOf('<section id="what-is-bimm"'), end = h.indexOf('</section>', start) + 10;
let about = h.slice(start, end);
about = about.replace(/Payam helps you pay bills, shop local and request everyday services\. Discover products, providers and useful money tools .*?all in one app\./, 'From buying data to finding someone to fix a leaking tap, Payam helps you handle the things you need every day. Shop from local businesses, pay your bills or arrange help for someone else.');
let index = 0;
about = about.replace(/<div class="flex items-center justify-center bg-ds-brand-lime-lt[^>]*>.*?<\/svg><\/div>/gs, () => {
 const icons = [Store, HandCoins, ClipboardList];
 return '<div class="payam-benefit-icon '+(index === 1 ? 'payam-benefit-icon-green' : '')+'">'+svg(icons[index++])+'</div>';
});
if (index !== 3) throw Error('Expected three About benefit icons');
h = h.slice(0,start)+about+h.slice(end);
start = h.lastIndexOf('<section', h.indexOf('WHY PAYAM?')); end = h.indexOf('</section>',start)+10;
let why = h.slice(start,end); index = 0;
why = why.replace(/<div class="relative flex items-center justify-center size-\[34px\][^>]*>.*?<\/svg><\/div>/gs, () => {
 const icons = [LayoutGrid, MapPin, ListChecks];
 return '<div class="payam-benefit-icon payam-benefit-icon-large '+(index === 1 ? 'payam-benefit-icon-green' : '')+'">'+svg(icons[index++],32)+'</div>';
});
if (index !== 3) throw Error('Expected three Why Payam icons');
h = h.slice(0,start)+why+h.slice(end);
h = h.replace('<div class="payam-family-tags"><span>Airtime &amp; data</span><span>Orders</span><span>Service requests</span></div>', '<div class="payam-family-tags"><span class="payam-tag-payments">'+svg(Smartphone,18)+'Airtime &amp; data</span><span class="payam-tag-orders">'+svg(ShoppingBag,18)+'Orders</span><span class="payam-tag-services">'+svg(Wrench,18)+'Service requests</span></div>');
page.html = h; fs.writeFileSync(file, JSON.stringify(page)+'\n');
console.log('Updated About copy, six Lucide benefit icons, three category tags.');

