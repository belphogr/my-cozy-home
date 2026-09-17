import { lazy,Suspense,useCallback,useEffect,useMemo,useRef,useState } from 'react'
import { loadHome } from './data/home'
import IntroSequence from './intro/IntroSequence'
import { useReducedMotionPreference } from './preferences'

const loadApp=()=>import('./App')
const App=lazy(loadApp)
let housePrefetch:Promise<unknown>|null=null
const prefetchHouse=()=>housePrefetch??=Promise.all([
 loadApp(),
 import('./scene/Scene'),
 fetch('/assets/environment/blender-daylight.hdr',{cache:'force-cache'}),
])

export default function Root(){
 const [mode,setMode]=useState<'intro'|'handoff'|'house'>('intro')
 const handoffFrames=useRef<number[]>([])
 const {reduced,setReduced}=useReducedMotionPreference()
 const homeData=useMemo(()=>loadHome(),[])
 const transition=useCallback(()=>{
  // Unmount the intro renderer first. Creating the house renderer inside the
  // same R3F frame can leave Chromium with a blank second WebGL context.
  setMode('handoff')
  const first=requestAnimationFrame(()=>{
   const second=requestAnimationFrame(()=>setMode('house'))
   handoffFrames.current.push(second)
  })
  handoffFrames.current.push(first)
 },[])
 useEffect(()=>()=>{for(const id of handoffFrames.current)cancelAnimationFrame(id)},[])
 return <>
  {mode==='intro'?<IntroSequence reduced={reduced} prefetchHouse={prefetchHouse} onTransition={transition}/>
   :mode==='handoff'?<div className="house-handoff" aria-hidden="true"/>
   :<Suspense fallback={null}><App preloadedData={homeData} reducedMotion={reduced} onReducedMotionChange={setReduced}/></Suspense>}
 </>
}
