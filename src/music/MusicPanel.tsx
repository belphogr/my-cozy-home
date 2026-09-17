import { Disc3, Pause, Play, Upload, Volume2, X } from 'lucide-react'
import { formatTime } from './useMusic'
import type { MusicController } from './useMusic'
import { text, useLanguage } from '../i18n'

export function MusicPanel({music,onClose,moving}:{music:MusicController;onClose:()=>void;moving:boolean}){
 const {language}=useLanguage(),t=(zh:string,en:string)=>text(language,zh,en)
 return <section className="music-panel" role="region" aria-label={t('唱片机播放控制','Record player controls')}>
  <header><span><Disc3/>{t('唱片收藏','Record collection')}</span><button aria-label={t('关闭唱片机近景','Close record player')} onClick={onClose}><X/></button></header>
  <div className="record-slots">
   {music.slots.map((slot,index)=><article key={index} className={'record-slot '+(music.activeSlot===index?'selected ':'')+(music.playing&&music.activeSlot===index?'playing':'')}>
    <button className="record-disc" aria-label={slot.url?(music.playing&&music.activeSlot===index?t(`暂停第${index+1}槽`,`Pause slot ${index+1}`):t(`播放第${index+1}槽`,`Play slot ${index+1}`)):t(`第${index+1}槽为空`,`Slot ${index+1} is empty`)} disabled={!slot.url||moving||music.pending}
     onClick={()=>{if(music.activeSlot!==index)music.select(index);else void music.toggle()}}><Disc3/><span>{String(index+1).padStart(2,'0')}</span></button>
    <input aria-label={t(`第${index+1}槽名称`,`Slot ${index+1} name`)} value={slot.name} maxLength={28} placeholder={t(`唱片 ${index+1}`,`Record ${index+1}`)} onFocus={()=>music.select(index)} onChange={e=>music.rename(index,e.target.value)}/>
    <label className="record-upload" title={t(`上传第${index+1}槽音频`,`Upload audio to slot ${index+1}`)} aria-label={t(`上传第${index+1}槽音频`,`Upload audio to slot ${index+1}`)}><Upload/><input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm" onChange={e=>{const file=e.target.files?.[0];if(file)music.choose(index,file);e.target.value=''}}/></label>
   </article>)}
  </div>
  <div className="music-transport">
   <button className="music-play" disabled={!music.track.url||moving||music.pending} aria-label={music.playing?t('暂停音乐','Pause music'):t('播放音乐','Play music')} onClick={()=>void music.toggle()}>{music.playing?<Pause/>:<Play/>}</button>
   <div className="music-timeline"><input aria-label={t('音乐进度','Track progress')} type="range" min="0" max={music.duration||1} step=".1" value={music.time} disabled={!music.duration} onInput={e=>music.seek(Number(e.currentTarget.value))} onChange={e=>music.seek(Number(e.target.value))}/><small>{formatTime(music.time)} / {formatTime(music.duration)}</small></div>
   <Volume2 className="volume-icon"/><input className="music-volume" aria-label={t('音乐音量','Volume')} type="range" min="0" max="1" step=".05" value={music.volume} onInput={e=>music.changeVolume(Number(e.currentTarget.value))} onChange={e=>music.changeVolume(Number(e.target.value))}/>
  </div>
  {music.error&&<p className="music-error" role="alert">{language==='zh'?music.error:'This audio could not be played.'}</p>}
 </section>
}
