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

replaceInFile('./src/types.ts', [
    [/export type SidebarTab =.*/, "export type SidebarTab = 'purchase' | 'sales' | 'cost' | 'accounting' | 'profit-loss' | 'balance-sheet' | 'cash-flow';"]
]);

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

// Handle adding new tab cases in App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');
if (!appContent.includes("<BalanceSheetView />")) {
  appContent = appContent.replace(
    /{currentTab === 'profit-loss' && <ProfitLossView \/>}/,
    `{currentTab === 'profit-loss' && <ProfitLossView />}\n          {currentTab === 'balance-sheet' && <BalanceSheetView />}\n          {currentTab === 'cash-flow' && <CashFlowView />}`
  );
  fs.writeFileSync('./src/App.tsx', appContent, 'utf8');
}

// Rename files
const renameMap = {
    'TodayView.tsx': 'PurchaseView.tsx',
    'TasksView.tsx': 'SalesView.tsx',
    'ScheduleView.tsx': 'CostView.tsx',
    'ProjectsView.tsx': 'AccountingView.tsx',
    'SettingsView.tsx': 'ProfitLossView.tsx'
};

for (const [oldName, newName] of Object.entries(renameMap)) {
    const oldPath = path.join('./src/components', oldName);
    const newPath = path.join('./src/components', newName);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${oldName} to ${newName}`);
        
        // Update function name in the file
        let fileContent = fs.readFileSync(newPath, 'utf8');
        const oldFuncName = oldName.replace('.tsx', '');
        const newFuncName = newName.replace('.tsx', '');
        fileContent = fileContent.replace(new RegExp(oldFuncName, 'g'), newFuncName);
        // Also update headers if they say Today, Tasks etc.
        fileContent = fileContent.replace(/>Today</g, ">Purchase<");
        fileContent = fileContent.replace(/>Tasks</g, ">Sales<");
        fileContent = fileContent.replace(/>Report</g, ">Profit & Loss<");
        fs.writeFileSync(newPath, fileContent, 'utf8');
    }
}

// Duplicate ProfitLossView for BalanceSheet and CashFlow
const plPath = './src/components/ProfitLossView.tsx';
if (fs.existsSync(plPath)) {
    const plContent = fs.readFileSync(plPath, 'utf8');
    
    let bsContent = plContent.replace(/ProfitLossView/g, 'BalanceSheetView').replace(/>Profit & Loss</g, '>Balance Sheet<');
    fs.writeFileSync('./src/components/BalanceSheetView.tsx', bsContent, 'utf8');
    
    let cfContent = plContent.replace(/ProfitLossView/g, 'CashFlowView').replace(/>Profit & Loss</g, '>Cash Flow<');
    fs.writeFileSync('./src/components/CashFlowView.tsx', cfContent, 'utf8');
}

console.log('Done renaming and updating components.');
