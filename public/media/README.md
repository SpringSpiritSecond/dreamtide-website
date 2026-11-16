# 官网图片

官网展示的 App 画面全部来自新版界面设计稿（水彩泡印风格，浅色），放在 `app/` 目录。
旧版 App 的截图和录屏已经全部移除，不要再加回来。

| 文件 | 画面 | 用在哪一章 |
|---|---|---|
| `app/home-cluster.webp` | 首页 · 聚 | 开篇 |
| `app/home-date.webp` | 首页 · 字 | 开篇 |
| `app/home-month.webp` | 首页 · 历 | 开篇 |
| `app/write-draft.webp` | 刻梦 · 写到一半 | 刻梦 |
| `app/write-restore.webp` | 刻梦 · 恢复暂存 | 刻梦 |
| `app/read.webp` | 读一条梦 | 梦的层次 |
| `app/tag.webp` | 标记 | 梦的层次 |
| `app/privacy-on.webp` | 遮住人名之后 | 梦的层次 |
| `app/view-records.webp` | 观梦 · 记录 | 观梦 |
| `app/calendar-month.webp` | 日历 | 观梦 |
| `app/view-cloud.webp` | 观梦 · 词云 | 观梦 |
| `app/share.webp` | 分享长图预览 | 带走一场梦 |

## 怎么重新生成

设计稿在 App 仓库的 `docs/ui-concepts/`。用下面的脚本把每个手机画面截成单独的透明圆角 PNG，
再挑出需要的画面转成 WebP（高度不超过 1600 像素）：

```bash
node design-review/capture-ui-concepts.cjs "<App 仓库>/docs/ui-concepts" <输出目录>
```

观梦和读一条梦两组画面（`dreamtide-page-view.html`、`dreamtide-page-reading.html`）出得较晚，
设计稿如果再调整，需要重新截这几张。深色稿还没定，不要用。
