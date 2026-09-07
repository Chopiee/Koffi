const fs = require('fs');

let content = fs.readFileSync('./src/components/Sidebar.tsx', 'utf8');

// Decrease font size by 1
content = content.replace(/text-\[15px\]/g, 'text-[14px]');
content = content.replace(/text-\[13px\]/g, 'text-[12px]');

// Decrease icon size by 1
content = content.replace(/size=\{14\.5\}/g, 'size={13.5}');
content = content.replace(/size=\{13\.5\}/g, 'size={12.5}');
content = content.replace(/size=\{15\.5\}/g, 'size={14.5}');

fs.writeFileSync('./src/components/Sidebar.tsx', content, 'utf8');
