import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import type { Area } from './layout'
import { cameraRoute, clampOrbit, computerPose, focusPose, overviewPose } from './navigation'
import type { Point, Travel } from './navigation'
import { text, useLanguage } from '../i18n'

export default function StageCamera({area,travel,computer,blocked,reduced,onMotion}:{area:Area;travel:Travel;computer:boolean;blocked:boolean;reduced:boolean;onMotion:(moving:boolean)=>void}){
 const {language}=useLanguage()
 const {camera,gl,size,events}=useThree()
 const angles=useRef<Record<Area,number>>({indoor:0,outdoor:0})
 const initial=overviewPose(area,size.width/size.height)
 const state=useRef({goal:initial,target:new Vector3(...initial.target),position:new Vector3(...initial.position),route:[] as Vector3[],moving:false,initialized:false})
 const live=useRef({blocked,computer,reduced,onMotion,area,travel,aspect:size.width/size.height})
 live.current={blocked,computer,reduced,onMotion,area,travel,aspect:size.width/size.height}
 useEffect(()=>{
  const s=state.current
  if(travel.kind==='reset')angles.current[area]=0
  const goal=computer?computerPose(size.width/size.height):travel.kind==='focus'?focusPose(travel.id,size.width/size.height):overviewPose(area,size.width/size.height,angles.current[area])
  s.goal=goal;s.position.set(...goal.position)
  s.route=s.initialized?cameraRoute(camera.position.toArray() as Point,goal.position).slice(0,-1).map(p=>new Vector3(...p)):[]
  if(!s.initialized){camera.position.set(...goal.position);s.target.set(...goal.target);s.initialized=true}
  s.moving=true;onMotion(true)
 },[area,travel,computer,size.width,size.height,camera,onMotion])
 useEffect(()=>{
  const surface=events.connected instanceof HTMLElement?events.connected:gl.domElement
  surface.tabIndex=0;surface.setAttribute('aria-label',text(language,'屋内与庭院：左右拖动环顾，点击物品靠近','Home and garden: drag to look around, click objects to approach'))
  let pointer:number|null=null,lastX=0
  const allowed=()=>!live.current.blocked&&!live.current.computer&&live.current.travel.kind!=='focus'&&!state.current.moving
  const orbit=(delta:number)=>{
   const l=live.current;angles.current[l.area]=clampOrbit(angles.current[l.area]+delta)
   const goal=overviewPose(l.area,l.aspect,angles.current[l.area]);state.current.goal=goal;state.current.position.set(...goal.position)
  }
  const down=(e:PointerEvent)=>{if(e.button!==0||!allowed())return;pointer=e.pointerId;lastX=e.clientX}
  const move=(e:PointerEvent)=>{if(pointer!==e.pointerId)return;if(!allowed()){pointer=null;return}orbit(-(e.clientX-lastX)*.0018);lastX=e.clientX}
  const up=()=>{pointer=null}
  const key=(e:KeyboardEvent)=>{if(!allowed()||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();orbit(e.key==='ArrowLeft'?.04:-.04)}
  surface.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);surface.addEventListener('keydown',key)
  return()=>{surface.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);surface.removeEventListener('keydown',key)}
 },[events.connected,gl,language])
 const target=useRef(new Vector3())
 useFrame((_,dt)=>{
  if(live.current.blocked)return
  const s=state.current,goal=s.goal,alpha=live.current.reduced?1:1-Math.exp(-Math.min(dt,.05)*6)
  target.current.set(...goal.target)
  if(live.current.reduced)s.route=[]
  if(s.route.length){const waypoint=s.route[0],distance=camera.position.distanceTo(waypoint);camera.position.lerp(waypoint,Math.min(1,Math.min(dt,.05)*9/Math.max(.001,distance)));if(distance<.05)s.route.shift()}
  else camera.position.lerp(s.position,alpha)
  s.target.lerp(target.current,alpha);camera.lookAt(s.target)
  if(camera instanceof PerspectiveCamera&&Math.abs(camera.fov-goal.fov)>.001){camera.fov+=(goal.fov-camera.fov)*alpha;camera.updateProjectionMatrix()}
  if(s.moving&&camera.position.distanceToSquared(s.position)<.0001&&s.target.distanceToSquared(target.current)<.0001&&(!(camera instanceof PerspectiveCamera)||Math.abs(camera.fov-goal.fov)<.02)){
   s.moving=false;live.current.onMotion(false)
  }
 })
 return null
}
