# DreamTide Android 发布与官网下载

`dreamtide` 可以保持为私有源码仓库。公开仓库
`SpringSpiritSecond/dreamtide-website` 只承载已经签名的 APK、公开更新说明和
`update-manifest.json`，供官网和已安装的 App 匿名读取。

任何 GitHub Token、Android 签名文件、密码或 API Key 都不得写入本仓库、网页
环境变量、Release 说明或构建日志。

## 自动发布链路

1. 在私有 `dreamtide` 仓库更新 `package.json`：
   - `version` 使用 `x.y.z`；
   - `dreamtide.androidVersionCode` 必须比上个版本大。
2. 在私有仓库创建并发布标签为 `v<version>` 的 GitHub Release。
3. 私有仓库的 `publish-android-release.yml` 自动测试、构建并签名 APK。
4. 工作流将同标签 Release、APK 和 `update-manifest.json` 镜像到本公开仓库。
5. 官网通过本仓库 Latest Release API 自动显示最新 APK。
6. App 通过 Latest Release 中的 `update-manifest.json` 自动检查更新。

官网不访问私有仓库，也不需要重新构建才能识别新的公开 Release。

## 公开 Release 文件

每个正式 Release 必须包含：

```text
DreamTide-v0.3.0.apk
update-manifest.json
```

Manifest 包含版本、Android versionCode、公开 APK 地址、SHA-256、更新说明和
发布时间。App 只接受本仓库 Release 下的 HTTPS APK 地址，并在打开系统安装器前
校验 SHA-256。

## 首次设置

首次正式发布前，需要在私有 `dreamtide` 仓库配置 Android 签名 Secrets 和一个
仅可写入本仓库的跨仓库凭据。具体名称及最小权限见私有仓库
`docs/android-releasing.md`。

不要在两个仓库之间手工复制 Secret，也不要把 Secret 放进 APK 或前端代码。
