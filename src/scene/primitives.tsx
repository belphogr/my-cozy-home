import { useLayoutEffect, useMemo, useRef } from 'react'
import { BoxGeometry, CatmullRomCurve3, Color, DoubleSide, InstancedMesh, LatheGeometry, MeshStandardMaterial, Object3D, SphereGeometry, TubeGeometry, Vector2, Vector3 } from 'three'
import type { Material } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ThreeElements } from '@react-three/fiber'
export type V3=[number,number,number]
const materials=new Map<string,MeshStandardMaterial>()
// Fine analytic surface detail, with derivative antialiasing. No bitmap textures.
export function craftSurface(material:MeshStandardMaterial,kind:'wood'|'linen'|'clay'|'plaster',world=false){
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCraft;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>\nvCraft = ${world?'(modelMatrix * vec4(position,1.0)).xyz':'position'};`)
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   varying vec3 vCraft;
   float filteredWave(float x){ return sin(x) * (1.0-smoothstep(0.5,3.0,fwidth(x))); }
   float craftNoise(vec2 p){
    vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
    vec4 a=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1,0),vec2(127.1,311.7)),dot(i+vec2(0,1),vec2(127.1,311.7)),dot(i+vec2(1,1),vec2(127.1,311.7))))*43758.5453);
    return mix(mix(a.x,a.y,f.x),mix(a.z,a.w,f.x),f.y);
   }
  `).replace('#include <color_fragment>',`#include <color_fragment>
   ${kind==='wood'?`
    float grainNoise=craftNoise(vCraft.xz*vec2(.8,9.0));
    float warp=(grainNoise-.5)*.068+(craftNoise(vCraft.xz*vec2(2.0,18.0))-.5)*.009;
    float rings=filteredWave((vCraft.z+vCraft.y*.13+warp)*270.0);
    float pores=filteredWave((vCraft.z+warp)*1700.0+sin(vCraft.x*19.0));
    diffuseColor.rgb*=.94-pow(.5+.5*rings,8.0)*.12+pores*.025+grainNoise*.09;
   `:kind==='linen'?`
    float weave=filteredWave((vCraft.x+vCraft.z)*1300.0)*filteredWave((vCraft.y+vCraft.z)*1300.0);
    diffuseColor.rgb*=.97+weave*.025;
   `:kind==='plaster'?`
    float lime=craftNoise(vCraft.xy*5.0+vCraft.zy*3.0);
    float trowel=craftNoise(vCraft.xy*24.0+vCraft.zy*17.0);
    diffuseColor.rgb*=.955+lime*.07+trowel*.025;
   `:`
    float turning=filteredWave(vCraft.y*900.0+sin(vCraft.x*20.0));
    diffuseColor.rgb*=.98+turning*.025;
   `}
  `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float craftHeight=${kind==='wood'?'.00012*rings+.00002*pores':kind==='linen'?'.00004*weave':kind==='plaster'?'.0006*trowel':'.00006*turning'};
   vec3 craftQ0=dFdx(-vViewPosition), craftQ1=dFdy(-vViewPosition);
   vec3 craftR1=cross(craftQ1,normal),craftR2=cross(normal,craftQ0);
   float craftDet=dot(craftQ0,craftR1);
   normal=normalize(abs(craftDet)*normal-sign(craftDet)*(dFdx(craftHeight)*craftR1+dFdy(craftHeight)*craftR2));
  `)
 }
 material.customProgramCacheKey=()=>`atelier-${kind}-${world}-v4`
 return material
}
export function mat(color:string,roughness=.65,metalness=0){
  const key=color+roughness+metalness
  if(!materials.has(key)) materials.set(key,new MeshStandardMaterial({color:new Color(color),roughness,metalness}))
  return materials.get(key)!
}
// Analytic grain: no downloaded image or texture map; every prop retains its geometry.
export function timber(color:string,roughness=.5){
 return craftSurface(mat(color,roughness),'wood',true)
}
export const greenPlaster=craftSurface(mat('#374a3b',.94),'plaster',true)
export const ivoryPlaster=craftSurface(mat('#d2c9b5',.97),'plaster',true)
export const wood=timber('#4e301d',.48)
export const woodLight=timber('#745138',.51)
export const rattan=mat('#b98a50',.63)
export const brass=mat('#a17b3d',.3,.72)
brass.envMapIntensity=2.8
export const dark=mat('#161e1c',.38,.22)
export const leaf=mat('#41613b',.8)
leaf.side=DoubleSide
const unitBox=new BoxGeometry(1,1,1)
const unitSphere=new SphereGeometry(1,24,16)
export function Box({size=[1,1,1],material=wood,...props}:ThreeElements['mesh'] & {size?:V3;material?:Material}){
 return <mesh {...props} geometry={unitBox} scale={size} material={material} castShadow receiveShadow />
}
export type BoxPlacement={position:V3;size:V3;rotation?:V3}
export function BoxInstances({items,material,castShadow=true,receiveShadow=true}:{items:BoxPlacement[];material:Material;castShadow?:boolean;receiveShadow?:boolean}){
 const ref=useRef<InstancedMesh>(null)
 useLayoutEffect(()=>{
  const mesh=ref.current!,dummy=new Object3D()
  items.forEach((item,index)=>{
   dummy.position.set(...item.position);dummy.scale.set(...item.size)
   dummy.rotation.set(...(item.rotation??[0,0,0]));dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()
 },[items])
 return <instancedMesh ref={ref} args={[unitBox,material,items.length]} castShadow={castShadow} receiveShadow={receiveShadow}/>
}
export type InstancePlacement={position:V3;rotation?:V3}
export function RoundInstances({items,size,radius=.04,material,castShadow=true,receiveShadow=true}:{items:InstancePlacement[];size:V3;radius?:number;material:Material;castShadow?:boolean;receiveShadow?:boolean}){
 const ref=useRef<InstancedMesh>(null)
 const geometry=useMemo(()=>new RoundedBoxGeometry(...size,3,radius),[...size,radius])
 useLayoutEffect(()=>{
  const mesh=ref.current!,dummy=new Object3D()
  items.forEach((item,index)=>{
   dummy.position.set(...item.position);dummy.rotation.set(...(item.rotation??[0,0,0]));dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()
  return()=>geometry.dispose()
 },[geometry,items])
 return <instancedMesh ref={ref} args={[geometry,material,items.length]} castShadow={castShadow} receiveShadow={receiveShadow}/>
}
export function Round({size=[1,1,1],radius=.04,material=wood,...props}:Omit<ThreeElements['mesh'],'args'> & {size?:V3;radius?:number;material?:Material}){
 const geometry=useMemo(()=>new RoundedBoxGeometry(...size,3,radius),[...size,radius])
 return <mesh {...props} geometry={geometry} material={material} castShadow receiveShadow />
}
export function Ball({size=[1,1,1],material=wood,...props}:ThreeElements['mesh'] & {size?:V3;material?:Material}){
 return <mesh {...props} geometry={unitSphere} scale={size} material={material} castShadow receiveShadow />
}
export function Tube({points,radius=.025,material=wood,closed=false}: {points:V3[];radius?:number;material?:Material;closed?:boolean}){
 const geometry=useMemo(()=>new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p)),closed),Math.max(8,points.length*5),radius,7,closed),[JSON.stringify(points),radius,closed])
 return <mesh geometry={geometry} material={material} castShadow receiveShadow />
}
export function Lathe({profile,material=wood,...props}:ThreeElements['mesh'] & {profile:[number,number][];material?:Material}){
 const geometry=useMemo(()=>new LatheGeometry(profile.map(p=>new Vector2(...p)),48),[JSON.stringify(profile)])
 return <mesh {...props} geometry={geometry} material={material} castShadow receiveShadow />
}
