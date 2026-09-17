import { useCallback,useEffect,useState } from 'react'

const MOTION_KEY='cozy-home-reduced-motion-v1'

function initialReducedMotion(){
 const saved=localStorage.getItem(MOTION_KEY)
 return saved===null?matchMedia('(prefers-reduced-motion: reduce)').matches:saved==='true'
}

export function useReducedMotionPreference(){
 const [reduced,setValue]=useState(initialReducedMotion)
 const setReduced=useCallback((value:boolean)=>{localStorage.setItem(MOTION_KEY,String(value));setValue(value)},[])
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)')
  const changed=(event:MediaQueryListEvent)=>{if(localStorage.getItem(MOTION_KEY)===null)setValue(event.matches)}
  media.addEventListener('change',changed)
  return()=>media.removeEventListener('change',changed)
 },[])
 return {reduced,setReduced}
}
