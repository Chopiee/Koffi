const fs = require('fs');

let content = fs.readFileSync('./src/components/Sidebar.tsx', 'utf8');

// Replace imports
content = content.replace('Plus,', 'Sparkles,');
content = content.replace('Search,', 'Inbox,');

// Replace elements
content = content.replace(/<Plus /g, '<Sparkles ');
content = content.replace(/<Search /g, '<Inbox ');

fs.writeFileSync('./src/components/Sidebar.tsx', content, 'utf8');
