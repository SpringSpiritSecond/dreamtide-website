export type Media = {
  src: string;
  alt: string;
  label: string;
  detail?: string;
  portrait?: boolean;
  poster?: string;
};

export type GuideGroup = {
  title: string;
  summary: string;
  controls: [string, string][];
};

export type AppSection = {
  number: string;
  kicker: string;
  title: string;
  description: string;
  highlights: string[];
  media: Media[];
  guides: GuideGroup[];
};

export const appSections: AppSection[] = [
  {
    number: '01',
    kicker: 'HOME',
    title: '首页与个人设置',
    description: '首页有聚、字、历三种排布，底部是「刻梦」和「观梦」两个入口；「我的」里可以设置隐私与外观、导出本地备份。',
    highlights: ['三种首页排布', '刻梦与观梦两个入口', '隐私与本地备份'],
    media: [
      { src: 'media/app/home-cluster.webp', alt: '梦潮首页的「聚」排布：梦里的词浮成泡印，下面是本周日期和刻梦、观梦两个入口', label: '首页 · 聚', detail: '梦里反复出现的词浮成大小不同的泡印；轻点一个泡会泛起涟漪。', portrait: true },
      { src: 'media/app/home-date.webp', alt: '梦潮首页的「字」排布：大字显示今天的日期和昨晚的梦', label: '首页 · 字', detail: '用大字显示今天的日期，下面是最近一场梦的开头。', portrait: true },
      { src: 'media/app/home-month.webp', alt: '梦潮首页的「历」排布：这个月的日历', label: '首页 · 历', detail: '显示这个月的日历，有梦的日子下面留着一枚小泡印。', portrait: true },
      { src: 'media/app/account.webp', alt: '「我的」面板：隐私、外观和本机数据设置', label: '我的', detail: '在「我的」里设置人名和私密片段的显示方式、切换深浅色，或导出本地备份。', portrait: true },
    ],
    guides: [
      {
        title: '梦潮首页',
        summary: '所有主要入口都从这里开始。',
        controls: [
          ['刻梦', '新建一场梦，进入正文书写页。'],
          ['观梦', '回看过去的梦，可以按记录一条条看，也可以看词云。'],
          ['右侧的小图标', '在聚、字、历三种首页排布之间切换。'],
          ['本周日期', '今天带一个珊瑚色的圈；有梦的日子下面留着小泡印。'],
          ['词泡', '轻点会泛起涟漪，不会跳到别的页面。'],
          ['头像', '打开「我的」面板。'],
        ],
      },
      {
        title: '「我的」面板',
        summary: '管理隐私显示、外观、本机数据、模型和版本。',
        controls: [
          ['头像', '从设备选择并更换头像。'],
          ['昵称 / 修改昵称', '更改 App 内显示的昵称。'],
          ['不谈人间事', '梦里的人名显示原名、遮住，或换成化名。'],
          ['春梦了无痕', '标为私密的文字显示或藏起来。'],
          ['深色模式', '在浅色和深色之间切换。'],
          ['AI 模型设置', '选择服务、模型名、接口地址并安全保存 API Key。'],
          ['本地备份导出', '导出 JSON 备份文件；文件可能包含私人梦境，请妥善保存。'],
          ['本地数据删除', '删除当前设备上的梦境和暂存草稿，需要再次确认。'],
          ['回收站', '查看被删除的梦境，并进行恢复或彻底删除。'],
          ['版本信息', '查看当前版本、检查更新并进入新版本安装流程。'],
        ],
      },
    ],
  },
  {
    number: '02',
    kicker: 'WRITE',
    title: '刻梦书写页',
    description: '趁细节还清晰，写下梦境正文，选择发生日期，再决定暂存或正式保存。',
    highlights: ['自由书写正文', '选择梦境日期', '暂存或正式保存'],
    media: [
      { src: 'media/app/write-blank.webp', alt: '刻梦页的空白状态：只有纸、日期和两个按钮', label: '空白页', detail: '只有一张纸、日期和两个按钮；还没写字时，「保存」是灰的。', portrait: true },
      { src: 'media/app/write-draft.webp', alt: '刻梦页：正文写到一半，下方是暂存和保存按钮', label: '写到一半', detail: '键盘占住下半屏时，按钮跟着上移；点「暂存」后会显示暂存的时间。', portrait: true },
      { src: 'media/app/write-restore.webp', alt: '刻梦页：上次暂存的正文和日期回到纸上', label: '恢复暂存', detail: '再进来时，上次暂存的正文和日期会原样回到纸上。', portrait: true },
      { src: 'media/app/write-edit.webp', alt: '刻梦页：修改一场已经保存的梦', label: '修改旧梦', detail: '从梦境页点「编辑」进来，按钮变成「保存修改」。', portrait: true },
    ],
    guides: [
      {
        title: '刻梦书写页',
        summary: '负责写正文、选择梦境日期并保存。',
        controls: [
          ['正文区域', '输入梦境内容；新建时可以继续恢复此前暂存的正文。'],
          ['梦境日期', '选择梦实际发生的日期，只能选择今天或过去日期。'],
          ['暂存', '保存当前正文和日期，但不把它变成正式梦境，也不会离开当前页面。'],
          ['正式保存 / 保存这场梦', '生成正式记录并进入阅读状态，之后才能添加标签、隐私标记和注记。'],
          ['保存编辑', '编辑已有梦境时写回修改；如需调整梦境日期，也可在书写页重新选择。'],
          ['返回', '使用 Android 系统返回操作，回到上一个页面。'],
        ],
      },
    ],
  },
  {
    number: '03',
    kicker: 'ORGANIZE',
    title: '梦境记录与线索',
    description: '保存后可补充情绪、标签、分类和人物，也能添加注记、标记需要隐藏的内容。',
    highlights: ['补充标签与人物', '隐藏私密人物或片段', '添加注记与 AI 释梦'],
    media: [
      { src: 'media/app/read.webp', alt: '读一条梦：标题、日期、梦里的词浮成泡印，下面是正文和底部操作', label: '读一条梦', detail: '梦里的词浮成泡印，下面是正文；底部是分享、编辑、标隐注、释梦和删除。', portrait: true },
      { src: 'media/app/tag.webp', alt: '「标记」工具：在正文下方点选情绪、标签和分类', label: '标记', detail: '在正文和底部操作之间展开，点选情绪、标签和分类，也能用「＋」新增。', portrait: true },
      { src: 'media/app/hide-names.webp', alt: '「隐藏」工具：不谈人间事，在正文里点选人名', label: '不谈人间事', detail: '点「点击选择」，再在正文里点一个人名，把它标成梦里的人。', portrait: true },
      { src: 'media/app/alias.webp', alt: '给梦里的人起一个化名', label: '起一个化名', detail: '标好人名后可以起一个化名，浏览时用化名代替原名。', portrait: true },
      { src: 'media/app/hide-private.webp', alt: '「隐藏」工具：春梦了无痕，选一段私密文字', label: '春梦了无痕', detail: '先点开头的字，再点一个字作为结尾，选出一段私密文字。', portrait: true },
      { src: 'media/app/privacy-on.webp', alt: '隐私打开之后：人名被墨迹遮住，私密片段藏起来', label: '隐私打开之后', detail: '在「我的」里打开隐私后，人名被墨迹遮住，私密片段不再显示。', portrait: true },
      { src: 'media/app/note.webp', alt: '「注记」工具：全文注记和片段注记', label: '注记', detail: '写下整场梦的全文注记，或者选一段正文写片段注记。', portrait: true },
      { src: 'media/app/ai.webp', alt: 'AI 释梦面板：选择模型，生成并保存释梦', label: 'AI 释梦', detail: '选好模型后点「生成」，满意的结果可以保存在这场梦里。', portrait: true },
    ],
    guides: [
      {
        title: '读一条梦',
        summary: '重读正文，并用底部的操作补上更多细节。标记、隐藏、注记会在正文下方展开。',
        controls: [
          ['编辑', '重新进入正文编辑状态；在隐私选择状态下需要先退出该状态。'],
          ['标记', '从下半页打开标签面板，维护情绪、内容标签和分类。'],
          ['隐藏', '进入隐私标记状态，选择人物名称或私密片段。'],
          ['注记', '打开全文注记、片段注记和 AI 释梦。'],
          ['分享', '生成完整纵向图片并先打开预览，不会立即发送。'],
          ['删除', '确认后把当前梦境移入回收站。'],
          ['正文翻页', '正文较长时左右切换阅读页，继续阅读后面的内容。'],
        ],
      },
      {
        title: '「标记」面板',
        summary: '为梦添加情绪、内容标签和分类。',
        controls: [
          ['情绪', '选择梦中的情绪状态；它也会影响档案卡片的视觉提示。'],
          ['标签', '选择已有或推荐的内容词，也可以通过“＋”新增自定义标签。'],
          ['分类', '从反复梦、清醒梦、噩梦、春梦、人间梦、残梦、午间梦中选择。'],
          ['推荐词', '选择系统从当前正文提取的候选词；推荐词会放在对应类型中。'],
        ],
      },
      {
        title: '「隐藏」面板',
        summary: '标记内容和浏览时的显示开关是两件事。',
        controls: [
          ['不谈人间事', '在正文中标记人物名称；确认后可填写化名，也可以只使用墨迹遮盖。标记的人物也可用于档案筛选。'],
          ['春梦了无痕', '选择一段私密文字并确认；浏览时可用删除动画隐藏，用打字动画恢复。'],
          ['确定', '保存当前划线选中的人物或片段；没有选中内容时不会误保存。'],
          ['显示方式', '人名和私密片段在浏览时怎么显示，在「我的」面板里设置。'],
        ],
      },
      {
        title: '「注记」与 AI 释梦',
        summary: '写下全文或片段注记；需要时可自行配置模型生成参考解释。',
        controls: [
          ['全文注记输入框', '写下对整场梦的感受与联想。'],
          ['划选正文', '选中某段文字后打开片段注记输入框，把当下的感受留在具体位置。'],
          ['片段注记标记', '查看已有片段注记，或继续补写。'],
          ['AI 服务 / 模型', '选择已配置的 DeepSeek、通义千问、豆包、OpenAI、Claude、Gemini 或兼容接口。'],
          ['生成释梦', '把当前梦境、标签和已有注记发送到所选服务，生成参考解释。'],
          ['填写 API Key', '当前服务尚未配置时打开安全输入框；Key 不进入普通本地存储或备份。'],
          ['保存释梦', '把满意的生成结果跟随当前梦境保存在本机。'],
        ],
      },
    ],
  },
  {
    number: '04',
    kicker: 'VIEW · RECORDS',
    title: '观梦 · 记录',
    description: '在观梦页按时间一条条回看过去的梦，用搜索和筛选缩小范围，再打开正文继续阅读。',
    highlights: ['多条件筛选', '按时间浏览档案', '随时回到梦境正文'],
    media: [
      { src: 'media/app/view-records.webp', alt: '观梦的记录：按月份排列的梦境，每条有标题、摘录和标签', label: '记录', detail: '梦按月份排列，每条有标题、日期、摘录和标签；点开一条，回到那场梦的正文。', portrait: true },
      { src: 'media/app/view-filter.webp', alt: '观梦的筛选面板：搜索、情绪、人物、标签、分类和时间', label: '搜索与筛选', detail: '组合关键词、情绪、人物、标签、分类和时间，缩小要回看的范围。', portrait: true },
      { src: 'media/app/view-filtered.webp', alt: '筛选之后的观梦记录，标题下显示当前的筛选条件', label: '筛选之后', detail: '当前的筛选条件显示在标题下面，列表只留下符合的梦。', portrait: true },
    ],
    guides: [
      {
        title: '观梦 · 记录',
        summary: '查找、筛选并打开过去的梦。',
        controls: [
          ['记录 / 词云', '在观梦页标题下切换两种看法；筛选条件保持不变。'],
          ['搜索与筛选', '打开筛选面板。'],
          ['关键词', '搜索标题或正文内容。'],
          ['标签 / 人物 / 分类', '按已经添加的线索缩小档案范围。'],
          ['开始日期 / 结束日期', '只查看某个时间段内发生的梦。'],
          ['清空', '清除筛选条件，恢复完整列表。'],
          ['梦境卡片', '打开该梦的正文阅读页。'],
          ['新增梦境', '直接进入刻梦页新建记录。'],
        ],
      },
    ],
  },
  {
    number: '05',
    kicker: 'VIEW · WORD CLOUD',
    title: '观梦 · 词云',
    description: '在观梦页换成词云，看梦里反复出现的词；点一个词，下面列出提到它的梦。',
    highlights: ['聚焦高频词', '查看相关梦境', '调整范围与屏蔽词'],
    media: [
      { src: 'media/app/view-cloud.webp', alt: '观梦的词云：反复出现的词浮成大小不同的泡印', label: '词云', detail: '出现得越多的词，泡印越大；下面按次数列出其余的词。', portrait: true },
      { src: 'media/app/view-cloud-filtered.webp', alt: '带筛选的词云：只统计符合筛选条件的梦', label: '筛选之后', detail: '筛选条件在记录和词云之间保留；词云只统计符合条件的梦。', portrait: true },
      { src: 'media/app/view-cloud-word.webp', alt: '在词云里点了「码头」之后，下面列出相关的梦', label: '点一个词', detail: '点一个词，它会泛起涟漪，下面列出提到它的梦，也可以屏蔽这个词。', portrait: true },
    ],
    guides: [
      {
        title: '观梦 · 词云',
        summary: '按词查看相关梦境，也可调整筛选或屏蔽词语。',
        controls: [
          ['词云中的词', '聚焦该词，并列出所有包含它的相关梦境。'],
          ['相关梦境卡片', '打开对应梦境正文。'],
          ['词云筛选', '按关键词、情绪、人物、标签、分类或日期范围筛选梦境。'],
          ['屏蔽词语', '把不想关注的高频词从词云中隐藏。'],
          ['隐私设置', '「我的」里的人名与私密片段设置，对记录和词云同样生效。'],
        ],
      },
    ],
  },
  {
    number: '06',
    kicker: 'CALENDAR',
    title: '日历与当天',
    description: '在月历上按日子回看，有梦的日期下面留着小泡印；也能为选中的那一天再记一场梦。',
    highlights: ['按月份回看', '打开某一天的梦', '为那一天补记'],
    media: [
      { src: 'media/app/calendar-month.webp', alt: '日历页：十一月月历，有梦的日期带着泡印，下面列出选中那天的梦', label: '月历', detail: '点一个日期，下面列出那天的梦；今天带一个珊瑚色的圈。', portrait: true },
      { src: 'media/app/calendar-day.webp', alt: '当天页：十一月十日的两场梦', label: '当天', detail: '点日期标题，打开那一天的梦境页，按顺序读完当天的梦。', portrait: true },
    ],
    guides: [
      {
        title: '完整月历与当天梦境',
        summary: '先选择日期，再查看或记录那一天的梦。',
        controls: [
          ['上个月 / 下个月', '切换月历；不能切换到未来月份。'],
          ['月份名称', '选择需要查看的年份和月份。'],
          ['月历中的日期', '选中该日并显示当天记录；未来日期不可选择。'],
          ['日期标题', '打开该日梦境页，阅读已有记录。'],
          ['记录梦境 / 再记一场梦', '从选定日期进入刻梦页。'],
        ],
      },
    ],
  },
  {
    number: '07',
    kicker: 'SHARE',
    title: '分享长图',
    description: '把一场梦生成一张完整的长图，先预览，再决定保存到手机，或者通过系统分享发给别人。',
    highlights: ['完整长图预览', '保存到手机', '调用系统分享'],
    media: [
      { src: 'media/app/share.webp', alt: '分享图片预览：一场梦生成的长图，下面是保存图片和分享', label: '分享长图', detail: '先看整张长图；点「保存图片」存到手机，或点「分享」选择发给谁。', portrait: true },
    ],
    guides: [
      {
        title: '分享长图',
        summary: '先检查长图，再决定保存或发送。',
        controls: [
          ['保存图片', '把完整梦境长图保存到设备的 Documents/DreamTide。'],
          ['分享', '打开 Android 系统分享面板，选择具体应用发送。'],
          ['关闭', '退出预览，不保存也不分享。'],
        ],
      },
    ],
  },
];
