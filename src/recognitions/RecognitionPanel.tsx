import { useEffect, useMemo, useState } from 'react'
import { Award, Image as ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react'
import type { HomeData, Recognition, RecognitionAttachment, RecognitionMime } from '../data/home'
import { useConfirm } from '../useConfirm'
import { text, useLanguage } from '../i18n'

const MAX_FILE_BYTES=10*1024*1024
const allowed=new Set<RecognitionMime>(['image/jpeg','image/png','image/webp'])
type Mode='list'|'add'|'view'
interface Props{data:HomeData;save:(data:HomeData)=>Promise<void>;onClose:()=>void;onDirty:(value:boolean)=>void}
const blank=():Recognition=>({id:crypto.randomUUID(),kind:'award',title:'',issuer:'',year:'',description:''})
function readAttachment(file:File,language:'zh'|'en'):Promise<RecognitionAttachment>{return new Promise((resolve,reject)=>{const mime=file.type as RecognitionMime;if(!allowed.has(mime))return reject(new Error(text(language,'请选择 JPG、PNG 或 WebP 图片','Choose a JPG, PNG, or WebP image')));if(file.size>MAX_FILE_BYTES)return reject(new Error(text(language,'图片不能超过 10 MB','Images must be under 10 MB')));const reader=new FileReader();reader.onerror=()=>reject(new Error(text(language,'图片读取失败','The image could not be read')));reader.onload=()=>typeof reader.result==='string'?resolve({name:file.name.slice(0,180),mime,dataUrl:reader.result}):reject(new Error(text(language,'图片读取失败','The image could not be read')));reader.readAsDataURL(file)})}

export function RecognitionPanel({data,save,onClose,onDirty}:Props){
 const {language}=useLanguage(),t=(zh:string,en:string)=>text(language,zh,en)
 const {ask,dialog}=useConfirm(),awards=useMemo(()=>data.recognitions.filter(item=>item.kind==='award'),[data.recognitions])
 const [mode,setMode]=useState<Mode>('list'),[draft,setDraft]=useState<Recognition>(blank),[selectedId,setSelectedId]=useState<string|null>(null)
 const [dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const selected=awards.find(item=>item.id===selectedId)??null
 useEffect(()=>onDirty(dirty),[dirty,onDirty]);useEffect(()=>()=>onDirty(false),[onDirty])
 const close=async()=>{if(dirty&&!await ask(t('放弃尚未保存的奖项？','Discard this unsaved award?')))return;onClose()}
 const back=()=>{setMode('list');setDirty(false);setError('')}
 async function submit(event:React.FormEvent){event.preventDefault();if(!draft.title.trim()){setError(t('请填写奖项名称','Enter an award name'));return}const entry={...draft,title:draft.title.trim(),issuer:draft.issuer.trim()};setBusy(true);try{await save({...data,recognitions:[entry,...data.recognitions]});setDirty(false);setSelectedId(entry.id);setMode('view')}catch(reason){setError(reason instanceof Error?reason.message:t('保存失败','Save failed'))}finally{setBusy(false)}}
 async function remove(item:Recognition){if(!await ask(t(`删除《${item.title}》？`,`Delete “${item.title}”?`)))return;await save({...data,recognitions:data.recognitions.filter(value=>value.id!==item.id)});back()}
 useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key!=='Escape'||document.querySelector('[data-confirm-open]'))return;event.stopImmediatePropagation();if(mode==='list')void close();else back()};window.addEventListener('keydown',escape,true);return()=>window.removeEventListener('keydown',escape,true)})
 return <div className="recognition-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)void close()}}><section className="recognition-panel" role="dialog" aria-modal="true" aria-label={t('奖项','Awards')}>
  <header className="recognition-header"><div><h2>{t('奖项','Awards')}</h2></div><button aria-label={t('关闭','Close')} onClick={()=>void close()}><X/></button></header>
  {mode==='list'&&<div className="recognition-home"><div className="recognition-actions"><button className="primary" onClick={()=>{setDraft(blank());setMode('add')}}><Plus/><span>{t('添加奖项','Add award')}</span></button></div>{awards.length?<div className="recognition-grid">{awards.map(item=><button key={item.id} className="recognition-card award-frame" onClick={()=>{setSelectedId(item.id);setMode('view')}}><span className="recognition-card-icon award"><Award/></span><span><small>{item.year}</small><strong>{item.title}</strong><em>{item.issuer}</em></span>{item.attachment&&<img src={item.attachment.dataUrl} alt=""/>}</button>)}</div>:<div className="recognition-empty"><Award/></div>}</div>}
  {mode==='add'&&<form className="recognition-form" onSubmit={submit}><button type="button" className="text-button" aria-label={t('返回','Back')} onClick={back}>←</button><div className="recognition-fields"><label>{t('奖项名称','Award name')}<input required autoFocus maxLength={120} value={draft.title} onChange={e=>{setDraft({...draft,title:e.target.value});setDirty(true)}}/></label><label>{t('年份','Year')}<input inputMode="numeric" maxLength={4} value={draft.year} onChange={e=>{setDraft({...draft,year:e.target.value.replace(/\D/g,'').slice(0,4)});setDirty(true)}}/></label></div><label>{t('颁发机构','Issuer')}<input maxLength={120} value={draft.issuer} onChange={e=>{setDraft({...draft,issuer:e.target.value});setDirty(true)}}/></label><label className="recognition-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{setDraft({...draft,attachment:await readAttachment(file,language)});setDirty(true)}catch(reason){setError(reason instanceof Error?reason.message:t('图片读取失败','The image could not be read'))}}}/><Upload/><span>{draft.attachment?t('更换图片','Replace image'):t('添加图片','Add image')}</span></label>{draft.attachment&&<div className="recognition-file"><span><ImageIcon/>{draft.attachment.name}</span></div>}<div className="recognition-form-footer"><button className="primary" disabled={busy}>{t('保存','Save')}</button></div></form>}
  {mode==='view'&&selected&&<div className="recognition-detail"><button className="text-button" onClick={back}>←</button><article className="recognition-sheet award"><span className="recognition-sheet-icon"><Award/></span><small>{selected.year}</small><h3>{selected.title}</h3>{selected.issuer&&<h4>{selected.issuer}</h4>}{selected.attachment&&<img src={selected.attachment.dataUrl} alt=""/>}</article><div className="recognition-detail-actions"><button className="secondary danger" onClick={()=>void remove(selected)}><Trash2/></button></div></div>}
  {error&&<footer className="recognition-status error" role="alert">{error}</footer>}
 </section>{dialog}</div>
}
