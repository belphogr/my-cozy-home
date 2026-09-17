import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { InspectId } from './data/home'

export type Language='zh'|'en'
const LanguageContext=createContext<{language:Language;toggle:()=>void}>({language:'zh',toggle:()=>{}})
export const text=(language:Language,zh:string,en:string)=>language==='zh'?zh:en
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>(()=>localStorage.getItem('home-language')==='en'?'en':'zh')
 useEffect(()=>{localStorage.setItem('home-language',language);document.documentElement.lang=language==='zh'?'zh-CN':'en'},[language])
 return <LanguageContext.Provider value={{language,toggle:()=>setLanguage(value=>value==='zh'?'en':'zh')}}>{children}</LanguageContext.Provider>
}
export const useLanguage=()=>useContext(LanguageContext)

const englishObjectNames:Record<InspectId,string>={cup:'Ceramic cup',book:'Botanical notebook',plant:'Desk plant',mouse:'Wireless mouse',phone:'Phone on stand',globe:'Vintage globe',hanging:'Cards and wind chime',livingBook:'Coffee-table book',catpuccino:'Cat marshmallow coffee',tablePlant:'Table flowers',narcissus:'Window narcissus',diningCup:'Amber coffee cup',diningMagazine:'Table magazine',wateringCan:'Garden watering can',gardenGreen:'Courtyard greenery',gardenFlowers:'Coral flowers',gardenSucculent:'Rosette succulent',gardenPotA:'Broadleaf planter',gardenPotB:'Wall-side planter',gardenPotC:'Terrace planter'}
export const objectName=(language:Language,id:InspectId,chinese:string)=>language==='zh'?chinese:englishObjectNames[id]
