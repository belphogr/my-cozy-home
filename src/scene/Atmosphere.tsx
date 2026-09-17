import { useEffect, useMemo } from 'react'
import { AdditiveBlending, BackSide, CanvasTexture, Color, SRGBColorSpace } from 'three'

function createStarMap(){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024
 const context=canvas.getContext('2d')!
 let seed=0x51f15e
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
 for(let index=0;index<1400;index++){
  const x=random()*canvas.width,y=random()*canvas.height*.78
  const radius=random()>.975?1.05:.30+random()*.48
  context.beginPath();context.arc(x,y,radius,0,Math.PI*2)
  context.fillStyle=random()>.82?'rgba(194,218,255,.95)':'rgba(246,247,235,.88)';context.fill()
  if(radius>1){context.beginPath();context.arc(x,y,radius*2.2,0,Math.PI*2);context.fillStyle='rgba(155,190,255,.08)';context.fill()}
 }
 const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture
}

export function Atmosphere({night}:{night:boolean}){
 const uniforms=useMemo(()=>({zenith:{value:new Color()},horizon:{value:new Color()},glow:{value:new Color()},isNight:{value:0}}),[])
 const starMap=useMemo(createStarMap,[])
 useEffect(()=>{
  uniforms.zenith.value.set(night?'#071526':'#65aee2')
  // Keep the night horizon close to the zenith value. The former #243b55
  // band was exposed behind the roof edge and read as a hidden blue sun.
  uniforms.horizon.value.set(night?'#0b192a':'#d7ecf1')
  uniforms.glow.value.set(night?'#000000':'#ffd39b')
  uniforms.isNight.value=night?1:0
 },[night,uniforms])
 useEffect(()=>()=>starMap.dispose(),[starMap])
 return <>
  <mesh scale={115} renderOrder={-10}>
   <sphereGeometry args={[1,48,28]}/>
   <shaderMaterial side={BackSide} depthWrite={false} toneMapped={false} uniforms={uniforms}
    vertexShader={`varying vec3 vDir; void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
    fragmentShader={`
     varying vec3 vDir; uniform vec3 zenith; uniform vec3 horizon; uniform vec3 glow; uniform float isNight;
     void main(){
       float h=smoothstep(-.12,.72,vDir.y);vec3 color=mix(horizon,zenith,h);
       vec3 sunDir=normalize(vec3(-.66,.45,-.58));
       float sun=pow(max(dot(vDir,sunDir),0.0),180.0)*(1.0-isNight);
       color+=glow*sun*1.7;
       gl_FragColor=vec4(color,1.0);
     }`}/>
  </mesh>
  {night&&<mesh scale={114.7} renderOrder={-5}>
   <sphereGeometry args={[1,48,28]}/>
   <meshBasicMaterial map={starMap} side={BackSide} transparent opacity={.78} depthWrite={false} toneMapped={false} blending={AdditiveBlending}/>
  </mesh>}
 </>
}
