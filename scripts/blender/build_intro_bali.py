"""Build the approved Bali lake-district intro as a deterministic Blender scene."""
from __future__ import annotations

import math
import os
import random
import sys
import bpy

sys.path.insert(0, os.path.dirname(__file__))
from intro_blender_runner import (
    reset_scene, collection, material, textured_material, cube, cylinder, sphere, mesh_object, empty,
    parent_local, animate_build, animate_growth, import_asset, save_and_export,
)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BLEND_PATH = os.path.join(ROOT, 'blender', 'intro-bali.blend')
GLB_PATH = os.path.join(ROOT, 'public', 'assets', 'intro', 'bali-intro.glb')
ASSET_ROOT = os.path.join(ROOT, 'public', 'assets', 'models', 'atelier')
TEXTURE_ROOT = os.path.join(ROOT, 'public', 'assets', 'intro', 'textures')
FPS = 30
FRAME_END = 900
random.seed(7319)

def coast_radius(angle, seed):
    return 1+.07*math.sin(angle*3+seed)+.045*math.sin(angle*5+seed*.7)+.018*math.sin(angle*9+seed)


def island_disc(name, center, rx, ry, top, depth, mat, target, seed, segments=42):
    rng = random.Random(seed)
    radii = [coast_radius(math.tau*i/segments, seed) for i in range(segments)]
    verts = [(center[0], center[1], top), (center[0], center[1], top - depth)]
    for i in range(segments):
        angle = math.tau * i / segments
        radius = radii[i]
        verts.append((center[0] + math.cos(angle) * rx * radius, center[1] + math.sin(angle) * ry * radius, top))
        verts.append((center[0] + math.cos(angle) * rx * radius, center[1] + math.sin(angle) * ry * radius, top - depth))
    faces = []
    for i in range(segments):
        ni = (i + 1) % segments
        ti, bi = 2 + i * 2, 3 + i * 2
        tn, bn = 2 + ni * 2, 3 + ni * 2
        faces.extend([(0, ti, tn), (1, bn, bi), (ti, bi, bn, tn)])
    return mesh_object(name, verts, faces, mat, target)


def island_terrain(name, center, rx, ry, edge_z, relief, mat, target, seed, rings=10, segments=64):
    """Low tropical terrain with an irregular sloped coastline and gentle interior relief."""
    rng = random.Random(seed)
    # Coherent coves instead of independent random radii (saw-tooth shores).
    boundary = [coast_radius(math.tau*i/segments, seed) for i in range(segments)]
    verts=[(center[0],center[1],edge_z+relief)]
    for ring in range(1,rings+1):
        t=ring/rings
        for i in range(segments):
            a=math.tau*i/segments
            beach_variation=1+.025*math.sin(a*2+seed)*t*t if name.startswith('Beach_') else 1
            radius=t*boundary[i]*(1+.035*math.sin(a*3+seed*.4)*(1-t))*beach_variation
            x=center[0]+math.cos(a)*rx*radius
            y=center[1]+math.sin(a)*ry*radius
            broad=(math.sin(x*.075+seed*.8)+math.cos(y*.09-seed*.55)+math.sin((x+y)*.045+seed))*relief*.075
            detail=(math.sin(x*.23+seed)+math.cos(y*.19-seed))*relief*.022
            z=edge_z+relief*(1-t**1.55)+(broad+detail)*(1-t*.72)
            verts.append((x,y,z))
    faces=[]
    for i in range(segments):faces.append((0,1+i,1+(i+1)%segments))
    for ring in range(1,rings):
        inner=1+(ring-1)*segments;outer=1+ring*segments
        for i in range(segments):
            n=(i+1)%segments
            faces.append((inner+i,inner+n,outer+n,outer+i))
    terrain=mesh_object(name,verts,faces,mat,target)
    for polygon in terrain.data.polygons: polygon.use_smooth=True
    return terrain


def palm_cluster(name, center, count, spread, mats, target, seed, scale=1.0):
    rng = random.Random(seed)
    verts, faces, indices = [], [], []

    def add_trunk(x, y, height, radius):
        base = len(verts)
        sides = 6
        lean_x, lean_y = rng.uniform(-.18, .18), rng.uniform(-.18, .18)
        for z, dx, dy in ((0, 0, 0), (height, lean_x, lean_y)):
            for i in range(sides):
                a = math.tau * i / sides
                verts.append((x + dx + math.cos(a) * radius, y + dy + math.sin(a) * radius, .05 + z))
        for i in range(sides):
            ni = (i + 1) % sides
            faces.append((base + i, base + ni, base + sides + ni, base + sides + i)); indices.append(0)
        crown = (x + lean_x, y + lean_y, .05 + height)
        for leaf in range(8):
            a = math.tau * leaf / 8 + rng.uniform(-.15, .15)
            length = rng.uniform(1.0, 1.7) * scale
            # A tapered arched ribbon with a central fold, rooted at the crown.
            # Four connected sections read as a drooping palm, not a flat fan.
            b=len(verts)
            near='Main' in name
            sections=4 if near else 2
            stride=3 if near else 2
            for section in range(sections+1):
                t=section/sections
                width=(.055 if near else .24)*scale*math.sin(math.pi*t)**.7
                px=crown[0]+math.cos(a)*length*t
                py=crown[1]+math.sin(a)*length*t
                pz=crown[2]+scale*(.46*math.sin(math.pi*t)-.48*t*t)
                verts.append((px-math.sin(a)*width,py+math.cos(a)*width,pz-width*.28))
                if near:verts.append((px,py,pz))
                verts.append((px+math.sin(a)*width,py-math.cos(a)*width,pz-width*.28))
            for section in range(sections):
                j=b+section*stride
                if near:
                    faces.extend(((j,j+3,j+4,j+1),(j+1,j+4,j+5,j+2)));indices.extend((1,1))
                else:
                    faces.append((j,j+2,j+3,j+1));indices.append(1)
            if near:
                # Pairs of pinnae meet the narrow frond spine at their roots.
                for pinna in range(1,6):
                    t=pinna/7
                    px=crown[0]+math.cos(a)*length*t;py=crown[1]+math.sin(a)*length*t
                    pz=crown[2]+scale*(.46*math.sin(math.pi*t)-.48*t*t)
                    for side in (-1,1):
                        j=len(verts);pa=a+side*1.05
                        plen=.55*scale*math.sin(math.pi*t)
                        verts.extend(((px,py,pz),(px+math.cos(a)*.12,py+math.sin(a)*.12,pz),
                            (px+math.cos(pa)*plen,py+math.sin(pa)*plen,pz-.16)))
                        faces.append((j,j+1,j+2) if side>0 else (j+2,j+1,j));indices.append(1)

    for _ in range(count):
        angle = rng.random() * math.tau
        radius = spread * math.sqrt(rng.random())
        x = center[0] + math.cos(angle) * radius
        y = center[1] + math.sin(angle) * radius
        height = rng.uniform(2.1, 4.2) * scale
        add_trunk(x, y, height, rng.uniform(.10, .17) * scale)
    obj = mesh_object(name, verts, faces, mats['bark'], target, indices, (mats['leaf'],))
    return obj


def canopy_cluster(name, center, count, spread, mats, target, seed, scale=1.0, terrain=None, clearings=()):
    """One merged, low-cost tropical canopy mass for aerial readability."""
    rng = random.Random(seed)
    verts, faces, indices = [], [], []

    def add_crown(x, y, z, sx, sy, sz, shade):
        # Exposed trunk + branching leaf sprays. Open gaps carry the silhouette;
        # no opaque ball is hidden under the leaves.
        base=len(verts);rotation=rng.random()*math.tau
        bottom=z-sz*.78
        for height,radius in ((bottom,.075*scale),(z+sz*.2,.035*scale)):
            for side in range(4):
                a=math.tau*side/4
                verts.append((x+math.cos(a)*radius,y+math.sin(a)*radius,height))
        for side in range(4):
            faces.append((base+side,base+(side+1)%4,base+4+(side+1)%4,base+4+side));indices.append(2)
        for branch in range(4):
            a=rotation+branch*2.4
            bx=x+math.cos(a)*sx*.38;by=y+math.sin(a)*sy*.38
            bz=z+sz*(.48-branch*.18)
            j=len(verts)
            verts.extend(((x-.035,y,z),(x+.035,y,z),(bx,by,bz)))
            faces.append((j,j+1,j+2));indices.append(2)
            for leaf in range(5):
                la=a+math.tau*leaf/5+rng.uniform(-.22,.22)
                length=rng.uniform(.70,1.08)*max(sx,sy)
                width=length*rng.uniform(.22,.34)
                dx=math.cos(la);dy=math.sin(la);j=len(verts)
                verts.extend(((bx,by,bz),
                    (bx+dx*length*.48-dy*width,by+dy*length*.48+dx*width,bz+.14*scale),
                    (bx+dx*length,by+dy*length,bz-.23*scale),
                    (bx+dx*length*.48+dy*width,by+dy*length*.48-dx*width,bz+.10*scale)))
                faces.extend(((j,j+2,j+1),(j,j+3,j+2)));indices.extend((shade,shade))

    # Larger clustered crowns preserve canopy coverage with fewer exported
    # vertices; silhouette density matters more than individual far-away trees.
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    surface=BVHTree.FromPolygons([v.co for v in terrain.data.vertices],[list(p.vertices) for p in terrain.data.polygons]) if terrain else None
    sx_spread,sy_spread=spread if isinstance(spread,tuple) else (spread,spread)
    planted=0
    for _ in range(max(1, int(count*.38))):
        angle = rng.random() * math.tau
        radius = math.sqrt(rng.random())
        x = center[0] + math.cos(angle) * radius*sx_spread
        y = center[1] + math.sin(angle) * radius*sy_spread
        if any(abs(x-cx)<cw and abs(y-cy)<ch for cx,cy,cw,ch in clearings): continue
        ground=0
        if surface:
            hit=surface.ray_cast(Vector((x,y,10)),Vector((0,0,-1)))[0]
            if hit is None or hit.z<-.25:continue
            ground=hit.z
        sx = rng.uniform(1.15, 2.20) * scale
        sy = rng.uniform(1.10, 2.10) * scale
        # Mixed low understorey and taller broadleaf crowns; crown bottoms meet soil.
        sz = rng.uniform(.65,1.10) * scale if rng.random()<.28 else rng.uniform(1.5,2.8)*scale
        z = ground+sz*.78-.025
        shade = 0 if rng.random() < .62 else 1
        add_crown(x,y,z,sx,sy,sz,shade)
        planted+=1
    obj=mesh_object(name, verts, faces, mats['canopy'], target, indices, (mats['canopy_light'],mats['bark']))
    for p in obj.data.polygons:p.use_smooth=True
    # One continuous planar field: avoid box-projection UV seams duplicating
    # vertices on every leaf in the exported aerial meshes.
    uv=obj.data.uv_layers.active.data if obj.data.uv_layers.active else []
    for loop in obj.data.loops:
        co=obj.data.vertices[loop.vertex_index].co
        uv[loop.index].uv=(co.x*.28,co.y*.28)
    obj['grounded_crowns']=planted
    return obj


def flower_bed(name, center, count, spread, mats, target, seed, scale=1.0):
    rng = random.Random(seed)
    verts, faces, indices = [], [], []
    for i in range(count):
        a = rng.random()*math.tau
        r = spread*math.sqrt(rng.random())
        x,y = center[0]+math.cos(a)*r, center[1]+math.sin(a)*r
        h = rng.uniform(.28,.78)*scale
        w = rng.uniform(.10,.18)*scale
        base=len(verts)
        verts.extend([(x-w,y,.03),(x+w,y,.03),(x+w*.45,y,h),(x-w*.45,y,h)])
        faces.append((base,base+1,base+2,base+3));indices.append(0)
        petals=rng.choice((5,6,7)); bloom_base=len(verts)
        verts.append((x,y,h+.02))
        for p in range(petals):
            pa=math.tau*p/petals
            verts.append((x+math.cos(pa)*w*1.65,y+math.sin(pa)*w*1.65,h+rng.uniform(-.015,.015)))
        for p in range(petals):
            faces.append((bloom_base,bloom_base+1+p,bloom_base+1+(p+1)%petals));indices.append(1 if i%3 else 2)
    return mesh_object(name,verts,faces,mats['leaf'],target,indices,(mats['petal'],mats['petal_light']))


def recessed_gate_leaf(name, center, mats, target):
    """Continuous solid door: front frame, sloped reveal, recessed field, back.

    Front is -Y; the inset is .055 m behind the frame face. Every loop
    shares vertices so no ornamental strips conceal gaps in the door.
    """
    verts=[];faces=[]
    for half_width,bottom,top,y in ((.41,0,2.18,-.08),(.31,.14,2.04,-.08),(.275,.175,2.005,-.025)):
        verts.extend(((center-half_width,y,bottom),(center+half_width,y,bottom),
                      (center+half_width,y,top),(center-half_width,y,top)))
    verts.extend(((center-.41,.08,0),(center+.41,.08,0),(center+.41,.08,2.18),(center-.41,.08,2.18)))
    for loop in (0,4):
        for i in range(4):
            n=(i+1)%4;faces.append((loop+i,loop+n,loop+4+n,loop+4+i))
    faces.append((8,9,10,11))
    for i in range(4):
        n=(i+1)%4;faces.append((i,12+i,12+n,n))
    faces.append((15,14,13,12))
    return mesh_object(name,verts,faces,mats['main_door'],target)


def carved_rosette(name,x,y,z,mat,target):
    # Connected petal relief seated 5 mm into the pillar's front plane.
    verts=[(x,y-.065,z)];faces=[];segments=40
    for ring in range(1,4):
        for i in range(segments):
            angle=math.tau*i/segments
            radius=(.045,.095,.145)[ring-1]*(1+.19*math.cos(angle*8))
            depth=(.06,.034,0)[ring-1]
            verts.append((x+math.cos(angle)*radius,y-depth,z+math.sin(angle)*radius))
    for i in range(segments):faces.append((0,1+i,1+(i+1)%segments))
    for ring in range(2):
        a=1+ring*segments;b=a+segments
        for i in range(segments):
            n=(i+1)%segments;faces.append((a+i,b+i,b+n,a+n))
    return mesh_object(name,verts,faces,mat,target)


def hip_roof(name, size_x, size_y, rise, root, mat, target, eave_z=0):
    x, y = size_x / 2, size_y / 2
    ridge = max(.35, x - y)
    verts = [(-x, -y, eave_z), (x, -y, eave_z), (x, y, eave_z), (-x, y, eave_z),
             (-ridge, 0, eave_z + rise), (ridge, 0, eave_z + rise)]
    faces = [(0, 1, 5, 4), (3, 4, 5, 2), (0, 4, 3), (1, 2, 5)]
    roof = mesh_object(name, verts, faces, mat, target)
    modifier = roof.modifiers.new('Real roof thickness', 'SOLIDIFY')
    modifier.thickness = .18
    modifier.offset = -.5
    roof.parent = root
    if name in ('Build_MainHipRoofSurface','Build_PavilionRoof'):
        # Half-round clay ridge caps along the actual ridge and four hip lines.
        from mathutils import Vector
        lines=[((-ridge,0,eave_z+rise),(ridge,0,eave_z+rise))]
        for sign in (-1,1):
            for side in (-1,1):lines.append(((sign*ridge,0,eave_z+rise),(sign*x,side*y,eave_z)))
        cap_verts=[];cap_faces=[]
        for start,end in lines:
            start,end=Vector(start),Vector(end);direction=(end-start).normalized()
            across=direction.cross(Vector((0,0,1))).normalized();up=across.cross(direction).normalized()
            count=max(1,math.ceil((end-start).length/.36))
            for tile in range(count):
                a=start.lerp(end,tile/count);b=start.lerp(end,min(1,(tile+1.05)/count));base=len(cap_verts)
                for point in (a,b):
                    for segment in range(7):
                        angle=math.pi*segment/6
                        cap_verts.append(tuple(point+across*(math.cos(angle)*.105)+up*(math.sin(angle)*.105+.015)))
                for segment in range(6):cap_faces.append((base+segment,base+segment+1,base+segment+8,base+segment+7))
        caps=mesh_object(name+'_RidgeCaps',cap_verts,cap_faces,mat,target);caps.parent=root
    return roof


def distant_villa(index, location, rotation, scale, mats, target, start):
    root = empty(f'DistrictVilla_{index:02d}', location, target)
    root.rotation_euler.z = rotation
    root.scale = (scale, scale, scale)
    courtyard = cube(f'DistrictVilla_{index:02d}_Courtyard', (11.2, 9.2, .16), (0, 0, .02), mats['earth'], .10, target=target)
    foundation = cube(f'DistrictVilla_{index:02d}_Base', (7.0, 5.0, .32), (0, 1.35, .20), mats['foundation'], .05, target=target)
    body = cube(f'DistrictVilla_{index:02d}_Body', (6.2, 4.2, 2.7), (0, 1.35, 1.66), mats['cream'], .05, target=target)
    glass = cube(f'DistrictVilla_{index:02d}_Glass', (3.5, .08, 1.75), (0, -.78, 1.65), mats['glass'], .015, target=target)
    pool = cube(f'DistrictVilla_{index:02d}_Pool', (4.0, 2.3, .12), (1.8, -2.85, .12), mats['water_shallow'], .04, target=target)
    deck = cube(f'DistrictVilla_{index:02d}_Deck', (3.0, 2.9, .12), (-2.2, -2.65, .12), mats['wood'], .03, target=target)
    for child in (courtyard, foundation, body, glass, pool, deck):
        child.parent = root
    roof=hip_roof(f'DistrictVilla_{index:02d}_Roof', 7.3, 5.5, 1.35, root, mats['roof'], target, 3.15);roof.location.y=1.35
    for wall_i,(size,loc) in enumerate((((11.2,.22,1.0),(0,4.5,.44)),((11.2,.22,1.0),(0,-4.5,.44)),((.22,9.0,1.0),(-5.5,0,.44)),((.22,9.0,1.0),(5.5,0,.44)))):
        wall=cube(f'DistrictVilla_{index:02d}_Wall_{wall_i}',size,loc,mats['stone'],.025,target=target);wall.parent=root
    animate_build(root, start, 42, 4.4, (.08 if index % 2 else -.08), 'HouseBuild')
    return root


def coastal_rocks(name,center,rx,ry,seed,mats,target,beach):
    """Grouped volcanic outcrops seated on the beach mesh, not a continuous curb."""
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    surface=BVHTree.FromPolygons([v.co for v in beach.data.vertices],[list(p.vertices) for p in beach.data.polygons])
    rng=random.Random(seed+1800);verts=[];faces=[]
    for cluster in range(13):
        a=rng.random()*math.tau
        for rock in range(rng.randint(2,4)):
            angle=a+rng.uniform(-.025,.025);r=coast_radius(angle,seed)*rng.uniform(.97,1.035)
            x=center[0]+math.cos(angle)*rx*r;y=center[1]+math.sin(angle)*ry*r
            hit=surface.ray_cast(Vector((x,y,10)),Vector((0,0,-1)))[0]
            if hit is None:continue
            w=rng.uniform(.3,.95);h=rng.uniform(.25,.7);b=len(verts)
            for z,rr in ((hit.z-.06,.7),(hit.z+h*.48,1),(hit.z+h,.55)):
                for k in range(5):
                    t=k*math.tau/5
                    verts.append((x+math.cos(t)*w*rr,y+math.sin(t)*w*.8*rr,z+rng.uniform(-.03,.03)))
            for k in range(5):
                n=(k+1)%5
                faces.extend(((b+k,b+n,b+5+n,b+5+k),(b+5+k,b+5+n,b+10+n,b+10+k)))
            faces.append(tuple(b+10+k for k in range(5)))
    obj=mesh_object(name,verts,faces,mats['stone'],target)
    for p in obj.data.polygons:p.use_smooth=True
    return obj


def create_district(mats, static, build, growth):
    # A continuous ocean exists from frame zero; turquoise shelves define lagoons and coves.
    ocean = cube('Ocean_Base', (520, 520, .35), (0, 16, -1.15), mats['water'], .0, target=static)
    ocean.name = 'Water_Ocean'
    islands = [
        ('Main', (0, -5), 37, 29, 1), ('NorthWest', (-34, 45), 34, 20, 2),
        ('NorthEast', (36, 48), 33, 20, 3), ('West', (-56, 4), 31, 23, 4),
        ('East', (57, 7), 33, 24, 5), ('SouthWest', (-58, -38), 24, 18, 6),
        ('SouthEast', (55, -36), 27, 19, 7), ('North', (2, 78), 40, 15, 8),
    ]
    for name, center, rx, ry, seed in islands:
        island_disc(f'LagoonShelf_{name}', center, rx + 4.2, ry + 3.4, -.93, .06, mats['water_shallow'], static, seed, 64)
        beach=island_terrain(f'Beach_{name}', center, rx + 2.0, ry + 1.8, -.98, .70, mats['sand'], static, seed)
        coastal_rocks(f'ShoreRocks_{name}',center,rx,ry,seed,mats,static,beach)
        terrain=island_terrain(f'Island_{name}', center, rx, ry, -.52, .55 if name=='Main' else .68, mats['earth'], static, seed)
        if name == 'Main':
            # The main estate reads as a clearing inside a continuous tropical canopy.
            clusters=((-27,10),(27,11),(-27,-18),(27,-18),(0,20),(-17,2),(18,3),(-17,-8),(18,-8))
            for side, side_center in enumerate(clusters):
                canopy = canopy_cluster(f'DistrictCanopy_Main_{side}', side_center, 72, 7.5, mats, growth, seed + 250 + side, 1.08,terrain,((0,-5,13,14),))
                palms = palm_cluster(f'DistrictPalms_Main_{side}', side_center, 7, 5.5, mats, growth, seed + 300 + side, .96)
                animate_growth(canopy, 5 + side * 5, 65)
                animate_growth(palms, 18 + side * 7, 82)
            fringe=canopy_cluster('DistrictCanopy_Main_Shore',center,260,(rx*.90,ry*.88),mats,growth,960,1.0,terrain,((0,-5,14,14),))
            animate_growth(fringe,8,78)
        else:
            canopy = canopy_cluster(f'DistrictCanopy_{name}', center, 390, (rx*.88,ry*.86), mats, growth, seed + 250, 1.16,terrain,((center[0],center[1],6,5),))
            palms = palm_cluster(f'DistrictPalms_{name}', center, 25, min(rx, ry) * .83, mats, growth, seed + 300, 1.04)
            animate_growth(canopy, 4 + seed * 3, 70)
            animate_growth(palms, 16 + seed * 4, 90)

    # Small natural islets break up the channels and make the lagoon network readable from above.
    for i,(center,rx,ry) in enumerate((((-15,28),7,5),((18,30),8,5),((-24,24),6,4),((30,27),6,4),((-7,58),8,5),((12,62),6,4),((-42,-20),7,5),((39,-18),6,4))):
        island_disc(f'LagoonShelf_Islet_{i}',center,rx+2.2,ry+1.8,-.93,.05,mats['water_shallow'],static,700+i,40)
        island_terrain(f'Islet_{i}',center,rx,ry,-.54,.42,mats['earth'],static,760+i,6,40)
        canopy=canopy_cluster(f'DistrictCanopy_Islet_{i}',center,22,min(rx,ry)*.82,mats,growth,810+i,.72)
        animate_growth(canopy,10+i*4,68)

    villas = [
        ((-38, 45, .14), .25, .78), ((38, 49, .14), -.35, .82), ((-57, 3, .14), .70, .68),
        ((58, 7, .14), -.55, .72), ((-58, -38, .14), .15, .66), ((55, -36, .14), -.2, .68),
        ((-8, 78, .14), .4, .70), ((15, 76, .14), -.35, .62),
    ]
    for i, (loc, rot, scale) in enumerate(villas):
        distant_villa(i, loc, rot, scale, mats, build, 24 + i * 13)

    # Roads and bridges are coarse middle-distance strokes, intentionally not interior-detail density.
    for i in range(24):
        angle = -.85 + i * .052
        x = -20 + i * 1.65
        y = -15 + math.sin(angle * 3.1) * 5.2
        cube(f'RoadStone_{i:02d}', (1.75, .90, .10), (x, y, -.05), mats['stone'], .14, rotation=(0, 0, angle * .16), target=static)
    for bridge_index, (x, y, rot) in enumerate(((-27, 8, .22), (29, 10, -.28), (1, 27, .04))):
        root = empty(f'Bridge_{bridge_index}', (x, y, .0), build)
        root.rotation_euler.z = rot
        for plank in range(9):
            piece = cube(f'Bridge_{bridge_index}_Plank_{plank}', (1.65, .42, .13), (0, (plank - 4) * .46, .13), mats['wood'], .025, target=build)
            piece.parent = root
        animate_build(root, 190 + bridge_index * 24, 38, 2.0, .04)


def create_main_house(mats, build, growth):
    parts = []
    def add(obj, order, duration=34, drop=4.5, twist=0):
        parts.append((obj, order, duration, drop, twist)); return obj

    # Dimensions derived from the approved exterior: 1 : .58 : .43 house massing.
    add(cube('Build_MainFoundation', (13.8, 7.6, .42), (0, 0, .10), mats['foundation'], .08, target=build), 0, 40, 1.5)
    add(cube('Build_LivingFloor', (12.9, 6.7, .20), (0, 0, .35), mats['wood'], .04, target=build), 1, 35, 1.8)

    posts = [(-6.1, -3.0), (6.1, -3.0), (-6.1, 3.0), (6.1, 3.0), (-2.1, -3.0), (2.1, -3.0), (4.2, -3.0), (-2.1, 3.0), (2.1, 3.0)]
    for i, (x, y) in enumerate(posts):
        add(cube(f'Build_TeakPost_{i:02d}', (.25, .25, 3.45), (x, y, 2.02), mats['wood_dark'], .025, target=build), 2 + i // 3, 31, 4.2, .04 * (-1 if i % 2 else 1))

    # Cream envelope and the recognizable dark-green study wall seen through the glass facade.
    walls = [
        ('Back', (12.3, .20, 3.25), (0, 2.88, 1.92), mats['cream']),
        ('Left', (.20, 5.8, 3.25), (-6.0, 0, 1.92), mats['cream']),
        ('FrontDoorBay', (3.1, .20, 3.25), (-4.5, -2.88, 1.92), mats['cream']),
        ('RightReturn', (.20, 2.7, 3.25), (6.0, 1.55, 1.92), mats['cream']),
        ('StudyGreen', (6.2, .18, 2.85), (1.7, 2.63, 1.83), mats['green']),
    ]
    for i, (name, size, loc, mat) in enumerate(walls):
        add(cube(f'Build_Wall_{name}', size, loc, mat, .04, target=build), 5 + i, 37, 4.0, .025 * (-1 if i % 2 else 1))

    # Full-height teak-framed glass wall corresponds directly to the existing room opening.
    for i, x in enumerate((-1.65, .05, 1.75, 3.45, 5.15)):
        add(cube(f'Build_GlassPanel_{i:02d}', (1.58, .055, 2.62), (x, -2.98, 1.78), mats['glass'], .01, target=build), 9 + i // 2, 30, 3.6)
        add(cube(f'Build_GlassMullion_{i:02d}', (.12, .16, 3.02), (x - .85, -3.03, 1.82), mats['wood'], .018, target=build), 9 + i // 2, 30, 3.6)
    add(cube('Build_GlassTopRail', (8.7, .18, .18), (1.72, -3.04, 3.31), mats['wood_dark'], .02, target=build), 11, 28, 3.8)
    add(cube('Build_GlassBottomRail', (8.7, .18, .14), (1.72, -3.04, .43), mats['wood_dark'], .02, target=build), 11, 28, 2.4)

    # House doors remain part of the recognizable exterior, but the cinematic destination is the garden gate.
    door_center = -4.55
    house_left_pivot = empty('HouseDoor_Left_Pivot', (door_center - .72, -3.08, .43), build)
    house_right_pivot = empty('HouseDoor_Right_Pivot', (door_center + .72, -3.08, .43), build)
    for pivot, sign, label in ((house_left_pivot, 1, 'Left'), (house_right_pivot, -1, 'Right')):
        center = .36 * sign
        slab = cube(f'Door_{label}', (.72, .16, 2.62), (center, 0, 1.31), mats['main_door'], .035, target=build); slab.parent = pivot
        for z in (.28, 1.15, 2.34):
            rail = cube(f'Door_{label}_Rail_{z}', (.58, .055, .055), (center, -.105, z), mats['wood_dark'], .012, target=build); rail.parent = pivot
        for xoff in (-.27, .27):
            stile = cube(f'Door_{label}_Stile_{xoff}', (.052, .055, 2.20), (center + xoff, -.105, 1.30), mats['wood_dark'], .012, target=build); stile.parent = pivot
        plate = cylinder(f'HouseDoor_HandleBase_{label}', .075, .055, (sign * .08, -.13, 1.36), mats['brass'], 16, rotation=(math.pi / 2, 0, 0), target=build); plate.parent = pivot
        lever = cube(f'HouseDoor_Handle_{label}', (.25, .055, .055), (sign * .01, -.17, 1.42), mats['brass'], .018, target=build); lever.parent = pivot
        add(pivot, 12, 34, 3.8, -.055 * sign)
    add(cube('Build_DoorFrameTop', (1.85, .32, .24), (door_center, -3.09, 3.22), mats['wood_dark'], .025, target=build), 11, 31, 3.8)
    add(cube('Build_DoorStep', (2.15, 1.05, .18), (door_center, -3.55, .20), mats['stone'], .05, target=build), 9, 30, 1.7)

    roof_root = empty('Build_MainHipRoof', (0, 0, 3.48), build)
    hip_roof('Build_MainHipRoofSurface', 14.5, 8.4, 2.15, roof_root, mats['main_roof'], build)
    fascia = cube('Build_MainRoofFascia', (14.6, .24, .26), (0, -4.21, .02), mats['wood_dark'], .025, target=build); fascia.parent = roof_root
    ceiling = cube('Build_MainRoofCeiling', (13.2, 7.0, .12), (0, 0, -.03), mats['wood'], .018, target=build); ceiling.parent = roof_root
    for i, x in enumerate((-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4)):
        rafter = cube(f'Build_MainRafter_{i}', (.14, 7.55, .16), (x, -.12, -.15), mats['wood_dark'], .015, target=build); rafter.parent = roof_root
    add(roof_root, 14, 52, 6.0, .05)

    # Pool and garden pieces are reused from the existing modeled house assets.
    pool = import_asset(os.path.join(ASSET_ROOT, 'poolshell.glb'), 'Build_ReusedPool', (3.3, -7.0, -.04), build, fit_longest=5.6, rotation=(0, 0, math.pi / 2))
    add(pool, 10, 38, 2.0)
    for i, x in enumerate((1.8, 4.2)):
        lounger = import_asset(os.path.join(ASSET_ROOT, 'lounger.glb'), f'Build_ReusedLounger_{i}', (x, -10.2, .15), build, fit_longest=2.25, rotation=(0, 0, 0))
        add(lounger, 13, 30, 2.2, .04 * (-1 if i else 1))
    # Detailed final destination: a Balinese volcanic-stone garden gate at the marked reference position.
    gate_y = -13.52
    gate_root = empty('Build_GardenGate', (0, 0, 0), build)
    for side, x in enumerate((door_center - 1.20, door_center + 1.20)):
        for tier,(w,d,h,z) in enumerate(((1.14,.98,.20,.10),(.98,.88,.18,.29))):
            base=cube(f'Build_GateBase_{side}_{tier}',(w,d,h),(x,gate_y,z),mats['stone_light' if tier else 'stone'],.035,target=build);base.parent=gate_root
        pillar = cube(f'Build_GatePillar_{side}', (.78, .78, 2.45), (x, gate_y, 1.42), mats['stone'], .045, target=build); pillar.parent = gate_root
        for tier, (w, h, z) in enumerate(((1.02, .18, 2.68), (.84, .20, 2.88), (.58, .23, 3.08))):
            cap = cube(f'Build_GateCap_{side}_{tier}', (w, w, h), (x, gate_y, z), mats['stone_light'], .035, target=build); cap.parent = gate_root
        for z in (.56, 1.20, 1.85, 2.28):
            band = cube(f'Build_GateRelief_{side}_{z}', (.88, .10, .09), (x, gate_y-.405, z), mats['stone_light'], .02, target=build); band.parent = gate_root
        for motif, z in enumerate((.86,1.52,2.10)):
            rosette=carved_rosette(f'Build_GateRosette_{side}_{motif}',x,gate_y-.385,z,mats['stone_light'],build);rosette.parent=gate_root
    lintel = cube('Build_GateLintel', (1.92, .62, .22), (door_center, gate_y, 2.52), mats['stone'], .035, target=build); lintel.parent = gate_root
    for tier,(width,height,z) in enumerate(((2.16,.16,2.69),(1.82,.16,2.84),(1.34,.18,2.99))):
        crown=cube(f'Build_GateLintelCrown_{tier}',(width,.72,height),(door_center,gate_y,z),mats['stone_light' if tier==1 else 'stone'],.035,target=build);crown.parent=gate_root
    crest=cylinder('Build_GateCrest',.23,.10,(door_center,gate_y-.43,3.10),mats['stone_light'],12,rotation=(math.pi/2,0,0),target=build);crest.parent=gate_root
    add(gate_root, 8, 44, 3.0)

    left_pivot = empty('Door_Left_Pivot', (door_center - .82, gate_y - .03, .34), build)
    right_pivot = empty('Door_Right_Pivot', (door_center + .82, gate_y - .03, .34), build)
    for pivot, sign, label in ((left_pivot, 1, 'Left'), (right_pivot, -1, 'Right')):
        center = .41 * sign
        slab = recessed_gate_leaf(f'GateDoor_{label}',center,mats,build);slab.parent=pivot
        for z in (.72,1.38):
            rail = cube(f'GateDoor_{label}_Rail_{z}', (.62, .075, .075), (center, -.063, z), mats['wood'], .009, target=build); rail.parent = pivot
        for z in (.28,1.86):
            hinge=cylinder(f'GateDoor_{label}_Hinge_{z}',.028,.16,(0,-.04,z),mats['brass'],12,target=build);hinge.parent=pivot
        if label == 'Left':
            # One real latch at the centre seam; the opposite leaf keeps only an
            # invisible animation anchor so the runtime contract remains stable.
            plate = cylinder('Gate_HandleBase_Left', .07, .045, (.68, -.15, 1.15), mats['brass'], 20, rotation=(math.pi/2, 0, 0), target=build); plate.parent = pivot
            lever = cube('Door_Handle_Left', (.22, .05, .05), (.65, -.18, 1.15), mats['brass'], .016, target=build); lever.parent = pivot
        else:
            marker = empty('Door_Handle_Right', (0, 0, 0), build); marker.parent = pivot
        add(pivot, 9, 38, 2.7, -.045 * sign)

    # Pool-facing pavilion: sofa backs to the boundary, open side looks toward the pool.
    pavilion = empty('Build_PoolPavilion', (8.0, -7.0, .0), build)
    for x in (-1.7, 1.7):
        for y in (-1.45, 1.45):
            post = cube(f'Build_PavilionPost_{x}_{y}', (.18, .18, 2.75), (x, y, 1.48), mats['wood_dark'], .02, target=build); post.parent = pavilion
    deck = cube('Build_PavilionDeck', (4.1, 3.5, .18), (0, 0, .18), mats['wood'], .035, target=build); deck.parent = pavilion
    hip_roof('Build_PavilionRoof', 4.7, 4.1, 1.15, pavilion, mats['main_roof'], build, 2.82)
    bench = cube('Build_PavilionBench', (2.7, .72, .50), (-.2, 1.03, .58), mats['cream'], .09, target=build); bench.parent = pavilion
    animate_build(pavilion, 465, 48, 4.0, -.05)

    # Physical boundary contacts: each wall starts on the property plane; gate opening remains clear.
    for i, (size, loc) in enumerate((
        ((6.85, .34, 1.35), (-9.38, -13.4, .48)), ((16.35, .34, 1.35), (4.83, -13.4, .48)),
        ((.34, 21.0, 1.35), (-13.0, -3.0, .48)), ((.34, 21.0, 1.35), (13.0, -3.0, .48)),
        ((26.0, .34, 1.35), (0, 7.5, .48)),
    )):
        wall = cube(f'Build_BoundaryWall_{i}', size, loc, mats['stone'], .06, target=build)
        add(wall, 7 + i // 2, 38, 2.5)

    # Door path uses large irregular stones, readable during the final human-height move.
    for i in range(14):
        y = -13.0 + i * .70
        x = door_center + math.sin(i * .9) * .17
        stone = cube(f'Build_EntryStone_{i:02d}', (1.25 + .18 * (i % 3), .55, .10), (x, y, .03), mats['stone'], .13, rotation=(0, 0, .04 * math.sin(i)), target=build)
        add(stone, 8 + i // 4, 25, 1.2)

    # Near-camera reuse gets the fidelity budget; distant vegetation stays merged and inexpensive.
    reused_plants = [
        ('broadleaf', 'NearBroadleafA', (9.7, -3.2, 0), 2.4, .4),
        ('broadleaf', 'NearBroadleafB', (-8.8, -2.1, 0), 2.0, -.5),
        ('fern', 'NearFern', (6.7, -11.5, 0), 1.0, 0),
        ('flowers', 'NearFlowersA', (7.8, -4.0, 0), .75, 0),
        ('flowers', 'NearFlowersB', (-7.2, -5.0, 0), .70, 0),
        ('understory', 'NearUnderstory', (-2.0, -8.8, 0), 1.1, 0),
        ('broadleaf', 'NearGateBroadleafL', (-6.9, -12.7, 0), 1.75, .28),
        ('broadleaf', 'NearGateBroadleafR', (-2.2, -12.7, 0), 1.65, -.35),
        # All flower pots sit fully in front of the boundary wall. The former
        # rear row crossed the wall plane at y=-13.4 and visually fused with it.
        ('flowers', 'NearGateFlowersL0', (-6.30, -14.18, 0), .82, 0),
        ('flowers', 'NearGateFlowersL1', (-7.15, -14.58, 0), .92, .2),
        ('flowers', 'NearGateFlowersL2', (-6.88, -14.02, 0), .72, -.2),
        ('flowers', 'NearGateFlowersR0', (-2.80, -14.18, 0), .82, .2),
        ('flowers', 'NearGateFlowersR1', (-1.95, -14.58, 0), .92, -.15),
        ('flowers', 'NearGateFlowersR2', (-2.22, -14.02, 0), .72, .12),
    ]
    for i, (asset, name, loc, height, rot) in enumerate(reused_plants):
        plant = import_asset(os.path.join(ASSET_ROOT, f'{asset}.glb'), name, loc, growth, fit_height=height, rotation=(0, 0, rot))
        animate_growth(plant, 360 + i * 13, 58)

    for obj, order, duration, drop, twist in parts:
        animate_build(obj, 145 + order * 17, duration, drop, twist)
    return left_pivot, right_pivot, door_center


def create_camera_markers(target, door_x):
    # 0-10s establishes the finished island district while it rapidly grows; 10-30s spends detail on the villa and gate.
    positions = [
        (86, -92, 67), (72, -26, 56), (39, 51, 43), (-31, 39, 31),
        (-29, 5, 21), (-20, -15, 12), (-11, -18, 5.8), (door_x, -18.25, 1.68),
    ]
    targets = [
        (0, 5, 0), (0, 7, .7), (0, 1, 1.0), (0, -2, 1.2),
        (-1, -4, 1.5), (door_x, -8.0, 1.6), (door_x, -12.5, 1.48), (door_x, -13.52, 1.42),
    ]
    for i, (position, look) in enumerate(zip(positions, targets)):
        empty(f'Cam_{i:02d}', position, target)
        empty(f'Target_{i:02d}', look, target)
    empty('Door_Approach', (door_x, -18.25, 1.60), target)


def validate_scene():
    required = ['Door_Left_Pivot', 'Door_Right_Pivot', 'Build_MainHipRoof', 'Build_ReusedPool', 'Cam_00', 'Cam_07', 'Door_Approach']
    missing = [name for name in required if bpy.data.objects.get(name) is None]
    if missing:
        raise RuntimeError(f'Missing contract nodes: {missing}')
    left = bpy.data.objects['Door_Left_Pivot']
    right = bpy.data.objects['Door_Right_Pivot']
    if abs(left.location.y - right.location.y) > .001:
        raise RuntimeError('Door hinge planes are not aligned')
    if left.location.x >= right.location.x:
        raise RuntimeError('Door hinges are reversed')
    print('VALIDATED Bali scene contract and door hinge planes')


def build():
    reset_scene()
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.fps = FPS
    scene.frame_start = 0
    scene.frame_end = FRAME_END
    scene.world = bpy.data.worlds.new('Bali World')
    scene.world.color = (.035, .055, .052)
    static = collection('Bali_Static')
    build_collection = collection('Bali_Build')
    growth = collection('Bali_Growth')
    markers = collection('Camera_Markers')

    texture = lambda name: os.path.join(TEXTURE_ROOT, f'{name}.png')
    # One compact master per surface family. Far vegetation stays merged and cheap;
    # mid/near architecture gets the stronger wood, roof and stone response.
    mats = {
        'earth': textured_material('Ground_Earth', texture('MAT_Terrain_Tropical'), .94),
        'sand': textured_material('Beach_Sand', texture('MAT_Sand_Wet'), .88),
        'stone': textured_material('Stone_Volcanic', texture('MAT_Stone_Volcanic'), .90),
        'stone_light': textured_material('Stone_Carved_Highlight', texture('MAT_Stone_Light'), .84),
        'foundation': textured_material('Foundation_Stone', texture('MAT_Stone_Volcanic'), .92),
        'wood': textured_material('Wood_Warm', texture('MAT_Wood_Teak'), .64),
        'wood_dark': textured_material('Wood_Frame_Dark', texture('MAT_Wood_Dark'), .60),
        'door': textured_material('Door_Honey', texture('MAT_Wood_Door'), .48),
        'roof': textured_material('Roof_Terracotta', texture('MAT_Roof_Terracotta'), .80),
        'main_door': textured_material('Door_House_Warm', texture('MAT_Wood_HouseDoor'), .54),
        'main_roof': textured_material('Roof_House_Warm', texture('MAT_Roof_House'), .86),
        'cream': textured_material('Plaster_Cream', texture('MAT_Plaster_Cream'), .90),
        'green': material('Wall_Deep_Green', (.08, .18, .105), .88),
        'glass': material('Glass_Garden', (.22, .43, .39), .15, .02, .32),
        'water': textured_material('Water_River', texture('MAT_Water_Deep'), .17, .04, .82, .10, 1.333),
        'water_shallow': textured_material('Water_Lagoon_Shallow', texture('MAT_Water_Lagoon'), .20, .03, .78, .08, 1.333),
        'brass': material('Metal_Brass', (.62, .40, .10), .22, .84),
        'bark': material('Tree_Bark', (.20, .105, .042), .92),
        'leaf': textured_material('Leaf_Canopy', texture('MAT_Leaf_Mid'), .78),
        'canopy': textured_material('Leaf_Canopy_Mass', texture('MAT_Leaf_Far'), .88),
        'canopy_light': textured_material('Leaf_Canopy_Sunlit', texture('MAT_Leaf_Mid'), .82),
        'petal': material('Flower_Coral', (.78, .23, .16), .72),
        'petal_light': material('Flower_Cream', (.92, .74, .42), .70),
    }
    create_district(mats, static, build_collection, growth)
    _, _, door_x = create_main_house(mats, build_collection, growth)
    create_camera_markers(markers, door_x)
    validate_scene()
    save_and_export(BLEND_PATH, GLB_PATH, FRAME_END)
    print(f'CREATED {BLEND_PATH}')
    print(f'CREATED {GLB_PATH}')


if __name__ == '__main__':
    build()
