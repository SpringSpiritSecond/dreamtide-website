export type Media = {
  src: string;
  alt: string;
  label: string;
  portrait?: boolean;
};

export type Feature = {
  number: string;
  title: string;
  description: string;
  media?: Media;
};

export type TutorialStep = {
  number: string;
  title: string;
  description: string;
  media: Media[];
};

export const features: Feature[] = [
  {
    number: '01',
    title: '趁记忆还清晰，写下梦',
    description: '用“刻梦”记录正文，支持暂存与正式保存。',
    media: {
      src: 'media/不谈人间事.mp4',
      alt: '在梦潮中写下梦境正文的操作演示',
      label: '刻梦 · 记录',
      portrait: true,
    },
  },
  {
    number: '02',
    title: '为梦留下线索',
    description:
      '保存后添加标签、隐私标记和注记，也可以获得 AI 参考解读。',
    media: {
      src: 'media/编辑-隐.jpg',
      alt: '梦潮梦境详情中的隐私标记界面',
      label: '标 · 隐 · 注',
      portrait: true,
    },
  },
  {
    number: '03',
    title: '在时间里重新遇见',
    description: '从日历、档案与词云回看过去的梦。',
    media: {
      src: 'media/档案.jpg',
      alt: '梦潮档案中的梦境记录列表',
      label: '梦潮 · 档案',
      portrait: true,
    },
  },
  {
    number: '04',
    title: '梦留在你的设备里',
    description:
      '当前数据本地保存，并支持导出备份。梦潮目前不提供云同步。',
  },
];

export const tutorialSteps: TutorialStep[] = [
  {
    number: '01',
    title: '下载并安装',
    description:
      '下载最新版 APK，按照 Android 系统提示完成安装。首次安装可能需要允许浏览器安装未知应用。',
    media: [
      {
        src: 'media/tutorial/01-install.gif',
        alt: '下载并安装梦潮 Android 版的步骤演示',
        label: '01 · 下载与安装',
      },
    ],
  },
  {
    number: '02',
    title: '写下第一场梦',
    description:
      '打开梦潮，点击醒目的“刻梦”入口。趁细节还清晰，写下你记得的画面与感受。',
    media: [
      {
        src: 'media/春梦了无痕.mp4',
        alt: '在梦潮中写下第一场梦的步骤演示',
        label: '02 · 开始刻梦',
        portrait: true,
      },
    ],
  },
  {
    number: '03',
    title: '保存、整理与分享',
    description:
      '先暂存或正式保存一场梦，再添加标签、隐私标记和注记，也可以生成分享卡片。',
    media: [
      {
        src: 'media/分享.png',
        alt: '梦潮生成的梦境分享卡片',
        label: '03 · 保存、整理与分享',
      },
    ],
  },
  {
    number: '04',
    title: '回到梦潮回看',
    description:
      '从日历找到某一天，从档案翻阅记录，也可以点击词云中的词重新进入相关梦境。',
    media: [
      {
        src: 'media/档案 筛选.jpg',
        alt: '梦潮档案筛选界面',
        label: '04 · 筛选档案',
        portrait: true,
      },
      {
        src: 'media/档案 正文.mp4',
        alt: '从梦潮档案打开梦境正文的步骤演示',
        label: '04 · 阅读正文',
        portrait: true,
      },
      {
        src: 'media/词云.mp4',
        alt: '通过梦潮词云回看相关梦境的步骤演示',
        label: '04 · 词云回看',
        portrait: true,
      },
    ],
  },
];
