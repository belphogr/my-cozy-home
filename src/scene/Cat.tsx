import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Box3, Group, LoopRepeat, MeshStandardMaterial, Vector3 } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
export default function Cat({paused=false,onClick}:{paused?:boolean;onClick:()=>void}){
 const gltf=useGLTF('/assets/models/cat.glb')
 const model=useMemo(()=>{
  const scene=clone(gltf.scene)
  scene.traverse(node=>{
   if('isMesh' in node){
    const mesh=node as import('three').Mesh
    const raw=Array.isArray(mesh.material)?mesh.material:[mesh.material]
    const mapped=raw.map(m=>new MeshStandardMaterial({name:m.name,color:m.name==='Grey'?'#c59464':m.name==='Pink'?'#d5aaa0':'#e2dbc7',roughness:.85}))
    mesh.material=Array.isArray(mesh.material)?mapped:mapped[0]
    mesh.castShadow=true
    mesh.receiveShadow=true
   }
  })
  // Update the complete bone hierarchy before any skinned bounds are computed.
  scene.updateMatrixWorld(true)
  return scene
 },[gltf.scene])
 const root=useRef<Group>(null)
 const {actions}=useAnimations(gltf.animations,model)
 const state=useRef(''),clock=useRef(0)
 useEffect(()=>{return()=>{Object.values(actions).forEach(a=>a?.stop())}},[actions])
 useEffect(()=>{Object.values(actions).forEach(a=>{if(a)a.paused=paused})},[actions,paused])
 useFrame((_,delta)=>{
  if(paused)return
  clock.current+=Math.min(delta,.05)
  const t=clock.current%30,walking=(t>5&&t<15)||(t>20)
  const desired=walking?'CatArmature|Walking':'CatArmature|Idle'
  if(state.current!==desired){
   actions[state.current]?.fadeOut(.3)
   actions[desired]?.reset().setLoop(LoopRepeat,Infinity).fadeIn(.3).play()
   state.current=desired
  }
  if(root.current){
   root.current.position.x=t<=5?-1.5:t<15?-1.5+(t-5)/10*1.85:t<20?.35:.35-(t-20)/10*1.85
   const facing=t>17?Math.PI:0
   root.current.rotation.y+=(facing-root.current.rotation.y)*Math.min(delta*4,1)
  }
 })
 // FBX source is centimeters plus a Blender export scale; normalize with full skinned bounds.
 const size=useMemo(()=>new Box3().setFromObject(model).getSize(new Vector3()),[model])
 const scale=.72/Math.max(size.x,size.y,size.z)
 return <group ref={root} position={[-1.5,-.012,1.4]} onClick={e=>{if(e.delta<5){e.stopPropagation();onClick()}}}>
  <primitive object={model} scale={scale}/>
 </group>
}
useGLTF.preload('/assets/models/cat.glb')
