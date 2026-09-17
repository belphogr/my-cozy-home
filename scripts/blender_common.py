"""Original, texture-free furniture for the cozy-home web sample.

Coordinates in constructors are web coordinates (X right, Y up, Z forward).
Run inside Blender, not a system Python environment. The default scene is kept.
"""
import bpy, math, json
from mathutils import Vector
from pathlib import Path

ROOT = Path('E:/我的3D小屋')
SCENE_NAME = 'Cozy Desk Atelier'
scene = bpy.data.scenes.get(SCENE_NAME)
if scene is None:
    scene = bpy.data.scenes.new(SCENE_NAME)
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.view_settings.view_transform = 'AgX'

def xyz(p): return (p[0], -p[2], p[1])

def material(name, color, rough=.5, metal=0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    rgb = tuple(int(color[i:i+2],16)/255 for i in (1,3,5))
    linear = tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)
    m.diffuse_color = (*linear,1)
    m.use_nodes = True
    p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if p is None:
        p=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        output=next((n for n in m.node_tree.nodes if n.type=='OUTPUT_MATERIAL'),None) or m.node_tree.nodes.new('ShaderNodeOutputMaterial')
        m.node_tree.links.new(p.outputs['BSDF'],output.inputs['Surface'])
    p.inputs['Base Color'].default_value=(*linear,1)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal
    return m

walnut=material('Atelier_Walnut','#846044',.38)
edge=material('Atelier_WalnutEdge','#684b35',.44)
cane=material('Atelier_Cane','#b38b55',.5)
caneLight=material('Atelier_CaneLight','#c9a871',.57)
caneDark=material('Atelier_CaneDark','#8d693f',.56)
linen=material('Atelier_Linen','#ded3b7',.93)
thread=material('Atelier_Seam','#c3b491',.88)
gold=material('Atelier_Brass','#bd9456',.3,.78)
goldDark=material('Atelier_BrassDark','#84663b',.37,.72)
glaze=material('Atelier_Glaze','#a7b08a',.22)
clay=material('Atelier_Clay','#c6bba0',.72)
ivory=material('Atelier_Ivory','#ece1c8',.32)
botanical=material('Atelier_Botanical','#526849',.4)
dark=material('Atelier_Dark','#252c25',.5)

def collection(name):
    # Never silently overwrite an artist-edited collection.
    if bpy.data.collections.get(name):
        raise RuntimeError('Collection already exists: '+name)
    c=bpy.data.collections.new(name);scene.collection.children.link(c)
    return c

def link(obj,c,mat):
    for old in list(obj.users_collection): old.objects.unlink(obj)
    c.objects.link(obj)
    if mat: obj.data.materials.append(mat)
    return obj

def mesh(name,verts,faces,mat,c):
    data=bpy.data.meshes.new(name);data.from_pydata([xyz(v) for v in verts],[],faces);data.update()
    ob=bpy.data.objects.new(name,data);c.objects.link(ob)
    if mat:data.materials.append(mat)
    return ob

def smooth(ob):
    if ob.type=='MESH':
        for p in ob.data.polygons:p.use_smooth=True
    return ob

def box(name,size,pos,mat,c,bevel=.01):
    bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(pos))
    ob=bpy.context.object;ob.name=name;ob.scale=(size[0],size[2],size[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    link(ob,c,mat)
    if bevel:
        mod=ob.modifiers.new('Soft crafted edges','BEVEL');mod.width=bevel;mod.segments=3
        ob.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
    return ob

def lathe(name,profile,mat,c,position=(0,0,0),segments=64):
    verts=[];faces=[]
    for r,y in profile:
        for j in range(segments):
            a=j*math.tau/segments
            verts.append((position[0]+r*math.cos(a),position[1]+y,position[2]+r*math.sin(a)))
    for i in range(len(profile)-1):
        for j in range(segments):
            a=i*segments+j;b=i*segments+(j+1)%segments
            faces.append((a+segments,b+segments,b,a))
    return smooth(mesh(name,verts,faces,mat,c))

def curve(name,points,radius,mat,c,closed=False,resolution=3):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D'
    data.resolution_u=2 if closed else 8;data.bevel_depth=radius;data.bevel_resolution=resolution
    s=data.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for p,co in zip(s.bezier_points,points):
        p.co=xyz(co);p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    s.use_cyclic_u=closed
    ob=bpy.data.objects.new(name,data);c.objects.link(ob);data.materials.append(mat)
    return ob

def ring(name,center,radius,tube,mat,c,axis='y'):
    pts=[]
    for i in range(24):
        a=math.tau*i/24;u=radius*math.cos(a);v=radius*math.sin(a)
        delta=(u,0,v) if axis=='y' else ((u,v,0) if axis=='z' else (0,u,v))
        pts.append(tuple(center[j]+delta[j] for j in range(3)))
    return curve(name,pts,tube,mat,c,True,2)

def ellipsoid(name,pos,scale,mat,c):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=xyz(pos))
    ob=bpy.context.object;ob.name=name;ob.scale=(scale[0],scale[2],scale[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return smooth(link(ob,c,mat))

def ribbon(name,points,width,mat,c):
    verts=[];faces=[]
    for i,p in enumerate(points):
        tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])
        across=Vector((-tangent.y,tangent.x,0)).normalized()*width/2
        verts.extend([tuple(Vector(p)-across),tuple(Vector(p)+across)])
    for i in range(len(points)-1):faces.append((i*2,i*2+1,i*2+3,i*2+2))
    ob=mesh(name,verts,faces,mat,c)
    solid=ob.modifiers.new('Actual cane thickness','SOLIDIFY');solid.thickness=.003
    return smooth(ob)

def leaf(name,start,end,width,mat,c):
    a=Vector(start);b=Vector(end);d=b-a
    side=d.cross(Vector((0,0,1))).normalized()*width
    if side.length<.001:side=Vector((width,0,0))
    verts=[];faces=[]
    for i in range(9):
        t=i/8;mid=a+d*t+Vector((0,0,math.sin(math.pi*t)*width*.45))
        w=math.sin(math.pi*t)**.8
        for j in (-1,0,1):verts.append(tuple(mid+side*w*j+Vector((0,0,-abs(j)*width*.14*w))))
    for i in range(8):
        for j in range(2):
            k=i*3+j;faces.append((k,k+1,k+4,k+3))
    ob=smooth(mesh(name,verts,faces,mat,c))
    solid=ob.modifiers.new('Leaf thickness','SOLIDIFY');solid.thickness=.0015
    return ob
