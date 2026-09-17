import { useLayoutEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Object3D } from 'three'
import type { V3 } from './primitives'
import { prepareAtelierMaterial } from './Atelier'

export type PlantPlacement={position:V3;scale:number;angle?:number}
// One draw per source material, not per leaf or plant. Retain the original GLB geometry.
export function PlantInstances({model,placements,crafted=false}:{model:'broadleaf'|'fern'|'understory'|'palm';placements:PlantPlacement[];crafted?:boolean}){
 const {scene}=useGLTF(`/assets/models/atelier/${model}.glb`)
 const group=useRef<Group>(null)
 useLayoutEffect(()=>{
  const parent=group.current!,meshes:InstancedMesh[]=[]
  scene.updateMatrixWorld(true)
  scene.traverse(node=>{
   if(!(node instanceof Mesh))return
   const source=node.material
   const material=crafted?(Array.isArray(source)?source.map(item=>prepareAtelierMaterial(item as MeshStandardMaterial)):prepareAtelierMaterial(source as MeshStandardMaterial)):source
   const mesh=new InstancedMesh(node.geometry,material,placements.length)
   const dummy=new Object3D(),matrix=new Matrix4()
   placements.forEach((p,i)=>{
    dummy.position.set(...p.position);dummy.rotation.set(0,p.angle??i*2.4,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix()
    matrix.multiplyMatrices(dummy.matrix,node.matrixWorld);mesh.setMatrixAt(i,matrix)
   })
   mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()
   mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh)
  })
  return ()=>{for(const mesh of meshes){parent.remove(mesh);mesh.dispose()}}
 },[scene,placements,crafted])
 return <group ref={group} dispose={null}/>
}
