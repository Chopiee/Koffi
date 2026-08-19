const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. Update types.ts
replaceInFile('./src/types.ts', [
    [/export type SidebarTab =.*/, "export type SidebarTab = 'purchase' | 'sales' | 'cost' | 'accounting' | 'profit-loss' | 'balance-sheet' | 'cash-flow';"]
]);

// 2. Update App.tsx
replaceInFile('./src/App.tsx', [
    [/useState<SidebarTab>\('today'\)/g, "useState<SidebarTab>('purchase')"],
    [/currentTab === 'today'/g, "currentTab === 'purchase'"],
    [/currentTab === 'tasks'/g, "currentTab === 'sales'"],
    [/currentTab === 'schedule'/g, "currentTab === 'cost'"],
    [/currentTab === 'projects'/g, "currentTab === 'accounting'"],
    [/currentTab === 'settings'/g, "currentTab === 'profit-loss'"],
    [/<TodayView/g, "<PurchaseView"],
    [/<TasksView/g, "<SalesView"],
    [/<ScheduleView/g, "<CostView"],
    [/<ProjectsView/g, "<AccountingView"],
    [/<SettingsView/g, "<ProfitLossView"],
    [/import TodayView from '.\/components\/TodayView';/g, "import PurchaseView from './components/PurchaseView';\nimport SalesView from './components/SalesView';\nimport CostView from './components/CostView';\nimport AccountingView from './components/AccountingView';\nimport ProfitLossView from './components/ProfitLossView';\nimport BalanceSheetView from './components/BalanceSheetView';\nimport CashFlowView from './components/CashFlowView';"],
    [/import TasksView from '.\/components\/TasksView';\n/g, ""],
    [/import ScheduleView from '.\/components\/ScheduleView';\n/g, ""],
    [/import ProjectsView from '.\/components\/ProjectsView';\n/g, ""],
    [/import SettingsView from '.\/components\/SettingsView';\n/g, ""],
]);

