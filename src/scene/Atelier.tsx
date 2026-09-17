import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial } from 'three'
import { craftSurface } from './primitives'

type Asset='desk'|'chair'|'eggchair'|'dogbed'|'catpuccino'|'phone'|'globe'|'hanging'|'cup'|'lamp'|'plant'|'pendant'|'landscape'|'deskbooks'|'shelf'|'floorplant'|'window'|'sofa'|'coffeetable'|'rug'|'gardenentry'|'pottingbench'|'lounger'|'poolshell'|'wateringcan'|'flowers'|'succulent'|'diningtable'|'sideboard'|'turntable'|'vinyl'|'palm'|'broadleaf'|'fern'|'niche'|'understory'
const path=(asset:Asset)=>`/assets/models/atelier/${asset}.glb`
const prepared=new WeakMap<MeshStandardMaterial,MeshStandardMaterial>()
export function prepareAtelierMaterial(source:MeshStandardMaterial){
 if(!prepared.has(source)){
  const material=source.clone()
  if(material.name.includes('Walnut'))craftSurface(material,'wood')
  else if(material.name.includes('Linen'))craftSurface(material,'linen')
  else if(material.name.includes('Pottery')||material.name.includes('Clay'))craftSurface(material,'clay')
  if(material.name.includes('Brass'))material.envMapIntensity=2.2
  if(material.name.includes('Glass')){material.transparent=true;material.opacity=.08;material.depthWrite=false}
  prepared.set(source,material)
 }
 return prepared.get(source)!
}

// Each placement owns its hierarchy; geometry/materials stay shared across canvases.
// Never mutate the cached GLTF scene when a prop is picked up or put back.
export function Atelier({model}:{model:Asset}){
 const {scene}=useGLTF(path(model))
 const object=useMemo(()=>{
  const copy=scene.clone(true)
  copy.traverse(node=>{
   if(!(node instanceof Mesh))return
   node.castShadow=true;node.receiveShadow=true
   node.material=Array.isArray(node.material)?node.material.map(m=>prepareAtelierMaterial(m as MeshStandardMaterial)):prepareAtelierMaterial(node.material as MeshStandardMaterial)
   if(!Array.isArray(node.material)&&node.material.name.includes('Glass'))node.castShadow=false
  })
  return copy
 },[scene])
 return <primitive object={object} dispose={null}/>
}
for(const asset of ['desk','chair','eggchair','dogbed','catpuccino','phone','globe','hanging','cup','lamp','plant','pendant','landscape','deskbooks','shelf','floorplant','window','sofa','coffeetable','rug','gardenentry','pottingbench','lounger','poolshell','wateringcan','flowers','succulent','diningtable','sideboard','turntable','vinyl','palm','broadleaf','fern','niche','understory'] as const)useGLTF.preload(path(asset))


