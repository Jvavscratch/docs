// VitePress 配置文件
// srcDir 默认为 `.`，即本仓库(docs/)根目录；配置文件自身位于 docs/.vitepress/。
import { defineConfig } from 'vitepress'

export default defineConfig({
  // 站点基础信息
  title: 'Jvavscratch',
  // jvavscratch 是一个把 JavaScript(及类 JS 语法)AOT 编译为 Scratch 3.0 `.sb3` 项目的编译器。
  description: 'jvavscratch —— 将 JavaScript 源码提前编译(AOT)为 Scratch 3.0 项目文件(.sb3)的编译器',
  lang: 'zh-CN',

  // 部署在 GitHub Pages 的 project page 下，站点位于 https://<org>.github.io/docs/。
  // 若以后改用自定义域名(或 user/org page，站点根路径为 `/`)，需要把这里改回 '/'。
  base: '/docs/',

  // 死链检查保持**开启**,只对下面这批历史遗留链接放行。
  //
  // 这些页面在仓库里确实还不存在,而本次整理的范围是「让站点能构建起来」,
  // 不包含撰写新文档,所以不能靠杜撰内容来消除。这里用显式白名单而不是
  // `ignoreDeadLinks: true`:后者会把**将来**新引入的死链一并吞掉,让校验
  // 形同虚设;白名单则会继续拦住任何新增的死链。
  //
  // 补齐对应页面后,把这一项从数组里删掉即可恢复校验。
  // 注意:VitePress 是按**解析后的绝对路径**精确匹配,不做子串匹配,
  // 所以下面每条都要写完整的站内路径,写 `tutorials` 是匹配不上
  // `/guide/tutorials` 的。
  ignoreDeadLinks: [
    '/contributing',      // api/index.md 的贡献指南页,尚未撰写
    '/examples/index',    // api/index.md 的示例索引
    '/guide/tutorials',   // api/examples.md 的教程页
    '/advanced/index',    // api/examples.md 的进阶示例
    '/plugins',           // modules/core.md 的插件机制说明
    '/extending',         // modules/index.md 的扩展指南
  ],

  // 构建产物目录(相对于 docs/)，deploy 脚本与 .gitignore 都按这个路径处理
  outDir: 'dist',

  // VitePress 的首页约定文件名是 `index.md`，而本仓库的首页是 `README.md`。
  // 这里用 rewrites 把 README.md 映射到首页路由，避免改动 README.md 本身。
  rewrites: {
    'README.md': 'index.md'
  },

  themeConfig: {
    // 顶部导航栏
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '语法', link: '/grammar/' },
      { text: 'API', link: '/api/' },
      { text: '模块', link: '/modules/' },
      { text: '语言参考', link: '/reference/language-reference' },
      { text: '笔记', link: '/notes/' },
      { text: 'FAQ', link: '/faq/' }
    ],

    // 侧边栏：条目与实际存在的 .md 文件一一对应，text 取各文档的 H1 标题
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '基本使用', link: '/guide/basic-usage' }
        ]
      },
      {
        text: '语法',
        items: [
          { text: 'jvavscratch 语法介绍', link: '/grammar/' },
          { text: '变量和赋值', link: '/grammar/variables' },
          { text: '函数', link: '/grammar/functions' },
          { text: '类和继承', link: '/grammar/classes' },
          { text: '控制流', link: '/grammar/control-flow' },
          { text: '事件块', link: '/grammar/events' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'API参考', link: '/api/' },
          { text: '内置函数', link: '/api/builtins' },
          { text: '运动API', link: '/api/motion' },
          { text: '外观API', link: '/api/looks' },
          { text: '声音API', link: '/api/sound' },
          { text: 'API使用示例', link: '/api/examples' }
        ]
      },
      {
        text: '模块',
        items: [
          { text: 'jvavscratch 模块文档', link: '/modules/' },
          { text: 'CLI 模块', link: '/modules/cli' },
          { text: 'Core 模块', link: '/modules/core' },
          { text: 'Generator 模块', link: '/modules/generator' },
          { text: 'Decompiler 模块', link: '/modules/decompiler' },
          { text: 'Types 模块', link: '/modules/types' },
          { text: 'Utils 模块', link: '/modules/utils' },
          { text: 'Registry 模块', link: '/modules/registry' },
          { text: 'Runtime 模块', link: '/modules/runtime' }
        ]
      },
      {
        text: '语言参考',
        items: [
          { text: '语言参考', link: '/reference/language-reference' }
        ]
      },
      {
        text: '笔记',
        items: [
          { text: '早期设计笔记', link: '/notes/' },
          { text: '早期笔记 · 项目分析与修复计划(20260125)', link: '/notes/早期笔记-plan_20260125_142319' },
          { text: '早期笔记 · 项目分析与修复计划(20260127)', link: '/notes/早期笔记-plan_20260127_135949' },
          { text: '早期笔记 · 使用Jvavscratch实现冒泡排序程序', link: '/notes/早期笔记-使用Jvavscratch实现冒泡排序程序' }
        ]
      },
      {
        text: 'FAQ',
        items: [
          { text: '常见问题', link: '/faq/' }
        ]
      }
    ],

    // 本地搜索(无需外部服务)
    search: {
      provider: 'local'
    },

    // 页脚与目录
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})
