import { useEffect, useState } from 'react'
import { Bookmark, ContactRound, ExternalLink, FolderOpen, Plus, Save, Trash2, X } from 'lucide-react'
import type { AppId, HomeData } from '../data/home'
import { loadFolderHandle, safeUrl, saveFolderHandle } from '../data/home'
import { useConfirm } from '../useConfirm'
import { text } from '../i18n'
import type { Language } from '../i18n'
interface Props{data:HomeData;save:(data:HomeData)=>Promise<void>;active:boolean;onDirty:(value:boolean)=>void;language:Language}
type DirectoryHandle=FileSystemDirectoryHandle&{entries:()=>AsyncIterableIterator<[string,FileSystemHandle]>;queryPermission?:(options:{mode:'read'})=>Promise<PermissionState>;requestPermission?:(options:{mode:'read'})=>Promise<PermissionState>}

export default function Desktop({data,save,active,onDirty,language}:Props){
 const t=(zh:string,en:string)=>text(language,zh,en)
 const apps=[
  {id:'profile' as const,label:t('关于我','About Me'),Icon:ContactRound},
  {id:'bookmarks' as const,label:t('收藏网站','Bookmarks'),Icon:Bookmark},
  {id:'folders' as const,label:t('文件夹','Folders'),Icon:FolderOpen},
 ]
 const {ask,dialog}=useConfirm(language)
 const [app,setApp]=useState<AppId|null>(null),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false)
 const [profile,setProfile]=useState(data.profile),[linkTitle,setLinkTitle]=useState(''),[linkUrl,setLinkUrl]=useState('')
 const [notice,setNotice]=useState(''),[formError,setFormError]=useState(''),[folderId,setFolderId]=useState<string|null>(null)
 useEffect(()=>onDirty(dirty),[dirty,onDirty])
 useEffect(()=>{if(!active){setApp(null);setDirty(false)}},[active])
 useEffect(()=>setProfile(data.profile),[data.profile])
 const leaveDraft=async()=>!dirty||await ask(t('放弃尚未保存的修改？','Discard unsaved changes?'))
 const open=async(next:AppId|null)=>{if(busy||!await leaveDraft())return;setApp(next);setDirty(false);setProfile(data.profile);setNotice('');setFormError('')}
 useEffect(()=>{if(!active)return;const escape=async(event:KeyboardEvent)=>{if(event.key==='Escape'&&app&&!document.querySelector('[data-confirm-open]')){event.stopImmediatePropagation();if(await leaveDraft()){setApp(null);setDirty(false)}}};window.addEventListener('keydown',escape,true);return()=>window.removeEventListener('keydown',escape,true)},[active,app,dirty])
 async function commit(next:HomeData){setBusy(true);setFormError('');try{await save(next);setDirty(false);setNotice(t('已保存','Saved'));return true}catch(error){setFormError(error instanceof Error?error.message:t('保存失败','Save failed'));return false}finally{setBusy(false)}}
 async function readDirectory(handle:DirectoryHandle){const entries:string[]=[];for await(const [name,entry] of handle.entries())entries.push(`${entry.kind==='directory'?'▸':'·'} ${name}`);return entries.sort((a,b)=>a.localeCompare(b,'zh-CN')).slice(0,160)}
 async function addFolder(){try{const picker=(window as Window&{showDirectoryPicker?:()=>Promise<FileSystemDirectoryHandle>}).showDirectoryPicker;if(!picker)throw new Error(t('当前浏览器不支持文件夹授权','This browser does not support folder access'));const handle=await picker() as DirectoryHandle;const entry={id:crypto.randomUUID(),name:handle.name,entries:await readDirectory(handle)};await saveFolderHandle(entry.id,handle);await commit({...data,folders:[entry,...data.folders]});setFolderId(entry.id)}catch(error){if((error as DOMException).name!=='AbortError')setFormError(error instanceof Error?error.message:t('无法读取文件夹','Unable to read this folder'))}}
 async function reopenFolder(id:string){try{const handle=await loadFolderHandle(id) as DirectoryHandle|undefined;if(!handle)throw new Error(t('请重新添加这个文件夹','Please add this folder again'));let permission=await handle.queryPermission?.({mode:'read'});if(permission!=='granted')permission=await handle.requestPermission?.({mode:'read'});if(permission!=='granted')throw new Error(t('未获得文件夹读取权限','Folder permission was not granted'));const entries=await readDirectory(handle);await commit({...data,folders:data.folders.map(item=>item.id===id?{...item,entries}:item)});setFolderId(id)}catch(error){setFormError(error instanceof Error?error.message:t('无法打开文件夹','Unable to open this folder'))}}
 const selectedFolder=data.folders.find(item=>item.id===folderId)
 return <div className={'computer-desktop '+(!active?'screen-inactive':'')} inert={!active} aria-hidden={!active}>
  <div className="desktop-wallpaper" aria-hidden="true"><div className="wallpaper-haze"/><div className="wallpaper-glass"/></div>
  <div className="desktop-menubar"><span>{t('我的电脑','My Computer')}</span></div>
  <div className="desktop-shortcuts">{apps.map(({id,label,Icon})=><button key={id} onClick={()=>open(id)} className="software-shortcut" aria-label={t('打开','Open ')+label}><span className={'app-icon '+id}><Icon strokeWidth={1.4}/></span><span>{label}</span></button>)}</div>
  {app&&<section className="software-window" aria-label={apps.find(item=>item.id===app)!.label}><header className="window-title"><span>{apps.find(item=>item.id===app)!.label}</span><button onClick={()=>open(null)} aria-label={t('关闭','Close')}><X/></button></header><div className="window-content">
   {app==='profile'&&<form className="profile-form profile-card" onSubmit={async event=>{event.preventDefault();await commit({...data,profile})}}><div className="profile-intro"><span className="profile-symbol"><ContactRound/></span><div><h2>{profile.name||t('关于我','About Me')}</h2><p>{profile.job||t('慢慢写下自己的样子','A quiet place for your story')}</p></div></div><div className="profile-grid"><label>{t('姓名','Name')}<input value={profile.name} maxLength={40} onChange={e=>{setProfile({...profile,name:e.target.value});setDirty(true)}}/></label><label>{t('年龄','Age')}<input value={profile.age} maxLength={12} onChange={e=>{setProfile({...profile,age:e.target.value});setDirty(true)}}/></label><label>{t('工作岗位','Position')}<input value={profile.job} maxLength={80} onChange={e=>{setProfile({...profile,job:e.target.value});setDirty(true)}}/></label><label>{t('兴趣爱好','Interests')}<input value={profile.interests} maxLength={300} onChange={e=>{setProfile({...profile,interests:e.target.value});setDirty(true)}}/></label></div><label>{t('个人经历','Experience')}<textarea value={profile.experience} maxLength={3000} onChange={e=>{setProfile({...profile,experience:e.target.value});setDirty(true)}}/></label><button className="primary icon-action" disabled={busy} aria-label={t('保存','Save')}><Save/></button></form>}
   {app==='bookmarks'&&<><form className="bookmark-form compact-form" onSubmit={async e=>{e.preventDefault();try{const url=safeUrl(linkUrl);if(await commit({...data,bookmarks:[...data.bookmarks,{id:crypto.randomUUID(),title:linkTitle.trim()||new URL(url).hostname,url}]})){setLinkTitle('');setLinkUrl('')}}catch(error){setFormError(language==='zh'&&error instanceof Error?error.message:t('链接格式不正确','Invalid website address'))}}}><input aria-label={t('网站名称','Website name')} placeholder={t('名称','Name')} value={linkTitle} onChange={e=>setLinkTitle(e.target.value)} maxLength={100}/><input aria-label={t('网站链接','Website address')} placeholder="https://" type="url" required value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}/><button className="primary icon-action" disabled={busy} aria-label={t('添加','Add')}><Plus/></button></form><div className="bookmark-list">{data.bookmarks.map(item=><div className="bookmark-row" key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer"><span className="link-letter">{item.title.slice(0,1)}</span><span><strong>{item.title}</strong><small>{new URL(item.url).hostname}</small></span><ExternalLink/></a><button aria-label={t('删除','Delete ')+item.title} onClick={()=>void commit({...data,bookmarks:data.bookmarks.filter(value=>value.id!==item.id)})}><Trash2/></button></div>)}</div></>}
   {app==='folders'&&<div className="folders-app"><button className="primary folder-add" onClick={()=>void addFolder()}><Plus/>{t('添加文件夹','Add folder')}</button><div className="folder-browser"><nav>{data.folders.map(item=><button key={item.id} className={folderId===item.id?'selected':''} onClick={()=>void reopenFolder(item.id)}><FolderOpen/><span>{item.name}</span></button>)}</nav><div className="folder-entries">{selectedFolder?.entries.map((entry,index)=><span key={index}>{entry}</span>)}</div></div></div>}
  </div>{(formError||notice)&&<footer className={'window-footer'+(formError?' form-error':'')} role={formError?'alert':'status'}>{formError||notice}</footer>}</section>}
  {dialog}
 </div>
}
