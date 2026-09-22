// VitePress configuration.
//
// srcDir defaults to `.` (this repo, docs/); this file lives in docs/.vitepress/.
//
// The site is bilingual. English is the default locale and lives at the repo root;
// every Chinese page lives under `zh/`. VitePress derives the locale from the
// directory prefix, so `guide/installation.md` serves `/guide/installation` and
// `zh/guide/installation.md` serves `/zh/guide/installation`.
import { defineConfig } from 'vitepress'

// Shared labels for the right-hand outline and the footer controls. Each locale
// overrides these with its own translations, so this is the English default.
const enTheme = {
  outline: { level: [2, 3], label: 'On this page' },
  docFooter: { prev: 'Previous', next: 'Next' },
  returnToTopLabel: 'Return to top',
  sidebarMenuLabel: 'Menu',
  darkModeSwitchLabel: 'Appearance',
  lightModeSwitchTitle: 'Switch to light theme',
  darkModeSwitchTitle: 'Switch to dark theme',
  lastUpdated: { text: 'Last updated' },
  notFound: { title: 'Page not found', quote: 'The page you are looking for does not exist.' },
  nav: [
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'Grammar', link: '/grammar/' },
    { text: 'API', link: '/api/' },
    { text: 'Modules', link: '/modules/' },
    { text: 'Language Reference', link: '/reference/language-reference' },
    { text: 'Notes', link: '/notes/' },
    { text: 'FAQ', link: '/faq/' }
  ],
  sidebar: [
    {
      text: 'Guide',
      items: [
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Basic Usage', link: '/guide/basic-usage' },
        { text: 'Tutorials', link: '/guide/tutorials' }
      ]
    },
    {
      text: 'Grammar',
      items: [
        { text: 'Introduction', link: '/grammar/' },
        { text: 'Variables and Assignment', link: '/grammar/variables' },
        { text: 'Functions', link: '/grammar/functions' },
        { text: 'Classes and Inheritance', link: '/grammar/classes' },
        { text: 'Control Flow', link: '/grammar/control-flow' },
        { text: 'Event Blocks', link: '/grammar/events' }
      ]
    },
    {
      text: 'API',
      items: [
        { text: 'Overview', link: '/api/' },
        { text: 'Built-in Functions', link: '/api/builtins' },
        { text: 'Motion', link: '/api/motion' },
        { text: 'Looks', link: '/api/looks' },
        { text: 'Sound', link: '/api/sound' },
        { text: 'Examples', link: '/api/examples' },
        { text: 'Example Index', link: '/examples/' }
      ]
    },
    {
      text: 'Modules',
      items: [
        { text: 'Overview', link: '/modules/' },
        { text: 'CLI', link: '/modules/cli' },
        { text: 'Core', link: '/modules/core' },
        { text: 'Generator', link: '/modules/generator' },
        { text: 'Decompiler', link: '/modules/decompiler' },
        { text: 'Types', link: '/modules/types' },
        { text: 'Utils', link: '/modules/utils' },
        { text: 'Registry', link: '/modules/registry' },
        { text: 'Runtime', link: '/modules/runtime' }
      ]
    },
    {
      text: 'Extending',
      items: [
        { text: 'Extending jvavscratch', link: '/extending' },
        { text: 'Writing a Plugin', link: '/plugins' }
      ]
    },
    {
      text: 'Advanced',
      items: [
        { text: 'Advanced Topics', link: '/advanced/' }
      ]
    },
    {
      text: 'Language Reference',
      items: [
        { text: 'Language Reference', link: '/reference/language-reference' }
      ]
    },
    {
      text: 'Notes',
      items: [
        { text: 'Notes', link: '/notes/' }
      ]
    },
    {
      text: 'FAQ',
      items: [
        { text: 'Frequently Asked Questions', link: '/faq/' }
      ]
    },
    {
      text: 'Contributing',
      items: [
        { text: 'Contributing Guide', link: '/contributing' }
      ]
    }
  ]
}

const zhTheme = {
  outline: { level: [2, 3], label: '本页目录' },
  docFooter: { prev: '上一篇', next: '下一篇' },
  returnToTopLabel: '回到顶部',
  sidebarMenuLabel: '目录',
  darkModeSwitchLabel: '主题',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  lastUpdated: { text: '最后更新于' },
  notFound: { title: '页面不存在', quote: '你访问的页面不存在。' },
  nav: [
    { text: '指南', link: '/zh/guide/getting-started' },
    { text: '语法', link: '/zh/grammar/' },
    { text: 'API', link: '/zh/api/' },
    { text: '模块', link: '/zh/modules/' },
    { text: '语言参考', link: '/zh/reference/language-reference' },
    { text: '笔记', link: '/zh/notes/' },
    { text: 'FAQ', link: '/zh/faq/' }
  ],
  sidebar: [
    {
      text: '指南',
      items: [
        { text: '安装', link: '/zh/guide/installation' },
        { text: '快速开始', link: '/zh/guide/getting-started' },
        { text: '基本使用', link: '/zh/guide/basic-usage' },
        { text: '教程', link: '/zh/guide/tutorials' }
      ]
    },
    {
      text: '语法',
      items: [
        { text: '语法介绍', link: '/zh/grammar/' },
        { text: '变量和赋值', link: '/zh/grammar/variables' },
        { text: '函数', link: '/zh/grammar/functions' },
        { text: '类和继承', link: '/zh/grammar/classes' },
        { text: '控制流', link: '/zh/grammar/control-flow' },
        { text: '事件块', link: '/zh/grammar/events' }
      ]
    },
    {
      text: 'API',
      items: [
        { text: 'API 参考', link: '/zh/api/' },
        { text: '内置函数', link: '/zh/api/builtins' },
        { text: '运动 API', link: '/zh/api/motion' },
        { text: '外观 API', link: '/zh/api/looks' },
        { text: '声音 API', link: '/zh/api/sound' },
        { text: '使用示例', link: '/zh/api/examples' },
        { text: '示例索引', link: '/zh/examples/' }
      ]
    },
    {
      text: '模块',
      items: [
        { text: '模块总览', link: '/zh/modules/' },
        { text: 'CLI 模块', link: '/zh/modules/cli' },
        { text: 'Core 模块', link: '/zh/modules/core' },
        { text: 'Generator 模块', link: '/zh/modules/generator' },
        { text: 'Decompiler 模块', link: '/zh/modules/decompiler' },
        { text: 'Types 模块', link: '/zh/modules/types' },
        { text: 'Utils 模块', link: '/zh/modules/utils' },
        { text: 'Registry 模块', link: '/zh/modules/registry' },
        { text: 'Runtime 模块', link: '/zh/modules/runtime' }
      ]
    },
    {
      text: '扩展',
      items: [
        { text: '扩展 jvavscratch', link: '/zh/extending' },
        { text: '编写插件', link: '/zh/plugins' }
      ]
    },
    {
      text: '进阶',
      items: [
        { text: '进阶主题', link: '/zh/advanced/' }
      ]
    },
    {
      text: '语言参考',
      items: [
        { text: '语言参考', link: '/zh/reference/language-reference' }
      ]
    },
    {
      text: '笔记',
      items: [
        { text: '笔记', link: '/zh/notes/' }
      ]
    },
    {
      text: 'FAQ',
      items: [
        { text: '常见问题', link: '/zh/faq/' }
      ]
    },
    {
      text: '贡献',
      items: [
        { text: '贡献指南', link: '/zh/contributing' }
      ]
    }
  ]
}

export default defineConfig({
  // Site metadata for the default (English) locale.
  title: 'Jvavscratch',
  description:
    'jvavscratch compiles JavaScript ahead of time (AOT) into Scratch 3.0 project files (.sb3).',
  lang: 'en-US',

  // Deployed to the GitHub Pages project page for Jvavscratch/docs, i.e.
  // https://jvavscratch.github.io/docs/. If this ever moves to a custom domain or
  // a user/org page (site root at `/`), change this back to '/'.
  base: '/docs/',

  // Build output directory, relative to docs/. The deploy workflow and .gitignore
  // both refer to this path.
  outDir: 'dist',

  // Dead links are checked by default. Add an explicit path here only for a link
  // whose target genuinely does not exist yet — do NOT switch this to
  // `ignoreDeadLinks: true`, which would silently swallow every future dead link
  // as well. Delete an entry once its page is written.
  ignoreDeadLinks: [],

  themeConfig: {
    // Local search; no external service required.
    search: { provider: 'local' }
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Jvavscratch',
      description:
        'jvavscratch compiles JavaScript ahead of time (AOT) into Scratch 3.0 project files (.sb3).',
      themeConfig: enTheme
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Jvavscratch',
      description: 'jvavscratch —— 将 JavaScript 源码提前编译(AOT)为 Scratch 3.0 工程文件(.sb3)的编译器',
      themeConfig: zhTheme
    }
  }
})
