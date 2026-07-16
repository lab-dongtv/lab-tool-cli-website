import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'aqua-cli',
  tagline: 'Scaffold the Claude Code Figma→code workflow',
  favicon: 'img/favicon.ico',
  url: 'https://aquaring.github.io',
  baseUrl: '/aqua-ai-develop-kit/',
  organizationName: 'aquaring',
  projectName: 'aqua-ai-develop-kit',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  markdown: { mermaid: true },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, indexBlog: false } as Record<string, unknown>,
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: { routeBasePath: '/', sidebarPath: './sidebars.ts' },
        blog: false,
        theme: {},
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'aqua-cli',
      items: [{ type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' }],
    },
    footer: { style: 'dark', copyright: 'Aquaring Lab' },
  } satisfies Preset.ThemeConfig,
};

export default config;
