import type { Metadata } from 'next';
import './globals.css';
import './styles/category-masonry.css';
import './styles/waitlist.css';
import './styles/waitlist-responsive.css';
import './styles/business-waitlist.css';
export const metadata: Metadata = { title: 'Payam — Everyday life, in one app', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
