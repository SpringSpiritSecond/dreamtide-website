# DreamTide Release 同步设计

## 目标

以 App 仓库发布的 GitHub Release 为唯一对外版本源，在 Release 发布后自动：

1. 将 APK 镜像到公开官网仓库的同标签 GitHub Release。
2. 将 Release 元数据写入官网仓库的 `public/releases.json`。
3. 让官网和 App 内更新检测读取同一份公开清单。

App 源码仓库未来可以设为 private。官网和 App 客户端均不得持有访问私有仓库的凭据，也不得直接请求私有仓库 API。

## 已有实现

### App 仓库

- 仓库：`SpringSpiritSecond/dreamtide`
- 默认分支：`main`
- 当前版本：`v0.2.1`
- `package.json` 的 `version` 为 `0.2.1`。
- `android/app/build.gradle` 的 `versionName` 为 `0.2.1`，`versionCode` 为 `3`。
- `.github/workflows/android-build.yml` 在 `main` push 或手动触发时构建 debug APK，并上传 Actions artifact，但不创建 GitHub Release。
- Release APK 命名规则为 `DreamTide-v<版本号>.apk`。
- `src/App.tsx` 已有版本信息弹窗和联网检查逻辑，但仍使用占位仓库 URL，且当前版本硬编码为 `0.1.0`。
- 尚无独立 update manifest。

### 官网仓库

- 仓库：`SpringSpiritSecond/dreamtide-website`
- 默认分支：`main`，当前没有分支保护。
- 已有同标签公开 Release 和 APK，例如 `v0.2.1`。
- 官网目前在浏览器中直接请求官网仓库的 GitHub Latest Release API。
- `.github/workflows/deploy-pages.yml` 会在 `main` push 后测试、构建并部署 GitHub Pages。
- `public/` 内容会作为站点静态资源部署。

## 架构

采用私有 App 仓库主动推送的单向同步方式：

```text
App GitHub Release published
  -> App Action 使用当前仓库 GITHUB_TOKEN 下载该 Release APK
  -> 使用 WEB_REPO_TOKEN 创建或更新官网仓库同标签公开 Release
  -> 上传 APK 到公开 Release
  -> 生成 public/releases.json
  -> commit 并 push 官网 main
  -> 官网 Pages 工作流自动部署
  -> 官网和 App 匿名读取公开 releases.json
```

不采用官网仓库反向读取私有仓库或定时轮询。这样访问私有 App 仓库的能力只存在于 App 仓库自身的 Action 中。

## 同步工作流

App 仓库新增 `.github/workflows/sync-release-to-web.yml`，仅监听：

```yaml
on:
  release:
    types:
      - published
```

工作流执行以下步骤：

1. 从 `github.event.release` 读取 tag、名称、正文、发布时间和更新时间。
2. 在 Release assets 中寻找名称严格匹配 `DreamTide-<tag>.apk` 的 APK。
3. 找不到匹配 APK 时失败，不提交不完整清单。
4. 使用 App 仓库自动提供的 `GITHUB_TOKEN` 下载 private Release asset。
5. 使用 `WEB_REPO_TOKEN` 在官网仓库创建同 tag Release；若已存在则更新标题和说明。
6. 使用 `--clobber` 幂等上传 APK，确保同 tag 重跑时不会产生重复 asset。
7. 将公开 Release asset URL 写入 `public/releases.json`。
8. 仅暂存 `public/releases.json`，有变化时提交 `Sync DreamTide release <tag>` 并 push 到 `main`。

工作流设置 `contents: read`，使默认 `GITHUB_TOKEN` 只能读取 App Release。跨仓库写入完全由单独的 `WEB_REPO_TOKEN` 完成。

## 公开清单

`public/releases.json` 的结构为：

```json
{
  "latest_version": "v0.2.1",
  "name": "DreamTide v0.2.1",
  "release_notes": "Markdown release notes",
  "published_at": "2026-07-20T15:57:23Z",
  "download_url": "https://github.com/SpringSpiritSecond/dreamtide-website/releases/download/v0.2.1/DreamTide-v0.2.1.apk",
  "file_name": "DreamTide-v0.2.1.apk",
  "file_size": 4847264,
  "updated_at": "2026-07-20T15:57:23Z"
}
```

字段含义：

- `latest_version`：带 `v` 的 Git tag，是官网与 App 更新比较的最新版本。
- `name`：Release 展示名称。
- `release_notes`：原始 Markdown Release body。
- `published_at`：源 Release 发布时间。
- `download_url`：官网仓库公开 Release 中 APK 的匿名下载地址。
- `file_name`、`file_size`：供官网保留现有文件名和大小展示。
- `updated_at`：源 Release 的更新时间，保持重跑结果稳定。

工作流必须通过 JSON 工具传参生成文件，不能用字符串拼接 Release body，以正确处理换行、引号和非 ASCII 字符。

## 官网读取

官网的 Release 数据层改为请求 `${import.meta.env.BASE_URL}releases.json`。在当前 GitHub Pages 项目站点上，实际地址为：

`https://springspiritsecond.github.io/dreamtide-website/releases.json`

现有加载、失败和缺少 APK 的状态保持不变。下载按钮只使用清单中的公开 `download_url`。官网不再请求 App 仓库或 GitHub API，也不保存 Token。

本次不改网页布局、图片、视频或正文内容，只修改 Release 数据读取、对应测试和静态清单。

## App 内更新检测

复用 `src/App.tsx` 已有的版本信息弹窗和 `checkForUpdates` 流程：

1. 当前版本从 App 仓库根目录 `package.json` 导入，不再硬编码。
2. manifest URL 改为公开官网的 `releases.json`。
3. 校验 `latest_version`、`download_url` 和可选 Release 字段。
4. 使用现有版本比较逻辑判断是否有新版本。
5. 有新版本时显示最新版本、更新说明和“下载更新”入口。
6. 下载入口打开公开官网 Release APK URL。
7. 离线、超时或清单无效时继续显示现有“不影响本地使用”反馈。

App 不访问私有仓库，也不在包内嵌入 Token。

## 权限与 Secret

在 App 仓库 Actions Secrets 中配置：

- 名称：`WEB_REPO_TOKEN`
- 类型：GitHub fine-grained personal access token
- Repository access：仅选择 `SpringSpiritSecond/dreamtide-website`
- Repository permissions：`Contents: Read and write`
- 其他仓库权限：`No access`
- 有效期：选择可接受的最短周期，并在到期前轮换

`Contents: Read and write` 同时用于推送 `public/releases.json`、创建公开 Release 和上传 Release asset。Token 不写入源码、JSON、日志、Vite 环境变量或 Pages 配置。

使用 PAT 推送而不是官网仓库默认 `GITHUB_TOKEN`，因此该 push 会正常触发官网 Pages 工作流。

## 并发、失败与恢复

- 工作流使用按目标仓库划分的 concurrency group，避免两个发布同步同时修改官网分支。
- 不取消正在执行的同步，防止较早任务在资源上传中途被终止。
- APK 缺失、下载失败、公开 Release 更新失败、JSON 生成失败或 push 失败均使工作流失败。
- 只有公开 APK 上传成功后才写入并 push 清单，避免清单指向尚不存在的文件。
- 同 tag 重跑会更新 Release 并覆盖同名 APK；无 JSON 差异时不创建空提交。
- 官网仓库未来若启用禁止直推的分支保护，需要将提交步骤改为自动 PR；当前不需要。

## 版本源规则

- 对外“最新版本”的权威来源是已发布的 App GitHub Release。
- App 构建前仍需保证 `package.json.version`、Android `versionName`、`versionCode` 和 tag 符合现有发布规则。
- App 运行时当前版本取自 `package.json.version`。
- 官网与 App 运行时最新版本都取自同步生成的 `releases.json`。
- Release notes 继续以 App Release body 为权威内容。

## 验证

### 静态验证

- 使用 `actionlint` 校验新增 workflow 的 GitHub Actions 表达式和 YAML 结构。
- 解析 `public/releases.json`，确认是有效 JSON 且字段类型正确。
- 检查 workflow 与前端源码中不存在硬编码 Token。

### 自动化测试

- 官网 Release 数据层测试覆盖成功、请求失败、清单无效和无下载地址。
- App manifest 解析与版本比较测试覆盖带 `v` 版本、较新版本、相同版本和无效清单。
- 官网执行 lint、单元测试和生产构建。
- App 执行 lint、单元测试和生产构建。

### 集成验收

首次可通过重新发布测试 Release 或临时手动触发等价测试分支验证：

1. 官网仓库出现同 tag 的公开 Release 和 APK。
2. `public/releases.json` 只包含 Release 元数据及公开 APK 地址。
3. 自动提交消息为 `Sync DreamTide release <tag>`。
4. 官网 Pages 部署成功。
5. 未登录 GitHub 的浏览器可读取 JSON 并下载 APK。
6. 官网显示版本、日期、说明和下载入口。
7. 旧版 App 能检测到较新版本并打开公开下载地址。

## 修改边界

官网仓库当前已有未提交的 `README.md` 和 `COMMITS.md` 变更。本功能不修改、暂存或覆盖这些文件，也不修改正在处理的网页代码布局和媒体资源。

实现只涉及：

- App：新同步 workflow、版本清单解析/测试、现有版本弹窗的最小接线。
- 官网：`public/releases.json`、Release 数据层及其测试、发布说明文档。

