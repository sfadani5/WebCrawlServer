WebCrawlServer
├── admin
│   ├── public
│   │   └── icon16.jpg
│   ├── src
│   │   ├── components
│   │   │   ├── layout
│   │   │   │   ├── Breadcrumb
│   │   │   │   │   └── BreadcrumbBar.tsx
│   │   │   │   ├── Navbar
│   │   │   │   │   ├── GlobalSearchBar.tsx
│   │   │   │   │   ├── HeaderTools.tsx
│   │   │   │   │   ├── ProjectSelector.tsx
│   │   │   │   │   └── TopBar.tsx
│   │   │   │   ├── Sidebar
│   │   │   │   │   └── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── GcpMainLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── metrics
│   │   │   │   ├── MetricCardItem.tsx
│   │   │   │   └── MetricCardsGroup.tsx
│   │   │   ├── tables
│   │   │   │   └── GcpClientsTable.tsx
│   │   │   └── views
│   │   │       ├── ClientsView.tsx
│   │   │       ├── ControlConsoleView.tsx
│   │   │       ├── CrawlLogsView.tsx
│   │   │       ├── GcpClientsView.tsx
│   │   │       ├── GcpControlConsoleView.tsx
│   │   │       └── GcpCrawlLogsView.tsx
│   │   ├── hooks
│   │   │   ├── useAdminDbApi.ts
│   │   │   └── useAdminSocket.ts
│   │   ├── services
│   │   │   ├── apiService.ts
│   │   │   └── socketService.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── start.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── databases
├── docs
│   ├── askLogs
│   ├── CHANGELOG
│   ├── decision
│   ├── rule
│   │   ├── R-00000 instructions.md
│   │   ├── R-00100 architecture.md
│   │   ├── R-00101 tech-stack.md
│   │   ├── R-00102 structure.md
│   │   ├── R-00103 workflow-management.md
│   │   ├── R-00104 versioning.md
│   │   ├── R-00105 communication.md
│   │   ├── R-00106 coding.md
│   │   ├── R-00107 security.md
│   │   ├── R-00108 testing.md
│   │   ├── R-00200 mcp.md
│   │   ├── R-00201 scheduler.md
│   │   ├── R-00202 monitoring.md
│   │   ├── R-00203 database.md
│   │   ├── R-00204 logging.md
│   │   ├── R-00205 auth.md
│   │   ├── R-00300 admin-guidelines.md
│   │   ├── R-00301 admin-development-guidelines.md
│   │   ├── R-00302 admin-ui-ux-guidelines.md
│   │   └── R-00400 plugin-guidelines.md
│   ├── tips
│   ├── ask.md
│   ├── CHANGELOG.md
│   ├── todo.history.md
│   └── todo.md
├── logs
├── plugins
│   └── basic-plugin
│       ├── dist
│       │   ├── background.js
│       │   ├── content.js
│       │   ├── manifest.json
│       │   ├── popup.html
│       │   └── popup.js
│       ├── public
│       │   └── manifest.json
│       ├── src
│       │   ├── background.ts
│       │   ├── content.ts
│       │   └── popup.tsx
│       ├── package.json
│       ├── popup.html
│       ├── tsconfig.json
│       └── vite.config.ts
├── server
│   ├── dist
│   │   ├── database.js
│   │   ├── database.js.map
│   │   ├── index.js
│   │   ├── index.js.map
│   │   ├── logger.js
│   │   └── logger.js.map
│   ├── public
│   │   ├── assets
│   │   │   ├── index-0CDWvoqm.js
│   │   │   └── index-CS2UwwFL.css
│   │   ├── icon16.jpg
│   │   └── index.html
│   ├── src
│   │   ├── database.ts
│   │   ├── index.ts
│   │   └── logger.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── .replit
├── .treeignore
├── AGENTS.md
├── eslint.config.mts
├── package.json
├── README.md
├── replit.md
├── tsconfig.base.json
├── tsconfig.json
├── WebCrawlServer.code-workspace
└── WebCrawlServer.tree.df.md
