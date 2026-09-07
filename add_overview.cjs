const fs = require('fs');

// 1. Update types.ts
let typesContent = fs.readFileSync('./src/types.ts', 'utf8');
typesContent = typesContent.replace(
  /export type SidebarTab = 'purchase'/,
  "export type SidebarTab = 'overview' | 'purchase'"
);
fs.writeFileSync('./src/types.ts', typesContent, 'utf8');

// 2. Create OverviewView.tsx
const overviewCode = `import { LayoutGrid } from 'lucide-react';

export function OverviewView() {
  return (
    <div className="w-full max-w-[700px] mx-auto pt-10 md:pt-14 pb-20 px-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight">Overview</h1>
      </div>
      <div className="border border-neutral-200/80 rounded-2xl p-5 bg-white space-y-4">
        <div className="flex items-center gap-3">
          <LayoutGrid size={24} className="text-neutral-400" />
          <p className="text-[15px] text-neutral-600">Welcome to your overview dashboard.</p>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('./src/components/OverviewView.tsx', overviewCode, 'utf8');

// 3. Update App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');
appContent = appContent.replace(
  /import \{ PurchaseView \} from '.\/components\/PurchaseView';/,
  "import { OverviewView } from './components/OverviewView';\nimport { PurchaseView } from './components/PurchaseView';"
);
appContent = appContent.replace(
  /\{currentTab === 'purchase' && \(/,
  "{currentTab === 'overview' && <OverviewView />}\n        {currentTab === 'purchase' && ("
);
fs.writeFileSync('./src/App.tsx', appContent, 'utf8');

// 4. Update Sidebar.tsx
let sidebarContent = fs.readFileSync('./src/components/Sidebar.tsx', 'utf8');
sidebarContent = sidebarContent.replace(
  /import \{([\s\S]*?)PanelLeft,/,
  "import {$1LayoutGrid,\n  PanelLeft,"
);

const overviewButtonCode = `
          {/* Overview */}
          <button
            id="sidebar-tab-overview"
            onClick={() => onSelectTab('overview')}
            className={\`w-full h-[29px] px-2 rounded-lg text-[14px] flex items-center gap-2.5 transition-colors cursor-pointer text-left \${
              currentTab === 'overview'
                ? 'bg-[#e5e5e7] font-medium text-neutral-900'
                : 'text-neutral-700 hover:bg-neutral-200/50 font-normal'
            }\`}
          >
            <LayoutGrid size={12.5} strokeWidth={1.5} className="text-neutral-700 shrink-0" />
            <span>Overview</span>
          </button>
`;

sidebarContent = sidebarContent.replace(
  /\{\/\* \+ New task button \*\/\}/,
  overviewButtonCode.trim() + "\n\n          {/* + New task button */}"
);

fs.writeFileSync('./src/components/Sidebar.tsx', sidebarContent, 'utf8');

console.log("Done adding overview");
