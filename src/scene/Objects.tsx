import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, CanvasTexture, Float32BufferAttribute, LinearFilter, Object3D, SRGBColorSpace } from 'three'
import type { SpotLight } from 'three'
import { Ball, Box, Lathe, Round, Tube, brass, dark, leaf, mat, woodLight } from './primitives'
import type { V3 } from './primitives'
import type { InspectId, StickyNote } from '../data/home'
import { Atelier } from './Atelier'
import { DiningMagazine, ModernCoffeeCup } from './Furnishings'
const paper=mat('#e7dcc1',.93)
const bookGreen=mat('#31482f',.72)
export function Cup(){return <Atelier model="cup"/>}
export function Saucer(){
 return <Lathe position={[0,-.016,0]} profile={[[0,0],[.25,0],[.28,.014],[.26,.03],[.195,.035],[.17,.02],[0,.02]]} material={woodLight}/>
}
export function Book(){
 return <group>
  <Round size={[.48,.11,.66]} position={[0,.075,0]} material={paper} radius={.015}/>
  <Round size={[.52,.025,.7]} position={[0,.14,0]} material={bookGreen} radius={.015}/>
  <Round size={[.52,.026,.7]} position={[0,.015,0]} material={bookGreen} radius={.014}/>
  <Round size={[.04,.15,.7]} position={[-.25,.077,0]} material={bookGreen} radius={.012}/>
  {[.04,.06,.08,.10].map(y=><Box key={y} size={[.465,.002,.656]} position={[.01,y,0]} material={mat('#c8bda3')}/>)}
  <Tube points={[[0,.157,-.22],[.02,.157,0],[-.08,.157,.2]]} radius={.008} material={brass}/>
  {[-1,1].flatMap(side=>[0,1,2].map(i=><Ball key={side+':'+i} size={[.045,.005,.075]} rotation={[0,side*.65,0]} position={[side*.05,.159,-.13+i*.1]} material={brass}/>))}
  <Box size={[.035,.006,.18]} position={[.13,.06,.39]} material={mat('#bca36c')}/>
 </group>
}
function LeafBlade({length=.45,width=.14}:{length?:number;width?:number}){
 const geometry=useMemo(()=>{
  const vertices:number[]=[],indices:number[]=[]
  for(let i=0;i<=10;i++){
   const t=i/10,w=Math.sin(Math.PI*t)*width
   for(let j=0;j<3;j++) vertices.push((j-1)*w,t*length,Math.sin(t*Math.PI)*.08+(j===1?.03:0))
  }
  for(let i=0;i<10;i++)for(let j=0;j<2;j++){const a=i*3+j;indices.push(a,a+1,a+3,a+1,a+4,a+3)}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g
 },[length,width])
 return <mesh geometry={geometry} material={leaf} castShadow receiveShadow/>
}
export function Plant({large=false}:{large?:boolean}){
 if(!large)return <Atelier model="plant"/>
 return <group scale={large?2.6:1}>
  <Lathe profile={[[0,0],[.12,0],[.155,.018],[.205,.27],[.218,.295],[.215,.32],[.19,.322],[.184,.29],[.15,.035],[0,.035]]} material={mat('#937253',.85)}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.276,0]} material={mat('#302b1c')}><circleGeometry args={[.184,32]}/></mesh>
  {Array.from({length:8},(_,i)=>{
   const angle=i*2.399,height=.46+(i%3)*.15,x=Math.cos(angle)*.17,z=Math.sin(angle)*.17
   return <group key={i}>
    <Tube radius={.012} points={[[0,.26,0],[x*.4,height*.7,z*.4],[x,height,z]]} material={mat('#5e6b36')}/>
    <group position={[x,height,z]} rotation={[.42,angle,-.45]}><LeafBlade length={.26+(i%3)*.06} width={.08}/></group>
    <group position={[x*.6,height*.8,z*.6]} rotation={[-.75,angle+2.1,.8]}><LeafBlade length={.2} width={.06}/></group>
   </group>
  })}
 </group>
}
export function Mouse(){
 return <group>
  <Ball position={[0,.055,0]} size={[.105,.06,.17]} material={dark}/>
  <Tube radius={.002} points={[[0,.095,-.13],[0,.116,0],[0,.112,.06]]} material={mat('#354035')}/>
  <Ball position={[0,.111,-.05]} size={[.012,.015,.032]} material={mat('#90978b',.5,.4)}/>
 </group>
}
function PhoneLockScreen(){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=640
  const context=canvas.getContext('2d')!
  const gradient=context.createLinearGradient(0,0,320,640)
  gradient.addColorStop(0,'#172c4a');gradient.addColorStop(.48,'#536f88');gradient.addColorStop(1,'#d79b76')
  context.fillStyle=gradient;context.fillRect(0,0,320,640)
  const glow=context.createRadialGradient(245,160,10,245,160,230)
  glow.addColorStop(0,'rgba(255,221,182,.72)');glow.addColorStop(1,'rgba(255,221,182,0)')
  context.fillStyle=glow;context.fillRect(0,0,320,430)
  context.fillStyle='rgba(7,19,34,.28)';context.beginPath();context.moveTo(0,430);context.bezierCurveTo(75,355,150,500,320,355);context.lineTo(320,640);context.lineTo(0,640);context.fill()
  const now=new Date(),time=now.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})
  const date=now.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})
  context.textAlign='center';context.fillStyle='#fff';context.shadowColor='rgba(0,0,0,.25)';context.shadowBlur=8
  context.font='500 70px system-ui';context.fillText(time,160,142)
  context.font='500 22px system-ui';context.fillText(date,160,180)
  context.shadowBlur=0;context.font='600 16px system-ui';context.textAlign='left';context.fillText('中国移动',22,31)
  context.textAlign='right';context.fillText('5G  ▰',298,31)
  for(const x of [58,262]){context.fillStyle='rgba(18,26,35,.46)';context.beginPath();context.arc(x,566,28,0,Math.PI*2);context.fill()}
  context.fillStyle='#fff';context.font='24px system-ui';context.textAlign='center';context.fillText('●',58,575);context.fillText('◎',262,575)
  context.fillStyle='rgba(255,255,255,.86)';context.fillRect(112,615,96,5)
  const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;map.minFilter=LinearFilter;map.magFilter=LinearFilter
  return map
 },[])
 useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh position={[-.0008,.104,.02435]}>
  <planeGeometry args={[.088,.176]}/><meshBasicMaterial map={texture} toneMapped={false}/>
 </mesh>
}
function Daffodil({x,z,height,lean,bendZ,yaw,pitch}:{x:number;z:number;height:number;lean:number;bendZ:number;yaw:number;pitch:number}){
 const top:V3=[x+lean,height,z+bendZ]
 return <group>
  <Tube points={[[x,0,z],[x+lean*.18,height*.34,z+bendZ*.12],[x+lean*.56,height*.7,z+bendZ*.52],top]} radius={.007} material={mat('#4e7137',.82)}/>
  <group position={top} rotation={[pitch,yaw,lean*.7]}>
   {Array.from({length:6},(_,i)=>{const angle=i*Math.PI/3;return <Ball key={i} size={[.074,.024,.034]} position={[Math.cos(angle)*.052,Math.sin(angle)*.052,0]} rotation={[0,0,angle]} material={mat('#f4edd3',.88)}/>})}
   <mesh position={[0,0,.032]} rotation={[Math.PI/2,0,0]} material={mat('#dda83c',.72)}><coneGeometry args={[.035,.066,18,1,true]}/></mesh>
   <Ball size={[.027,.027,.02]} position={[0,0,.005]} material={mat('#e6b84d',.7)}/>
  </group>
 </group>
}
export function NarcissusArrangement({placed=false}:{placed?:boolean}){
 return <group position={placed?[-6.04,1.70,2.14]:[0,0,0]}>
  {!placed&&<Lathe profile={[[0,0],[.15,0],[.18,.025],[.14,.34],[.12,.43],[.085,.46],[0,.46]]} material={mat('#dfd4ba',.9)}/>}
  <group position={[0,placed?0:.43,0]}>
   <Daffodil x={-.045} z={-.015} height={.60} lean={-.17} bendZ={.10} yaw={.72} pitch={-.18}/>
   <Daffodil x={.045} z={.018} height={.79} lean={.14} bendZ={-.085} yaw={-.52} pitch={.13}/>
   <Tube points={[[.01,0,0],[-.07,.22,.01],[-.13,.49,.025]]} radius={.013} material={mat('#58783e',.88)}/>
   <Tube points={[[.02,0,.01],[.11,.19,.015],[.17,.40,.03]]} radius={.012} material={mat('#668448',.88)}/>
  </group>
 </group>
}
export function ItemModel({id}:{id:InspectId}){
 if(id==='cup')return <Cup/>
 if(id==='book'||id==='livingBook')return <Book/>
 if(id==='plant'||id==='gardenGreen')return <Plant/>
 if(id==='wateringCan')return <Atelier model="wateringcan"/>
 if(id==='phone')return <group><Atelier model="phone"/><PhoneLockScreen/></group>
 if(id==='globe')return <Atelier model="globe"/>
 if(id==='catpuccino')return <group>
  <Atelier model="catpuccino"/>
  {/* Keep the tiny tabletop ornament easy to select from the room overview. */}
  <mesh position={[0,.10,0]}>
   <boxGeometry args={[.18,.20,.18]}/>
   <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
  </mesh>
 </group>
 if(id==='diningCup')return <ModernCoffeeCup/>
 if(id==='diningMagazine')return <DiningMagazine/>
 if(id==='hanging')return <Atelier model="hanging"/>
 if(id==='gardenFlowers')return <Atelier model="flowers"/>
 if(id==='tablePlant')return <Atelier model="flowers"/>
 if(id==='narcissus')return <NarcissusArrangement/>
 if(id==='gardenSucculent')return <Atelier model="succulent"/>
 if(id==='gardenPotA'||id==='gardenPotB'||id==='gardenPotC')return <Atelier model="floorplant"/>
 return <Mouse/>
}
const hangingCards=[
 {position:[-.900,-.500,.012] as V3,size:[.363,.287] as [number,number]},
 {position:[-.420,-.380,.012] as V3,size:[.292,.311] as [number,number]},
 {position:[.020,-.570,.012] as V3,size:[.387,.299] as [number,number]},
 {position:[.470,-.400,.012] as V3,size:[.267,.323] as [number,number]},
]
function CardLabel({note,size}:{note:StickyNote;size:[number,number]}){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.max(320,Math.round(512*size[1]/size[0]))
  const context=canvas.getContext('2d')!,cx=canvas.width/2,height=canvas.height
  context.clearRect(0,0,canvas.width,height)
  context.fillStyle='#51483a';context.strokeStyle='rgba(255,250,224,.38)';context.lineWidth=3
  context.textAlign='center';context.textBaseline='middle'
  context.font=`${Math.round(height*.19)}px "Segoe UI Emoji","Microsoft YaHei"`
  context.strokeText(note.emoji,cx,height*.37);context.fillText(note.emoji,cx,height*.37)
  const chinese=/[\u3400-\u9fff]/.test(note.keyword)
  const fontSize=Math.min(canvas.width*(chinese?.17:.13),height*.18)
  context.font=`600 ${Math.round(fontSize)}px KaiTi, "STKaiti", "Microsoft YaHei", sans-serif`
  context.strokeText(note.keyword,cx,height*.64);context.fillText(note.keyword,cx,height*.64)
  const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;map.minFilter=LinearFilter;map.magFilter=LinearFilter
  return map
 },[note.emoji,note.keyword,size])
 useEffect(()=>()=>texture.dispose(),[texture])
 return <mesh position={[0,0,.010]}><planeGeometry args={size}/><meshBasicMaterial map={texture} transparent alphaTest={.015} toneMapped={false} polygonOffset polygonOffsetFactor={-2}/></mesh>
}
export function HangingCardLabels({notes=[],onCard}:{notes?:StickyNote[];onCard:(slot:number)=>void}){
 return <group>{hangingCards.map((card,index)=>{const note=notes.find(item=>item.slot===index);return <group key={index} position={card.position}
  onClick={event=>{if(event.delta<5){event.stopPropagation();onCard(index)}}}
  onPointerOver={event=>{event.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
   <mesh><planeGeometry args={card.size}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
   {note&&<CardLabel note={note} size={card.size}/>} 
  </group>})}</group>
}
export function Keyboard(){
 return <group>
  <Round size={[1.36,.045,.46]} material={dark} radius={.028}/>
  {[0,1,2,3].map(row=>Array.from({length:15},(_,col)=>
   <Round key={row+':'+col} size={[.068,.018,.064]} radius={.008}
    position={[(col-7)*.085,.032,(row-2)*.078]} material={mat('#3b4239',.58)}/>
  ))}
  {[-7,-6,-5,5,6,7].map(col=><Round key={col} size={[.068,.018,.064]} radius={.008} position={[col*.085,.032,.156]} material={mat('#3b4239',.58)}/>)}
  <Round size={[.7,.018,.064]} radius={.008} position={[0,.032,.156]} material={mat('#737d69',.58)}/>
 </group>
}
export function Chair(){return <Atelier model="chair"/>}
export function Desk(){return <Atelier model="desk"/>}
export function Lamp(){
 const target=useMemo(()=>new Object3D(),[])
 const light=useRef<SpotLight>(null)
 useEffect(()=>{if(light.current){light.current.shadow.autoUpdate=false;light.current.shadow.needsUpdate=true}},[])
 return <group>
  <Atelier model="lamp"/>
  <mesh position={[.6,1.185,0]} scale={[.044,.062,.044]}>
   <sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#ece1c8" emissive="#ffd39b" emissiveIntensity={2.5}/>
  </mesh>
  <primitive object={target} position={[.57,.05,.28]}/>
  <>
   <spotLight ref={light} position={[.6,.98,0]} target={target} color="#ffdbab" intensity={3.4} angle={.95} penumbra={.9} distance={3.2} decay={2}
    castShadow shadow-mapSize={[512,512]} shadow-bias={-.0002} shadow-normalBias={.008}/>
   <pointLight position={[.6,.93,0]} color="#ffd6a2" intensity={.45} distance={2.5}/>
  </>
 </group>
}
export function WallFrame({position,size=[.75,.95],variant=0}:{position:V3;size?:[number,number];variant?:number}){
 return <group position={position} scale={[size[0],size[1],1]} rotation={[0,0,variant?-.015:0]}><Atelier model="landscape"/></group>
}
