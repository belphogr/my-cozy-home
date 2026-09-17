import { BookOpen, Plus, Tag, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { HomeData, StickyNote } from '../data/home'
import { normalizeKeyword, noteEmojis } from '../data/home'
import { text, useLanguage } from '../i18n'

interface Props{data:HomeData;save:(data:HomeData)=>Promise<void>;onClose:()=>void}
function limitKeyword(input:string){
 const value=input.replace(/\s+/g,' ')
 if(/[\u3400-\u9fff]/.test(value))return Array.from(value.replace(/\s/g,'')).slice(0,4).join('')
 const words=value.trim().split(' ').filter(Boolean).slice(0,2)
 return words.join(' ')+(value.endsWith(' ')&&words.length<2?' ':'')
}
function currentNote(note:StickyNote){
 const legacy=note as StickyNote&{body?:string;mood?:string;slot?:number}
 const moodEmoji:Record<string,string>={calm:'☕',happy:'😊',tired:'🌿',hopeful:'✨'}
 return {id:note.id,slot:legacy.slot??0,keyword:normalizeKeyword(note.keyword??legacy.body??'便签'),emoji:note.emoji??moodEmoji[legacy.mood??'']??'🌿'}
}

export function NotesPanel({data,save,onClose,initialSlot=0}:Props&{initialSlot?:number}){
 const {language}=useLanguage(),t=(zh:string,en:string)=>text(language,zh,en)
 const notes=data.notes.map(currentNote),first=notes.find(note=>note.slot===initialSlot)
 const [slot,setSlot]=useState(initialSlot),[keyword,setKeyword]=useState(first?.keyword??''),[emoji,setEmoji]=useState<string>(first?.emoji??noteEmojis[0])
 const select=(next:number)=>{const note=notes.find(item=>item.slot===next);setSlot(next);setKeyword(note?.keyword??'');setEmoji(note?.emoji??noteEmojis[0])}
 const saveTag=async()=>{const value=normalizeKeyword(keyword);if(!value)return;const old=notes.find(note=>note.slot===slot);const entry={id:old?.id??crypto.randomUUID(),slot,keyword:value,emoji};await save({...data,notes:[...notes.filter(note=>note.slot!==slot),entry].sort((a,b)=>a.slot-b.slot)})}
 return <div className="personal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="personal-panel notes-panel" role="dialog" aria-modal="true" aria-label={t('关键词标签','Keyword tags')}><header><Tag/><button aria-label={t('关闭','Close')} onClick={onClose}><X/></button></header><div className="fixed-tag-grid">{Array.from({length:4},(_,index)=>{const note=notes.find(item=>item.slot===index);return <button key={index} className={'fixed-tag paper-'+index+(slot===index?' selected':'')} onClick={()=>select(index)} aria-label={t(`编辑第${index+1}张标签`,`Edit tag ${index+1}`)}><span className="paper-tape"/><span>{note?.emoji??'＋'}</span><strong>{note?.keyword??t(`标签 ${index+1}`,`Tag ${index+1}`)}</strong></button>})}</div><form className="tag-form" onSubmit={async e=>{e.preventDefault();await saveTag()}}><input autoFocus required aria-label={t('关键词','Keyword')} placeholder={t('关键词','Keyword')} value={keyword} maxLength={24} onChange={e=>setKeyword(limitKeyword(e.target.value))}/><div className="emoji-picker">{noteEmojis.map(item=><button type="button" key={item} className={emoji===item?'selected':''} aria-label={t('选择','Choose ')+item} onClick={()=>setEmoji(item)}>{item}</button>)}</div><button className="primary icon-action" aria-label={t('保存标签','Save tag')}><Plus/></button>{notes.some(note=>note.slot===slot)&&<button type="button" className="tag-clear" aria-label={t('清空标签','Clear tag')} onClick={()=>void save({...data,notes:notes.filter(note=>note.slot!==slot)})}><Trash2/></button>}</form></section></div>
}

export function BooksPanel({data,save,onClose}:Props){
 const {language}=useLanguage(),t=(zh:string,en:string)=>text(language,zh,en)
 const [title,setTitle]=useState(''),[author,setAuthor]=useState('')
 return <div className="personal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="personal-panel books-panel" role="dialog" aria-modal="true" aria-label={t('书柜','Bookcase')}><header><BookOpen/><button aria-label={t('关闭','Close')} onClick={onClose}><X/></button></header><form onSubmit={async e=>{e.preventDefault();if(!title.trim())return;await save({...data,books:[...data.books,{id:crypto.randomUUID(),title:title.trim(),author:author.trim()}]});setTitle('');setAuthor('')}}><input autoFocus required aria-label={t('书名','Book title')} placeholder={t('书名','Book title')} maxLength={80} value={title} onChange={e=>setTitle(e.target.value)}/><input aria-label={t('作者','Author')} placeholder={t('作者','Author')} maxLength={80} value={author} onChange={e=>setAuthor(e.target.value)}/><button className="primary icon-action" aria-label={t('添加','Add')}><Plus/></button></form><div className="bookcase"><div className="bookcase-crown"><span>MY LIBRARY</span></div><div className="bookcase-interior">{data.books.map((book,index)=><article key={book.id} className={'shelf-book tone-'+index%5}><span className="book-spine"/><div className="book-cover"><i>{String(index+1).padStart(2,'0')}</i><strong>{book.title}</strong><small>{book.author}</small><span className="book-flourish">❦</span></div><span className="book-pages"/><button aria-label={t('删除','Delete ')+book.title} onClick={()=>void save({...data,books:data.books.filter(item=>item.id!==book.id)})}><Trash2/></button></article>)}</div></div></section></div>
}
