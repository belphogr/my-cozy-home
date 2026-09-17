"""Deterministic helpers shared by the Bali intro Blender recipe."""
from __future__ import annotations

import math
import os
import bpy
from mathutils import Vector


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def collection(name: str):
    item = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(item)
    return item


def move_to(obj, target):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    target.objects.link(obj)
    return obj


def material(name, color, roughness=.72, metallic=0.0, alpha=1.0, emission=None):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, alpha)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Alpha'].default_value = alpha
        if emission:
            bsdf.inputs['Emission Color'].default_value = (*emission, 1)
            bsdf.inputs['Emission Strength'].default_value = 1.6
    if alpha < 1:
        mat.surface_render_method = 'DITHERED'
        mat.use_transparency_overlap = False
    return mat


def textured_material(name, texture_path, roughness=.72, metallic=0.0, alpha=1.0,
                      transmission=0.0, ior=1.45, tint=(1.0, 1.0, 1.0)):
    """Create one reusable, glTF-safe material master backed by a local image."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = next((node for node in nodes if node.type == 'BSDF_PRINCIPLED'), None)
    if bsdf is None:
        raise RuntimeError(f'No Principled shader available for {name}')
    image = bpy.data.images.load(texture_path, check_existing=True)
    image.colorspace_settings.name = 'sRGB'
    texture = nodes.new('ShaderNodeTexImage')
    texture.name = f'{name}_BaseColor'
    texture.label = os.path.basename(texture_path)
    texture.image = image
    texture.interpolation = 'Linear'
    texture.extension = 'REPEAT'
    links.new(texture.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Alpha'].default_value = alpha
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = .08 if roughness < .45 else .02
    if 'IOR' in bsdf.inputs:
        bsdf.inputs['IOR'].default_value = ior
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    if alpha < 1:
        mat.surface_render_method = 'DITHERED'
        mat.use_transparency_overlap = False
    mat.diffuse_color = (*tint, alpha)
    return mat


def ensure_projected_uv(obj, scale=None):
    """Assign stable box-style UVs to procedural meshes without adding modifiers."""
    if obj.type != 'MESH' or not obj.data.polygons:
        return obj
    mesh = obj.data
    if scale is None:
        name = obj.name.lower()
        if any(token in name for token in ('island_', 'beach_', 'islet_', 'lagoonshelf_')):
            scale = .012
        elif any(token in name for token in ('canopy', 'palm', 'flower')):
            scale = .28
        elif 'roof' in name:
            scale = .32
        else:
            scale = .16
    uv_layer = mesh.uv_layers.active or mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        normal = poly.normal
        axis = max(range(3), key=lambda item: abs(normal[item]))
        for loop_index in poly.loop_indices:
            co = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            if axis == 2:
                uv = (co.x * scale, co.y * scale)
            elif axis == 1:
                uv = (co.x * scale, co.z * scale)
            else:
                uv = (co.y * scale, co.z * scale)
            uv_layer.data[loop_index].uv = uv
    return obj


def cube(name, size, location, mat=None, bevel=0.0, rotation=(0, 0, 0), target=None):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        modifier = obj.modifiers.new('Construction edge', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 2
    if target:
        move_to(obj, target)
    return obj


def cylinder(name, radius, depth, location, mat=None, vertices=12, rotation=(0, 0, 0), target=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if target:
        move_to(obj, target)
    return obj


def sphere(name, scale, location, mat=None, segments=12, rings=6, target=None):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if target:
        move_to(obj, target)
    return obj


def mesh_object(name, verts, faces, mat, target, material_indices=None, extra_materials=()):
    mesh = bpy.data.meshes.new(f'{name}_Mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    target.objects.link(obj)
    if mat:
        mesh.materials.append(mat)
    for item in extra_materials:
        mesh.materials.append(item)
    if material_indices:
        for poly, index in zip(mesh.polygons, material_indices):
            poly.material_index = index
    ensure_projected_uv(obj)
    return obj


def empty(name, location=(0, 0, 0), target=None):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = 'PLAIN_AXES'
    obj.empty_display_size = .3
    obj.location = location
    (target or bpy.context.scene.collection).objects.link(obj)
    return obj


def parent_local(obj, parent):
    obj.parent = parent
    return obj


def animate_build(obj, start, duration=34, drop=5.0, twist=0.0, prefix='HouseBuild'):
    final_location = obj.location.copy()
    final_rotation = obj.rotation_euler.copy()
    final_scale = obj.scale.copy()
    obj.location = final_location + Vector((0, 0, -drop))
    obj.rotation_euler.z = final_rotation.z + twist
    obj.scale = final_scale * .86
    obj.keyframe_insert('location', frame=start)
    obj.keyframe_insert('rotation_euler', frame=start)
    obj.keyframe_insert('scale', frame=start)
    obj.location = final_location + Vector((0, 0, .10))
    obj.rotation_euler = final_rotation
    obj.scale = final_scale * 1.012
    obj.keyframe_insert('location', frame=start + duration - 5)
    obj.keyframe_insert('rotation_euler', frame=start + duration - 5)
    obj.keyframe_insert('scale', frame=start + duration - 5)
    obj.location = final_location
    obj.scale = final_scale
    obj.keyframe_insert('location', frame=start + duration)
    obj.keyframe_insert('scale', frame=start + duration)
    if obj.animation_data and obj.animation_data.action:
        obj.animation_data.action.name = f'{prefix}__{obj.name}'


def animate_growth(obj, start, duration=52):
    """Lift vegetation from below grade without radial X/Y scaling."""
    final = obj.scale.copy()
    final_location = obj.location.copy()
    bpy.context.view_layer.update()
    mesh_objects = [item for item in [obj, *obj.children_recursive] if item.type == 'MESH']
    points = [item.matrix_world @ Vector(corner) for item in mesh_objects for corner in item.bound_box]
    height = (max((point.z for point in points), default=2.0) - min((point.z for point in points), default=0.0))
    drop = max(1.25, min(5.0, height * 1.08))
    obj.location = final_location + Vector((0, 0, -drop))
    obj.scale = (final.x, final.y, final.z * .72)
    obj.keyframe_insert('location', frame=start)
    obj.keyframe_insert('scale', frame=start)
    obj.location = final_location + Vector((0, 0, .08))
    obj.scale = (final.x, final.y, final.z * 1.025)
    obj.keyframe_insert('location', frame=start + duration - 7)
    obj.keyframe_insert('scale', frame=start + duration - 7)
    obj.location = final_location
    obj.scale = final
    obj.keyframe_insert('location', frame=start + duration)
    obj.keyframe_insert('scale', frame=start + duration)
    if obj.animation_data and obj.animation_data.action:
        obj.animation_data.action.name = f'ValleyGrowth__{obj.name}'


def import_asset(path, name, location, target, fit_height=None, fit_longest=None, rotation=(0, 0, 0)):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    imported = [obj for obj in bpy.data.objects if obj not in before]
    meshes = [obj for obj in imported if obj.type == 'MESH']
    if not meshes:
        raise RuntimeError(f'No mesh in {path}')
    points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    lo = Vector((min(v.x for v in points), min(v.y for v in points), min(v.z for v in points)))
    hi = Vector((max(v.x for v in points), max(v.y for v in points), max(v.z for v in points)))
    size = hi - lo
    scale = 1.0
    if fit_height:
        scale = fit_height / max(size.z, .001)
    elif fit_longest:
        scale = fit_longest / max(size.x, size.y, size.z, .001)
    root = empty(name, location, target)
    root.rotation_euler = rotation
    roots = [obj for obj in imported if obj.parent not in imported]
    center = Vector(((lo.x + hi.x) * .5, (lo.y + hi.y) * .5, lo.z))
    for obj in roots:
        world = obj.matrix_world.copy()
        world.translation -= center
        obj.parent = root
        obj.matrix_world = world
    root.scale = (scale, scale, scale)
    for obj in imported:
        for old in list(obj.users_collection):
            old.objects.unlink(obj)
        target.objects.link(obj)
    return root


def save_and_export(blend_path, glb_path, frame_end=900):
    scene = bpy.context.scene
    os.makedirs(os.path.dirname(blend_path), exist_ok=True)
    os.makedirs(os.path.dirname(glb_path), exist_ok=True)
    scene.frame_set(frame_end)
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_animations=True,
        export_nla_strips=False,
        export_frame_range=True,
        export_cameras=False,
        export_lights=False,
    )
