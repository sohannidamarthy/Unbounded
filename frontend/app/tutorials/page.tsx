import { SeoPageShell } from "../components/SeoPageShell";
import { buildSeoMetadata } from "../components/seoData";
export const metadata = buildSeoMetadata("/tutorials");
export default function TutorialsSeoPage() {
  return (
    <div style={{position:"relative",minHeight:"100vh"}}>
      <SeoPageShell path="/tutorials" />
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(11,26,46,0.88)",zIndex:40,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",pointerEvents:"none"}}>
        <div style={{pointerEvents:"auto",border:"1px solid rgba(212,160,23,0.4)",borderRadius:"12px",padding:"8px 20px",background:"rgba(212,160,23,0.1)"}}>
          <span style={{color:"#d4a017",fontSize:"12px",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase"}}>Coming Soon</span>
        </div>
        <h1 style={{color:"#e8f0f8",fontSize:"32px",fontWeight:500,margin:0}}>Tutorials</h1>
        <p style={{color:"#4a6a8a",fontSize:"16px",margin:0,textAlign:"center",maxWidth:"400px"}}>Video tutorials are on the way. Check back soon.</p>
      </div>
    </div>
  );
}