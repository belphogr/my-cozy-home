import { useEffect, useMemo, useRef, useState } from 'react'

export interface MusicSlot {name:string;url:string;fileName:string}
const emptySlots=():MusicSlot[]=>Array.from({length:3},()=>({name:'',url:'',fileName:''}))
export function validateAudio(file:Pick<File,'size'|'type'|'name'>){
 if(file.size===0)return '文件为空'
 if(file.size>50*1024*1024)return '音频不能超过 50 MB'
 if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name))return '请选择音频文件'
 return ''
}
export const formatTime=(seconds:number)=>`${Math.floor(Math.max(0,seconds||0)/60)}:${String(Math.floor(Math.max(0,seconds||0)%60)).padStart(2,'0')}`
const titleFromFile=(name:string)=>name.replace(/\.[^.]+$/,'').slice(0,28)
export function useMusic(){
 const ref=useRef<HTMLAudioElement>(null),objectUrls=useRef<(string|null)[]>([null,null,null]),request=useRef(0)
 const [slots,setSlots]=useState<MusicSlot[]>(emptySlots),[activeSlot,setActiveSlot]=useState(0)
 const [playing,setPlaying]=useState(false),[pending,setPending]=useState(false)
 const [error,setError]=useState(''),[volume,setVolume]=useState(.35),[time,setTime]=useState(0),[duration,setDuration]=useState(0)
 const track=useMemo(()=>slots[activeSlot]??{name:'',url:'',fileName:''},[slots,activeSlot])
 const stop=()=>{request.current++;ref.current?.pause();setPlaying(false);setPending(false)}
 const resetProgress=()=>{setTime(0);setDuration(0)}
 const select=(index:number)=>{if(index===activeSlot)return;stop();setActiveSlot(index);resetProgress();setError('')}
 const toggle=async()=>{
  const audio=ref.current;if(!audio||pending||!track.url)return
  if(!audio.paused){stop();return}
  setError('');setPending(true);const id=++request.current
  try{await audio.play()}catch{if(request.current===id)setError('无法播放，请更换音频')}
  finally{if(request.current===id)setPending(false)}
 }
 const choose=(index:number,file:File)=>{
  const issue=validateAudio(file);if(issue){setError(issue);return}
  stop();if(objectUrls.current[index])URL.revokeObjectURL(objectUrls.current[index]!)
  const url=URL.createObjectURL(file);objectUrls.current[index]=url
  setSlots(current=>current.map((slot,i)=>i===index?{name:slot.name.trim()||titleFromFile(file.name),url,fileName:file.name}:slot))
  setActiveSlot(index);resetProgress();setError('')
 }
 const rename=(index:number,name:string)=>setSlots(current=>current.map((slot,i)=>i===index?{...slot,name:name.slice(0,28)}:slot))
 const seek=(value:number)=>{const audio=ref.current;if(audio&&Number.isFinite(audio.duration)){audio.currentTime=Math.max(0,Math.min(audio.duration,value));setTime(audio.currentTime)}}
 const changeVolume=(value:number)=>{const next=Math.max(0,Math.min(1,value));if(ref.current)ref.current.volume=next;setVolume(next)}
 useEffect(()=>{if(ref.current)ref.current.volume=.35;return()=>{request.current++;objectUrls.current.forEach(url=>{if(url)URL.revokeObjectURL(url)})}},[])
 return {ref,slots,activeSlot,track,playing,pending,error,volume,time,duration,toggle,stop,select,choose,rename,seek,changeVolume,
  events:{onPlay:()=>setPlaying(true),onPause:()=>setPlaying(false),onEnded:()=>setPlaying(false),
   onTimeUpdate:()=>setTime(ref.current?.currentTime??0),onLoadedMetadata:()=>setDuration(Number.isFinite(ref.current?.duration)?ref.current!.duration:0),
   onError:()=>{setPlaying(false);setPending(false);if(track.url)setError('无法读取这个音频')}}}
}
export type MusicController=ReturnType<typeof useMusic>
