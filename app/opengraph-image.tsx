import { ImageResponse } from 'next/og'
export const alt='Join the Payam waitlist'
export const size={width:1200,height:630}
export const contentType='image/png'
export default function Image(){return new ImageResponse(<div style={{alignItems:'center',background:'#f7f9fc',color:'#0c1425',display:'flex',fontFamily:'Arial',height:'100%',justifyContent:'space-between',padding:'76px',width:'100%'}}><div style={{display:'flex',flexDirection:'column',maxWidth:760}}><span style={{color:'#2851cb',fontSize:24,fontWeight:700,letterSpacing:3}}>PAYAM IS COMING</span><strong style={{fontSize:72,lineHeight:1.04,marginTop:24}}>Everyday life, in one trusted place.</strong><span style={{fontSize:30,marginTop:28}}>Join the waitlist. Vote for your city.</span></div><div style={{alignItems:'center',background:'#2851cb',borderRadius:80,color:'white',display:'flex',fontSize:120,fontWeight:700,height:310,justifyContent:'center',width:310}}>P</div></div>,size)}
