export type Media = { src: string; alt: string; label: string; portrait?: boolean };
export type Feature = { number: string; kicker: string; title: string; description: string; steps: string[]; media?: Media[] };
export type TutorialStep = { number: string; title: string; description: string; media: Media[] };

export const features: Feature[] = [
  {
    number: '01', kicker: 'RECORD',
    title: '写下并保存一场梦',
    description: '从醒来后的第一个片段开始，把一场梦完整留在本机。',
    steps: ['点击首页的“新增”进入刻梦', '写下仍记得的画面、人物与感受', '没写完可以暂存，完成后再正式保存'],
    media: [{ src: 'media/首页.mp4', alt: '在梦潮中记录梦境的操作演示', label: '刻梦 · 记录与保存', portrait: true }],
  },
  {
    number: '02', kicker: 'ORGANIZE',
    title: '让梦的线索慢慢浮现',
    description: '保存后继续补充情绪、场景、人物与注记。一次整理，也可能是一次重新理解。',
    steps: ['用标签标记情绪、场景、内容与人物', '给全文或选中的片段添加注记', '随时回到正文继续补充和修改'],
    media: [{ src: 'media/编辑-隐.jpg', alt: '梦境详情中的标签、隐私和注记入口', label: '标签 · 隐私 · 注记', portrait: true }],
  },
  {
    number: '03', kicker: 'PRIVACY',
    title: '决定哪些内容被看见',
    description: '先标记人物或私密片段，再选择浏览时的显示方式。分享屏幕时，也可以安心一点。',
    steps: ['“不谈人间事”可隐藏原名或显示化名', '“春梦了无痕”可隐去私密文字片段', '所有切换都由你主动控制'],
    media: [
      { src: 'media/不谈人间事.mp4', alt: '切换人物原名、遮盖和化名的演示', label: '不谈人间事', portrait: true },
      { src: 'media/春梦了无痕.mp4', alt: '隐藏与恢复私密片段的演示', label: '春梦了无痕', portrait: true },
    ],
  },
  {
    number: '04', kicker: 'REDISCOVER',
    title: '从档案与词云重新遇见梦',
    description: '按日期、人物和标签筛选过去的记录，或从反复出现的词重新进入相关梦境。',
    steps: ['在档案中搜索关键词或组合筛选', '从结果中打开正文并继续阅读', '点击词云中的词，发现相互呼应的梦'],
    media: [{ src: 'media/档案.jpg', alt: '梦潮档案中的梦境记录列表', label: '档案 · 搜索与回看', portrait: true }],
  },
];

export const tutorialSteps: TutorialStep[] = [
  {
    number: '01', title: '下载并安装',
    description: '下载最新 APK，按照 Android 系统提示完成安装。首次安装可能需要允许浏览器安装未知应用。',
    media: [{ src: 'media/tutorial/01-install.gif', alt: '下载并安装梦潮 Android 版', label: '01 · 下载与安装' }],
  },
  {
    number: '02', title: '写下第一场梦',
    description: '打开梦潮，点击醒目的“刻梦”入口。趁细节还清晰，写下你记得的画面与感受。',
    media: [{ src: 'media/首页.mp4', alt: '进入刻梦并写下第一场梦', label: '02 · 开始刻梦', portrait: true }],
  },
  {
    number: '03', title: '整理并分享',
    description: '保存以后，补充标签、隐私标记和注记。想要分享时，也能生成更适合阅读的梦境卡片。',
    media: [{ src: 'media/分享.png', alt: '梦潮生成的梦境分享卡片', label: '03 · 整理与分享' }],
  },
  {
    number: '04', title: '在梦的档案里回看',
    description: '从筛选结果打开一段旧梦，或点击词云里反复出现的词，看看它曾在哪些夜晚出现。',
    media: [
      { src: 'media/档案 筛选.jpg', alt: '梦潮档案筛选界面', label: '筛选档案', portrait: true },
      { src: 'media/档案 正文.mp4', alt: '从档案打开梦境正文', label: '阅读正文', portrait: true },
      { src: 'media/词云.mp4', alt: '通过词云回看相关梦境', label: '词云回看', portrait: true },
    ],
  },
];
