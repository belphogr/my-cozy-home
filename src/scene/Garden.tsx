import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ExtrudeGeometry, InstancedMesh, MeshPhysicalMaterial, Object3D, Shape, SphereGeometry } from 'three'
import { Atelier } from './Atelier'
import { Box, BoxInstances, Round, RoundInstances, craftSurface, ivoryPlaster, mat, timber, woodLight } from './primitives'
import type { V3 } from './primitives'

import { benchPosition, entryPosition, gardenGroundSections, loungerPositions, poolPosition } from './layout'

const gravel=mat('#b5b19c',1),pebbleMaterial=mat('#c9c3ab',1)
const pebbleGeometry=new SphereGeometry(1,7,5)
const pathStone=craftSurface(mat('#b4aa90',.95),'plaster',true)
const deckWood=timber('#a48259',.79)
const deckBoards=Array.from({length:34},(_,i)=>({size:[5.08,.024,.142] as V3,position:[10.86,-.033,4.48+i*.15] as V3}))
const wallStoneMaterials=['#8b8b79','#989b87','#a2a48d'].map(color=>mat(color,.98))
const wallStoneBatches=wallStoneMaterials.map((material,variant)=>({material,items:Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>({r,c})))
 .flat().filter(({r,c})=>(r+c)%3===variant).map(({r,c})=>({position:[8.13+c*.38+(r%2)*.08,.18+r*.305,-1.35] as V3}))}))
function Pebbles(){
 const ref=useRef<InstancedMesh>(null)
 useLayoutEffect(()=>{
  const dummy=new Object3D(),color=new Color()
  const rand=(n:number)=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)}
  for(let i=0;i<800;i++){
   dummy.position.set(4.5+rand(i+1)*3.62,-.017,-1.2+rand(i+900)*10.45)
   dummy.scale.set(.022+rand(i+30)*.035,.012+rand(i+60)*.01,.026+rand(i+90)*.038)
   dummy.rotation.y=rand(i+200)*Math.PI;dummy.updateMatrix()
   ref.current!.setMatrixAt(i,dummy.matrix)
   color.setHSL(.11,.12,.45+rand(i+400)*.21);ref.current!.setColorAt(i,color)
  }
  ref.current!.instanceMatrix.needsUpdate=true;ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere()
 },[])
 return <instancedMesh ref={ref} args={[pebbleGeometry,pebbleMaterial,800]} receiveShadow/>
}
function Flagstone({position,seed}:{position:V3;seed:number}){
 const geometry=useMemo(()=>{
  const shape=new Shape()
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,r=.43+Math.sin(seed+i*2.4)*.045
   const x=Math.cos(a)*r,y=Math.sin(a)*r*.84
   if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y)
  }
  shape.closePath()
  return new ExtrudeGeometry(shape,{depth:.032,bevelEnabled:true,bevelSegments:2,bevelSize:.021,bevelThickness:.009,steps:1})
 },[seed])
 return <mesh geometry={geometry} material={pathStone} position={position} rotation={[-Math.PI/2,0,seed*.18]} castShadow receiveShadow/>
}
function PoolWater({night,reduced}:{night:boolean;reduced:boolean}){
 const time=useMemo(()=>({value:0}),[])
 const material=useMemo(()=>{
  const m=new MeshPhysicalMaterial({color:'#4f9e94',roughness:.22,metalness:.12,transparent:true,opacity:.78,depthWrite:false,clearcoat:.5})
  m.onBeforeCompile=shader=>{
   shader.uniforms.uWaterTime=time
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWaterTime; varying vec2 vWater;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvWater=position.xy; transformed.z+=.004*(sin(position.x*5.0+uWaterTime*.65)+cos(position.y*4.0-uWaterTime*.5));')
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterTime; varying vec2 vWater;')
    .replace('#include <color_fragment>',`#include <color_fragment>
     float wave=sin(vWater.x*17.0+sin(vWater.y*9.0+uWaterTime*.4))+cos(vWater.y*19.0+sin(vWater.x*7.0-uWaterTime*.3));
     float glints=pow(max(0.0,wave*.5),12.0);
     diffuseColor.rgb*=.92+glints*.22;
    `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
     normal=normalize(normal+vec3(sin(vWater.x*8.0+uWaterTime*.65)*.075,cos(vWater.y*9.0-uWaterTime*.5)*.075,0.0));
    `)
  }
  m.customProgramCacheKey=()=> 'garden-water-v1'
  return m
 },[time])
 useEffect(()=>{material.color.set(night?'#326b6c':'#4f9e94')},[material,night])
 useEffect(()=>()=>material.dispose(),[material])
 useFrame((_,dt)=>{if(!reduced)time.value+=Math.min(dt,.05)})
 return <mesh position={[poolPosition[0],poolPosition[1]-.08,poolPosition[2]]} rotation={[-Math.PI/2,0,0]} material={material} receiveShadow>
  <planeGeometry args={[3.35,3.95,32,40]}/>
 </mesh>
}
function Lantern({position,night}:{position:V3;night:boolean}){
 return <group position={position}>
  <Box size={[.18,.035,.18]} position={[0,.22,0]} material={mat('#554e37',.7)}/>
  <Box size={[.14,.035,.14]} position={[0,0,0]} material={mat('#554e37',.7)}/>
  {[-1,1].flatMap(x=>[-1,1].map(z=><Box key={x+','+z} size={[.015,.21,.015]} position={[x*.065,.11,z*.065]} material={mat('#554e37',.7)}/>))}
  <mesh position={[0,.11,0]}><cylinderGeometry args={[.041,.045,.16,12]}/><meshStandardMaterial color="#e7d7b6" emissive="#ffcf8b" emissiveIntensity={night?2.2:0}/></mesh>
  <pointLight position={[0,.17,.12]} intensity={night?4:0} distance={5} color="#ffbd72"/>
 </group>
}
export function GardenEntry({onGarden,computer}:{onGarden:()=>void;computer:boolean}){
 return <group>
  <group position={entryPosition} rotation={[0,Math.PI/2,0]} onClick={e=>{if(!computer&&e.delta<5){e.stopPropagation();onGarden()}}}><Atelier model="gardenentry"/></group>
  {[-.3,7.9].map((z,i)=><group key={z}>
   <Box size={[.12,4.25,.12]} position={[4.25,2.10,i?9.46:-1.30]} material={woodLight}/>
   {[.08,1.55,3.1,4.18].map(y=><Box key={y} size={[.10,.06,i?3.12:1.91]} position={[4.25,y,z]} material={woodLight}/>)}
  </group>)}
 </group>
}
export function Garden({night,reduced,onPool,onBench}:{night:boolean;reduced:boolean;onPool:()=>void;onBench:()=>void}){
 return <group onClick={e=>e.stopPropagation()}>
  <group>
  {gardenGroundSections.map((p,i)=><Box key={i} {...p} material={i===1?deckWood:gravel}/>)}
  <Pebbles/>
  {Array.from({length:12},(_,i)=><Flagstone key={i} seed={i+1} position={[6.45+Math.sin(i*2)*.10,-.035,-.68+i*.82]}/>)}
  {[0,1].map(i=><Flagstone key={'entry'+i} seed={i+21} position={[4.85+i*.72,-.035,3.5]}/>)}
  <BoxInstances items={deckBoards} material={deckWood}/>
  </group>
  <Box size={[9.22,2.8,.18]} position={[8.85,1.35,-1.50]} material={ivoryPlaster}/>
  <Round size={[9.35,.13,.28]} position={[8.85,2.78,-1.5]} radius={.035} material={pathStone}/>
  <Box size={[.18,1.5,11.1]} position={[13.4,.70,4]} material={ivoryPlaster}/>
  <Round size={[.28,.13,11.15]} position={[13.4,1.43,4]} radius={.035} material={pathStone}/>
  {wallStoneBatches.map((batch,index)=><RoundInstances key={index} {...batch} size={[.36,.28,.13]} radius={.035}/>)}
  <group position={benchPosition} onClick={e=>{if(e.delta<5){e.stopPropagation();onBench()}}}><Atelier model="pottingbench"/></group>
  <group position={poolPosition} onClick={e=>{if(e.delta<5){e.stopPropagation();onPool()}}}><Atelier model="poolshell"/></group>
  <PoolWater night={night} reduced={reduced}/>
  {loungerPositions.map((p,i)=><group key={i} position={p} onClick={e=>{if(e.delta<5){e.stopPropagation();onPool()}}}><Atelier model="lounger"/></group>)}
  <Box size={[.18,.26,.06]} position={[5.6,1.94,-1.38]} material={mat('#554e37',.7)}/>
  <Box size={[.07,.05,.2]} position={[5.6,1.81,-1.3]} material={mat('#554e37',.7)}/>
  <Lantern position={[5.6,1.83,-1.25]} night={night}/>
  <Lantern position={[12.95,-.0035,5.0]} night={night}/>
  <Lantern position={[5.25,-.0035,6.8]} night={night}/>
  <Lantern position={[7.40,-.0035,1.65]} night={night}/>
  <Lantern position={[7.45,-.0035,5.20]} night={night}/>
  <Lantern position={[12.85,-.0035,.10]} night={night}/>
 </group>
}
