import { Image } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { Box, Round, mat, timber } from './primitives'
import { MAX_RENDERED_PHOTO_CHARS, preparePhoto } from './photoImage'

const frameMaterials=[timber('#5d3e2c',.84),timber('#76533a',.82),timber('#49382e',.86)],paper=mat('#efe8d5',.98)
const palettes=[['#aab8aa','#536f61','#789584','#e4c47d'],['#b8c4c5','#587078','#7f9993','#d8b877'],['#c0b7a6','#65735c','#8b9c72','#d58c6c'],['#a7b9b0','#4b6757','#769284','#e0ad72']]
const slots=[
 {p:[-5.95,3.25,-1.245],s:[.48,.64],r:-.028,v:0},{p:[-5.67,4.15,-1.245],s:[.72,.48],r:.018,v:1},{p:[-4.92,3.55,-1.245],s:[.74,.98],r:-.012,v:2},{p:[-4.72,4.56,-1.245],s:[.52,.38],r:.026,v:3},{p:[-4.04,4.10,-1.245],s:[.55,.74],r:.014,v:1},{p:[-3.67,3.24,-1.245],s:[.72,.50],r:-.021,v:0},{p:[-4.24,3.02,-1.245],s:[.38,.32],r:.032,v:3},
] as const
function DefaultPhoto({variant}:{variant:number}){const colors=palettes[variant%palettes.length];return <group><Box size={[.82,.78,.016]} position={[0,0,.058]} material={mat(colors[0],.98)}/>{variant%3===2?<><Box size={[.07,.54,.014]} position={[0,-.03,.075]} material={mat(colors[1],.92)}/>{[-.20,-.10,.11,.22].map((x,i)=><mesh key={x} position={[x,(i%2?.10:-.13)+x*.25,.082]} scale={[.13,.07,.025]} rotation={[0,0,(i%2?-.55:.55)]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color={i%2?colors[2]:colors[1]}/></mesh>)}</>:<><mesh position={[-.18,-.02,.079]}><coneGeometry args={[.28,.52,3]}/><meshStandardMaterial color={colors[2]}/></mesh><mesh position={[.16,-.06,.081]}><coneGeometry args={[.32,.61,3]}/><meshStandardMaterial color={colors[1]}/></mesh></>}</group>}
function Frame({slot,index,src,selected,onClick}:{slot:typeof slots[number];index:number;src:string|null;selected:boolean;onClick:(event:ThreeEvent<MouseEvent>,index:number)=>void}){const safeSrc=src&&src.length<=MAX_RENDERED_PHOTO_CHARS?src:null;return <group position={slot.p} scale={[slot.s[0],slot.s[1],1]} rotation={[0,0,slot.r]} onClick={event=>onClick(event,index)}><Round size={[1.12,1.12,.09]} radius={.025} material={selected?timber('#b58c4d',.72):frameMaterials[index%frameMaterials.length]}/><Round size={[1,1,.035]} position={[0,0,.055]} radius={.012} material={paper}/>{safeSrc?<Suspense fallback={<DefaultPhoto variant={slot.v}/>}><Image url={safeSrc} scale={[.82,.78]} position={[0,0,.084]} transparent/></Suspense>:<DefaultPhoto variant={slot.v}/>}</group>}
function choosePhoto(index:number,onPhoto:(index:number,value:string|null)=>void,onError:(message:string)=>void){const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.onchange=()=>{const file=input.files?.[0];if(!file)return;void preparePhoto(file).then(value=>onPhoto(index,value)).catch(error=>onError(error instanceof Error?error.message:'照片处理失败'))};input.click()}
export function PhotoWall({onOpen,focused,photos,onPhoto,onError,onSelection}:{onOpen:()=>void;focused:boolean;photos:(string|null)[];onPhoto:(index:number,value:string|null)=>void;onError:(message:string)=>void;onSelection:(index:number|null)=>void}){
 const [selected,setSelected]=useState<number|null>(null)
 useEffect(()=>{if(!focused){setSelected(null);onSelection(null)}},[focused,onSelection])
 useEffect(()=>{if(!focused||selected===null)return;const key=(event:KeyboardEvent)=>{if(event.key==='Delete'&&photos[selected])onPhoto(selected,null)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[focused,selected,photos,onPhoto])
 const click=(event:ThreeEvent<MouseEvent>,index:number)=>{
  if(event.delta>=5)return
  event.stopPropagation()
  if(!focused){onOpen();return}
  if(selected!==index){setSelected(index);onSelection(index);return}
  choosePhoto(index,onPhoto,onError)
 }
 return <group onPointerOver={event=>{event.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>{slots.map((slot,index)=><Frame key={index} slot={slot} index={index} src={photos[index]} selected={selected===index} onClick={click}/>)}</group>
}
