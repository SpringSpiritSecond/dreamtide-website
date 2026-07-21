# 梦潮产品官网

梦潮（Dreamtide）的公开产品介绍、新手教程与 Android 安装包下载网站。

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

本网站的主要访问路径是：了解产品 → 查看使用方法 → 下载最新 APK。

## 网站功能

- 单页产品介绍，包含 Hero、功能故事、新手教程和页尾下载区。
- 页内导航直达「功能」「使用方法」「下载」。
- 自动读取 GitHub Latest Release，展示 APK 版本、大小和发布日期。
- 对加载中、接口失败、无 Release、无 APK 等状态提供明确反馈和备用入口。
- 截图或动图缺失时显示固定比例的品牌占位，避免页面布局跳动。
- 支持移动端布局、键盘导航、跳过链接和减少动态效果偏好。

## 技术与架构

- React 19、TypeScript、Vite 8
- 纯 CSS 响应式视觉系统，Lucide 图标
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

- 产品功能与教程文案：[`src/content/siteContent.ts`](src/content/siteContent.ts)
- 页面组件：[`src/components/`](src/components/)
- 截图与动图：[`public/media/`](public/media/)
- 视觉与交互规格：[`docs/superpowers/specs/2026-07-21-dreamtide-website-design.md`](docs/superpowers/specs/2026-07-21-dreamtide-website-design.md)

完整文件名、尺寸和格式要求见 [`public/media/README.md`](public/media/README.md)。
将正式素材按同名路径放入后即可生效。没有素材时，页面显示固定比例占位画面。

## 发布 Android 版

见 [`docs/releasing.md`](docs/releasing.md)。APK 必须发布到本公开仓库的
Releases，官网不会也不能匿名读取私有 App 仓库。

## 功能演进

[`COMMITS.md`](COMMITS.md) 按提交时间记录产品功能和工程能力的变化。维护要求：

1. 功能、文案、交互、发布方式发生变化时，同步更新 README 的当前状态。
2. 每次形成有意义的提交后，在 `COMMITS.md` 增加一条按时间排列的记录。
3. 访客可见变化标记为「产品」，构建、测试、部署和文档变化标记为「工程」。
