"""A miniature carved landscape: actual layered relief, not a picture plane."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
c=collection('Atelier_Landscape')
sky=material('Atelier_Sky','#bcc5b5',.9)
far=material('Atelier_FarMountain','#7b9285',.9)
middle=material('Atelier_MiddleMountain','#596f60',.9)
near=material('Atelier_NearMountain','#42573c',.88)
bank=material('Atelier_RiverBank','#8d9162',.84)
water=material('Atelier_Water','#93b9b0',.48)
sun=material('Atelier_Sun','#e3d4a3',.7)
box('Carved walnut frame',(1.10,1.10,.085),(0,0,-.017),edge,c,.012)
box('Linen mat',(1.0,1.0,.012),(0,0,.033),ivory,c,.002)
box('Inset landscape backing',(.82,.82,.01),(0,0,.042),sky,c,.001)
def relief(name,points,z,mat):
    ob=mesh(name,[(x,y,z) for x,y in points],[tuple(range(len(points)))],mat,c)
    s=ob.modifiers.new('Carved relief depth','SOLIDIFY');s.thickness=.009
    b=ob.modifiers.new('Soft carving edge','BEVEL');b.width=.002;b.segments=2
relief('Distant mountain ridge',[(-.41,-.41),(.41,-.41),(.41,.07),(.3,.18),(.22,.11),(.08,.3),(-.035,.20),(-.15,.31),(-.27,.14),(-.41,.17)],.054,far)
relief('Middle mountain ridge',[(-.41,-.41),(.41,-.41),(.41,-.04),(.30,.08),(.24,.01),(.08,.14),(-.05,-.04),(-.17,.07),(-.30,-.05),(-.41,.1)],.069,middle)
relief('Forest hillside',[(-.41,-.41),(.41,-.41),(.41,-.19),(.21,-.23),(.07,-.12),(-.08,-.21),(-.23,-.13),(-.41,-.03)],.084,near)
relief('Valley bank',[(-.41,-.41),(.41,-.41),(.41,-.32),(.1,-.3),(-.04,-.18),(-.11,-.23),(-.26,-.26),(-.41,-.23)],.098,bank)
relief('Winding river',[(-.12,-.41),(.12,-.41),(.05,-.34),(-.09,-.29),(-.12,-.255),(-.055,-.23),(-.038,-.198),(-.065,-.216),(-.16,-.25),(-.15,-.29),(-.01,-.35)],.111,water)
ellipsoid('Inlaid sun',(.245,.27,.051),(.045,.045,.005),sun,c)
for i in range(13):
    x=-.36+i*.058;y=-.26+.035*math.sin(i*1.9)
    if -.18<x<.10:continue
    h=.07+(i%3)*.018
    curve('Miniature tree trunk',[(x,y,.115),(x,y+h,.115)],.003,edge,c,False,1)
    for j in range(3):
        ellipsoid('Carved forest foliage',(x+math.sin(i+j)*.012,y+h*(.45+j*.22),.123),(.018+j*.002,.022,.007),near if i%2 else middle,c)
print('Built miniature landscape with',len(c.objects),'parts')
