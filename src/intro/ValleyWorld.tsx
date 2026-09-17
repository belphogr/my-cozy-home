import { useEffect,useMemo,useRef } from 'react'
import { Stars,useAnimations,useGLTF } from '@react-three/drei'
import { useFrame,useThree } from '@react-three/fiber'
import { CatmullRomCurve3,Color,DirectionalLight,FogExp2,Group,MathUtils,Mesh,MeshPhysicalMaterial,MeshStandardMaterial,Object3D,PerspectiveCamera,Points,Vector3 } from 'three'
import type { IntroPhase } from './introState'

const ASSET='/assets/intro/bali-intro.glb'
const INTRO_SECONDS=30
const DOOR_X=-4.55
const DOOR_Z=13.55
const dawn=new Color('#a9cee0'),day=new Color('#76b9d3'),sunset=new Color('#c8794d'),night=new Color('#07101f'),morning=new Color('#91c8dd')
const mistTint=new Color('#d9dbd2'),waterDeep=new Color('#effdff'),waterLagoon=new Color('#f2fff9')
const warmSun=new Color('#fff0cf'),clearMorningSun=new Color('#fff8e9')
// glTF material colors multiply their texture maps. These are deliberately
// light tint factors; the previous dark greens multiplied the albedo to black.
const groundDry=new Color('#c4b58f'),groundLush=new Color('#b9d0a7')
let deferredDispose:number|undefined

interface Props{
 phase:IntroPhase
 reduced:boolean
 active:boolean
 onComplete:()=>void
 onPortal:()=>void
 onDoor:()=>void
 onProgress:(value:number)=>void
}

function smooth(value:number){return value*value*(3-2*value)}
function range(value:number,start:number,end:number){return MathUtils.clamp((value-start)/(end-start),0,1)}

function skyColor(progress:number,target:Color){
 if(progress<.18)return target.copy(dawn).lerp(day,smooth(range(progress,0,.18)))
 if(progress<.62)return target.copy(day).lerp(sunset,smooth(range(progress,.52,.62)))
 if(progress<.76)return target.copy(sunset).lerp(night,smooth(range(progress,.62,.76)))
 if(progress<.89)return target.copy(night).lerp(dawn,smooth(range(progress,.80,.89)))
 // The destination is a clear tropical morning, not the previous amber dusk.
 return target.copy(dawn).lerp(morning,smooth(range(progress,.89,1)))
}

function markerCurve(model:Object3D,prefix:string){
 const points:Vector3[]=[]
 for(let i=0;i<8;i++){
  const node=model.getObjectByName(`${prefix}_${String(i).padStart(2,'0')}`)
  if(node)points.push(node.getWorldPosition(new Vector3()))
 }
 return new CatmullRomCurve3(points,false,'catmullrom',.42)
}

export default function ValleyWorld({phase,reduced,active,onComplete,onPortal,onDoor,onProgress}:Props){
 const loaded=useGLTF(ASSET),model=useMemo(()=>loaded.scene.clone(true),[loaded.scene])
 const group=useRef<Group>(null),sun=useRef<DirectionalLight>(null),stars=useRef<Points>(null),moon=useRef<Mesh>(null)
 const progress=useRef(reduced?1:0),opening=useRef(0),finished=useRef(false),portaled=useRef(false)
 const color=useMemo(()=>new Color(),[]),fogColor=useMemo(()=>new Color(),[]),sunColor=useMemo(()=>new Color(),[])
 const {actions,mixer}=useAnimations(loaded.animations,group)
 const {camera,scene,size,gl}=useThree()
 const cameraPath=useMemo(()=>{model.updateMatrixWorld(true);return markerCurve(model,'Cam')},[model])
 const targetPath=useMemo(()=>{model.updateMatrixWorld(true);return markerCurve(model,'Target')},[model])
 const doorApproach=useMemo(()=>model.getObjectByName('Door_Approach')?.getWorldPosition(new Vector3())??new Vector3(DOOR_X,1.60,18.25),[model])
 const leftDoor=useMemo(()=>model.getObjectByName('Door_Left_Pivot'),[model]),rightDoor=useMemo(()=>model.getObjectByName('Door_Right_Pivot'),[model])
 const leftHandle=useMemo(()=>model.getObjectByName('Door_Handle_Left'),[model]),rightHandle=useMemo(()=>model.getObjectByName('Door_Handle_Right'),[model])
 const leftBase=useMemo(()=>leftDoor?.rotation.y??0,[leftDoor]),rightBase=useMemo(()=>rightDoor?.rotation.y??0,[rightDoor])
 const leftHandleBase=useMemo(()=>leftHandle?.rotation.z??0,[leftHandle]),rightHandleBase=useMemo(()=>rightHandle?.rotation.z??0,[rightHandle])
 const materials=useMemo(()=>{
  const found=new Map<string,MeshStandardMaterial>()
  model.traverse(object=>{
   if(!(object instanceof Mesh))return
   let parent:Object3D|null=object,near=false
   while(parent){if(parent.name.startsWith('Build_')||parent.name.startsWith('Near')){near=true;break}parent=parent.parent}
   object.castShadow=near&&!object.name.includes('Glass')
   object.receiveShadow=true
   const list=Array.isArray(object.material)?object.material:[object.material]
   for(const item of list)if(item instanceof MeshStandardMaterial)found.set(item.name,item)
  })
  return found
 },[model])

 useEffect(()=>{
  // Blender's water is exported with transmission for offline rendering. With
  // no HDRI behind it in the browser that made the ocean read as a dark sheet.
  // Keep a little optical depth, but let the albedo/specular response carry the
  // realtime surface so the deep ocean and turquoise lagoon stay distinct.
  const tuneWater=(name:string,tint:Color,emissive:string)=>{
   const material=materials.get(name)
   if(!material)return
   material.color.copy(tint)
   material.roughness=.26
   material.metalness=.06
   material.opacity=1
   material.transparent=false
   material.emissive.set(emissive)
   material.emissiveIntensity=.14
   material.envMapIntensity=1.25
   if(material instanceof MeshPhysicalMaterial){
    material.transmission=.06
    material.thickness=.18
    material.ior=1.333
    material.clearcoat=.34
    material.clearcoatRoughness=.22
   }
   material.needsUpdate=true
  }
  tuneWater('Water_River',waterDeep,'#126985')
  tuneWater('Water_Lagoon_Shallow',waterLagoon,'#25969b')
 },[materials])

 useEffect(()=>{
  for(const action of Object.values(actions))if(action){action.enabled=true;action.clampWhenFinished=true;action.play()}
 },[actions])
 useEffect(()=>{
  // React StrictMode mounts effects twice in development. Cancel a deferred
  // cleanup when the same intro immediately remounts; perform it only on the
  // real transition so the 15 MB intro does not occupy the house GPU context.
  if(deferredDispose!==undefined){clearTimeout(deferredDispose);deferredDispose=undefined}
  return()=>{
   deferredDispose=window.setTimeout(()=>{
    const geometries=new Set<import('three').BufferGeometry>()
    const disposableMaterials=new Set<MeshStandardMaterial>()
    model.traverse(object=>{
     if(!(object instanceof Mesh))return
     geometries.add(object.geometry)
     const list=Array.isArray(object.material)?object.material:[object.material]
     for(const item of list)if(item instanceof MeshStandardMaterial)disposableMaterials.add(item)
    })
    for(const geometry of geometries)geometry.dispose()
    for(const item of disposableMaterials){
     for(const map of [item.map,item.normalMap,item.roughnessMap,item.metalnessMap,item.aoMap,item.emissiveMap,item.alphaMap])map?.dispose()
     item.dispose()
    }
    useGLTF.clear(ASSET)
    gl.renderLists.dispose()
    gl.dispose()
    deferredDispose=undefined
   },0)
  }
 },[model,gl])
 useEffect(()=>{if(phase==='doorstep')progress.current=1},[phase])
 useEffect(()=>{scene.fog=new FogExp2('#b9d1d4',.0026);return()=>{scene.fog=null}},[scene])

 useFrame((state,dt)=>{
  if(!active)return
  if(phase==='building'){
   progress.current=Math.min(1,progress.current+Math.min(dt,.05)/INTRO_SECONDS)
   onProgress(progress.current)
   if(progress.current>=1&&!finished.current){finished.current=true;onComplete()}
  }else if(phase==='doorstep'||phase==='opening')progress.current=1

  const clipTime=progress.current*INTRO_SECONDS
  for(const action of Object.values(actions))if(action){action.time=Math.min(clipTime,action.getClip().duration);action.paused=false}
  mixer.update(0)

  const route=smooth(progress.current),position=cameraPath.getPoint(route),target=targetPath.getPoint(route)
  if(phase==='opening'){
   opening.current=Math.min(1,opening.current+Math.min(dt,.05)/1.85)
   const eased=smooth(opening.current),handleEase=smooth(range(opening.current,0,.28)),doorEase=smooth(range(opening.current,.16,1))
   position.lerp(doorApproach,eased)
   if(leftHandle)leftHandle.rotation.z=leftHandleBase-handleEase*.42
   if(rightHandle)rightHandle.rotation.z=rightHandleBase+handleEase*.42
   if(leftDoor)leftDoor.rotation.y=leftBase+doorEase*1.34
   if(rightDoor)rightDoor.rotation.y=rightBase-doorEase*1.34
   if(opening.current>=1&&!portaled.current){portaled.current=true;onPortal()}
  }
  const portrait=size.width/size.height<.85
  if(portrait){position.x*=.88;position.z+=route<.7?2.3:0}
  camera.position.copy(position);camera.lookAt(target)
  if(camera instanceof PerspectiveCamera){camera.fov=MathUtils.lerp(portrait?76:65,portrait?58:46,smooth(range(route,.58,1)));camera.updateProjectionMatrix()}

  const sky=skyColor(progress.current,color),nightAmount=Math.sin(Math.PI*range(progress.current,.63,.90))
  scene.background=sky
  if(scene.fog instanceof FogExp2){
   // Fog should add aerial depth to the wide shot, then clear as the camera
   // arrives at the gate. The old linear ramp ended at .011 and washed the
   // entire doorstep grey.
   scene.fog.color.copy(skyColor(progress.current,fogColor).lerp(mistTint,.07+nightAmount*.12))
   scene.fog.density=.0022+nightAmount*.0032+(1-smooth(range(progress.current,.86,1)))*.0005
  }
  if(sun.current){
   if(progress.current<.52){
    const travel=smooth(range(progress.current,0,.52))
    sun.current.position.set(MathUtils.lerp(-12,9,travel),MathUtils.lerp(15,20,travel),MathUtils.lerp(18,13,travel))
   }else if(progress.current<.76){
    const setting=smooth(range(progress.current,.52,.76))
    sun.current.position.set(MathUtils.lerp(9,14,setting),MathUtils.lerp(20,1.5,setting),MathUtils.lerp(13,-7,setting))
   }else if(progress.current<.88){
    const dawnReturn=smooth(range(progress.current,.76,.88))
    sun.current.position.set(MathUtils.lerp(-14,-9,dawnReturn),MathUtils.lerp(1.5,6,dawnReturn),MathUtils.lerp(-7,9,dawnReturn))
   }else{
    const morningRise=smooth(range(progress.current,.88,1))
    sun.current.position.set(MathUtils.lerp(-9,9,morningRise),MathUtils.lerp(6,18,morningRise),MathUtils.lerp(9,17,morningRise))
   }
   sun.current.color.copy(sunColor.copy(warmSun).lerp(clearMorningSun,smooth(range(progress.current,.9,1))))
   sun.current.intensity=Math.max(.1,(3.0+smooth(range(progress.current,.89,1))*.35)*(1-nightAmount))
  }
  if(stars.current&&!Array.isArray(stars.current.material)){stars.current.material.transparent=true;stars.current.material.opacity=nightAmount*.88}
  if(moon.current){moon.current.visible=nightAmount>.06;moon.current.position.set(-8,9,-7)}
  const earth=materials.get('Ground_Earth');if(earth)earth.color.copy(groundDry).lerp(groundLush,smooth(range(progress.current,.04,.28)))
  const water=materials.get('Water_River');if(water)water.color.copy(waterDeep).offsetHSL(Math.sin(state.clock.elapsedTime*.5)*.004,0,Math.sin(state.clock.elapsedTime)*.008)
  const lagoon=materials.get('Water_Lagoon_Shallow');if(lagoon)lagoon.color.copy(waterLagoon).offsetHSL(Math.sin(state.clock.elapsedTime*.42)*.003,0,Math.sin(state.clock.elapsedTime*.8)*.006)
  const warm=materials.get('Interior_Warm_Light');if(warm)warm.emissiveIntensity=.35+nightAmount*2.8+smooth(range(progress.current,.9,1))*.8
 })

 return <>
  <hemisphereLight args={['#dff3ff','#637054',1.72]}/>
  <directionalLight ref={sun} castShadow position={[8,12,6]} intensity={2.4} shadow-mapSize={[1536,1536]}
   shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-bias={-.00025} shadow-normalBias={.025} shadow-radius={3}/>
  <pointLight position={[DOOR_X,2.5,12.7]} color="#ffd4a0" intensity={phase==='doorstep'||phase==='opening'?2.1:.25} distance={8}/>
  <pointLight position={[DOOR_X,4.2,18.2]} color="#d9efff" intensity={phase==='doorstep'||phase==='opening'?1.4:0} distance={11}/>
  <Stars ref={stars} radius={55} depth={24} count={1100} factor={2.2} saturation={.12} fade speed={.15}/>
  <mesh ref={moon} position={[-8,9,-7]}><sphereGeometry args={[.55,18,12]}/><meshBasicMaterial color="#e8eddd"/></mesh>
  <group ref={group}><primitive object={model}/></group>
  {(phase==='doorstep'||phase==='opening')&&<mesh position={[DOOR_X,1.55,DOOR_Z]} onClick={event=>{event.stopPropagation();onDoor()}}
   onPointerOver={()=>{document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
   <boxGeometry args={[2.1,3.2,.5]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/>
  </mesh>}
 </>
}

useGLTF.preload(ASSET)
