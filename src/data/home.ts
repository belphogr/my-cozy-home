import { openDB } from 'idb'
export type AppId = 'profile' | 'bookmarks' | 'folders'
export type InspectId = 'cup' | 'book' | 'plant' | 'mouse' | 'phone' | 'globe' | 'hanging' | 'livingBook' | 'catpuccino' | 'tablePlant' | 'narcissus' | 'diningCup' | 'diningMagazine' | 'wateringCan' | 'gardenGreen' | 'gardenFlowers' | 'gardenSucculent' | 'gardenPotA' | 'gardenPotB' | 'gardenPotC'
export interface Profile { name: string; age: string; interests: string; job: string; experience: string; bio: string }
export interface Memory { id: string; title: string; body: string; date: string }
export interface Bookmark { id: string; title: string; url: string }
export interface FolderIndex { id:string; name:string; entries:string[] }
export type Mood='calm'|'happy'|'tired'|'hopeful'
export interface StickyNote { id:string; slot:number; keyword:string; emoji:string }
export interface ShelfBook { id:string; title:string; author:string }
export type RecognitionKind = 'award' | 'paper'
export type RecognitionMime = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'
export interface RecognitionAttachment { name:string; mime:RecognitionMime; dataUrl:string }
export interface Recognition {
 id:string; kind:RecognitionKind; title:string; issuer:string; year:string; description:string; attachment?:RecognitionAttachment
}
export interface HomeData { version: 1; profile: Profile; memories: Memory[]; bookmarks: Bookmark[]; folders:FolderIndex[]; notes:StickyNote[]; books:ShelfBook[]; photos:(string|null)[]; recognitions:Recognition[] }
export const freshHome = (): HomeData => ({version: 1, profile: {name:'',age:'',interests:'',job:'',experience:'',bio:''}, memories:[], bookmarks:[], folders:[], notes:[], books:[], photos:Array(7).fill(null), recognitions:[]})
export const noteEmojis=['🌿','☀️','☕','✨','😊','💪','📚','🎵'] as const
export function normalizeKeyword(input:string){
 const value=input.trim().replace(/\s+/g,' ')
 if(/[\u3400-\u9fff]/.test(value))return Array.from(value.replace(/\s/g,'')).slice(0,4).join('')
 return value.split(' ').filter(Boolean).slice(0,2).join(' ')
}
export function safeUrl(input: string): string {
  let value:URL
  try{value=new URL(input.trim())}catch{throw new Error('请输入完整的网址，例如 https://example.com')}
  if (!['http:', 'https:'].includes(value.protocol)) throw new Error('链接需要以 https:// 或 http:// 开头')
  return value.href
}
export function validateHome(value:unknown):asserts value is HomeData {
 const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
 const strings=(v:Record<string,unknown>,keys:string[])=>keys.every(k=>typeof v[k]==='string')
 if(!object(value)||value.version!==1||!object(value.profile)||!strings(value.profile,['name','age','bio','interests','job','experience'])||!Array.isArray(value.memories)||!Array.isArray(value.bookmarks)||!Array.isArray(value.folders)||!Array.isArray(value.notes)||!Array.isArray(value.books)||!Array.isArray(value.photos)||!Array.isArray(value.recognitions))throw new Error('存档格式或版本不受支持，已停止写入')
 for(const [items,keys] of [[value.memories,['id','title','body','date']],[value.bookmarks,['id','title','url']]] as const){
  const ids=new Set<string>()
  for(const item of items){
   if(!object(item)||!strings(item,[...keys])||!item.id||ids.has(item.id as string))throw new Error('存档中的记录格式不正确')
   ids.add(item.id as string)
  }
 }
 for(const item of value.memories){if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||Number.isNaN(new Date(item.date).getTime()))throw new Error('记录日期格式不正确')}
 for(const item of value.bookmarks)safeUrl(item.url)
 for(const item of value.folders)if(!object(item)||!strings(item,['id','name'])||!Array.isArray(item.entries)||!item.entries.every(v=>typeof v==='string'))throw new Error('文件夹索引格式不正确')
 const noteSlots=new Set<number>()
 for(const item of value.notes){if(!object(item)||!strings(item,['id','keyword','emoji'])||typeof item.slot!=='number'||item.slot<0||item.slot>3||noteSlots.has(item.slot)||!item.keyword||normalizeKeyword(item.keyword as string)!==item.keyword||!noteEmojis.includes(item.emoji as typeof noteEmojis[number]))throw new Error('便签格式不正确');noteSlots.add(item.slot)}
 for(const item of value.books)if(!object(item)||!strings(item,['id','title','author']))throw new Error('书籍格式不正确')
 if(value.photos.length!==7||!value.photos.every(v=>v===null||(typeof v==='string'&&v.startsWith('data:image/'))))throw new Error('照片墙格式不正确')
 const recognitionIds=new Set<string>()
 for(const item of value.recognitions){
  if(!object(item)||!strings(item,['id','kind','title','issuer','year','description'])||!item.id||recognitionIds.has(item.id as string)||!['award','paper'].includes(item.kind as string))throw new Error('奖项或论文记录格式不正确')
  recognitionIds.add(item.id as string)
  if((item.title as string).length>120||(item.issuer as string).length>120||(item.description as string).length>3000||!/^\d{0,4}$/.test(item.year as string))throw new Error('奖项或论文记录内容超出限制')
  if(item.attachment!==undefined){
   if(!object(item.attachment)||!strings(item.attachment,['name','mime','dataUrl']))throw new Error('奖项附件格式不正确')
   const mime=item.attachment.mime as string,dataUrl=item.attachment.dataUrl as string
   if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(mime)||!dataUrl.startsWith(`data:${mime};base64,`)||dataUrl.length>14_100_000||(item.attachment.name as string).length>180)throw new Error('奖项附件不受支持或文件过大')
  }
 }
}
export function normalizeHome(value:unknown):HomeData{
 if(value&&typeof value==='object'&&!Array.isArray(value)){
  const old=value as Record<string,unknown>,profile=old.profile&&typeof old.profile==='object'?old.profile as Record<string,unknown>:{}
  const moodEmoji:Record<string,string>={calm:'☕',happy:'😊',tired:'🌿',hopeful:'✨'}
  const notes=Array.isArray(old.notes)?old.notes.slice(0,4).map((note,index)=>{const item=note&&typeof note==='object'?note as Record<string,unknown>:{};return {id:typeof item.id==='string'?item.id:`migrated-note-${index}`,slot:typeof item.slot==='number'&&item.slot>=0&&item.slot<4?item.slot:index,keyword:normalizeKeyword(typeof item.keyword==='string'?item.keyword:typeof item.body==='string'?item.body:'便签'),emoji:typeof item.emoji==='string'&&noteEmojis.includes(item.emoji as typeof noteEmojis[number])?item.emoji:moodEmoji[String(item.mood)]??'🌿'}}):[]
  value={...old,profile:{name:profile.name??'',age:profile.age??'',interests:profile.interests??'',job:profile.job??'',experience:profile.experience??'',bio:profile.bio??''},recognitions:old.recognitions??[],folders:old.folders??[],notes,books:old.books??[],photos:old.photos??Array(7).fill(null)}
 }
 validateHome(value)
 return value
}
export function localDate(date=new Date()){
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
let database: ReturnType<typeof openDB> | undefined
function db() {
  // Do not force a version upgrade for the main archive: an older open tab would
  // otherwise block startup. Folder handles live in their own tiny database.
  database ??= openDB('my-cozy-home',undefined,{upgrade(db){if(!db.objectStoreNames.contains('home'))db.createObjectStore('home')}})
  return database
}
export async function loadHome(): Promise<HomeData> {
  const pending=(async()=>((await db()).get('home','current')))()
  // A second tab with an older IndexedDB connection must never leave the whole
  // house on an endless loading screen.
  const data=(await Promise.race([pending,new Promise<undefined>(resolve=>setTimeout(()=>resolve(undefined),1800))])) ?? freshHome()
  return normalizeHome(data)
}
export async function saveHome(data: HomeData): Promise<void> {
  validateHome(data)
  await (await db()).put('home', data, 'current')
}
let folderDatabase:ReturnType<typeof openDB>|undefined
function folderDb(){folderDatabase??=openDB('my-cozy-home-folders',1,{upgrade(db){db.createObjectStore('handles')}});return folderDatabase}
export async function saveFolderHandle(id:string,handle:FileSystemDirectoryHandle){await (await folderDb()).put('handles',handle,id)}
export async function loadFolderHandle(id:string){return (await (await folderDb()).get('handles',id)) as FileSystemDirectoryHandle|undefined}
export const inspectNames: Record<InspectId,string> = {cup:'陶瓷茶杯',book:'植物笔记本',plant:'桌边的小绿植',mouse:'无线鼠标',phone:'木架上的手机',globe:'维多利亚地球仪',hanging:'风铃与卡片',livingBook:'茶几上的小书',catpuccino:'猫咪棉花糖咖啡',tablePlant:'圆桌上的小花',narcissus:'窗边的水仙花',diningCup:'琥珀咖啡杯',diningMagazine:'桌上的杂志',wateringCan:'园艺洒水壶',gardenGreen:'庭院绿植',gardenFlowers:'珊瑚色小花',gardenSucculent:'莲座多肉',gardenPotA:'庭院阔叶盆栽',gardenPotB:'围墙边盆栽',gardenPotC:'露台绿植'}
