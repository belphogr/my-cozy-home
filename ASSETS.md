# 资产与许可记录

## 第三方猫模型

- 作者：Quaternius
- 作品：Animal Pack Vol. 2，Cat
- 来源页：https://opengameart.org/node/78596
- 作者网站：https://quaternius.com/
- 下载：https://opengameart.org/sites/default/files/Animal%20Pack%20Vol.2%20by%20%40Quaternius.zip
- 来源页许可：CC0（https://creativecommons.org/publicdomain/zero/1.0/）
- 下载/处理日期：2026-08-28
- 项目文件：`public/assets/models/cat.glb`、`cat-info.json`
- 修改：从 FBX 转成 GLB，合并重复材质分组以减少绘制调用，使用纯色标准材质；运行时缩放、暖色重配色、骨骼动画播放与安全路线移动。未使用图像纹理。
- 转换脚本：`scripts/prepare-cat.mjs`。原压缩包与解包暂存于被 gitignore 的 `.asset-cache`；不是网站运行依赖。
- 保留的骨骼动作：`CatArmature|Idle`、`CatArmature|Walking`，各约 1.67 秒。来源不含进食、抚摸、追玩、趴睡动作。
- 转换器警告：FBX 少数顶点超过四个骨骼权重时会丢弃额外权重。当前样板已检查可见模型，后续仍需对全部动作逐项验收。

## 本项目生成的几何体

桌、椅、杯、杯托、书、显示器、键盘、鼠标、台灯、盆栽、窗框、地板、猫窝、装饰浮雕均由本项目代码构建。不是从参考视频提取的资产，不使用房间图片冒充三维场景。木纹使用数学着色，光照反射环境由 Three.js 内置 RoomEnvironment 在本机生成。

### Blender 精细模型（2026-08-28）

室内扩建轮新增 `diningtable.glb`（5,952 三角形）与 `sideboard.glb`（12,028 三角形），运行资产现为 23 个 GLB。源代码为 `scripts/blender_room_expansion.py`，包括圆桌倒圆桌沿、凹凸立柱底座、边柜竖向木条门板、黄铜把手、抽屉与陶器。两把餐椅复用藤椅几何。房屋扩大不缩放原书桌、电脑和沙发。源文件已同步保存，以下 21 个资产列表为前一轮记录。

- 制作工具：用户本机 Blender 5.2.1 LTS，通过已连接的 Blender MCP 建模和导出；未调用模型生成、素材下载或付费服务。
- 原始可编辑文件：`design/blender/cozy-desk-atelier.blend`。保留用户原有 `Scene`，新建 `Cozy Desk Atelier` 资产场景与 `Cozy Desk Preview` 摆放预览场景。
- 运行资产：`public/assets/models/atelier/`，包含 desk、chair、cup、lamp、plant、pendant、landscape、deskbooks、shelf、floorplant、window、sofa、coffeetable、rug、gardenentry、pottingbench、lounger、poolshell、wateringcan、flowers、succulent 二十一个 GLB，及记录体积、三角形数、材质数的 `manifest.json`。
- 原创建模源代码：`scripts/blender_common.py`、`blender_furniture.py`、`blender_details.py`、`blender_landscape.py`、`blender_reading_corner.py`、`blender_window.py`、`blender_living.py`、`blender_garden.py`、`blender_garden_plants.py`、`blender_export.py`、`blender_preview.py`。没有复制第三方模型，无新增第三方资产许可要求。
- 庭院新增敞开的木框玻璃门、双层种植台、木框布垫躺椅、带真实池壁和瓷砖的池体、空心洒水壶、花卉和多肉。水面使用实时顶点起伏和数学着色，非图片或视频；石板、碎石和小灯为网页几何。瓷砖网格按材质合并，避免每一块瓷砖单独绘制。庭院 GLB 合计约 2.61 MB，未实现植物成长或游泳。
- 客厅新增双人沙发、圆茶几和编织地毯。沙发具有曲面坐垫、靠枕、缝线和有厚度的搭毯；地毯使用实体编织环。茶几上的杯子与书复用同一模型并支持拿起查看，和书桌物件使用独立交互 ID，不冒充个人记录。
- 窗边模型包含木窗框、窗台、窗扇、黄铜扣手和挂环、有厚度的亚麻褶帘；墙面分段形成真实窗洞。玻璃使用低透明度材质，不投射实心阴影。窗外树木为程序构建的枝干和实例化立体叶片，远景为几何丘陵，未使用风景背景图片。
- 藤椅背为有厚度的交织藤条，坐垫带曲面与包边；台灯包含双杆关节、灯罩内壁；茶杯包含杯底、内腔、外置把手和立体叶纹。山水为多层浮雕，不是图片。
- 左侧完整木架包含落地柜脚、柜门、立柱、层板及托架，陈设书本、陶器和垂蔓；落地植物有弯曲叶面、实体叶脉与陶盆。右侧三本装饰书直立建模，底边与书挡底座对齐，底座直接落在桌面。它们是固定陈设，不代表用户真实记录；可拿取的桌面日记本仍是独立物件。
- GLB 不含图片纹理或外部资源。凹隙明暗通过模型顶点颜色携带；木纹、布纹与细微表面起伏由网页数学着色实现。精细物件在房间与拿取检查中使用同一 GLB，独立层级实例共享几何体。
- Blender 预览中的显示器与键盘仅为尺寸代理；实际软件交互、房屋、窗光和猫咪仍由网页实现。不能将 Blender 预览当成网页验收。
- MCP 的提示词、代码、截图和场景数据采集已关闭；插件仍记录最小匿名工具使用次数等信息。没有向素材或生成服务发送用户日记、资料或照片。

## 网页与概念图

- 界面图标：lucide-react，ISC；第三方依赖的详细许可证保留于对应 npm 包。
- 三维引擎：Three.js（MIT）、React Three Fiber / Drei（MIT），按包内 LICENSE 使用。
- `design/concepts`：内置 image_gen 生成的设计参考。不是运行时 3D 画面，也不作为模型/动画验收证据。
- 桌面壁纸为网页 CSS 和图标构图；显示器内容是可操作的 HTML，而非截图。
- 未购买模型、贴图或订阅服务，未复制参考视频作者的模型、代码或照片。

## 正面场景与唱片机补充

新增原创 `turntable.glb`（4,304 三角形）与 `vinyl.glb`（13,492 三角形），当前共 25 个 GLB。源代码 `scripts/blender_record_player.py`；唱片纹路、木箱、金属盘、按钮与螺丝均为真实几何。唱臂在 `src/scene/RecordPlayer.tsx` 中以几何曲线构成并实时转动。

`public/assets/audio/cozy-afternoon.wav` 是 `scripts/generate_cozy_music.py` 从数学振荡器生成的 32 秒原创合成循环，不使用采样或下载音乐，按 CC0 提供。用户选择的本地音频不上传，也不写入项目或存档。
## 连通室内外与热带绿植

本轮新增 Blender 原创 `palm.glb`（58,656 三角形）、`broadleaf.glb`（11,040）和 `fern.glb`（32,640），当前共 28 个 GLB。源脚本 `scripts/blender_tropical.py`。叶片均有几何轮廓与厚度，不是透明贴片；重复摆放共享模型数据，沿庭院外围及左窗外形成植物层次。没有下载外部素材或使用用户图片作为纹理。
## 木顶、拱形壁龛与庭院下层植被

本轮新增原创 `niche.glb`（15,685 三角形）与 `understory.glb`（9,864 三角形），当前共 30 个 GLB。源脚本 `scripts/blender_niche.py`，可编辑源文件保存在 `design/blender/cozy-desk-atelier.blend`。拱形壁龛包含前后深度、石灰质内壁、三层实木层板、陶器、收藏盒与垂蔓；道路边缘草丛、花瓣和茎叶均为几何体，不使用透明植物贴片。木板顶、承重梁、细椽、外挑檐板、陶瓦轮廓、天沟与落水管由网页实时三维几何构成。

## 光影、窗帘与电脑桌面精修

窗帘重新由 Blender 几何生成：加长至接近地面，增加七道纵向褶皱、收腰、实体底摆、侧缝和金属束带；更新后的 `window.glb` 为 54,760 三角形。壁龛藤叶分离为四条细藤，花瓶鲜花包含实体花茎、叶片、双层花瓣与花心；`niche.glb` 更新为 22,029 三角形。电脑壁纸使用站内 SVG 山谷、树林、湖面、日光及前景叶片，不加载外部图片。窗外蓝天、星空和远景山丘均为实时几何/着色器，不使用整张背景贴图。
