const fs = require('fs');
const path = require('path');

const replacements = {
  'text-\\[7\\.5px\\]': 'text-[9.5px]',
  'text-\\[10px\\]': 'text-[12px]',
  'text-\\[11px\\]': 'text-[13px]',
  'text-xs': 'text-[14px]',
  'text-\\[12px\\]': 'text-[14px]',
  'text-\\[13px\\]': 'text-[15px]',
  'text-\\[14px\\]': 'text-[16px]',
  'text-sm': 'text-[16px]',
  'text-\\[15px\\]': 'text-[17px]',
  'text-\\[16px\\]': 'text-[18px]',
  'text-base': 'text-[18px]',
  'text-\\[22px\\]': 'text-[24px]',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`(?<=\\s|['"\`])(${key})(?=\\s|['"\`])`, 'g');
        newContent = newContent.replace(regex, value);
      }
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./src');
console.log('Done');
