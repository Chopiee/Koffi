const fs = require('fs');

let content = fs.readFileSync('./src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  /<aside[\s\S]*?className=\{`bg-\[#F2F2F2\] flex flex-col justify-between select-none shrink-0 font-sans transition-all duration-300 ease-in-out overflow-hidden \$\{[\s\S]*?collapsed \? 'w-0 p-0 opacity-0' : 'w-\[236px\] p-3 pl-\[9px\] opacity-100'[\s\S]*?\}\`\}[\s\S]*?>[\s\S]*?<div className="w-\[212px\] h-full flex flex-col justify-between">/,
  `<aside
      className={\`bg-[#F2F2F2] select-none shrink-0 font-sans transition-all duration-300 ease-in-out overflow-hidden \${
        collapsed ? 'w-0 opacity-0' : 'w-[236px] opacity-100'
      }\`}
    >
      <div className="w-[236px] h-full p-3 pl-[9px] flex flex-col justify-between">
        <div className="w-[212px] h-full flex flex-col justify-between">`
);

// We need to add a closing </div> for the new wrapper.
// The original ended with:
//         </div>
//       </div>
//     </aside>
// Wait, the original was:
//     </aside>
// So we need to add a </div> right before </aside>

content = content.replace(
  /<\/div>\n    <\/aside>/,
  `</div>\n      </div>\n    </aside>`
);

fs.writeFileSync('./src/components/Sidebar.tsx', content, 'utf8');
