"""Original dining pedestal table and slatted storage console, no bitmap assets."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
warm=material('Atelier_ExpansionWalnut','#97704e',.69)
edge=material('Atelier_ExpansionWalnutEdge','#745236',.73)
linen=material('Atelier_ExpansionLinen','#d8c9a8',.95)
clay=material('Atelier_ExpansionPottery','#c0b89a',.87)
table=collection('Atelier_Diningtable')
lathe('Rounded circular tabletop',[(0,.91),(.95,.91),(1.015,.925),(1.03,.95),(1.015,.976),(.96,.985),(0,.985)],warm,table,segments=80)
lathe('Pedestal base',[(0,0),(.42,0),(.49,.035),(.46,.075),(.30,.11),(.22,.2),(.22,.83),(.37,.9),(0,.9)],edge,table,segments=48)
for i in range(28):
    a=i*2*math.pi/28
    curve('Pedestal flute',[(.222*math.cos(a),.18,.222*math.sin(a)),(.222*math.cos(a),.82,.222*math.sin(a))],.012,warm,table)
console=collection('Atelier_Sideboard')
for x in (-1.45,1.45):
    for z in (-.22,.22):box('Console foot',(.095,.18,.095),(x,.09,z),edge,console,.018)
box('Console bottom',(3.25,.085,.58),(0,.20,0),edge,console,.013)
box('Console top',(3.36,.095,.64),(0,1.22,0),warm,console,.022)
for x in (-1.59,1.59):box('Console end',(.075,.98,.58),(x,.71,0),warm,console,.014)
box('Console back',(3.12,.92,.045),(0,.72,-.265),edge,console,.006)
for x in (-.54,.54):box('Console divider',(.04,.92,.54),(x,.72,0),edge,console,.006)
for x in (-1.05,1.05):
    box('Door panel',(.995,.91,.04),(x,.72,.265),edge,console,.012)
    for i in range(15):box('Vertical door flute',(.036,.865,.028),(x-.447+i*.064,.72,.3),warm,console,.01)
    curve('Door brass pull',[(x+.33,.63,.325),(x+.33,.80,.325)],.012,gold,console)
for i in range(3):
    y=.415+i*.30
    box('Center drawer',(1.02,.282,.055),(0,y,.275),warm,console,.012)
    curve('Drawer brass pull',[(-.15,y,.326),(-.15,y,.345),(.15,y,.345),(.15,y,.326)],.009,gold,console)
lathe('Console vase',[(0,0),(.14,0),(.17,.06),(.18,.23),(.12,.38),(.075,.44),(.07,.48),(.05,.48),(.055,.43),(.1,.37),(.15,.2),(.12,.035),(0,.035)],clay,console,(-1.05,1.2675,0),segments=48)
for i in range(3):box('Folded linen',(.55,.065,.38),(.94,1.30+i*.068,0),linen,console,.028)
print('Created original dining table and storage console.')
