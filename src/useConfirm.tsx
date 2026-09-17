import { useCallback, useEffect, useRef, useState } from 'react'
import { text, useLanguage } from './i18n'
import type { Language } from './i18n'

/** An in-page confirmation works in embedded browsers and never discards by default. */
export function useConfirm(languageOverride?:Language){
 const context=useLanguage(),language=languageOverride??context.language,t=(zh:string,en:string)=>text(language,zh,en)
 const [message,setMessage]=useState('')
 const resolve=useRef<((value:boolean)=>void)|null>(null)
 const previousFocus=useRef<HTMLElement|null>(null)
 const finish=useCallback((value:boolean)=>{
  resolve.current?.(value);resolve.current=null;setMessage('')
  previousFocus.current?.focus({preventScroll:true})
 },[])
 const ask=useCallback((text:string)=>{
  if(resolve.current)return Promise.resolve(false)
  previousFocus.current=document.activeElement as HTMLElement
  setMessage(text)
  return new Promise<boolean>(done=>{resolve.current=done})
 },[])
 useEffect(()=>()=>{resolve.current?.(false)},[])
 useEffect(()=>{
  if(!message)return
  const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(false)}}
  window.addEventListener('keydown',close,true)
  return()=>window.removeEventListener('keydown',close,true)
 },[message,finish])
 const dialog=message?<div className="confirm-layer" data-confirm-open><section role="alertdialog" aria-modal="true" aria-label={t('未保存的内容','Unsaved changes')} onKeyDown={e=>{
  if(e.key!=='Tab')return
  const buttons=e.currentTarget.querySelectorAll('button'),first=buttons[0],last=buttons[buttons.length-1]
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus({preventScroll:true})}
  if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus({preventScroll:true})}
 }}><h2>{t('还有一点没保存','Changes not saved')}</h2><p>{message}</p><div><button className="secondary" autoFocus onClick={()=>finish(false)}>{t('继续编辑','Keep editing')}</button><button className="primary" onClick={()=>finish(true)}>{t('放弃并继续','Discard')}</button></div></section></div>:null
 return {ask,dialog}
}
