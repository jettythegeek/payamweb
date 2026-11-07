import type {MetadataRoute} from 'next'
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,'');if(!base)return[];return ['','business','privacy-policy','terms-of-service'].map(path=>({url:`${base}/${path}`,lastModified:new Date(),changeFrequency:path?'monthly':'weekly',priority:path?0.6:1}))}
