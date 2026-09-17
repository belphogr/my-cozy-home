import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { AdditiveBlending, Color, Group, Object3D, PMREMGenerator, ShaderMaterial, Texture } from 'three'
import type { DirectionalLight, SpotLight } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { Round, dark, mat } from './primitives'
import { Room } from './Room'
import Dog from './Dog'
import { Atelier } from './Atelier'
import Desktop from '../desktop/Desktop'
import type { HomeData, InspectId } from '../data/home'
import { ItemModel } from './Objects'
import StageCamera from './StageCamera'
import type { FocusId, Travel } from './navigation'
import { Garden } from './Garden'
import { TropicalGarden } from './TropicalGarden'
import { WindowLandscape } from './Window'
import { Atmosphere } from './Atmosphere'
import { items } from './layout'
import type { Area } from './layout'
import { dogBedPosition } from './layout'
import { text, useLanguage } from '../i18n'
import type { Language } from '../i18n'
interface Props {
 data:HomeData; save:(data:HomeData)=>Promise<void>;computer:boolean;onComputer:()=>void;
 inspect:InspectId|null;onFocus:(id:FocusId)=>void;night:boolean;reduced:boolean;active:boolean;
 onDirty:(value:boolean)=>void;onDog:(wandering:boolean)=>void;
 travel:Travel;onStats:(value:string)=>void;onMotion:(moving:boolean)=>void;playing:boolean;
 area:Area;onRegion:(area:Area)=>void;
 onRecognition:()=>void;
 focus:FocusId|null;onPhoto:(index:number,value:string|null)=>void;onPhotoError:(message:string)=>void;
 onPhotoSelection:(index:number|null)=>void;
 onNoteCard:(slot:number)=>void;
 language:Language;
 onGraphicsLost:()=>void;
 onReady?:()=>void;
}
function Monitor({data,save,computer,onComputer,inspect,onDirty,language}:Props){
 // Scale around the desk contact point, keeping the stand seated on the surface.
 return <group position={[0,1.14,-.5]} scale={.65} onClick={e=>{if(!computer&&!inspect&&e.delta<5){e.stopPropagation();onComputer()}}}>
  <group position={[0,-1.14,.5]}>
  <Round size={[.67,.04,.38]} position={[0,1.145,-.43]} radius={.024} material={dark}/>
  <Round size={[.17,.4,.12]} position={[0,1.32,-.56]} material={dark} radius={.02}/>
  <Round size={[3.02,1.88,.10]} position={[0,2.20,-.5]} radius={.035} material={dark}/>
  <Round size={[2.85,1.70,.012]} position={[0,2.22,-.443]} radius={.013} material={mat('#819578',.7)}/>
  <mesh position={[.07,1.292,-.44]}><sphereGeometry args={[.008,8,8]}/><meshBasicMaterial color="#c8d4ad"/></mesh>
  {/* A depth-tested screen aperture sits in the WebGL canvas; HTML lives behind it.
      Unlike center-ray visibility, blending also clips partially occluded screen edges. */}
  {!inspect&&<Html transform occlude="blending" wrapperClass="monitor-html" position={[0,2.22,-.432]} distanceFactor={1.14} zIndexRange={[20,0]} pointerEvents={computer?'auto':'none'} style={{width:1000,height:596,pointerEvents:computer?'auto':'none'}}>
   <Desktop data={data} save={save} active={computer} onDirty={onDirty} language={language}/>
  </Html>}
  </group>
 </group>
}
function RenderStats({report}:{report:(value:string)=>void}){
 const {language}=useLanguage()
 const sample=useRef({elapsed:0,frames:0,warmup:2})
 const gpuName=useRef('')
 useFrame(({gl,size},dt)=>{
  const s=sample.current
  if(!gpuName.current){
   const context=gl.getContext()
   const info=context.getExtension('WEBGL_debug_renderer_info')
   gpuName.current=info
    ?String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)).replace(/^ANGLE \(/,'').replace(/\)$/,'')
    :'WebGL GPU'
  }
  if(s.warmup>0){s.warmup-=dt;return}
  if(dt>1){s.elapsed=0;s.frames=0;return}
  s.elapsed+=dt;s.frames++
  if(s.elapsed>=2){report(`${size.width} × ${size.height} · DPR ${gl.getPixelRatio().toFixed(1)} · ${(s.frames/s.elapsed).toFixed(0)} FPS · ${gl.info.render.calls} ${text(language,'次绘制','draw calls')} · ${gl.info.programs?.length??0} shaders · ${gpuName.current}`);s.elapsed=0;s.frames=0}
 })
 return null
}
function GraphicsRecovery({onLost}:{onLost:()=>void}){
 const {gl}=useThree()
 useEffect(()=>{
  let handled=false
  const canvas=gl.domElement
  const lost=(event:Event)=>{event.preventDefault();if(!handled){handled=true;onLost()}}
  canvas.addEventListener('webglcontextlost',lost,false)
  return()=>canvas.removeEventListener('webglcontextlost',lost,false)
 },[gl,onLost])
 return null
}
function SceneReady({onReady}:{onReady?:()=>void}){
 const pending=useRef(false),done=useRef(false),frames=useRef(0)
 useFrame(({gl,scene,camera})=>{
  if(done.current||pending.current||!onReady||++frames.current<3)return
  pending.current=true
  void gl.compileAsync(scene,camera).catch(()=>undefined).finally(()=>{
   if(done.current)return
   done.current=true
   onReady()
  })
 })
 return null
}
function DaylightAccents({night}:{night:boolean}){
 const material=useMemo(()=>new ShaderMaterial({
  transparent:true,depthWrite:false,depthTest:true,blending:AdditiveBlending,
  uniforms:{uColor:{value:new Color('#ffd09a')},uOpacity:{value:.22}},
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec2 vUv;uniform vec3 uColor;uniform float uOpacity;
   void main(){
    float edge=smoothstep(0.0,.18,vUv.x)*smoothstep(0.0,.18,1.0-vUv.x)*smoothstep(0.0,.16,vUv.y)*smoothstep(0.0,.16,1.0-vUv.y);
    float glow=.92+.08*sin(vUv.y*18.0);
    gl_FragColor=vec4(uColor,edge*glow*uOpacity);
   }`,
 }),[])
 useEffect(()=>()=>material.dispose(),[material])
 if(night)return null
 return <group renderOrder={2}>
  {/* Indoor and outdoor daylight coexist; changing the camera must not switch either off. */}
  <mesh position={[6.42,-.015,3.65]} rotation={[-Math.PI/2,0,-.05]} material={material}><planeGeometry args={[2.1,6.6]}/></mesh>
  <mesh position={[10.4,-.014,6.10]} rotation={[-Math.PI/2,0,.04]} material={material}><planeGeometry args={[4.45,1.55]}/></mesh>
  <mesh position={[8.85,-.014,-.58]} rotation={[-Math.PI/2,0,-.03]} material={material}><planeGeometry args={[4.8,1.2]}/></mesh>
  <mesh position={[2.78,-.015,3.65]} rotation={[-Math.PI/2,0,-.08]} material={material}><planeGeometry args={[2.15,4.7]}/></mesh>
  <mesh position={[1.05,-.014,2.55]} rotation={[-Math.PI/2,0,-.08]} material={material}><planeGeometry args={[.72,3.15]}/></mesh>
  <mesh position={[2.65,2.7,-1.285]} rotation={[0,0,-.05]} material={material}><planeGeometry args={[1.25,2.55]}/></mesh>
 </group>
}
function Lighting({night,area}:{night:boolean;area:Area}){
 const {scene,gl}=useThree()
 const [environments,setEnvironments]=useState<{day:Texture;night:Texture}|null>(null)
 const pendantTarget=useMemo(()=>new Object3D(),[])
 const livingLightTarget=useMemo(()=>new Object3D(),[])
 const gardenSunTarget=useMemo(()=>new Object3D(),[])
 const diningLightTarget=useMemo(()=>new Object3D(),[])
 const gardenSun=useRef<DirectionalLight>(null)
 const pendantShadow=useRef<SpotLight>(null)
 const livingShadow=useRef<SpotLight>(null)
 useEffect(()=>{
  const generator=new PMREMGenerator(gl),room=new RoomEnvironment()
  const nightTarget=generator.fromScene(room,.04)
  let active=true,dayTarget:ReturnType<PMREMGenerator['fromEquirectangular']>|null=null
  room.dispose()
  // Keep the established night environment available while the Blender HDR finishes loading.
  setEnvironments({day:nightTarget.texture,night:nightTarget.texture})
  new HDRLoader().load('/assets/environment/blender-daylight.hdr',source=>{
   if(!active){source.dispose();return}
   dayTarget=generator.fromEquirectangular(source);source.dispose();generator.dispose()
   setEnvironments({day:dayTarget.texture,night:nightTarget.texture})
  },undefined,()=>generator.dispose())
  return()=>{active=false;scene.environment=null;nightTarget.dispose();dayTarget?.dispose();generator.dispose()}
 },[scene,gl])
 useEffect(()=>{if(environments)scene.environment=night?environments.night:environments.day},[scene,night,environments])
 useEffect(()=>{scene.environmentIntensity=night?.09:area==='outdoor'?.66:.48},[scene,night,area])
 useEffect(()=>{scene.background=new Color(night?'#071526':'#69afe0')},[scene,night])
 useEffect(()=>{gl.toneMappingExposure=night?.78:area==='outdoor'?1.15:1.06},[gl,night,area])
 useEffect(()=>{
  const active=!night&&area==='outdoor',shadow=gardenSun.current?.shadow
  if(shadow){shadow.autoUpdate=false;if(active)shadow.needsUpdate=true}
 },[night,area])
 useEffect(()=>{
  for(const light of [pendantShadow.current,livingShadow.current]){
   if(light){light.shadow.autoUpdate=false;light.shadow.needsUpdate=true}
  }
 },[])
 return <>
  <ambientLight intensity={night?.10:.09} color={night?'#6f89ad':'#ffe4c3'}/>
  <hemisphereLight args={[night?'#526b96':'#c9e0e7','#5b402b',night?.14:area==='outdoor'?.38:.25]}/>
  <primitive object={gardenSunTarget} position={[9,0,4]}/>
  {/* One soft shadow source, plus a shadowless courtyard bounce that keeps the open side bright. */}
  <directionalLight ref={gardenSun} position={[14,10,8]} target={gardenSunTarget} color="#ffd3a2" intensity={!night&&area==='outdoor'?2.55:.00001} castShadow
   shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7}
   shadow-normalBias={.014} shadow-bias={-.0001} shadow-radius={2.3}/>
  <directionalLight position={[14,10,8]} target={gardenSunTarget} color={night?'#7895c8':'#ffd3a2'} intensity={night?.07:area==='outdoor'?.00001:1.25}/>
  <directionalLight position={[8,7,4]} color={night?'#6c86b7':'#ffd0a0'} intensity={night?.10:1.35}/>
  <directionalLight position={[-8,5,2.3]} intensity={night?.05:.32} color={night?'#7895bd':'#bed9e2'}/>
  <rectAreaLight position={[4.05,2.65,3.7]} rotation={[0,Math.PI/2,0]} width={4.8} height={4.1} intensity={night?0:5.2} color="#ffd5aa"/>
  <pointLight position={[4.2,2.7,3.8]} intensity={night?.18:.55} distance={8.5} decay={1.6} color="#ffd6aa"/>
  <pointLight position={[-2,3,4]} intensity={night?1.1:.22} distance={9} color="#ffd39c"/>
  <>
   <primitive object={pendantTarget} position={[-1.5,0,.4]}/>
   <spotLight ref={pendantShadow} position={[-1.5,4.60,.4]} target={pendantTarget} intensity={night?95:22} angle={.88} penumbra={.82} distance={10} color="#ffbf73"
    castShadow shadow-mapSize={[512,512]} shadow-normalBias={.015} shadow-bias={-.0002} shadow-radius={4}/>
   <pointLight position={[-1.5,4.93,.4]} intensity={night?2.2:.42} distance={3.5} color="#ffbe72"/>
   {/* Low-cost approximation of warm light reflected by the ceiling and walls. */}
   <pointLight position={[-1.5,3.3,1.3]} intensity={night?3.2:.12} distance={8} color="#e9a95f"/>
   <pointLight position={[1.5,2.6,3.0]} intensity={night?2.1:.08} distance={7} color="#e4ad70"/>
   <primitive object={livingLightTarget} position={[-4.2,0,4.35]}/>
   <spotLight ref={livingShadow} position={[-4.2,4.50,4.35]} target={livingLightTarget} intensity={night?90:21} angle={.88} penumbra={.82} distance={10} color="#ffbf73"
    castShadow shadow-mapSize={[512,512]} shadow-normalBias={.015} shadow-bias={-.0002} shadow-radius={4}/>
   <pointLight position={[-4.2,4.83,4.35]} intensity={night?2.1:.40} distance={3.5} color="#ffbe72"/>
   <pointLight position={[-3.2,2.6,4.6]} intensity={night?2.8:.10} distance={7} color="#e9a95f"/>
   <mesh position={[-4.2,4.83,4.35]}><sphereGeometry args={[.04,16,12]}/><meshStandardMaterial color="#ffe5b2" emissive="#ffd08c" emissiveIntensity={2}/></mesh>
   <mesh position={[-1.5,4.8,.4]}><sphereGeometry args={[.055,16,12]}/><meshStandardMaterial color="#ffe5b2" emissive="#ffd08c" emissiveIntensity={3}/></mesh>
   <primitive object={diningLightTarget} position={[1.25,0,4.0]}/>
   <spotLight position={[1.25,4.3,4.0]} target={diningLightTarget} intensity={night?105:24} angle={.86} penumbra={.80} distance={10} color="#ffc078"/>
   <pointLight position={[1.25,4.53,4.0]} intensity={night?2.4:.45} distance={3.5} color="#ffc078"/>
   <pointLight position={[1.25,3.3,4.0]} intensity={night?3.5:.12} distance={8} color="#e9a95f"/>
   <pointLight position={[-5.8,2.0,1.3]} intensity={night?2.0:.05} distance={5} color="#ffbd70"/>
   <pointLight position={[4.7,2.8,3.5]} intensity={night?3.0:.08} distance={8} color="#ffb767"/>
   <mesh position={[1.25,4.53,4.0]}><sphereGeometry args={[.055,16,12]}/><meshStandardMaterial color="#ffe5b2" emissive="#ffbd72" emissiveIntensity={3}/></mesh>
  </>
  <DaylightAccents night={night}/>
 </>
}
export default function Scene(props:Props){
 return <Canvas shadows="percentage" dpr={[1,1.5]} frameloop={props.active?'always':'never'} camera={{position:[-1.8,2.9,8.6],fov:72,near:.03,far:150}}
  gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMappingExposure=1.08}}>
  <GraphicsRecovery onLost={props.onGraphicsLost}/>
  <Lighting night={props.night} area={props.area}/>
  <Atmosphere night={props.night}/>
  <WindowLandscape/>
  <TropicalGarden/>
  <group>
  <Room computer={props.computer} inspect={props.inspect} onFocus={props.onFocus} playing={props.playing} reduced={props.reduced} recognitions={props.data.recognitions} night={props.night} photos={props.data.photos} photoFocused={props.focus==='art'} onPhoto={props.onPhoto} onPhotoError={props.onPhotoError} onPhotoSelection={props.onPhotoSelection} notes={props.data.notes??[]} onNoteCard={props.onNoteCard} onGarden={()=>props.onRegion(props.area==='indoor'?'outdoor':'indoor')}/>

  <Monitor {...props}/>
  <Suspense fallback={null}>
   <group position={dogBedPosition}><Atelier model="dogbed"/></group>
   <Dog paused={props.reduced||!!props.inspect||!props.active} onToggle={props.onDog}/>
  </Suspense>
  </group>
  <group>
   <Garden night={props.night} reduced={props.reduced||!!props.inspect} onPool={()=>props.onFocus('pool')} onBench={()=>props.onFocus('bench')}/>
   {items.filter(i=>i.id.startsWith('garden')||i.id==='wateringCan').map(item=><group key={item.id} position={item.position} scale={item.scale||1} visible={props.inspect!==item.id}
    onClick={e=>{if(e.delta<5){e.stopPropagation();props.onFocus(item.id)}}}
    onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}><ItemModel id={item.id}/></group>)}
  </group>
  <StageCamera computer={props.computer} reduced={props.reduced} blocked={!!props.inspect||!props.active} travel={props.travel} area={props.area} onMotion={props.onMotion}/>
  <RenderStats report={props.onStats}/>
  <SceneReady onReady={props.onReady}/>
 </Canvas>
}
function InspectionObject({id}:{id:InspectId}){
 const group=useRef<Group>(null)
 const {size}=useThree()
 const fit=Math.min(1,size.width/size.height/.95)
 const plant=id==='plant'||id==='gardenGreen'||id.startsWith('gardenPot'),hanging=id==='hanging'
 const scale=hanging?1.45:id==='mouse'?3:id==='phone'?3:id==='globe'?1.35:id==='catpuccino'?4:id==='narcissus'?1.65:plant?1.3:(id==='gardenFlowers'||id==='tablePlant')?1.8:id==='wateringCan'?2:id==='diningCup'?1.55:id==='diningMagazine'?2:2.4
 const y=hanging?.75:id==='narcissus'?-.65:plant?-.55:(id==='gardenFlowers'||id==='tablePlant')?-.4:(id==='cup'||id==='wateringCan')?-.3:0
 return <group ref={group} rotation={[0,-.4,0]} scale={scale*fit} position={[0,y,0]}><ItemModel id={id}/></group>
}
export function Inspection({id,active}:{id:InspectId;active:boolean}){
 return <Canvas dpr={[1,1.5]} frameloop={active?'always':'never'} camera={{position:[1.6,1.25,2.6],fov:37}} gl={{alpha:true,antialias:true}}>
  <ambientLight intensity={1.8}/><directionalLight position={[3,5,4]} intensity={3.0} color="#ffe7be"/>
  <directionalLight position={[-3,2,-2]} intensity={1.5} color="#b2c4b0"/>
  <InspectionObject id={id}/>
  <OrbitControls makeDefault target={[0,.2,0]} enablePan={false} minDistance={1.7} maxDistance={5} enableDamping dampingFactor={.08}/>
 </Canvas>
}

