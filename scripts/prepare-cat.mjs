import fs from 'node:fs/promises'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { Box3, Vector3, MeshStandardMaterial } from 'three'

// Export a texture-free, rigged CC0 source model without requiring Blender.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}
  readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.()})}
}
const source='.asset-cache/animals/Animal Pack Vol.2 by @Quaternius/FBX/Cat.fbx'
const data=await fs.readFile(source)
const cat=new FBXLoader().parse(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'')
const bones=[], materials=[]
cat.traverse(node=>{
  if(node.isBone) bones.push(node.name)
  if(node.isMesh){
    // Consolidate FBX's repeated material groups into one GLB primitive per material.
    const geometry=node.geometry, groups=geometry.groups.slice(), index=geometry.index
    if(groups.length){
      const indices=[], combined=[]
      for(const materialIndex of [...new Set(groups.map(g=>g.materialIndex))]){
        const start=indices.length
        for(const group of groups.filter(g=>g.materialIndex===materialIndex)){
          for(let i=group.start;i<group.start+group.count;i++)indices.push(index?index.getX(i):i)
        }
        combined.push({start,count:indices.length-start,materialIndex})
      }
      geometry.setIndex(indices);geometry.clearGroups()
      for(const group of combined)geometry.addGroup(group.start,group.count,group.materialIndex)
    }
    const original=Array.isArray(node.material)?node.material:[node.material]
    materials.push(...original.map(m=>({name:m.name,color:m.color?.getHexString()})))
    const mapped=original.map(m=>new MeshStandardMaterial({name:m.name,color:m.color,roughness:.9,metalness:0}))
    node.material=Array.isArray(node.material)?mapped:mapped[0]
    node.castShadow=true
    node.receiveShadow=true
  }
})
cat.updateMatrixWorld(true)
const size=new Box3().setFromObject(cat).getSize(new Vector3())
const report={source,size:size.toArray(),animations:cat.animations.map(a=>({name:a.name,duration:a.duration,tracks:a.tracks.length})),bones,materials}
console.log(JSON.stringify(report,null,2))
const result=await new GLTFExporter().parseAsync(cat,{binary:true,animations:cat.animations})
await fs.writeFile('public/assets/models/cat.glb',Buffer.from(result))
await fs.writeFile('public/assets/models/cat-info.json',JSON.stringify(report,null,2))
