# 官网截图与动图

将正式素材按以下名称放入目录，页面会自动使用，无需修改代码：

- `hero/home.webp`：首屏主截图，推荐 1080 × 2160，纵向 1:2。
- `features/record.webp`：刻梦功能截图，推荐 1440 × 1080，4:3。
- `features/annotate.webp`：标/隐/注截图，推荐 1440 × 1080，4:3。
- `features/review.webp`：日历/档案/词云截图，推荐 1440 × 1080，4:3。
- `tutorial/01-install.gif`：下载与安装步骤，推荐 1200 × 900，4:3。
- `tutorial/02-record.gif`：开始刻梦步骤，推荐 1200 × 900，4:3。
- `tutorial/03-organize.gif`：保存与整理步骤，推荐 1200 × 900，4:3。
- `tutorial/04-review.gif`：回看步骤，推荐 1200 × 900，4:3。

单个 GIF 建议不超过 5 MB。体积更大时优先转换为动画 WebP，并同步修改
`src/content/siteContent.ts` 中对应的扩展名。素材缺失时，官网会显示固定比例的
品牌占位画面，不会破坏布局。
