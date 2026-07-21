# 梦潮产品官网

梦潮（Dreamtide）的公开产品介绍与新手教程网站。

- 官网部署：GitHub Pages
- 产品平台：Android
- App 源码：位于独立私有仓库，不包含在本仓库
- 下载来源：本仓库公开 GitHub Releases

## 本地开发

```bash
corepack pnpm install
corepack pnpm dev
```

## 验证

```bash
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
corepack pnpm test:e2e
```

## 替换截图与动图

完整文件名、尺寸和格式要求见 [`public/media/README.md`](public/media/README.md)。
将正式素材按同名路径放入后即可生效。没有素材时，页面显示固定比例占位画面。

## 发布 Android 版

见 [`docs/releasing.md`](docs/releasing.md)。APK 必须发布到本公开仓库的
Releases，官网不会也不能匿名读取私有 App 仓库。
