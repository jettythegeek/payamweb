import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import Reference from '../reference';
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
 const { slug: incoming = [] } = await params;
 const slug = incoming[0] === 'en' ? incoming.slice(1) : [...incoming];
 const aliases: Record<string, string> = { bedrift: 'business', businesses: 'business', student: 'students', 'hvor-skal-vi-spise': 'where-to-eat-in-oslo' };
 if (slug.length === 1 && aliases[slug[0]]) slug[0] = aliases[slug[0]];
 if (slug.some(segment => !/^[a-zA-Z0-9-]+$/.test(segment))) notFound();
 let page;
 try { page = JSON.parse(await readFile(path.join(process.cwd(), 'content', slug.length ? slug.join('__') + '.json' : 'home.json'), 'utf8')); } catch { notFound(); }
 return <><title>{page.title}</title>{page.styles.map((href: string) => <link key={href} rel="stylesheet" href={href} />)}<Reference markup={page.html} bodyClass={page.bodyClass} /></>;
}
