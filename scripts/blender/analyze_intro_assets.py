import bpy
import os
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ASSETS = ['poolshell', 'lounger', 'gardenentry', 'palm', 'broadleaf', 'fern', 'flowers', 'understory', 'desk', 'chair', 'sofa', 'pendant']

for asset in ASSETS:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path = os.path.join(ROOT, 'public', 'assets', 'models', 'atelier', f'{asset}.glb')
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    lo = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    hi = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    tris = sum(len(obj.data.loop_triangles) if obj.data.loop_triangles else len(obj.data.polygons) for obj in meshes)
    print(f'ASSET {asset:12} meshes={len(meshes):3} faces={tris:7} size={tuple(round(v, 3) for v in (hi-lo))} min={tuple(round(v, 3) for v in lo)}')
