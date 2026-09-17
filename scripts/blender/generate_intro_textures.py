"""Generate compact seamless-ish PBR base-color textures for the Bali intro GLB."""
from __future__ import annotations

import os
import bpy
import numpy as np

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
OUT=os.path.join(ROOT,'public','assets','intro','textures')
os.makedirs(OUT,exist_ok=True)
SIZE=256
rng=np.random.default_rng(7319)
y,x=np.mgrid[0:SIZE,0:SIZE]/SIZE

def norm(v):return np.clip(v,0,1)
def field(seed, waves=18):
    local=np.random.default_rng(seed);result=np.zeros((SIZE,SIZE),dtype=np.float32)
    weight=0.0
    for i in range(waves):
        frequency=local.uniform(.65,5.8)*(1.0+i/waves*.45)
        angle=local.uniform(0,np.pi*2);phase=local.uniform(0,np.pi*2)
        amplitude=1/(1+frequency*.72)
        result+=np.sin((x*np.cos(angle)+y*np.sin(angle))*np.pi*2*frequency+phase)*amplitude
        weight+=amplitude
    result=result/max(weight,.001)
    return (result-result.min())/max(result.max()-result.min(),.001)
def save(name,rgb):
    rgb=norm(rgb.astype(np.float32));alpha=np.ones((SIZE,SIZE,1),dtype=np.float32)
    rgba=np.concatenate((rgb,alpha),axis=2)
    image=bpy.data.images.new(name,width=SIZE,height=SIZE,alpha=True,float_buffer=False)
    image.pixels.foreach_set(rgba.reshape(-1));image.file_format='PNG'
    image.filepath_raw=os.path.join(OUT,f'{name}.png');image.save()
    print(f'TEXTURE {image.filepath_raw}')

noise=rng.random((SIZE,SIZE))-.5
grain=np.sin((x*34+np.sin(y*9)*1.8)*np.pi)*.5+.5
wood=np.dstack((.34+.16*grain+.05*noise,.14+.075*grain+.025*noise,.045+.03*grain+.012*noise))
save('MAT_Wood_Teak',wood)
save('MAT_Wood_Dark',wood*np.array([.48,.43,.38]))
save('MAT_Wood_Door',wood*np.array([1.18,1.02,.78]))

# The hero house repeats the warm timber palette already used inside the 3D room.
house_door=np.dstack((.34+.14*grain+.025*noise,.22+.085*grain+.018*noise,.135+.052*grain+.012*noise))
save('MAT_Wood_HouseDoor',house_door)

row=np.mod(y*12,1);col=np.mod(x*10+(np.floor(y*12)%2)*.5,1)
grout=((row<.07)|(col<.045)).astype(float)
roof=np.dstack((.48+.10*noise,.16+.045*noise,.055+.025*noise))*(1-grout[...,None]*.55)
save('MAT_Roof_Terracotta',roof)
house_roof=np.dstack((.58+.14*noise,.34+.075*noise,.23+.050*noise))*(1-grout[...,None]*.30)
save('MAT_Roof_House',house_roof)

stone_noise=.5+.5*np.sin(x*31+np.sin(y*19)*2.4)+noise*.42
stone=np.dstack((.22+.12*stone_noise,.235+.12*stone_noise,.22+.10*stone_noise))
save('MAT_Stone_Volcanic',stone)
save('MAT_Stone_Light',stone*1.34)

sand_noise=.12+.76*field(19)+noise*.10
sand=np.dstack((.63+.12*sand_noise,.50+.10*sand_noise,.30+.065*sand_noise))
save('MAT_Sand_Wet',sand)

terrain_noise=.10+.82*field(31)+noise*.08
terrain=np.dstack((.10+.055*terrain_noise,.235+.15*terrain_noise,.08+.045*terrain_noise))
# Mixed exposed soil, dry groundcover and green understory, not an even lawn.
soil_mask=np.clip((field(132,24)-.40)*1.7,0,.70)[...,None]
soil=np.dstack((.29+.07*terrain_noise,.245+.055*terrain_noise,.145+.04*terrain_noise))
terrain=terrain*(1-soil_mask)+soil*soil_mask
save('MAT_Terrain_Tropical',terrain)

leaf_noise=.15+.70*field(47,12)+noise*.15
leaf_far=np.dstack((.045+.04*leaf_noise,.19+.15*leaf_noise,.055+.04*leaf_noise))
save('MAT_Leaf_Far',leaf_far)
save('MAT_Leaf_Mid',leaf_far*np.array([1.20,1.18,.95]))

plaster=np.dstack((.70+.035*noise,.64+.03*noise,.50+.025*noise))
save('MAT_Plaster_Cream',plaster)

ripple=.18+.58*field(63,10)+.12*np.sin((x*.85+y)*np.pi*7)
deep=np.dstack((.025+.025*ripple,.19+.11*ripple,.27+.14*ripple))
lagoon=np.dstack((.04+.04*ripple,.38+.18*ripple,.43+.20*ripple))
save('MAT_Water_Deep',deep);save('MAT_Water_Lagoon',lagoon)
