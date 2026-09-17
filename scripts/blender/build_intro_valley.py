import bpy
import math
import os
import random
from mathutils import Vector

FPS = 30
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BLEND_PATH = os.path.join(ROOT, 'blender', 'intro-valley.blend')
GLB_PATH = os.path.join(ROOT, 'public', 'assets', 'intro', 'valley-intro.glb')
random.seed(24)


def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, metallic=0.0, roughness=0.72, alpha=1.0, emission=None):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, alpha)
    mat.use_nodes = True
    bsdf = next(node for node in mat.node_tree.nodes if node.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if alpha < 1:
        bsdf.inputs['Alpha'].default_value = alpha
        mat.surface_render_method = 'DITHERED'
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*emission, 1)
        bsdf.inputs['Emission Strength'].default_value = 1.8
    return mat


def cube(name, size, location, mat, bevel=0.05, rotation=(0, 0, 0), collection=None):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft_Edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
    if collection:
        for old in list(obj.users_collection):
            old.objects.unlink(obj)
        collection.objects.link(obj)
    return obj


def cylinder(name, radius, depth, location, mat, vertices=12, rotation=(0, 0, 0), collection=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if collection:
        for old in list(obj.users_collection):
            old.objects.unlink(obj)
        collection.objects.link(obj)
    return obj


def uv_sphere(name, scale, location, mat, segments=16, rings=8, collection=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if collection:
        for old in list(obj.users_collection):
            old.objects.unlink(obj)
        collection.objects.link(obj)
    return obj


def empty(name, location=(0, 0, 0), collection=None):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = 'PLAIN_AXES'
    obj.empty_display_size = 0.25
    obj.location = location
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def set_linear(obj):
    # Blender 5 stores curves in layered action slots. The default Bezier
    # interpolation is the desired weighted construction motion.
    return


def animate_build(obj, start, duration=24, drop=4.0, twist=0.0, scale_from=0.82):
    final_loc = obj.location.copy()
    final_rot = obj.rotation_euler.copy()
    final_scale = obj.scale.copy()
    obj.location = final_loc + Vector((0, 0, -drop))
    obj.rotation_euler.z = final_rot.z + twist
    obj.scale = final_scale * scale_from
    obj.keyframe_insert('location', frame=start)
    obj.keyframe_insert('rotation_euler', frame=start)
    obj.keyframe_insert('scale', frame=start)
    obj.location = final_loc + Vector((0, 0, 0.12))
    obj.rotation_euler = final_rot
    obj.scale = final_scale * 1.015
    obj.keyframe_insert('location', frame=start + duration - 4)
    obj.keyframe_insert('rotation_euler', frame=start + duration - 4)
    obj.keyframe_insert('scale', frame=start + duration - 4)
    obj.location = final_loc
    obj.scale = final_scale
    obj.keyframe_insert('location', frame=start + duration)
    obj.keyframe_insert('scale', frame=start + duration)
    if obj.animation_data and obj.animation_data.action:
        obj.animation_data.action.name = f'HouseBuild__{obj.name}'
    set_linear(obj)


def animate_growth(obj, start, duration=42):
    final_scale = obj.scale.copy()
    obj.scale = (final_scale.x * 0.04, final_scale.y * 0.04, final_scale.z * 0.02)
    obj.keyframe_insert('scale', frame=start)
    obj.scale = (final_scale.x * 1.06, final_scale.y * 1.06, final_scale.z * 1.03)
    obj.keyframe_insert('scale', frame=start + duration - 6)
    obj.scale = final_scale
    obj.keyframe_insert('scale', frame=start + duration)
    if obj.animation_data and obj.animation_data.action:
        obj.animation_data.action.name = f'ValleyGrowth__{obj.name}'
    set_linear(obj)


def create_terrain(mats, static_collection):
    size = 34
    steps = 40
    verts = []
    faces = []
    for iy in range(steps + 1):
        y = -size / 2 + size * iy / steps
        for ix in range(steps + 1):
            x = -size / 2 + size * ix / steps
            r = math.sqrt((x * 0.72) ** 2 + (y * 0.72) ** 2)
            bowl = max(0, r - 6.5) * 0.12
            ridges = 0.28 * math.sin(x * 0.48) * math.cos(y * 0.35) + 0.12 * math.sin((x + y) * 0.9)
            path_flat = math.exp(-((x / 2.8) ** 2 + ((y + 4) / 9) ** 2))
            z = -0.34 + bowl + ridges * (1 - path_flat * 0.72)
            verts.append((x, y, z))
    row = steps + 1
    for iy in range(steps):
        for ix in range(steps):
            a = iy * row + ix
            faces.append((a, a + 1, a + row + 1, a + row))
    mesh = bpy.data.meshes.new('ValleyTerrainMesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    terrain = bpy.data.objects.new('Terrain_Valley', mesh)
    static_collection.objects.link(terrain)
    terrain.data.materials.append(mats['earth'])

    # A stone path fixes the final camera scale and leads to the physical door.
    for i in range(14):
        y = -11.7 + i * 0.72
        x = math.sin(i * 0.72) * 0.28
        stone = cube(f'PathStone_{i:02d}', (1.35 + (i % 3) * 0.16, 0.58, 0.09), (x, y, -0.03), mats['stone'], 0.12,
                     rotation=(0, 0, math.sin(i) * 0.05), collection=static_collection)
        stone.scale.z *= 0.75

    # River ribbon to the left of the house.
    river_pts = [(-6.4, -13, -0.18), (-5.8, -8, -0.16), (-6.8, -3, -0.12), (-6.0, 2, -0.1), (-7.1, 7, 0.02)]
    verts, faces = [], []
    width = 0.85
    for i, point in enumerate(river_pts):
        x, y, z = point
        verts.extend([(x - width, y, z), (x + width, y, z)])
        if i:
            k = i * 2
            faces.append((k - 2, k - 1, k + 1, k))
    mesh = bpy.data.meshes.new('RiverMesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    river = bpy.data.objects.new('Water_River', mesh)
    static_collection.objects.link(river)
    river.data.materials.append(mats['water'])
    return terrain, river


def create_tree(index, location, scale, mats, growth_collection, start):
    root = empty(f'Tree_{index:02d}', location, growth_collection)
    trunk = cylinder(f'Tree_{index:02d}_Trunk', 0.16 * scale, 2.1 * scale, (0, 0, 1.05 * scale), mats['bark'], 9, collection=growth_collection)
    trunk.parent = root
    for j, offset in enumerate(((-0.25, 0, 2.0), (0.28, 0.08, 2.15), (0, -0.18, 2.48))):
        crown = uv_sphere(f'Tree_{index:02d}_Crown_{j}', (0.72 * scale, 0.62 * scale, 0.82 * scale), offset, mats['leaf'], 12, 6, growth_collection)
        crown.parent = root
    animate_growth(root, start, 46)
    return root


def create_valley_growth(mats, growth_collection):
    groups = []
    positions = [(-10, -6, 0.0), (-11, 1, 0.5), (-9, 7, 0.7), (10, -5, 0.3), (11, 1, 0.6), (9, 7, 0.7),
                 (-4.5, 5.5, -0.05), (5.0, 6.3, -0.02), (-4.8, -3.4, -0.12), (5.2, -2.9, -0.08)]
    for i, pos in enumerate(positions):
        groups.append(create_tree(i, pos, 0.82 + (i % 4) * 0.12, mats, growth_collection, 332 + i * 7))

    # Grass and flower clusters rise in staggered waves around the house and path.
    for i in range(18):
        angle = i * 2.399
        radius = 4.7 + (i % 5) * 0.72
        x = math.cos(angle) * radius
        y = math.sin(angle) * radius - 0.6
        root = empty(f'GardenCluster_{i:02d}', (x, y, -0.08), growth_collection)
        for j in range(5):
            a = j * 1.257 + i
            leaf = uv_sphere(f'GardenCluster_{i:02d}_Leaf_{j}', (0.28, 0.16, 0.42 + 0.06 * (j % 2)),
                             (math.cos(a) * 0.38, math.sin(a) * 0.28, 0.25 + 0.06 * j), mats['leaf2'], 8, 5, growth_collection)
            leaf.rotation_euler = (0.18 * math.sin(a), 0.42 * math.cos(a), a)
            leaf.parent = root
        for j in range(3):
            flower = uv_sphere(f'GardenCluster_{i:02d}_Flower_{j}', (0.13, 0.13, 0.09),
                               ((j - 1) * 0.25, 0.05 * ((i + j) % 2), 0.72 + 0.09 * j), mats['flower' if i % 2 else 'flower2'], 9, 5, growth_collection)
            flower.parent = root
        animate_growth(root, 325 + i * 4, 38)
        groups.append(root)
    return groups


def create_house(mats, build_collection):
    parts = []

    def add(obj, order, duration=24, drop=4.0, twist=0.0):
        parts.append((obj, order, duration, drop, twist))
        return obj

    # Foundation and deck.
    add(cube('Build_Foundation', (8.4, 6.5, 0.38), (0, 0, 0.12), mats['foundation'], 0.1, collection=build_collection), 0, 30, 1.5)
    add(cube('Build_FrontDeck', (6.8, 2.1, 0.22), (0, -4.05, 0.22), mats['wood'], 0.08, collection=build_collection), 1, 26, 1.8)

    # Twelve structural posts.
    post_positions = [(-3.5, -2.75), (3.5, -2.75), (-3.5, 2.55), (3.5, 2.55), (-1.75, -2.75), (1.75, -2.75),
                      (-3.5, 0), (3.5, 0), (-1.75, 2.55), (1.75, 2.55)]
    for i, (x, y) in enumerate(post_positions):
        add(cube(f'Build_Post_{i:02d}', (0.24, 0.24, 3.8), (x, y, 2.1), mats['wood_dark'], 0.035, collection=build_collection), 2 + i // 3, 23, 4.6, (-0.08 if i % 2 else 0.08))

    # Main wall panels: green plaster framed by warm timber.
    panels = [
        ('FrontLeft', (2.9, 0.18, 3.25), (-2.05, -2.66, 1.82), mats['green']),
        ('FrontRight', (2.9, 0.18, 3.25), (2.05, -2.66, 1.82), mats['green']),
        ('BackLeft', (3.35, 0.18, 3.25), (-1.75, 2.46, 1.82), mats['cream']),
        ('BackRight', (3.35, 0.18, 3.25), (1.75, 2.46, 1.82), mats['cream']),
        ('SideLeftA', (0.18, 2.55, 3.25), (-3.41, -1.34, 1.82), mats['cream']),
        ('SideLeftB', (0.18, 2.55, 3.25), (-3.41, 1.28, 1.82), mats['cream']),
        ('SideRightA', (0.18, 2.55, 3.25), (3.41, -1.34, 1.82), mats['green']),
        ('SideRightB', (0.18, 2.55, 3.25), (3.41, 1.28, 1.82), mats['green']),
    ]
    for i, (name, size, loc, mat) in enumerate(panels):
        add(cube(f'Build_Wall_{name}', size, loc, mat, 0.045, collection=build_collection), 6 + i // 2, 26, 4.2, (0.06 if i % 2 else -0.06))

    # Continuous beams make the architecture read as the same timber atelier.
    beams = [
        ('FrontTop', (7.3, 0.28, 0.32), (0, -2.78, 3.72)), ('BackTop', (7.3, 0.28, 0.32), (0, 2.58, 3.72)),
        ('LeftTop', (0.28, 5.3, 0.32), (-3.52, 0, 3.72)), ('RightTop', (0.28, 5.3, 0.32), (3.52, 0, 3.72)),
        ('FrontMid', (7.0, 0.18, 0.18), (0, -2.82, 2.55)), ('BackMid', (7.0, 0.18, 0.18), (0, 2.62, 2.55)),
    ]
    for i, (name, size, loc) in enumerate(beams):
        add(cube(f'Build_Beam_{name}', size, loc, mats['wood_dark'], 0.035, collection=build_collection), 9 + i // 2, 22, 4.6)

    # Window frames and glass panels.
    window_specs = [(-2.1, -2.80, 2.05), (2.1, -2.80, 2.05), (-3.53, -0.65, 2.05), (-3.53, 0.9, 2.05), (3.53, 0.7, 2.05)]
    for i, (x, y, z) in enumerate(window_specs):
        side = abs(x) > 3.5
        glass_size = (0.04, 1.05, 1.65) if side else (1.18, 0.04, 1.65)
        glass = cube(f'Build_WindowGlass_{i:02d}', glass_size, (x, y, z), mats['glass'], 0.01, collection=build_collection)
        add(glass, 11 + i // 2, 22, 3.5)
        if side:
            for sy in (-0.58, 0.58):
                add(cube(f'Build_WindowFrame_{i:02d}_{sy:+.0f}', (0.12, 0.12, 1.9), (x, y + sy, z), mats['wood'], 0.025, collection=build_collection), 11 + i // 2, 22, 3.5)
        else:
            for sx in (-0.68, 0.68):
                add(cube(f'Build_WindowFrame_{i:02d}_{sx:+.0f}', (0.12, 0.12, 1.9), (x + sx, y, z), mats['wood'], 0.025, collection=build_collection), 11 + i // 2, 22, 3.5)

    # Physical double doors parented to true hinge pivots.
    left_pivot = empty('Door_Left_Pivot', (-0.92, -2.91, 0.42), build_collection)
    right_pivot = empty('Door_Right_Pivot', (0.92, -2.91, 0.42), build_collection)
    left = cube('Door_Left', (0.9, 0.18, 2.6), (0.45, 0, 1.3), mats['door'], 0.045, collection=build_collection)
    right = cube('Door_Right', (0.9, 0.18, 2.6), (-0.45, 0, 1.3), mats['door'], 0.045, collection=build_collection)
    left.parent, right.parent = left_pivot, right_pivot
    for pivot, sign in ((left_pivot, 1), (right_pivot, -1)):
        # Raised rails and stiles give the door real depth at the final close-up.
        panel_center = 0.45 * sign
        for suffix, size, loc in (
            ('Outer', (0.72, 0.055, 0.055), (panel_center, -0.115, 0.18)),
            ('Mid', (0.72, 0.055, 0.055), (panel_center, -0.115, 1.08)),
            ('Top', (0.72, 0.055, 0.055), (panel_center, -0.115, 2.42)),
            ('HingeStile', (0.055, 0.055, 2.28), (panel_center + 0.33 * sign, -0.115, 1.30)),
            ('LatchStile', (0.055, 0.055, 2.28), (panel_center - 0.33 * sign, -0.115, 1.30)),
        ):
            trim = cube(f'Door_Trim_{"Left" if sign == 1 else "Right"}_{suffix}', size, loc, mats['wood_dark'], 0.018, collection=build_collection)
            trim.parent = pivot
        glass = cube(f'Door_Glass_{"Left" if sign == 1 else "Right"}', (0.60, 0.028, 0.70), (panel_center, -0.125, 1.72), mats['glass'], 0.008, collection=build_collection)
        glass.parent = pivot
        handle = cylinder(f'Door_Handle_{"Left" if sign == 1 else "Right"}', 0.055, 0.32, (sign * 0.16, -0.18, 1.34), mats['brass'], 14, rotation=(math.pi / 2, 0, 0), collection=build_collection)
        handle.parent = pivot
        lever = cube(f'Door_Lever_{"Left" if sign == 1 else "Right"}', (0.32, 0.07, 0.07), (sign * 0.02, -0.27, 1.42), mats['brass'], 0.03, collection=build_collection)
        lever.parent = pivot
        add(pivot, 14, 28, 4.0, -0.08 * sign)

    # Pitched roof built from two solid panels and a ridge.
    roof_angle = math.radians(25)
    add(cube('Build_Roof_Left', (4.15, 6.25, 0.24), (-1.75, 0, 4.42), mats['roof'], 0.07,
             rotation=(0, roof_angle, 0), collection=build_collection), 15, 34, 5.8, -0.08)
    add(cube('Build_Roof_Right', (4.15, 6.25, 0.24), (1.75, 0, 4.42), mats['roof'], 0.07,
             rotation=(0, -roof_angle, 0), collection=build_collection), 15, 34, 5.8, 0.08)
    add(cube('Build_Roof_Ridge', (0.28, 6.4, 0.3), (0, 0, 5.25), mats['wood_dark'], 0.05, collection=build_collection), 16, 25, 5.8)
    add(cube('Build_Chimney', (0.68, 0.68, 1.8), (-2.0, 1.1, 5.05), mats['stone'], 0.08, collection=build_collection), 17, 27, 5.5)

    # A glass garden wing and pergola echo the open courtyard of the current room.
    for i, x in enumerate((4.4, 5.65, 6.9)):
        add(cube(f'Build_GlassWingPost_{i}', (0.18, 0.18, 3.1), (x, 0.9, 1.75), mats['wood_dark'], 0.03, collection=build_collection), 13 + i, 22, 4.1)
    add(cube('Build_GlassWingRoof', (3.8, 3.7, 0.12), (5.5, 0.9, 3.45), mats['glass'], 0.02, rotation=(0, -0.08, 0), collection=build_collection), 16, 30, 4.8)
    add(cube('Build_GlassWingWall', (0.08, 3.5, 2.85), (6.92, 0.9, 1.82), mats['glass'], 0.02, collection=build_collection), 16, 27, 4.1)
    for i, y in enumerate((-1.7, -0.7, 0.3, 1.3, 2.3)):
        add(cube(f'Build_PergolaSlat_{i}', (3.8, 0.12, 0.16), (5.3, y, 3.72), mats['wood'], 0.025, collection=build_collection), 17 + i // 2, 20, 4.5)

    # A proper porch canopy and step anchor the doorway to the facade.
    add(cube('Build_PorchHeader', (2.65, 0.34, 0.28), (0, -3.02, 3.43), mats['wood_dark'], 0.035, collection=build_collection), 13, 24, 4.0)
    add(cube('Build_PorchCanopy', (3.25, 1.18, 0.16), (0, -3.42, 3.62), mats['roof'], 0.045, rotation=(math.radians(-6), 0, 0), collection=build_collection), 15, 26, 4.8)
    add(cube('Build_DoorStep', (2.55, 0.85, 0.18), (0, -3.18, 0.20), mats['stone'], 0.06, collection=build_collection), 13, 22, 2.0)

    # Animate only top-level build parts; children follow hinge pivots.
    for obj, order, duration, drop, twist in parts:
        start = 105 + min(order, 19) * 10
        animate_build(obj, start, duration, drop, twist)
    return parts, left_pivot, right_pivot


def create_camera_markers(markers_collection):
    positions = [
        (14.0, -16.0, 12.5), (17.0, -6.0, 10.5), (12.0, 9.5, 8.2), (2.0, 13.0, 6.4),
        (-8.5, 5.0, 4.8), (-5.4, -6.4, 3.1), (0.0, -11.4, 1.95), (0.0, -8.35, 1.72),
    ]
    targets = [(0, 0, 1.2), (0, 0, 1.5), (0, 0, 1.8), (0, 0, 1.9), (0, -0.2, 1.8), (0, -1.3, 1.65), (0, -2.7, 1.55), (0, -2.9, 1.55)]
    for i, (pos, target) in enumerate(zip(positions, targets)):
        empty(f'Cam_{i:02d}', pos, markers_collection)
        empty(f'Target_{i:02d}', target, markers_collection)
    empty('Door_Approach', (0, -5.85, 1.62), markers_collection)


def create_world():
    reset_scene()
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.fps = FPS
    scene.frame_start = 0
    scene.frame_end = 600
    scene.world.color = (0.035, 0.045, 0.038)

    static_collection = bpy.data.collections.new('Valley_Static')
    build_collection = bpy.data.collections.new('House_Build')
    growth_collection = bpy.data.collections.new('Valley_Growth')
    markers_collection = bpy.data.collections.new('Camera_Markers')
    scene.collection.children.link(static_collection)
    scene.collection.children.link(build_collection)
    scene.collection.children.link(growth_collection)
    scene.collection.children.link(markers_collection)

    mats = {
        'earth': material('Ground_Earth', (0.24, 0.19, 0.12), roughness=0.96),
        'grass': material('Ground_Lush', (0.18, 0.29, 0.13), roughness=0.94),
        'stone': material('Stone_Warm', (0.39, 0.35, 0.28), roughness=0.92),
        'foundation': material('Foundation_Stone', (0.34, 0.31, 0.25), roughness=0.9),
        'wood': material('Wood_Warm', (0.38, 0.18, 0.075), roughness=0.72),
        'wood_dark': material('Wood_Frame_Dark', (0.18, 0.075, 0.035), roughness=0.68),
        'door': material('Door_Honey', (0.52, 0.28, 0.08), roughness=0.58),
        'roof': material('Roof_Terracotta', (0.30, 0.12, 0.055), roughness=0.85),
        'cream': material('Plaster_Cream', (0.64, 0.56, 0.43), roughness=0.9),
        'green': material('Wall_Deep_Green', (0.10, 0.19, 0.115), roughness=0.88),
        'glass': material('Glass_Garden', (0.20, 0.39, 0.34), metallic=0.04, roughness=0.14, alpha=0.36),
        'water': material('Water_River', (0.08, 0.31, 0.34), metallic=0.05, roughness=0.18, alpha=0.72),
        'brass': material('Metal_Brass', (0.62, 0.42, 0.12), metallic=0.82, roughness=0.24),
        'bark': material('Tree_Bark', (0.16, 0.085, 0.035), roughness=0.92),
        'leaf': material('Leaf_Canopy', (0.10, 0.27, 0.10), roughness=0.82),
        'leaf2': material('Leaf_Garden', (0.18, 0.36, 0.14), roughness=0.8),
        'flower': material('Flower_Cream', (0.92, 0.77, 0.54), roughness=0.78),
        'flower2': material('Flower_Coral', (0.76, 0.33, 0.23), roughness=0.8),
        'warm': material('Interior_Warm_Light', (0.88, 0.48, 0.18), roughness=0.7, emission=(1.0, 0.38, 0.08)),
    }
    create_terrain(mats, static_collection)
    create_house(mats, build_collection)
    create_valley_growth(mats, growth_collection)
    create_camera_markers(markers_collection)

    # Low-poly mountain silhouettes close the horizon without expensive geometry.
    for i in range(18):
        angle = i / 18 * math.tau
        radius = 14.5 + (i % 3) * 1.6
        height = 3.2 + (i % 5) * 0.85
        bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=3.4 + (i % 4) * 0.55, radius2=0.28, depth=height,
                                        location=(math.cos(angle) * radius, math.sin(angle) * radius, height / 2 - 0.1))
        mountain = bpy.context.object
        mountain.name = f'Mountain_{i:02d}'
        mountain.data.materials.append(mats['earth'])
        for old in list(mountain.users_collection):
            old.objects.unlink(mountain)
        static_collection.objects.link(mountain)

    os.makedirs(os.path.dirname(BLEND_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
    scene.frame_set(600)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format='GLB',
        export_apply=True,
        export_animations=True,
        export_nla_strips=False,
        export_frame_range=True,
        export_cameras=False,
        export_lights=False,
    )
    print(f'CREATED {BLEND_PATH}')
    print(f'CREATED {GLB_PATH}')


if __name__ == '__main__':
    create_world()
