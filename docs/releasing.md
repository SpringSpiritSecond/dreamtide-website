# 发布 Android APK

官网只读取公开仓库 `SpringSpiritSecond/dreamtide-website` 的 Latest Release。
私有 App 仓库的 Token 不得写入网页源码、Vite 环境变量或 Pages 配置。

## 首次准备

1. 在私有 App 仓库完成构建与签名。
2. 将安装包命名为 `DreamTide-v<版本号>.apk`。
3. 在本机登录 GitHub CLI：`gh auth login`。

## 发布

在 APK 所在目录执行：

```bash
gh release create v0.3.0 "DreamTide-v0.3.0.apk#DreamTide Android v0.3.0" \
  --repo SpringSpiritSecond/dreamtide-website \
  --title "DreamTide v0.3.0" \
  --notes "梦潮 Android v0.3.0"
```

发布完成后，访问以下接口确认 `assets` 中存在 `.apk`：

`https://api.github.com/repos/SpringSpiritSecond/dreamtide-website/releases/latest`

官网无需重新构建，会在访客打开页面时自动读取最新公开版本。

## 后续自动同步

若在私有 App 仓库增加发布工作流，应使用只拥有
`dreamtide-website` Releases 写权限的 fine-grained token，并只把该 token
保存在私有 App 仓库的 Actions Secrets。公开仓库和前端构建不得持有该 token。
