import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { freshHome, loadHome, saveHome, safeUrl, validateHome, localDate, normalizeHome, normalizeKeyword } from './home'
describe('书桌数据',()=>{
  it('初始数据不冒充用户经历',()=>{
    const data=freshHome()
    expect(data.profile.name).toBe('')
    expect(data.memories).toEqual([])
    expect(data.recognitions).toEqual([])
    expect(data.folders).toEqual([])
    expect(data.notes).toEqual([])
    expect(data.books).toEqual([])
    expect(data.photos).toEqual(Array(7).fill(null))
  })
  it('保存并重新读取中文资料和记录',async()=>{
    const data=freshHome()
    data.profile.name='测试用资料'
    data.memories.push({id:'check',title:'测试记录',body:'一杯茶的时间',date:'2026-08-28'})
    await saveHome(data)
    expect(await loadHome()).toEqual(data)
  })
  it('书签拒绝脚本或本地文件地址',()=>{
    expect(safeUrl('https://example.com')).toBe('https://example.com/')
    expect(()=>safeUrl('javascript:alert(1)')).toThrow()
    expect(()=>safeUrl('file:///C:/')).toThrow()
    expect(()=>safeUrl('不是网址')).toThrow()
  })
  it('拒绝不支持的版本、重复 ID 和非法书签',()=>{
    expect(()=>validateHome({...freshHome(),version:2})).toThrow()
    const item={id:'repeat',title:'测试',body:'',date:'2026-08-28'}
    expect(()=>validateHome({...freshHome(),memories:[item,item]})).toThrow()
    expect(()=>validateHome({...freshHome(),bookmarks:[{id:'x',title:'测试',url:'javascript:alert(1)'}]})).toThrow()
  })
  it('非法保存不覆盖之前的存档',async()=>{
    const before=await loadHome()
    await expect(saveHome({...before,memories:[{id:'bad',title:'测试',body:'',date:'wrong'}]})).rejects.toThrow()
    expect(await loadHome()).toEqual(before)
  })
  it('日期使用本地年月日，而非 UTC 或地区格式猜测',()=>{
    expect(localDate(new Date(2026,0,2,0,1))).toBe('2026-01-02')
  })
  it('便签关键词限制为四个中文字或两个英文单词',()=>{
    expect(normalizeKeyword('今天要开心')).toBe('今天要开')
    expect(normalizeKeyword('slow sunny morning')).toBe('slow sunny')
    expect(normalizeKeyword('  cozy   home  ')).toBe('cozy home')
  })
  it('旧版长便签迁移为关键词和表情标签',()=>{
    const current=freshHome()
    const migrated=normalizeHome({...current,notes:[{id:'old-note',body:'今天要开心',mood:'happy'}]})
    expect(migrated.notes).toEqual([{id:'old-note',slot:0,keyword:'今天要开',emoji:'😊'}])
  })
  it('为已有版本一存档补上空奖状墙，不丢失旧内容',()=>{
    const current=freshHome()
    const old={version:1,profile:current.profile,memories:current.memories,bookmarks:current.bookmarks}
    const migrated=normalizeHome(old)
    expect(migrated.recognitions).toEqual([])
    expect(migrated.profile).toMatchObject({age:'',job:'',experience:''})
    expect(migrated.photos).toEqual(Array(7).fill(null))
  })
  it('保存并读取带图片附件的奖项',async()=>{
    const data=await loadHome()
    data.recognitions=[{id:'award-check',kind:'award',title:'测试奖项',issuer:'测试机构',year:'2026',description:'仅用于自动化测试',attachment:{name:'proof.png',mime:'image/png',dataUrl:'data:image/png;base64,iVBORw0KGgo='}}]
    await saveHome(data)
    expect((await loadHome()).recognitions).toEqual(data.recognitions)
  })
  it('拒绝脚本附件、超长年份与重复奖项 ID',()=>{
    const item={id:'r1',kind:'paper' as const,title:'测试论文',issuer:'测试期刊',year:'2026',description:''}
    expect(()=>validateHome({...freshHome(),recognitions:[item,item]})).toThrow()
    expect(()=>validateHome({...freshHome(),recognitions:[{...item,id:'r2',year:'20260'}]})).toThrow()
    expect(()=>validateHome({...freshHome(),recognitions:[{...item,id:'r3',attachment:{name:'unsafe.svg',mime:'image/svg+xml',dataUrl:'data:image/svg+xml;base64,PHN2Zz4='}}]})).toThrow()
  })
})
