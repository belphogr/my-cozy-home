import { useLayoutEffect, useMemo, useRef } from 'react'
import { DoubleSide, InstancedMesh, Object3D, SphereGeometry } from 'three'
import { Atelier } from './Atelier'
import { Box, Tube, ivoryPlaster, mat, timber } from './primitives'
import type { V3 } from './primitives'
import { windowPosition, windowWallSections } from './layout'

export function WindowWall(){
 return <group>
  {windowWallSections.map((p,i)=><Box key={i} {...p} material={ivoryPlaster}/>)}
  <group position={windowPosition} rotation={[0,Math.PI/2,0]}><Atelier model="window"/></group>
  <Box size={[.09,.18,10.5]} position={[-6.48,.065,3.9]} material={timber('#8d6c4e',.65)}/>
 </group>
}

const foliage=mat('#5c744b',.93);foliage.side=DoubleSide
const bark=timber('#75644b',.95)
const leafGeometry=new SphereGeometry(1,8,6)
const leafCount=170
export function WindowTree({position,scale=1,seed=0}:{position:V3;scale?:number;seed?:number}){
 const leaves=useRef<InstancedMesh>(null)
 const branches=useMemo(()=>Array.from({length:7},(_,i)=>{
  const a=i*2.4+seed,y=1+i*.24
  return [[0,y,0],[Math.cos(a)*.45,y+.35,Math.sin(a)*.45],[Math.cos(a)*.9,y+.6,Math.sin(a)*.9]] as V3[]
 }),[seed])
 useLayoutEffect(()=>{
  const dummy=new Object3D()
  for(let i=0;i<leafCount;i++){
   const branch=branches[i%7],t=(i%40)/40,a=i*2.39996+seed
   dummy.position.set(branch[2][0]+Math.cos(a)*.52*t,branch[2][1]+Math.sin(i*1.7)*.40,branch[2][2]+Math.sin(a)*.52*t)
   dummy.rotation.set(Math.sin(i)*.6,a,Math.cos(i*2)*.7)
   dummy.scale.set(.12+.03*Math.sin(i),.023,.23)
   dummy.updateMatrix();leaves.current!.setMatrixAt(i,dummy.matrix)
  }
  leaves.current!.instanceMatrix.needsUpdate=true
  leaves.current!.computeBoundingSphere()
 },[branches,seed])
 return <group position={position} scale={scale}>
  <Tube points={[[0,0,0],[.05,1.2,0],[0,2.8,.03]]} radius={.055} material={bark}/>
  {branches.map((points,i)=><Tube key={i} points={points} radius={.022} material={bark}/>)}
  <instancedMesh ref={leaves} args={[leafGeometry,foliage,leafCount]} castShadow receiveShadow/>
 </group>
}
export function WindowLandscape(){
 return <group>
  {[0,1,2,3,4].map(i=><WindowTree key={i} position={[-9.4-(i%2)*.55,0,-1.4+i*1.75]} scale={1.12+(i%3)*.14} seed={i*.83}/>) }
 </group>
}
