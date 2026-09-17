import { Component, Suspense, lazy, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Moon, Sun, X, RotateCcw, House, Settings2, BookOpen, Sprout, Pause, Trash2 } from 'lucide-react'
import { focusArea, isSmallItem } from './scene/navigation'
import type { FocusId, Travel } from './scene/navigation'
import type { Area } from './scene/layout'
import { freshHome, inspectNames, loadHome, saveHome } from './data/home'
import type { HomeData, InspectId } from './data/home'
import { useConfirm } from './useConfirm'
import { useMusic } from './music/useMusic'
import { MusicPanel } from './music/MusicPanel'
import { RecognitionPanel } from './recognitions/RecognitionPanel'
import { BooksPanel, NotesPanel } from './features/PersonalPanels'
import { objectName, text, useLanguage } from './i18n'
const Scene=lazy(()=>import('./scene/Scene'))
const Inspection=lazy(()=>import('./scene/Scene').then(m=>({default:m.Inspection})))
class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:Error){console.error('3D 场景未能加载',error)}
 render(){return this.state.failed?this.props.fallback:this.props.children}
}
interface AppProps{preloadedData?:Promise<HomeData>;onSceneReady?:()=>void;reducedMotion?:boolean;onReducedMotionChange?:(value:boolean)=>void}
export default function App({preloadedData,onSceneReady,reducedMotion,onReducedMotionChange}:AppProps){
 const {language,toggle}=useLanguage(),t=(zh:string,en:string)=>text(language,zh,en)
 const {ask,dialog}=useConfirm()
 const music=useMusic()
 const [data,setData]=useState<HomeData>(freshHome)
 const [loaded,setLoaded]=useState(false),[computer,setComputer]=useState(false)
 const [inspect,setInspect]=useState<InspectId|null>(null)
 const [night,setNight]=useState(false),[settings,setSettings]=useState(false)
 const [recognitionsOpen,setRecognitionsOpen]=useState(false),[musicOpen,setMusicOpen]=useState(false)
 const [notesOpen,setNotesOpen]=useState(false),[booksOpen,setBooksOpen]=useState(false)
 const [noteSlot,setNoteSlot]=useState(0)
 const [localReduced,setLocalReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)
 const reduced=reducedMotion??localReduced,setReduced=onReducedMotionChange??setLocalReduced
 const [active,setActive]=useState(!document.hidden),[dirty,setDirty]=useState(false)
 const [error,setError]=useState(''),[hint,setHint]=useState('')
 const [readFailed,setReadFailed]=useState(false)
 const [stats,setStats]=useState('…'),[moving,setMoving]=useState(false)
 const [area,setArea]=useState<Area>('indoor'),[focus,setFocus]=useState<FocusId|null>(null)
 const [photoSelection,setPhotoSelection]=useState<number|null>(null)
 const [sceneVersion,setSceneVersion]=useState(0)
 const [travel,setTravel]=useState<Travel>({serial:0,kind:'region'})
 const region=useCallback((next:Area)=>{setArea(next);setFocus(null);setMusicOpen(false);setHint('');setTravel(v=>({serial:v.serial+1,kind:'region'}))},[])
 const resetView=useCallback(()=>{setFocus(null);setMusicOpen(false);setTravel(v=>({serial:v.serial+1,kind:'reset'}))},[])
 const returnView=useCallback(()=>{setFocus(null);setMusicOpen(false);setTravel(v=>({serial:v.serial+1,kind:'restore'}))},[])
 const approach=useCallback((id:FocusId)=>{if(computer)return;setArea(focusArea(id));setFocus(id);setHint('');setTravel(v=>({serial:v.serial+1,kind:'focus',id}))},[computer])
 useEffect(()=>{(preloadedData??loadHome()).then(setData).catch(()=>{setReadFailed(true);setError(t('暂时无法读取本地数据，已暂停写入以保护存档。请不要清理浏览器数据，可稍后重试。','Local data could not be read. Saving is paused to protect it; please try again later.'))}).finally(()=>setLoaded(true))},[preloadedData])
 useEffect(()=>{const fn=()=>setActive(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[])
 useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(''),4000);return()=>clearTimeout(t)},[hint])
 useEffect(()=>{if(!dirty)return;const fn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',fn);return()=>window.removeEventListener('beforeunload',fn)},[dirty])
 const save=useCallback(async(next:HomeData)=>{if(readFailed)throw new Error(t('读取存档失败，已阻止覆盖。请保留当前编辑内容并稍后重试。','The archive could not be read, so overwriting was blocked. Please keep your edits and try again later.'));await saveHome(next);setData(next)},[readFailed,language])
 const enter=useCallback(()=>{setInspect(null);setComputer(true);setHint('')},[])
 const leave=useCallback(async()=>{if(dirty&&!await ask(t('离开电脑会放弃这次尚未保存的编辑。','Leaving the computer will discard unsaved edits.')))return;setComputer(false);setDirty(false)},[dirty,ask,language])
 const pick=useCallback((id:InspectId)=>{setInspect(id);document.body.style.cursor='auto';setHint('')},[])
 const sceneFocus=useCallback((id:FocusId)=>{
  if(computer)return
  if(focus!==id){setMusicOpen(false);approach(id);return}
  if(moving)return
  if(id==='tallShelf'){setBooksOpen(true);return}
  if(isSmallItem(id)){pick(id);return}
  if(id==='desk'){enter();return}
  if(id==='recognitionWall'){setRecognitionsOpen(true);return}
  if(id==='recordPlayer')setMusicOpen(true)
 },[computer,focus,moving,approach,pick,enter])
 const openNoteCard=useCallback((slot:number)=>{if(computer||moving)return;if(focus!=='hanging'){approach('hanging');return}setNoteSlot(slot);setNotesOpen(true)},[computer,moving,focus,approach])
 useEffect(()=>{
  const fn=(e:KeyboardEvent)=>{if(e.key!=='Escape'||document.querySelector('[data-confirm-open]')||recognitionsOpen)return;if(notesOpen)setNotesOpen(false);else if(booksOpen)setBooksOpen(false);else if(settings)setSettings(false);else if(inspect)setInspect(null);else if(computer)void leave();else if(musicOpen)setMusicOpen(false);else if(focus)returnView()}
  window.addEventListener('keydown',fn)
  return()=>window.removeEventListener('keydown',fn)
 },[settings,inspect,computer,leave,focus,returnView,recognitionsOpen,musicOpen,notesOpen,booksOpen])
 const fallback=<div className="fallback"><BookOpen/><h2>{t('小屋暂时无法呈现 3D','The 3D room is temporarily unavailable')}</h2></div>
 const contextReturn=useCallback((event:React.MouseEvent)=>{
  if(settings||recognitionsOpen||notesOpen||booksOpen)return
  if(computer){event.preventDefault();void leave();return}
  if(inspect){event.preventDefault();setInspect(null);return}
  if(focus){event.preventDefault();returnView()}
 },[computer,leave,settings,recognitionsOpen,notesOpen,booksOpen,inspect,focus,returnView])
 return <main className={inspect?'home inspecting':'home'} onContextMenu={contextReturn}>
  <audio ref={music.ref} src={music.track.url||undefined} loop preload="metadata" {...music.events} aria-label={t('小屋音乐播放器','Home music player')}/>
  <div className="scene-layer">
   {loaded?<SceneBoundary fallback={fallback}><Suspense fallback={<div className="loading"><span/>{t('正在为小屋点亮灯光…','Lighting the room…')}</div>}>
    <Scene key={sceneVersion} data={data} save={save} computer={computer} onComputer={()=>{setArea('indoor');enter()}} inspect={inspect} onFocus={sceneFocus} focus={focus}
     travel={travel} onStats={setStats} area={area} onRegion={region} playing={music.playing} onMotion={setMoving}
     night={night} reduced={reduced} active={active&&!inspect&&!settings&&!recognitionsOpen&&!notesOpen&&!booksOpen} onDirty={setDirty} onRecognition={()=>setRecognitionsOpen(true)}
     onPhoto={(index,value)=>void save({...data,photos:data.photos.map((photo,i)=>i===index?value:photo)}).then(()=>{if(value===null)setPhotoSelection(null)}).catch(()=>setError(t('照片保存失败，请换一张较小的照片','The photo could not be saved. Please choose a smaller image.')))}
     onPhotoError={setError}
     onPhotoSelection={setPhotoSelection}
     language={language}
     onGraphicsLost={()=>{setHint(t('正在恢复 3D 画面…','Restoring the 3D scene…'));setSceneVersion(value=>value+1)}}
     onNoteCard={openNoteCard}
     onReady={onSceneReady}
     onDog={wandering=>setHint(wandering?t('小柴犬出去转转了。','The little Shiba went for a stroll.'):t('小柴犬回窝休息了。','The little Shiba returned to its bed.'))}/>
   </Suspense></SceneBoundary>:<div className="loading"><span/>{t('正在打开小屋…','Opening the room…')}</div>}
  </div>
  <header className="home-header"><h1>{t('我的小屋','My Little Home')}</h1>{!computer&&!inspect&&<nav aria-label={t('小屋设置','Home controls')}>
   <button onClick={()=>setNight(v=>!v)} aria-label={night?t('切换白天','Switch to day'):t('切换夜晚','Switch to night')} title={night?t('切换白天','Switch to day'):t('切换夜晚','Switch to night')}>{night?<Moon/>:<Sun/>}</button>
   {music.playing&&<button aria-label={t('暂停音乐','Pause music')} title={t('暂停音乐','Pause music')} onClick={music.stop}><Pause/></button>}
   <button aria-label={t('复位视角','Reset view')} title={t('复位视角','Reset view')} onClick={resetView}><RotateCcw/></button>
   <button aria-label={t('设置','Settings')} title={t('设置','Settings')} onClick={()=>setSettings(true)}><Settings2/></button>
   <button className="language-toggle" aria-label={t('切换到英文','Switch to Chinese')} title={t('切换到英文','Switch to Chinese')} onClick={toggle}>{language==='zh'?'中':'EN'}</button>
  </nav>}</header>
  {!computer&&!inspect&&<>
   {focus==='recordPlayer'&&musicOpen&&<MusicPanel music={music} onClose={returnView} moving={moving}/>} 
   <nav className="scene-navigation" aria-label={t('小屋地点','Home areas')}>
    <button aria-label={t('进入室内','Go indoors')} title={t('室内','Indoors')} aria-pressed={area==='indoor'} onClick={()=>region('indoor')}><House/></button>
    <button aria-label={t('进入室外','Go outdoors')} title={t('室外','Outdoors')} aria-pressed={area==='outdoor'} onClick={()=>region('outdoor')}><Sprout/></button>
   </nav>
   {focus==='art'&&photoSelection!==null&&data.photos[photoSelection]&&<div className="photo-actions"><button aria-label={t('恢复默认图案','Restore default artwork')} title={t('恢复默认图案','Restore default artwork')} onClick={()=>void save({...data,photos:data.photos.map((photo,index)=>index===photoSelection?null:photo)}).then(()=>setPhotoSelection(null)).catch(()=>setError(t('照片删除失败，请稍后重试','The photo could not be removed. Please try again.')))}><Trash2/></button></div>}
  </>}
  {inspect&&<section className="inspection-layer" role="dialog" aria-modal="true" aria-label={t('查看','View ')+objectName(language,inspect,inspectNames[inspect])}>
   <div className="inspection-title"><h2>{objectName(language,inspect,inspectNames[inspect])}</h2><p>{t('右键放回','Right-click to return')}</p></div>
   <Suspense fallback={null}><Inspection id={inspect} active={active}/></Suspense>
  </section>}
  {recognitionsOpen&&<RecognitionPanel data={data} save={save} onDirty={setDirty} onClose={()=>{setDirty(false);setRecognitionsOpen(false)}}/>}
  {notesOpen&&<NotesPanel data={data} save={save} initialSlot={noteSlot} onClose={()=>setNotesOpen(false)}/>} 
  {booksOpen&&<BooksPanel data={data} save={save} onClose={()=>setBooksOpen(false)}/>} 
  {settings&&<div className="modal-backdrop"><section className="settings-panel" role="dialog" aria-modal="true" aria-label={t('小屋设置','Home settings')}>
   <header><h2>{t('让小屋适合你','Make the room yours')}</h2><button aria-label={t('关闭设置','Close settings')} onClick={()=>setSettings(false)}><X/></button></header>
   <label className="switch-row"><span><strong>{t('减少动态','Reduce motion')}</strong><small>{t('停用水波与小狗活动，镜头直接切换。','Pause water and pet motion; camera changes become instant.')}</small></span><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label>
   <p>{t('左右拖动环顾。首次点击物品靠近，再次点击查看或操作；查看时右键放回。室内与室外按钮只切换镜头。','Drag left or right to look around. Click once to approach an object and again to view or use it. Right-click to return.')}</p>
   <small className="render-stats">{t('最近一次渲染采样：','Latest render sample: ')}{stats}</small>
   <p>{t('资料保存在当前浏览器，未加密、未云同步，请勿存放唯一副本。','Data stays in this browser. It is not encrypted or synced, so keep another copy.')}</p>
  </section></div>}
  {error&&<div className="error-toast" role="alert"><span>{error}</span><button aria-label={t('关闭提示','Dismiss message')} onClick={()=>setError('')}><X size={18}/></button></div>}
  {hint&&<div className="hint-toast" role="status">{hint}</div>}
  {dialog}
 </main>
}
