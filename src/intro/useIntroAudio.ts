import { useCallback,useEffect,useRef,useState } from 'react'

const AUDIO_KEY='cozy-home-intro-audio-v1'

export function useIntroAudio(active:boolean){
 const [enabled,setEnabled]=useState(()=>localStorage.getItem(AUDIO_KEY)==='true')
 const context=useRef<AudioContext|null>(null),master=useRef<GainNode|null>(null),lastBeat=useRef(-1)

 const ensure=useCallback(()=>{
  if(context.current)return context.current
  const audio=new AudioContext(),gain=audio.createGain();gain.gain.value=.0001;gain.connect(audio.destination)
  const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=540
  const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0)
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.22
  const wind=audio.createBufferSource();wind.buffer=buffer;wind.loop=true;wind.connect(filter);filter.connect(gain);wind.start()
  for(const [frequency,level] of [[98,.026],[147,.018],[196,.009]] as const){
   const osc=audio.createOscillator(),oscGain=audio.createGain();osc.type='sine';osc.frequency.value=frequency;oscGain.gain.value=level;osc.connect(oscGain);oscGain.connect(gain);osc.start()
  }
  context.current=audio;master.current=gain
  return audio
 },[])

 const fade=useCallback((value:number)=>{const audio=ensure(),gain=master.current!;void audio.resume();gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,value),audio.currentTime+.7)},[ensure])
 const toggle=useCallback(()=>setEnabled(value=>{const next=!value;localStorage.setItem(AUDIO_KEY,String(next));fade(next?.42:.0001);return next}),[fade])
 const transient=useCallback((frequency=150,duration=.13,level=.12)=>{
  if(!enabled)return
  const audio=ensure(),osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(frequency,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*.56,audio.currentTime+duration);gain.gain.setValueAtTime(level,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);osc.connect(gain);gain.connect(master.current!);osc.start();osc.stop(audio.currentTime+duration)
 },[enabled,ensure])
 const progress=useCallback((value:number)=>{
  const beat=Math.floor((value-.17)/.075)
  if(beat>=0&&beat<=5&&beat!==lastBeat.current){lastBeat.current=beat;transient(125+beat*13,.11,.075)}
 },[transient])
 useEffect(()=>{if(enabled)fade(.42)},[enabled,fade])
 useEffect(()=>{const audio=context.current;if(!audio)return;if(active)void audio.resume();else void audio.suspend()},[active])
 useEffect(()=>()=>{void context.current?.close()},[])
 return {enabled,toggle,progress,knock:()=>transient(92,.22,.18)}
}
