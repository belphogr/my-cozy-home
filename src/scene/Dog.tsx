import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Group, LoopRepeat, Mesh, Vector3 } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { dogBedPosition } from './layout'

type DogState='rest'|'wander'
const dogAsset='/assets/models/dog.glb?v=3'
const home=new Vector3(dogBedPosition[0],dogBedPosition[1]+.30,dogBedPosition[2])
const homeRotation=0
const route=[
 new Vector3(-2.70,.02,2.10),
 new Vector3(-1.40,.02,1.65),
 new Vector3(-.65,.02,2.55),
 new Vector3(-1.55,.02,3.25),
 new Vector3(-2.85,.02,3.05),
 new Vector3(-2.70,.02,2.10),
]

export default function Dog({paused=false,onToggle}:{paused?:boolean;onToggle:(wandering:boolean)=>void}){
 const gltf=useGLTF(dogAsset)
 const camera=useThree(state=>state.camera)
 const model=useMemo(()=>{
  const scene=clone(gltf.scene)
  scene.traverse(node=>{
   node.layers.set(1)
   if(node instanceof Mesh){
    // The room contact-shadow pass is intentionally static. Keeping this moving
    // mesh out of that pass prevents a baked ghost from remaining by the bed.
    node.castShadow=false;node.receiveShadow=true
   }
  })
  scene.updateMatrixWorld(true)
  return scene
 },[gltf.scene])
 const root=useRef<Group>(null)
 const state=useRef<DogState>('rest'),target=useRef(1),activeAction=useRef('')
 const {actions}=useAnimations(gltf.animations,model)
 const restName=useMemo(()=>gltf.animations.find(a=>/dog[_ |]rest/i.test(a.name))?.name??gltf.animations[0]?.name,[gltf.animations])
 const walkName=useMemo(()=>gltf.animations.find(a=>/dog[_ |]walk/i.test(a.name))?.name??gltf.animations[1]?.name??gltf.animations[0]?.name,[gltf.animations])
 const fit=useMemo(()=>{
  const bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3())
  const scale=.78/Math.max(size.x,size.y,size.z)
  return {scale,offset:new Vector3(-center.x*scale,0,-center.z*scale)}
 },[model])
 useEffect(()=>{camera.layers.enable(1);return()=>camera.layers.disable(1)},[camera])
 useEffect(()=>()=>{Object.values(actions).forEach(action=>action?.stop())},[actions])
 useEffect(()=>{Object.values(actions).forEach(action=>{if(action)action.paused=paused})},[actions,paused])
 const playNow=(name?:string)=>{
  Object.values(actions).forEach(action=>action?.stop())
  if(name){actions[name]?.reset().setLoop(LoopRepeat,Infinity).play();activeAction.current=name}
 }
 const restAtHome=()=>{
  if(root.current){root.current.position.copy(home);root.current.rotation.set(0,homeRotation,0)}
  state.current='rest';target.current=1;playNow(restName);onToggle(false)
 }
 useFrame((_,delta)=>{
  const group=root.current
  if(!group)return
  const desired=state.current==='rest'?restName:walkName
  if(desired&&activeAction.current!==desired){
   if(activeAction.current)actions[activeAction.current]?.fadeOut(.24)
   actions[desired]?.reset().setLoop(LoopRepeat,Infinity).fadeIn(.24).play()
   activeAction.current=desired
  }
  if(paused||state.current==='rest')return
  const goal=route[target.current]
  const dx=goal.x-group.position.x,dz=goal.z-group.position.z
  const distance=Math.hypot(dx,dz)
  if(distance<.06){
   if(target.current>=route.length-1)restAtHome()
   else target.current++
   return
  }
  const step=Math.min(distance,delta*.42)
  group.position.x+=dx/distance*step;group.position.z+=dz/distance*step
  // The source Shiba faces Blender -Y, exported as local Three.js +Z.
  const facing=Math.atan2(dx,dz)
  group.rotation.y+=Math.atan2(Math.sin(facing-group.rotation.y),Math.cos(facing-group.rotation.y))*Math.min(delta*5,1)
 })
 const toggle=()=>{
  if(state.current==='rest'){
   root.current?.position.copy(route[0])
   if(root.current){const dx=route[1].x-route[0].x,dz=route[1].z-route[0].z;root.current.rotation.y=Math.atan2(dx,dz)}
   state.current='wander';target.current=1;playNow(walkName);onToggle(true)
  }else restAtHome()
 }
 return <group ref={root} position={home} onClick={event=>{if(event.delta<5){event.stopPropagation();toggle()}}}>
  <group position={fit.offset}><primitive object={model} scale={fit.scale}/></group>
  <mesh position={[0,.27,0]}><boxGeometry args={[1.16,.88,1.26]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 </group>
}
useGLTF.preload(dogAsset)
