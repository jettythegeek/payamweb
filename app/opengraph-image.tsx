import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
export const alt='Join the Payam waitlist'
export const size={width:1200,height:630}
export const contentType='image/png'
export default async function Image(){
 const favicon = await readFile(path.join(process.cwd(), 'app', 'icon.png'))
 const source = `data:image/png;base64,${favicon.toString('base64')}`
 return new ImageResponse(<div style={{alignItems:'center',background:'#f7f9fc',color:'#0c1425',display:'flex',fontFamily:'Arial',height:'100%',justifyContent:'space-between',padding:'76px',width:'100%'}}><div style={{display:'flex',flexDirection:'column',maxWidth:760}}><span style={{color:'#2851cb',fontSize:24,fontWeight:700,letterSpacing:3}}>PAYAM IS COMING</span><strong style={{fontSize:72,lineHeight:1.04,marginTop:24}}>Everyday life, in one trusted place.</strong><span style={{fontSize:30,marginTop:28}}>Join the waitlist. Vote for your city.</span></div><img src={source} alt="Payam" width={310} height={310} style={{borderRadius:80,flexShrink:0}} /></div>,size)
}
