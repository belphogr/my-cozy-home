export type IntroPhase='building'|'doorstep'|'opening'|'transition'|'entered'
export interface IntroState{phase:IntroPhase}
export type IntroAction={type:'COMPLETE'}|{type:'SKIP'}|{type:'KNOCK'}|{type:'PORTAL'}|{type:'ENTERED'}

export const initialIntroState=(reduced:boolean):IntroState=>({phase:reduced?'doorstep':'building'})

export function introReducer(state:IntroState,action:IntroAction):IntroState{
 switch(action.type){
  case 'COMPLETE':case 'SKIP':return state.phase==='building'?{phase:'doorstep'}:state
  case 'KNOCK':return state.phase==='doorstep'?{phase:'opening'}:state
  case 'PORTAL':return state.phase==='opening'?{phase:'transition'}:state
  case 'ENTERED':return state.phase==='transition'?{phase:'entered'}:state
 }
}
