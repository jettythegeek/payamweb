const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { ArrowUpRight, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } = require('lucide-react');
const icons = { '↗': ArrowUpRight, '→': ArrowRight, '←': ArrowLeft, '↑': ArrowUp, '↓': ArrowDown, '➜': ArrowRight, '➡': ArrowRight };
const svg = icon => renderToStaticMarkup(React.createElement(icon, { width: 20, height: 20, strokeWidth: 2, 'aria-hidden': true, style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 } }));
const content = path.join(__dirname, '../content');
let count = 0;
for (const name of fs.readdirSync(content).filter(name => name.endsWith('.json'))) {
 const file = path.join(content, name), page = JSON.parse(fs.readFileSync(file, 'utf8'));
 if (!page.html) continue;
 // Only text nodes: never alter labels, URLs or image alt attributes.
 page.html = page.html.replace(/>[^<]+</g, text => text.replace(/[↗→←↑↓➜➡]/g, char => { count++; return svg(icons[char]); }));
 page.html = page.html.replace(/(<button aria-label="Scroll to top"[^>]*>)<span><\/span>/g, '$1'+svg(ArrowUp));
 fs.writeFileSync(file, JSON.stringify(page)+'\n');
}
console.log(`Replaced ${count} text arrows with Lucide SVGs.`);
