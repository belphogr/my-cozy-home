import { describe, expect, it } from 'vitest'
import { formatTime, validateAudio } from './useMusic'

describe('唱片机本地音频',()=>{
 it('accepts audio MIME types and known extensions when a browser omits the MIME type',()=>{
  expect(validateAudio({name:'午后.mp3',type:'audio/mpeg',size:1024})).toBe('')
  expect(validateAudio({name:'雨声.M4A',type:'',size:1024})).toBe('')
 })
 it('rejects empty, oversized and unrelated files before replacing the current track',()=>{
  expect(validateAudio({name:'空.wav',type:'audio/wav',size:0})).toContain('空')
  expect(validateAudio({name:'大.wav',type:'audio/wav',size:51*1024*1024})).toContain('50 MB')
  expect(validateAudio({name:'网页.html',type:'text/html',size:1024})).toContain('音频文件')
 })
 it('formats unloaded metadata and seeking positions without showing NaN',()=>{
  expect(formatTime(NaN)).toBe('0:00');expect(formatTime(-1)).toBe('0:00');expect(formatTime(125.8)).toBe('2:05')
 })
})
