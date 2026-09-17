"""Render a neutral blockout review image from the generated Bali scene."""
from __future__ import annotations

import os
import bpy
from mathutils import Vector

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
OUT=os.path.join(ROOT,'references','intro-bali','blockout-overview-v1.png')
CLOSE=os.path.join(ROOT,'references','intro-bali','blockout-main-estate-v1.png')

def clay(name,color,roughness=.82,metallic=0.0):
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    bsdf=next((node for node in mat.node_tree.nodes if node.type=='BSDF_PRINCIPLED'),None)
    if bsdf is None:raise RuntimeError(f'No Principled shader for {name}')
    bsdf.inputs['Base Color'].default_value=(*color,1)
    bsdf.inputs['Roughness'].default_value=roughness
    bsdf.inputs['Metallic'].default_value=metallic
    return mat

def look_at(obj,target):
    obj.rotation_euler=((Vector(target)-obj.location).to_track_quat('-Z','Y')).to_euler()

scene=bpy.context.scene
scene.frame_set(scene.frame_end)
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=1440;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.055,.065,.07,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.34

terrain=clay('Blockout_Terrain',(.48,.50,.48));sand=clay('Blockout_Shore',(.68,.67,.62))
water=clay('Blockout_Water',(.20,.34,.39),.28,.08);vegetation=clay('Blockout_Vegetation',(.34,.40,.35))
architecture=clay('Blockout_Architecture',(.76,.75,.70));roof=clay('Blockout_Roof',(.47,.45,.42))
stone=clay('Blockout_Stone',(.54,.54,.51))

for obj in bpy.data.objects:
    if obj.type!='MESH':continue
    name=obj.name.lower()
    chosen=architecture
    if 'water_' in name or 'lagoon' in name or 'ocean' in name:chosen=water
    elif 'beach' in name:chosen=sand
    elif 'island' in name or 'islet' in name or 'ground' in name:chosen=terrain
    elif any(token in name for token in ('canopy','palm','near','leaf','fern','flower','broadleaf','understory')):chosen=vegetation
    elif 'roof' in name:chosen=roof
    elif any(token in name for token in ('stone','wall','pillar','gatecap','bridge')):chosen=stone
    obj.data.materials.clear();obj.data.materials.append(chosen)

bpy.ops.object.camera_add(location=(122,-142,112))
camera=bpy.context.object;camera.name='Blockout_Review_Camera';camera.data.lens=52;camera.data.sensor_width=36
look_at(camera,(0,12,0));scene.camera=camera

bpy.ops.object.light_add(type='SUN',location=(0,-20,80));sun=bpy.context.object
sun.data.energy=3.0;sun.data.angle=.38;sun.rotation_euler=(.55,-.45,-.35)
bpy.ops.object.light_add(type='AREA',location=(-35,-30,85));area=bpy.context.object
area.data.energy=1350;area.data.shape='DISK';area.data.size=55;look_at(area,(0,8,0))
bpy.ops.object.light_add(type='AREA',location=(70,25,45));fill=bpy.context.object
fill.data.energy=850;fill.data.size=45;look_at(fill,(0,5,0))

os.makedirs(os.path.dirname(OUT),exist_ok=True)
scene.render.filepath=OUT
bpy.ops.render.render(write_still=True)
print(f'RENDERED {OUT}')

camera.location=(46,-61,45);camera.data.lens=56;look_at(camera,(0,-4,.5))
scene.render.filepath=CLOSE
bpy.ops.render.render(write_still=True)
print(f'RENDERED {CLOSE}')
