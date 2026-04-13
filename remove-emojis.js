const fs = require('fs');
const path = require('path');

// Basic regex to match a wide range of emojis
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{25A0}-\u{25FF}⭐✔️⚠️✅⚙️🛡️🔗💸📦🤖📄💡🛠️🔍🔥⚡🚧📌📝📈🛠]/gu;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walkDir(fullPath);
      }
    } else if (fullPath.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalLength = content.length;
      content = content.replace(emojiRegex, '');
      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned emojis from: ${fullPath}`);
      }
    }
  }
}

walkDir(__dirname);
