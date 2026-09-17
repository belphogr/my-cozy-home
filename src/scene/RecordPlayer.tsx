import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Atelier } from './Atelier'
import { Round, Tube, brass, dark, mat } from './primitives'
import { recordPlayerPosition, sideboardRotation } from './layout'

export function RecordPlayer({playing,reduced,onClick}:{playing:boolean;reduced:boolean;onClick:()=>void}){
 const disc=useRef<Group>(null),arm=useRef<Group>(null)
 useFrame((_,dt)=>{
  if(disc.current&&playing&&!reduced)disc.current.rotation.y-=Math.min(dt,.05)*Math.PI*2*33/60
  if(arm.current)arm.current.rotation.y+=((playing?-.7:0)-arm.current.rotation.y)*(reduced?1:1-Math.exp(-dt*5))
 })
 return <group position={recordPlayerPosition} rotation={[0,sideboardRotation,0]} onClick={e=>{e.stopPropagation();if(e.delta<5)onClick()}}
  onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
  <Atelier model="turntable"/>
  <group ref={disc} position={[-.17,.209,0]}><Atelier model="vinyl"/></group>
  <group ref={arm} position={[.39,.255,-.19]}>
   <Tube points={[[0,0,-.065],[0,0,0],[-.08,0,.20],[-.20,0,.40]]} radius={.009} material={mat('#b4bdb2',.27,.8)}/>
   <Round size={[.064,.024,.082]} position={[-.20,-.007,.41]} radius={.004} material={dark}/>
   <Round size={[.012,.02,.012]} position={[-.205,-.025,.43]} radius={.002} material={brass}/>
  </group>
  <mesh position={[.50,.192,.20]}><sphereGeometry args={[.009,12,8]}/><meshStandardMaterial color={playing?'#d9c486':'#677260'} emissive={playing?'#e2b267':'#000000'} emissiveIntensity={playing?1.2:0}/></mesh>
 </group>
}
