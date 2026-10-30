import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import './styles/waitlist.css'
import './waitlist-admin/admin.css'
const jakarta=Plus_Jakarta_Sans({subsets:['latin'],weight:['400','600','700'],display:'swap',variable:'--font-payam'})
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL
export const metadata:Metadata={metadataBase:new URL(siteUrl||'http://127.0.0.1:3005'),title:{default:'Join the Payam waitlist',template:'%s | Payam'},description:'Vote for your city and be first to hear when Payam launches.',applicationName:'Payam',manifest:'/manifest.webmanifest',robots:{index:false,follow:false}}
export const viewport:Viewport={themeColor:'#2851cb',colorScheme:'light'}
export default function RootLayout({children}:{children:React.ReactNode}){const plausible=process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;return <html lang="en-NG" className={jakarta.variable}><body>{children}{plausible&&<Script defer data-domain={plausible} src="https://plausible.io/js/script.js" strategy="afterInteractive"/>}</body></html>}
