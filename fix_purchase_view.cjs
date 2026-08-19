const fs = require('fs');

let content = fs.readFileSync('./src/components/PurchaseView.tsx', 'utf8');

// Fix the destructuring in the export function
content = content.replace(
  /export function PurchaseView\(\{.*?\}: PurchaseViewProps\) {/,
  `export function PurchaseView({
  tasks,
  calendarEvents,
  isCalendarConnected,
  onConnectCalendar,
  onDisconnectCalendar,
  onToggleTask,
  onDeleteTask,
  onOpenNewTask,
}: PurchaseViewProps) {`
);

fs.writeFileSync('./src/components/PurchaseView.tsx', content, 'utf8');
