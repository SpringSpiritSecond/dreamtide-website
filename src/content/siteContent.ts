export type Feature = {
  number: string;
  title: string;
  description: string;
  media?: {
    src: string;
    alt: string;
    label: string;
  };
};

export type TutorialStep = {
  number: string;
  title: string;
  description: string;
  media: {
    src: string;
    alt: string;
    label: string;
  };
};

export const features: Feature[] = [
  {
    number: '01',
    title: '趁记忆还清晰，写下梦',
    description: '用“刻梦”记录正文，支持暂存与正式保存。',
    media: {
      src: 'media/features/record.webp',
      alt: '梦潮刻梦书写界面',
      label: '刻梦 · 记录',
    },
  },
  {
    number: '02',
    title: '为梦留下线索',
    description:
      '保存后添加标签、隐私标记和注记，也可以获得 AI 参考解读。',
    media: {
      src: 'media/features/annotate.webp',
      alt: '梦潮标签、隐私和注记界面',
      label: '标 · 隐 · 注',
    },
  },
  {
    number: '03',
    title: '在时间里重新遇见',
    description: '从日历、档案与词云回看过去的梦。',
    media: {
      src: 'media/features/review.webp',
      alt: '梦潮日历、档案与词云回看界面',
      label: '梦潮 · 回看',
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
    media: {
      src: 'media/tutorial/01-install.gif',
      alt: '下载并安装梦潮 Android 版的步骤演示',
      label: '01 · 下载与安装',
    },
  },
  {
    number: '02',
    title: '写下第一场梦',
    description:
      '打开梦潮，点击醒目的“刻梦”入口。趁细节还清晰，写下你记得的画面与感受。',
    media: {
      src: 'media/tutorial/02-record.gif',
      alt: '进入刻梦并记录梦境的步骤演示',
      label: '02 · 开始刻梦',
    },
  },
  {
    number: '03',
    title: '保存并整理',
    description:
      '先暂存未完成的内容，或正式保存一场梦。保存后可添加标签、隐私标记和注记。',
    media: {
      src: 'media/tutorial/03-organize.gif',
      alt: '保存梦境并添加标签与注记的步骤演示',
      label: '03 · 保存与整理',
    },
  },
  {
    number: '04',
    title: '回到梦潮回看',
    description:
      '从日历找到某一天，从档案翻阅记录，也可以点击词云中的词重新进入相关梦境。',
    media: {
      src: 'media/tutorial/04-review.gif',
      alt: '通过日历、档案和词云回看梦境的步骤演示',
      label: '04 · 回看梦潮',
    },
  },
];
