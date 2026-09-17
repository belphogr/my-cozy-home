# Blender 小屋资产

打开 `cozy-desk-atelier.blend`：

- **Cozy Desk Preview**：通过集合实例摆放的书桌、客厅和庭院家具预览，不会移动或破坏原始资产。墙面和显示器是尺寸参照，网页地面、庭院围墙、水波和交互不在此文件中。
- **Cozy Desk Atelier**：每种资产一个 `Atelier_*` 集合，原始部件、曲线、倒角、实体化修改器均保留。资产原点按网页坐标设计，单独编辑时可隔离对应集合。
- **Scene**：接入时的默认场景，原有立方体、灯光、相机保留。

网页加载 `public/assets/models/atelier/*.glb`，修改 Blender 文件不会自动修改网页；编辑后需要重新导出。

## 重建与导出

源代码位于项目 `scripts/blender_*.py`。在新的 Blender 文件中按 common → furniture → details → landscape → reading_corner → window → living → garden → garden_plants → room_expansion → export → preview 的顺序运行；各建模脚本会自行读取 common。为防止覆盖手工修改，集合已存在时建模脚本会主动报错，不会清空旧场景。庭院、圆餐桌与收纳边柜均已保存到源文件，无需在现有集合上重复运行建模脚本。预览墙面仅是早期尺寸代理，以网页的扩大后建筑为准。

在现有源文件中修改资产后，只需运行 `blender_export.py`；它切换到资产场景，复制网格进行转换、合并与顶点凹隙着色，导出后清理本次临时对象，不修改可编辑的原件。导出后切回 `Cozy Desk Preview` 即可查看摆放。

构造器采用网页坐标 X 右、Y 上、Z 前，并映射到 Blender。GLB 导出为 Y-up，网页无需再旋转 90°。尺寸与交互位置由 `src/scene/layout.ts` 和模型测试约束。

源文件不包含照片、日记或个人资料。没有购买素材，也没有使用房间背景图片。

本轮新增 `scripts/blender_record_player.py`，在导出前运行一次，创建 `Atelier_Turntable` 与 `Atelier_Vinyl`。唱臂由网页几何组件实现；编辑源 `.blend` 已保存唱片机源集合及更新后的家具实例。正面全景／剖开屋顶／有限环绕以网页为准，Blender Preview 仍是模型检查用代理场景。音频生成脚本为 `scripts/generate_cozy_music.py`，无需任何外部音频素材。
本轮增加 scripts/blender_tropical.py（导出前运行一次），创建棕榈、大叶植物和蕨类。源 .blend 已保存 28 个模型集合及校正朝向后的椅子／边柜实例。网页保持真实封闭屋顶与连通庭院，Blender Preview 仍只用于资产检查。
