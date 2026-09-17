<div align="center">

# 我的小屋 · My Cozy Home

**一个可以被走进、凝视与慢慢填满的 3D 个人空间。**  
**A 3D personal space to enter, explore, and gradually make your own.**

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?logo=three.js)](https://threejs.org/)
[![Blender](https://img.shields.io/badge/Blender-5.2_LTS-E87D0D?logo=blender&logoColor=white)](https://www.blender.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-MIT-3da639.svg)](LICENSE)

</div>

<p align="center">
  <img src="artifacts/readme-interior-day.png" alt="小屋白天室内的实际运行截图" width="100%" />
</p>

<p align="center"><sub>白天的室内全景 · Interior overview in daylight</sub></p>

---

## 中文

### 这是什么？

“我的小屋”是一个基于浏览器的互动式 3D 个人空间样板。你从有屋顶的室内开始，在书桌、客厅与热带庭院之间切换镜头；靠近、拿起并查看物件；通过显示器进入自己的数字桌面。

这不是静态页面：小屋的大部分家具、庭院、植物和可拿起物件均在 Blender 中建模并导出为 GLB；React Three Fiber / Three.js 在浏览器中负责实时渲染、镜头、灯光与交互。个人资料、记录与收藏仅存于本机浏览器的 IndexedDB，不会上传到服务器。

<p align="center">
  <img src="artifacts/readme-interior-night.png" alt="小屋夜晚室内的实际运行截图" width="49%" />
  <img src="artifacts/readme-object-inspection.png" alt="陶瓷茶杯拿起查看的实际运行截图" width="49%" />
</p>

<p align="center"><sub>夜晚氛围 · 拿起陶瓷茶杯查看<br />Night mood · ceramic-cup inspection</sub></p>

### 小屋一览 · Explore the home

<p align="center">
  <img src="artifacts/readme-garden.png" alt="庭院、泳池与热带植物的实际运行截图" width="100%" />
</p>

<p align="center"><sub>庭院：泳池、种植台与热带绿植 · Garden: pool, potting bench, and tropical planting</sub></p>

<p align="center">
  <img src="artifacts/readme-bookshelf-open.png" alt="打开我的书架的实际运行截图" width="49%" />
  <img src="artifacts/readme-computer-open.png" alt="打开我的电脑的实际运行截图" width="49%" />
</p>

<p align="center"><sub>打开书架 · 打开电脑<br />Opened bookshelf · Opened computer</sub></p>

### 功能一览

| 功能 | 你可以做什么 |
| --- | --- |
| 🏡 连通的小屋 | 在室内与庭院之间切换视角，穿过门洞；屋顶、木梁、客厅、书桌、泳池与热带植物始终处在同一个场景。 |
| 🌤️ 日夜氛围 | 一键切换白天与夜晚。白天呈现暖色日光与窗影；夜晚点亮吊灯、台灯、门廊和庭院灯，并可看见星空。 |
| 🪑 物件互动 | 首次点击家具或物品可自动靠近；再次点击小物件可拿起并旋转查看。茶杯、笔记本、盆栽、鼠标、手机、地球仪、茶几物件、庭院盆栽与洒水壶均可探索。 |
| 🏷️ 风铃便签 | 打开风铃卡片可维护四张固定位置的便签：为每张选择表情与简短关键词，保存后会显示在屋内的卡片上。 |
| 🖼️ 照片墙 | 可为七个画框选择本地照片，并在聚焦状态恢复默认图案或删除选中的照片。 |
| 📚 我的书架 | 点击落地书墙打开“我的书架”，录入书名与作者；书目会以封面形式排入书架，并支持删除。 |
| 💻 我的电脑 | 点击显示器进入屏幕内桌面：编辑个人资料，添加／删除收藏网站，并授权读取本地文件夹的目录列表。 |
| 🏅 成果墙 | 记录奖项或论文的标题、机构、年份与说明；可附加 JPEG、PNG、WebP 图片或 PDF，并在墙上查看详情。 |
| 🎵 午后唱片机 | 靠近唱片机即可播放／暂停、调整进度与音量；唱片和唱臂同步动作。内置原创示例曲，也可临时选择本地音频。 |
| 🐾 宠物与设置 | 点击小狗可切换外出散步／回窝休息；小猫提供 Idle 与 Walking 动画。另支持中英切换、视角复位、减少动态和文字桌面。 |

### 互动方式

- 拖动鼠标或使用方向键小范围环顾；右上角可复位镜头。
- 点击物件靠近，再点一次查看或使用；拿起物件时可拖动旋转，`Esc` 或右键放回。
- 点击显示器，或书桌近景中的“使用电脑”进入桌面；`Esc` 会先关闭窗口，再退出电脑。
- 在手机上建议横屏体验三维场景；竖屏时可在电脑模式选择“展开阅读”。

### 快速开始

**推荐：** 双击 [`启动小屋.cmd`](启动小屋.cmd)，保持启动窗口开启后访问 [http://127.0.0.1:5173/](http://127.0.0.1:5173/)。

或在项目目录运行：

```powershell
npm.cmd install
npm.cmd run dev
```

开发环境使用 Node.js 22。开发服务器固定监听 `127.0.0.1:5173`；请不要交替使用 `localhost`、IP 或其他端口，以免进入不同的浏览器本地存储空间。

### 数据与隐私

个人资料、便签、书目、照片、收藏、文件夹索引与成果记录保存在当前浏览器的 IndexedDB 数据库 `my-cozy-home`。项目没有业务后端、账号、加密或云同步，**不会上传你的内容**；本地文件夹仅在你主动授权后读取目录列表。

目前还没有 ZIP 导入导出、跨设备同步或恢复机制。请不要把唯一的重要资料仅保存在样板中；更换浏览器／设备／访问地址，或清除站点数据都可能导致本地内容不可见。

### 后续计划

- 纪念物与记录摆放
- ZIP 备份、导入与恢复
- 植物成长与照顾系统
- 宠物喂食、抚摸、逗猫与趴睡动画
- 环境声音、移动端适配与性能验收

### 开发与检查

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

项目结构：`design/blender` 与 `blender` 保存 Blender 源场景，`public/assets/models` 保存导出的 GLB，`src/scene` 负责网页端场景、镜头和交互，`src/desktop` 为屏幕内软件，`src/data` 为版本化本地数据与校验。素材与许可记录见 [ASSETS.md](ASSETS.md)。

---

## English

### What is this?

**My Cozy Home** is a browser-based interactive 3D personal-space prototype. Begin inside a roofed room, move your view between the desk, living area, and tropical garden, inspect objects up close, and enter a digital desktop through the in-world monitor.

It is not a static page. Most furniture, garden, plant, and pick-up assets are modelled in Blender and exported as GLB; React Three Fiber and Three.js handle real-time rendering, camera work, lighting, and interaction in the browser. Profile data, notes, and links stay in your browser's IndexedDB and are never sent to a server.

### Feature map

| Feature | What you can do |
| --- | --- |
| Connected home | Move the view between the roofed interior and tropical garden through the doorway; the desk, living space, pool, roof, and planting remain one continuous scene. |
| Day and night | Switch between sunlit window shadows and a night scene with pendant lamps, desk light, porch and garden lighting, plus stars. |
| Object inspection | Approach furniture, then pick up and rotate small objects: cups, notebooks, plants, mouse, phone, globe, table objects, watering can, and garden plants. |
| Hanging-note tags | Edit four fixed hanging-card tags with an emoji and short keyword; saved tags appear back in the room. |
| Photo wall | Upload local photos into seven frames, restore a default image, or remove the selected photo. |
| My Library | Open the tall book wall, add book titles and authors, see them arranged as shelf covers, and delete entries. |
| My Computer | Use the in-world monitor to edit a profile, manage bookmarks, and—only after your permission—read a selected local folder's directory listing. |
| Recognition wall | Store awards or papers with title, organisation, year, description, and an optional JPEG, PNG, WebP, or PDF attachment. |
| Turntable | Name track slots, temporarily choose local audio, and control play, pause, seek, and volume while the record and tonearm animate. |
| Pets and preferences | Click the dog to toggle a walk or rest; the cat has Idle and Walking animations. Chinese/English, reset view, reduced motion, and text-desktop settings are also available. |

### Run locally

**Recommended:** double-click [`启动小屋.cmd`](启动小屋.cmd), keep its terminal window open, then visit [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

Alternatively, from the project directory:

```powershell
npm.cmd install
npm.cmd run dev
```

The project uses Node.js 22 and intentionally serves only on `127.0.0.1:5173`. Avoid swapping between `localhost`, an IP address, or other ports: each can have a separate browser-storage space.

### Controls

- Drag, or use the arrow keys, for a limited look-around; use the top-right reset control to recenter the view.
- Click an object to approach it. Choose “pick up to inspect” in close view, then press `Esc` to put it back.
- Click the monitor, or choose “use computer” at the desk, to open the desktop. `Esc` closes software first, then exits the computer.
- Landscape orientation is recommended for the 3D experience on phones. In portrait mode, select “expand reading” in computer mode.

### Privacy and data boundary

Profiles, tags, books, photos, bookmarks, folder indexes, and recognition records are stored in the current browser's `my-cozy-home` IndexedDB database. There is no application backend, account system, encryption layer, or cloud sync; **your content is not uploaded**. A local folder is read only after you explicitly grant access, and only its directory listing is stored.

This prototype does not yet provide ZIP import/export, cross-device sync, or recovery. Do not keep your only copy of important material here. Changing browsers, devices, or site addresses—or clearing site data—can make local content unavailable.

### Roadmap

- Placeable keepsakes and memories
- ZIP backup, import, and recovery
- Plant growth and care
- Feeding, petting, play, and resting interactions for pets
- Ambient sound, mobile refinement, and performance validation

### Development checks

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

`design/blender` and `blender` contain Blender source scenes; `public/assets/models` contains exported GLB assets; `src/scene` contains browser-side scene, camera, and interaction code; `src/desktop` contains the in-world desktop; and `src/data` is the versioned local-data layer. See [ASSETS.md](ASSETS.md) for assets and licenses.

---

## Credits

The cat model is adapted from Quaternius’ **Animal Pack Vol. 2**, released under CC0. Detailed asset, transformation, and dependency notes are maintained in [ASSETS.md](ASSETS.md) and [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md).

## License

This repository is released under the [MIT License](LICENSE).
