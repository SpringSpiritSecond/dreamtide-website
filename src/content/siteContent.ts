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
  steps: string[];
  media?: Media[];
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
    title: '写下并保存一场梦',
    description: '从醒来后的片段开始，把一场梦完整留在本机。',
    steps: [
      '在首页点击“新增”进入刻梦。',
      '写下仍记得的画面、人物与感受，标题会自动生成。',
      '未写完时先暂存；完成后正式保存。',
    ],
    media: [
      {
        src: 'media/features/record.webp',
        alt: '在梦潮中记录并保存梦境的步骤演示',
        label: '刻梦 · 记录与保存',
        portrait: true,
      },
    ],
  },
  {
    number: '02',
    title: '用标签和注记整理梦',
    description: '保存后继续补充线索，让以后更容易找到和理解这场梦。',
    steps: [
      '打开已保存的梦，点击“标”添加情绪、场景、内容、分类和人物标签。',
      '点击“注”添加全文注记，或先划选正文再记录片段注记。',
      '需要修改正文时，退出其他操作状态后点击“编辑”。',
    ],
    media: [
      {
        src: 'media/编辑-隐.jpg',
        alt: '梦潮梦境详情中的标签、隐私和注记入口',
        label: '标 · 隐 · 注',
        portrait: true,
      },
    ],
  },
  {
    number: '03',
    title: '隐私浏览时，决定哪些内容被看见',
    description: '先标记人物或私密片段，再用全局开关控制浏览时的显示方式。',
    steps: [
      '打开一场梦并点击“隐”，先选“不谈人间事”或“春梦了无痕”，再划选正文并确认。',
      '不谈人间事：浏览时在显、隐、化之间切换；水墨遮住原名，“化”状态显示化名。',
      '春梦了无痕：浏览时在显、隐之间切换；删除动画隐藏，打字动画恢复。',
    ],
    media: [
      {
        src: 'media/不谈人间事.mp4',
        alt: '浏览梦境时切换人物原名、水墨遮盖和化名的演示',
        label: '不谈人间事 · 显 / 隐 / 化',
        portrait: true,
      },
      {
        src: 'media/春梦了无痕.mp4',
        alt: '浏览梦境时隐藏和恢复私密片段的演示',
        label: '春梦了无痕 · 显 / 隐',
        portrait: true,
      },
    ],
  },
  {
    number: '04',
    title: '从档案和词云重新找到梦',
    description: '按线索筛选过去的记录，或从反复出现的词重新进入相关梦境。',
    steps: [
      '进入档案，输入关键词，或按标签、人物、分类和日期筛选。',
      '从结果中打开梦境正文，继续查看标签和注记。',
      '也可以在首页点击词云中的词，查看包含该词的相关梦境。',
    ],
    media: [
      {
        src: 'media/档案.jpg',
        alt: '梦潮档案中的梦境记录列表',
        label: '梦潮 · 档案与回看',
        portrait: true,
      },
    ],
  },
  {
    number: '05',
    title: '梦留在你的设备里',
    description:
      '当前数据本地保存，并支持导出备份。梦潮目前不提供云同步。',
    steps: [
      '在设置中导出本地 JSON 备份。',
      '把导出文件保存到安全位置，不要上传包含隐私内容的文件。',
      '当前版本不能从备份恢复；清除 App 数据或卸载会删除本机内容。',
    ],
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
        src: 'media/tutorial/02-record.gif',
        alt: '进入刻梦并写下第一场梦的步骤演示',
        label: '02 · 开始刻梦',
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
