# 梦潮产品官网

梦潮（Dreamtide）的公开产品介绍与 Android 安装包下载网站。整个网站只有一页。

- 线上地址：<https://springspiritsecond.github.io/dreamtide-website/>
- 产品平台：Android
- App 源码：位于独立私有仓库，不包含在本仓库
- APK 来源：本仓库公开 GitHub Releases

## 产品定位

梦潮是一款本地优先的梦境记录应用，帮助用户完成「记录、整理、回看」：

- **记录**：通过「刻梦」写下梦境，支持暂存与正式保存。
- **整理**：添加标签、隐私标记和注记，并可获取 AI 参考解读。
- **回看**：从日历、档案和词云重新进入过去的梦境。
- **本地保存**：数据保存在当前设备，支持导出备份，暂不提供云同步。

网站是一幅会动的水彩，共六个整屏章节，每章只讲一件事：开篇（三种首页）、刻梦（写梦）、
梦的层次（读梦、标记、遮住人名）、观梦（日历、记录、词云）、带走一场梦（分享长图）和下载。画面全部来自新版 App 界面设计稿：每章把一到三张手机画面斜放在纸上，主画面带手绘线框，
再配一两枚泡印形状的局部放大；换章时画面依次落下、线框描上、放大镜弹出，悬停时手机会被轻轻拿起。
原来的功能介绍 / 下载页已经移除，下载入口就在最后一章。

## 网站功能

- 只有一页。旧地址 `#/app`、`#/features`、`#/guide` 打开这一页的开篇，`#/download` 直接打开下载那一章；
  打开后地址栏去掉旧的 `#/…` 部分。
- 六个章节：开篇展示「聚、字、历」三种首页，随后是四个功能章节和下载。滚轮或方向键前进、返回，触控板一次滑动只翻一页；触屏上下或左右滑动；点击截图在左侧换成操作说明。
- 首页背景是用 WebGL 实时绘制的水彩晕染和泡印：每章有自己的一组颜料，换章时颜色约两秒内渐变，
  晕染重新化开，旧泡印渗进纸里、新泡印依次晕开；颜料在原地缓慢变浓变淡，纸面不会被拖动。
- 鼠标移动时偶尔落下泡印，几秒后渗入纸面消失；系统开启「减少动态效果」时画面保持静止。
- 首页的彩色泡群是整页的一层：每章按页面上文字、截图和下载泡印的实际位置算出一条曲线，泡沿曲线排开（托在文字下方、越过标题、沿文字与截图之间的空隙，或绕着下载泡印），中段大泡、两端渐细，颜色取本章的水彩颜料；换章时同一批泡顺着流到新曲线上，指针靠近时轻轻让开。
- 浏览器不支持 WebGL 时，改为每章绘制一幅静态水彩并在换章时淡入淡出。
- 网站上的 App 画面只用新版界面（`public/media/app/`），不加边框、不裁切；旧版截图和录屏已移除。
- 最后一章的「下载 Android 版」在访客浏览器里实时读取本仓库 GitHub Latest Release，直接下载最新 APK，
  并显示版本号和大小；读取中显示「正在读取最新版本」，读取失败时改为打开版本列表。
- 支持移动端布局、键盘导航、跳过链接和减少动态效果偏好。

## 技术与架构

- React 19、TypeScript、Vite 8
- WebGL 水彩（不支持时退回 Canvas 2D）、Canvas 泡群、CSS 响应式布局
- Vitest + Testing Library 单元测试
- Playwright 端到端与多视口测试
- GitHub Actions 自动构建并部署到 GitHub Pages
- 无业务后端；浏览器直接读取公开 GitHub Release API

主分支更新后，部署工作流会先执行单元测试和生产构建，再发布到
GitHub Pages。

## 本地开发

```bash
corepack pnpm install
corepack pnpm dev
```

生产构建预览：

```bash
corepack pnpm build
corepack pnpm preview
```

## 验证

```bash
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
corepack pnpm test:e2e
```

## 内容与媒体维护

- 章节、文案和每章的截图排版：[`src/components/WatercolorTide.tsx`](src/components/WatercolorTide.tsx)
- 水彩与泡印：[`src/lib/watercolorTide.ts`](src/lib/watercolorTide.ts)；彩色泡群：[`src/lib/bubbleTide.ts`](src/lib/bubbleTide.ts)
- App 画面：[`public/media/app/`](public/media/app/)，清单和重新截图的方法见 [`public/media/README.md`](public/media/README.md)

## 发布 Android 版

见 [`docs/releasing.md`](docs/releasing.md)。APK 必须发布到本公开仓库的
Releases，官网不会也不能匿名读取私有 App 仓库。

## 功能演进

[`COMMITS.md`](COMMITS.md) 按提交时间记录产品功能和工程能力的变化。维护要求：

1. 功能、文案、交互、发布方式发生变化时，同步更新 README 的当前状态。
2. 每次形成有意义的提交后，在 `COMMITS.md` 增加一条按时间排列的记录。
3. 访客可见变化标记为「产品」，构建、测试、部署和文档变化标记为「工程」。
