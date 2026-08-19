const fs = require('fs');

let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// The rename script might have resulted in imports that are missing the curly braces for named exports, or kept the old names with the braces.
// Let's replace the import block.
appContent = appContent.replace(/import \{ TodayView \} from '.\/components\/TodayView';/g, "import { PurchaseView } from './components/PurchaseView';");
appContent = appContent.replace(/import \{ TasksView \} from '.\/components\/TasksView';/g, "import { SalesView } from './components/SalesView';");
appContent = appContent.replace(/import \{ ScheduleView \} from '.\/components\/ScheduleView';/g, "import { CostView } from './components/CostView';");
appContent = appContent.replace(/import \{ ProjectsView \} from '.\/components\/ProjectsView';/g, "import { AccountingView } from './components/AccountingView';");
appContent = appContent.replace(/import \{ SettingsView \} from '.\/components\/SettingsView';/g, "import { ProfitLossView } from './components/ProfitLossView';\nimport { BalanceSheetView } from './components/BalanceSheetView';\nimport { CashFlowView } from './components/CashFlowView';");

// Clean up any double imports if my previous script added them
appContent = appContent.replace(/import PurchaseView from '.\/components\/PurchaseView';/g, "");
appContent = appContent.replace(/import SalesView from '.\/components\/SalesView';/g, "");
appContent = appContent.replace(/import CostView from '.\/components\/CostView';/g, "");
appContent = appContent.replace(/import AccountingView from '.\/components\/AccountingView';/g, "");
appContent = appContent.replace(/import ProfitLossView from '.\/components\/ProfitLossView';/g, "");
appContent = appContent.replace(/import BalanceSheetView from '.\/components\/BalanceSheetView';/g, "");
appContent = appContent.replace(/import CashFlowView from '.\/components\/CashFlowView';/g, "");

// Remove any empty lines resulting from the cleanup
appContent = appContent.replace(/^\s*[\r\n]/gm, '');

fs.writeFileSync('./src/App.tsx', appContent, 'utf8');

