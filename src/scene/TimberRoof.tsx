import { useLayoutEffect, useMemo, useRef } from 'react'
import { CylinderGeometry, InstancedMesh, Object3D } from 'three'
import type { Material } from 'three'
import { Box, BoxInstances, Round, RoundInstances, Tube, mat, timber } from './primitives'
import { roof } from './architecture'

const boards=['#855d3d','#8a6242','#805739','#906846'].map(c=>timber(c,.72))
const beam=timber('#65452d',.65),edge=timber('#956742',.65)
const roofBoardBatches=boards.map((material,variant)=>({
 material,
 items:Array.from({length:32},(_,i)=>i).filter(i=>i%4===variant).map(i=>({
  size:[10.95,.065,.333] as [number,number,number],position:[-1.2,5.53,-1.3+i*.339] as [number,number,number],
 })),
}))
const soffitBatches=boards.map((material,variant)=>({
 material,
 items:Array.from({length:6},(_,i)=>i).filter(i=>i%4===variant).map(i=>({
  size:[.205,.065,11.15] as [number,number,number],position:[.06+i*.211,0,0] as [number,number,number],
 })),
}))
const tileGeometry=new CylinderGeometry(.11,.11,1.38,8,1,true,0,Math.PI)
const tileMaterials=[mat('#bc7b56',.92),mat('#ac6c4d',.92)]
const rafters=Array.from({length:15},(_,i)=>({position:[-1.2,5.355,-1.24+i*.75] as [number,number,number]}))
const rafterTails=Array.from({length:19},(_,i)=>({position:[.60,-.13,-5.45+i*.60] as [number,number,number]}))

function RoofTileBatch({variant,material}:{variant:number;material:Material}){
 const ref=useRef<InstancedMesh>(null)
 const indices=useMemo(()=>Array.from({length:46},(_,i)=>i).filter(i=>(i%3===0?0:1)===variant),[variant])
 useLayoutEffect(()=>{
  const mesh=ref.current!,dummy=new Object3D()
  indices.forEach((i,index)=>{
   dummy.position.set(.64,.12,-5.48+i*.243)
   dummy.rotation.set(0,0,Math.PI/2)
   dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()
 },[indices])
 return <instancedMesh ref={ref} args={[tileGeometry,material,indices.length]} castShadow receiveShadow/>
}

export function TimberRoof(){
 return <group>
  <Box size={[11,.15,10.9]} position={[-1.2,5.64,3.9]} material={beam}/>
  {/* Separate tongue-and-groove boards and two levels of load-bearing timbers. */}
  {roofBoardBatches.map((batch,i)=><BoxInstances key={'boards'+i} {...batch}/>)}
  {[-5.6,-2.45,.7,3.83].map(x=><Round key={x} size={[.27,.33,10.8]} radius={.025} position={[x,5.15,3.9]} material={beam}/>)}
  <RoundInstances items={rafters} size={[11.05,.23,.15]} radius={.012} material={edge}/>
  <Round size={[10.95,.31,.23]} position={[-1.2,5.15,-1.23]} material={beam}/>
  {/* Continuous overhang beyond the glass wall, with visible soffit and rafter tails. */}
  <group position={[roof.wallX,5.55,3.9]} rotation={[0,0,-roof.eavePitch]}>
   {soffitBatches.map((batch,i)=><BoxInstances key={'soffit'+i} {...batch}/>)}
   <RoundInstances items={rafterTails} size={[roof.eaveWidth,.20,.13]} radius={.015} material={edge}/>
   <Round size={[.13,.25,11.2]} position={[1.29,-.07,0]} material={beam}/>
   <Box size={[roof.eaveWidth,.05,11.2]} position={[.64,.055,0]} material={mat('#92553b',.93)}/>
   {tileMaterials.map((material,variant)=><RoofTileBatch key={'tiles'+variant} variant={variant} material={material}/>)}
  </group>
  <Tube points={[[5.65,5.21,9.4],[5.65,5.21,-1.65]]} radius={.067} material={mat('#625d4c',.65,.25)}/>
  <Tube points={[[5.65,5.21,-1.63],[5.56,4.94,-1.63],[4.53,4.58,-1.63],[4.48,3.8,-1.63],[4.48,.10,-1.63]]} radius={.05} material={mat('#625d4c',.65,.25)}/>
 </group>
}
