import { useMemo } from 'react'

import { RecordPlayer } from './RecordPlayer'
import { Atelier } from './Atelier'
import { Box, BoxInstances, Round, greenPlaster, mat, rattan, timber, woodLight } from './primitives'
import { TimberRoof } from './TimberRoof'
import { nichePosition, nicheRotation } from './architecture'
import { Chair, Desk, HangingCardLabels, ItemModel, Keyboard, Lamp, NarcissusArrangement, Saucer } from './Objects'
import { WindowWall } from './Window'
import { Living } from './Living'
import { GardenEntry } from './Garden'
import type { InspectId, Recognition, StickyNote } from '../data/home'
import type { FocusId } from './navigation'
import { chairFacing, deskChairPosition, cupPosition, deskBooksPosition, diningChairPositions, diningPosition, floorPlantPosition, items, shelfPosition, sideboardPosition, sideboardRotation, sideboardScale, tallShelfPosition } from './layout'
import { RecognitionWall } from './RecognitionWall'
import { PhotoWall } from './PhotoWall'
import { TableReadingSet, TallBookshelf } from './Furnishings'


export function Room({inspect,onFocus,computer,onGarden,playing,reduced,recognitions,night,photos,photoFocused,onPhoto,onPhotoError,onPhotoSelection,notes,onNoteCard}:{inspect:InspectId|null;onFocus:(id:FocusId)=>void;computer:boolean;playing:boolean;reduced:boolean;onGarden:()=>void;recognitions:Recognition[];night:boolean;photos:(string|null)[];photoFocused:boolean;onPhoto:(index:number,value:string|null)=>void;onPhotoError:(message:string)=>void;onPhotoSelection:(index:number|null)=>void;notes:StickyNote[];onNoteCard:(slot:number)=>void}){
 const floorColors=useMemo(()=>['#937857','#967b59','#997d5b','#907455','#9c805d','#927657'].map(c=>timber(c,.78)),[])
 const floorBatches=useMemo(()=>floorColors.map((material,batch)=>({material,items:Array.from({length:19},(_,row)=>Array.from({length:9},(_,col)=>{
  const x=-7.2+col*1.6+(row%2)*.8,left=Math.max(-6.52,x-.797),right=Math.min(4.25,x+.797)
  return right>left&&(row*7+col*3)%6===batch?{size:[right-left,.028,.569] as [number,number,number],position:[(left+right)/2,-.035,-1.3+row*.575] as [number,number,number]}:null
 })).flat().filter((item):item is NonNullable<typeof item>=>item!==null)})),[floorColors])
 // Opaque room surfaces also block clicks to objects behind them.
 return <group onClick={event=>event.stopPropagation()}>
  <group>
  <Box size={[10.93,.18,10.8]} position={[-1.235,-.14,3.9]} material={mat('#423324')}/>
  {floorBatches.map((batch,index)=><BoxInstances key={index} items={batch.items} material={batch.material}/>)}
  </group>
  <Box size={[10.93,5.6,.16]} position={[-1.235,2.75,-1.38]} material={greenPlaster}/>

  <group onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('window')}}}><WindowWall/></group>
  {[-1.24].map(z=><Box key={z} size={[10.93,.16,.1]} position={[-1.235,.06,z]} material={woodLight}/>)}
  <TimberRoof/>
  <Box size={[10.93,5.6,.16]} position={[-1.235,2.75,9.3]} material={greenPlaster}/>
  {/* Open clerestory above the existing doors reveals the continuous eave. */}
  <Round size={[.22,.25,10.8]} position={[4.25,5.16,3.9]} material={woodLight}/>
  {[-1.3,.9,3.1,5.3,7.5,9.3].map(z=><Box key={'transom'+z} size={[.10,.87,.09]} position={[4.25,4.63,z]} material={woodLight}/>)}
  <GardenEntry onGarden={onGarden} computer={computer}/>

  <group onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('desk')}}}><Desk/></group>
  <Living onApproach={()=>onFocus('sofa')} computer={computer}/>
  <group position={cupPosition}><Saucer/></group>
  <group position={[-2.2,1.14,-.3]}><Lamp/></group>
  <group position={[0,1.18,.61]} onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('desk')}}}><Keyboard/></group>
  {items.filter(item=>!item.id.startsWith('garden')&&item.id!=='wateringCan'&&item.id!=='narcissus'&&item.id!=='hanging'&&!item.id.startsWith('dining')).map(item=><group key={item.id} position={item.position} rotation={item.rotation} scale={item.scale||1}
   visible={inspect!==item.id} onClick={e=>{if(!computer&&e.delta<5){e.stopPropagation();onFocus(item.id)}}}
   onPointerOver={e=>{e.stopPropagation();if(!computer)document.body.style.cursor='pointer'}}
   onPointerOut={()=>{document.body.style.cursor='auto'}}><ItemModel id={item.id}/></group>)}
  {(()=>{const hanging=items.find(item=>item.id==='hanging')!;return <group position={hanging.position} rotation={hanging.rotation}><ItemModel id="hanging"/><HangingCardLabels notes={notes} onCard={onNoteCard}/></group>})()}
  <group position={deskChairPosition} rotation={[0,chairFacing(deskChairPosition,[0,0,0]),0]} onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('desk')}}}><Chair/></group>
  <group position={floorPlantPosition}><Atelier model="floorplant"/></group>
  <group position={tallShelfPosition} onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('tallShelf')}}}><TallBookshelf/></group>
  <PhotoWall onOpen={()=>onFocus('art')} focused={photoFocused} photos={photos} onPhoto={onPhoto} onError={onPhotoError} onSelection={onPhotoSelection}/>
  <RecognitionWall items={recognitions} night={night} onOpen={()=>onFocus('recognitionWall')}/>
  <group position={shelfPosition} onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('shelf')}}}><Atelier model="shelf"/></group>
  <group position={deskBooksPosition}><Atelier model="deskbooks"/></group>
  <group position={[3.05,.02,.6]}>
   <mesh rotation={[-Math.PI/2,0,0]} material={mat('#d6c6a1',.98)} receiveShadow><circleGeometry args={[.47,48]}/></mesh>
   {Array.from({length:6},(_,i)=><mesh key={i} rotation={[Math.PI/2,0,0]} position={[0,.045+i*.025,0]} material={rattan} castShadow><torusGeometry args={[.45,.016,6,60]}/></mesh>)}
   <Round size={[.65,.095,.52]} position={[0,.07,0]} radius={.04} material={mat('#e0d5b9',.96)}/>
  </group>
  <group position={[-1.5,5.15,.4]}><Atelier model="pendant"/></group>
  <group position={[-4.2,5.05,4.35]}><Atelier model="pendant"/></group>
  <group position={nichePosition} rotation={[0,nicheRotation,0]} onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('niche')}}}><Atelier model="niche"/></group>
  <group onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('dining')}}}>
   <group position={diningPosition}><Atelier model="diningtable"/></group>
   <group position={diningChairPositions[0]} rotation={[0,chairFacing(diningChairPositions[0],diningPosition),0]} scale={.90}><Atelier model="eggchair"/></group>
   <group position={diningPosition}><TableReadingSet hidden={inspect==='diningCup'||inspect==='diningMagazine'?inspect:null} onFocus={onFocus}/></group>
   <group position={[diningPosition[0],4.85,diningPosition[2]]} onClick={e=>e.stopPropagation()}><Atelier model="pendant"/></group>
  </group>
  <group onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('sideboard')}}}>
   <group position={sideboardPosition} rotation={[0,sideboardRotation,0]} scale={sideboardScale}><Atelier model="sideboard"/></group>
   <group visible={inspect!=='narcissus'} onClick={e=>{if(e.delta<5){e.stopPropagation();onFocus('narcissus')}}}
    onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}><NarcissusArrangement placed/></group>
  </group>
  <RecordPlayer playing={playing} reduced={reduced} onClick={()=>onFocus('recordPlayer')}/>
 </group>
}

