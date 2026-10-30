import type {MetadataRoute} from 'next'
export default function manifest():MetadataRoute.Manifest{return {name:'Payam',short_name:'Payam',description:'Everyday life, in one place.',start_url:'/',display:'standalone',background_color:'#f7f9fc',theme_color:'#2851cb',icons:[{src:'/icon.png',sizes:'512x512',type:'image/png'},{src:'/apple-icon.png',sizes:'180x180',type:'image/png'}]}}
