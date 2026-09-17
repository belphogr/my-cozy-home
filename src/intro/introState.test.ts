import { describe,expect,it } from 'vitest'
import { initialIntroState,introReducer } from './introState'

describe('valley intro state machine',()=>{
 it('plays, waits at the door, opens and enters in order',()=>{
  let state=initialIntroState(false)
  state=introReducer(state,{type:'COMPLETE'});expect(state.phase).toBe('doorstep')
  state=introReducer(state,{type:'KNOCK'});expect(state.phase).toBe('opening')
  state=introReducer(state,{type:'PORTAL'});expect(state.phase).toBe('transition')
  state=introReducer(state,{type:'ENTERED'});expect(state.phase).toBe('entered')
 })
 it('skips only to the interactive door',()=>{
  const state=introReducer(initialIntroState(false),{type:'SKIP'})
  expect(state.phase).toBe('doorstep')
  expect(introReducer(state,{type:'PORTAL'})).toEqual(state)
 })
 it('starts at the built doorway for reduced motion',()=>{
  expect(initialIntroState(true).phase).toBe('doorstep')
 })
})
