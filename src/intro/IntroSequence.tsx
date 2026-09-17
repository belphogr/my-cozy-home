import { Component,Suspense,useCallback,useEffect,useReducer,useState,type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { SkipForward,Volume2,VolumeX } from 'lucide-react'
import { AgXToneMapping,SRGBColorSpace } from 'three'
import ValleyWorld from './ValleyWorld'
import { initialIntroState,introReducer } from './introState'
import { useIntroAudio } from './useIntroAudio'
import './intro.css'

interface Props{
 reduced:boolean
 prefetchHouse:()=>Promise<unknown>
 onTransition:()=>void
}

class IntroBoundary extends Component<{children:ReactNode;onFallback:()=>void},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:Error){console.error('Valley intro could not load',error)}
 render(){return this.state.failed?<button className="intro-fallback" aria-label="Enter the home" onClick={this.props.onFallback}/>:this.props.children}
}

export default function IntroSequence({reduced,prefetchHouse,onTransition}:Props){
 const [state,dispatch]=useReducer(introReducer,reduced,initialIntroState)
 const [active,setActive]=useState(!document.hidden)
 const audio=useIntroAudio(active)
 useEffect(()=>{void prefetchHouse()},[prefetchHouse])
 useEffect(()=>{const changed=()=>setActive(!document.hidden);document.addEventListener('visibilitychange',changed);return()=>document.removeEventListener('visibilitychange',changed)},[])
 const finish=useCallback(()=>dispatch({type:'COMPLETE'}),[])
 const skip=useCallback(()=>dispatch({type:'SKIP'}),[])
 const door=useCallback(()=>{if(state.phase!=='doorstep')return;audio.knock();dispatch({type:'KNOCK'})},[state.phase,audio])
 const portal=useCallback(()=>{dispatch({type:'PORTAL'});onTransition()},[onTransition])
 const fallback=useCallback(()=>{dispatch({type:'PORTAL'});onTransition()},[onTransition])
 return <section className={`valley-intro phase-${state.phase}`} aria-label="3D Bali island prologue">
  <IntroBoundary onFallback={fallback}>
   <Canvas shadows dpr={[1,1.5]} frameloop={active?'always':'never'} camera={{position:[64,54,72],fov:65,near:.08,far:260}}
    gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{
     // Blender review renders use AgX. Lock the browser to the same display
     // transform instead of relying on renderer defaults that vary by version.
     gl.toneMapping=AgXToneMapping
     gl.outputColorSpace=SRGBColorSpace
     gl.toneMappingExposure=1.12
    }}>
    <Suspense fallback={null}><ValleyWorld phase={state.phase} reduced={reduced} active={active} onComplete={finish} onPortal={portal} onDoor={door} onProgress={audio.progress}/></Suspense>
   </Canvas>
  </IntroBoundary>
  <nav className="intro-controls" aria-label="Prologue controls">
   {state.phase==='building'&&<button aria-label="Skip to the door" title="Skip" onClick={skip}><SkipForward/></button>}
   <button aria-label={audio.enabled?'Mute prologue':'Enable prologue audio'} title={audio.enabled?'Mute':'Sound'} onClick={audio.toggle}>{audio.enabled?<Volume2/>:<VolumeX/>}</button>
  </nav>
  {state.phase==='doorstep'&&<button className="intro-door-cue" aria-label="Open the door" onClick={door}><i/></button>}
 </section>
}
