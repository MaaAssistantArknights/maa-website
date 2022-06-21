// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Maa Documentation',
  tagline: 'Maa means MaaAssistantArknights:)',
  url: 'https://www.maa.plus',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'MAA DOC',
        logo: {
          alt: 'Maa Logo',
          src: 'img/logo.webp',
        },
        items: [
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://www.maa.plus',
            label: '官网',
            position: 'right',
          },
          {
            href: 'https://github.com/MaaAssistantArknights',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '社区',
            items: [
              {
                label: '技术交流 & 吹水群：内卷地狱！（明日方舟弱相关）',
                href: 'https://jq.qq.com/?_wv=1027&k=ypbzXcA2',
              },
              {
                label: '自动战斗 JSON 作业分享群',
                href: 'https://jq.qq.com/?_wv=1027&k=1giyMpPb',
              },
              {
                label: 'Bilibili 直播间',
                href: 'https://live.bilibili.com/2808861',
              },
            ],
          },
          {
            title: '开发者',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/MaaAssistantArknights',
              },
              {
                label: '开发者群',
                href: 'https://jq.qq.com/?_wv=1027&k=JM9oCk3C',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MAA. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
