"""Export material-batched GLBs, keep editable source parts in the .blend.

Run after blender_furniture.py and blender_details.py. The temporary mesh copies
belong only to this script, and never replace the editable source objects.
"""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
import bmesh
from mathutils.bvhtree import BVHTree
out=ROOT/'public/assets/models/atelier';out.mkdir(parents=True,exist_ok=True)
stats=json.loads((out/'manifest.json').read_text(encoding='utf-8')) if (out/'manifest.json').exists() else {}
for key in globals().get('EXPORT_ASSETS',('Desk','Chair','Cup','Lamp','Plant','Pendant','Landscape','Deskbooks','Shelf','Floorplant','Window','Sofa','Coffeetable','Rug','Gardenentry','Pottingbench','Lounger','Poolshell','Wateringcan','Flowers','Succulent','Diningtable','Sideboard','Turntable','Vinyl','Palm','Broadleaf','Fern','Niche','Understory')):
    src=bpy.data.collections['Atelier_'+key]
    temp=bpy.data.collections.new('Export_'+key);scene.collection.children.link(temp)
    bpy.ops.object.select_all(action='DESELECT')
    copies=[]
    for ob in src.objects:
        cp=ob.copy();cp.data=ob.data.copy();temp.objects.link(cp);copies.append(cp);cp.select_set(True)
    bpy.context.view_layer.objects.active=copies[0]
    bpy.ops.object.convert(target='MESH')
    for ob in bpy.context.selected_objects:
        bm=bmesh.new();bm.from_mesh(ob.data)
        bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        bm.to_mesh(ob.data);bm.free()
    bpy.ops.object.join()
    joined=bpy.context.object;joined.name='Atelier_'+key
    # Bake the source object's origin, retain glTF Y-up conversion on export.
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    # Vertex cavity shading survives GLB without a bitmap AO texture.
    bm=bmesh.new();bm.from_mesh(joined.data);tree=BVHTree.FromBMesh(bm);bm.free()
    ao=joined.data.color_attributes.new(name='CraftCavity',type='FLOAT_COLOR',domain='POINT')
    distance={'Desk':.25,'Chair':.14,'Cup':.055,'Lamp':.10,'Plant':.055,'Pendant':.08,'Landscape':.05,'Deskbooks':.045,'Shelf':.10,'Floorplant':.06,'Window':.045,'Sofa':.14,'Coffeetable':.10,'Rug':.01,'Gardenentry':.065,'Pottingbench':.08,'Lounger':.08,'Poolshell':.08,'Wateringcan':.04,'Flowers':.035,'Succulent':.025,'Diningtable':.08,'Sideboard':.08,'Turntable':.025,'Vinyl':.008,'Palm':.025,'Broadleaf':.035,'Fern':.015,'Niche':.12,'Understory':.02}[key]
    for v in joined.data.vertices:
        n=v.normal.normalized();t=n.cross(Vector((0,0,1)))
        if t.length<.01:t=n.cross(Vector((0,1,0)))
        t.normalize();b=n.cross(t);hits=0
        for j in range(8):
            a=j*2.39996;z=.25+.7*(j+.5)/8;r=math.sqrt(1-z*z)
            direction=(n*z+t*math.cos(a)*r+b*math.sin(a)*r).normalized()
            if tree.ray_cast(v.co+n*.0007,direction,distance)[0] is not None:hits+=1
        shade=1-.48*hits/8
        ao.data[v.index].color=(shade,shade,shade,1)
    bpy.ops.export_scene.gltf(filepath=str(out/(key.lower()+'.glb')),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_yup=True,export_materials='EXPORT',export_extras=False,export_texcoords=False,export_vertex_color='NAME',export_vertex_color_name='CraftCavity',export_all_vertex_colors=False)
    joined.data.calc_loop_triangles()
    stats[key]={'triangles':len(joined.data.loop_triangles),'materials':len(joined.data.materials),'bytes':(out/(key.lower()+'.glb')).stat().st_size}
    data=joined.data;bpy.data.objects.remove(joined,do_unlink=True);bpy.data.meshes.remove(data);bpy.data.collections.remove(temp)
(out/'manifest.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print(json.dumps(stats))

