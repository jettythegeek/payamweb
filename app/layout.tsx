import type { Metadata } from 'next';
import './globals.css';
import './styles/waitlist.css';
import './styles/waitlist-responsive.css';
export const metadata: Metadata = { title: 'Payam — Everyday life, in one app', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
