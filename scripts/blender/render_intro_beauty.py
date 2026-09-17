"""Render material/lighting QA stills from the final Bali intro scene."""
from __future__ import annotations

import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT_DIR = os.path.join(ROOT, 'references', 'intro-bali')
OVERVIEW = os.path.join(OUT_DIR, 'beauty-overview-v1.png')
ESTATE = os.path.join(OUT_DIR, 'beauty-main-estate-v1.png')
DOORSTEP = os.path.join(OUT_DIR, 'beauty-doorstep-v1.png')


def look_at(obj, target):
    obj.rotation_euler = ((Vector(target) - obj.location).to_track_quat('-Z', 'Y')).to_euler()


def area_light(name, location, target, energy, size, color):
    bpy.ops.object.light_add(type='AREA', location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.shape = 'DISK'
    light.data.size = size
    light.data.color = color
    look_at(light, target)
    return light


scene = bpy.context.scene
scene.frame_set(scene.frame_end)
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1440
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.view_settings.look = 'AgX - Medium High Contrast'

# Replace the flat world with a physical tropical sky and restrained golden-hour light.
world = scene.world or bpy.data.worlds.new('Bali Beauty World')
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
links = world.node_tree.links
nodes.clear()
output = nodes.new('ShaderNodeOutputWorld')
background = nodes.new('ShaderNodeBackground')
sky = nodes.new('ShaderNodeTexSky')
sky.sky_type = 'MULTIPLE_SCATTERING'
sky.sun_elevation = .26
sky.sun_rotation = 2.3
sky.altitude = .12
sky.air_density = 1.0
background.inputs['Strength'].default_value = .42
links.new(sky.outputs['Color'], background.inputs['Color'])
links.new(background.outputs['Background'], output.inputs['Surface'])

for obj in list(bpy.data.objects):
    if obj.type in {'LIGHT', 'CAMERA'}:
        bpy.data.objects.remove(obj, do_unlink=True)

bpy.ops.object.light_add(type='SUN', location=(0, -20, 90))
sun = bpy.context.object
sun.name = 'Beauty_Sun'
sun.data.energy = 2.25
sun.data.angle = .18
sun.data.color = (1.0, .72, .43)
sun.rotation_euler = (.48, -.62, -1.02)
area_light('Beauty_Sky_Fill', (-68, -25, 86), (0, 5, 0), 1050, 58, (.53, .68, 1.0))
area_light('Beauty_Water_Bounce', (56, 12, 30), (0, 4, 0), 760, 38, (.33, .78, .86))

bpy.ops.object.camera_add(location=(122, -142, 112))
camera = bpy.context.object
camera.name = 'Beauty_Review_Camera'
camera.data.lens = 52
camera.data.sensor_width = 36
camera.data.clip_end = 1000
look_at(camera, (0, 12, 0))
scene.camera = camera

os.makedirs(OUT_DIR, exist_ok=True)
scene.render.filepath = OVERVIEW
bpy.ops.render.render(write_still=True)
print(f'RENDERED {OVERVIEW}')

camera.location = (43, -58, 31)
camera.data.lens = 55
camera.data.dof.use_dof = True
camera.data.dof.focus_object = bpy.data.objects.get('Build_MainVilla') or bpy.data.objects.get('Build_MainHouse')
camera.data.dof.aperture_fstop = 7.1
look_at(camera, (0, -5, 1.25))
scene.render.filepath = ESTATE
bpy.ops.render.render(write_still=True)
print(f'RENDERED {ESTATE}')

camera.location = bpy.data.objects['Cam_07'].location
camera.data.lens = 48
camera.data.dof.focus_object = bpy.data.objects.get('Build_GardenGate')
camera.data.dof.aperture_fstop = 5.6
look_at(camera, bpy.data.objects['Target_07'].location)
scene.render.filepath = DOORSTEP
bpy.ops.render.render(write_still=True)
print(f'RENDERED {DOORSTEP}')
