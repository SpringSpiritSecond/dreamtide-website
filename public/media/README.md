# 官网图片

官网展示的 App 画面全部来自新版界面设计稿（水彩泡印风格，浅色），放在 `app/` 目录。
旧版 App 的截图和录屏已经全部移除，不要再加回来。

| 文件 | 画面 | 用在哪里 |
|---|---|---|
| `app/home-cluster.webp` | 首页 · 聚 | 首页开篇、功能页 01 |
| `app/home-date.webp` | 首页 · 字 | 首页开篇、功能页 01 |
| `app/home-month.webp` | 首页 · 历 | 首页开篇、功能页 01 |
| `app/account.webp` | 「我的」面板 | 首页「只留在你的手机里」、功能页 01 |
| `app/write-blank.webp` | 刻梦 · 空白页 | 功能页 02 |
| `app/write-draft.webp` | 刻梦 · 写到一半 | 首页「刻梦」、功能页 02 |
| `app/write-restore.webp` | 刻梦 · 恢复暂存 | 首页「刻梦」、功能页 02 |
| `app/write-edit.webp` | 刻梦 · 修改旧梦 | 功能页 02 |
| `app/read.webp` | 读一条梦 | 首页「梦的层次」「带走一场梦」、功能页 03 |
| `app/tag.webp` | 标记 | 首页「梦的层次」、功能页 03 |
| `app/hide-names.webp` | 隐藏 · 不谈人间事 | 功能页 03 |
| `app/alias.webp` | 起一个化名 | 功能页 03 |
| `app/hide-private.webp` | 隐藏 · 春梦了无痕 | 功能页 03 |
| `app/privacy-on.webp` | 隐私打开之后 | 首页「只留在你的手机里」、功能页 03 |
| `app/note.webp` | 注记 | 功能页 03 |
| `app/ai.webp` | AI 释梦 | 功能页 03 |
| `app/view-records.webp` | 观梦 · 记录 | 首页「观梦」、功能页 04 |
| `app/view-filter.webp` | 观梦 · 筛选面板 | 功能页 04 |
| `app/view-filtered.webp` | 观梦 · 带筛选的记录 | 功能页 04 |
| `app/view-cloud.webp` | 观梦 · 词云 | 首页「观梦」、功能页 05 |
| `app/view-cloud-filtered.webp` | 观梦 · 同一筛选下的词云 | 功能页 05 |
| `app/view-cloud-word.webp` | 观梦 · 点了「码头」 | 功能页 05 |
| `app/calendar-month.webp` | 日历 · 月历 | 首页「回到那一天」、功能页 06 |
| `app/calendar-day.webp` | 日历 · 当天 | 首页「回到那一天」、功能页 06 |
| `app/share.webp` | 分享长图预览 | 首页「带走一场梦」、功能页 07 |

## 怎么重新生成

设计稿在 App 仓库的 `docs/ui-concepts/`。用下面的脚本把每个手机画面截成单独的透明圆角 PNG，
再挑出需要的画面转成 WebP（高度不超过 1600 像素）：

```bash
node design-review/capture-ui-concepts.cjs "<App 仓库>/docs/ui-concepts" <输出目录>
```

观梦和读一条梦两组画面（`dreamtide-page-view.html`、`dreamtide-page-reading.html`）出得较晚，
设计稿如果再调整，需要重新截这几张。深色稿还没定，不要用。
