import fs from 'fs';

let content = fs.readFileSync('src/pages/public/PublicPage.tsx', 'utf-8');

// replace the h1 inline style
const oldH1Style = `style={{
              fontFamily: lang === 'en' ? "'Rajdhani', 'Rajdhani Medium', sans-serif" : "'Koulen', 'Khmer OS Koulen', sans-serif",
              fontWeight: lang === 'en' ? 500 : 'normal'
            }}`;

const newH1Style = `style={{
              fontFamily: lang === 'en' ? "'Rajdhani', sans-serif" : "'Koulen', 'Khmer OS Koulen', sans-serif",
              fontWeight: lang === 'en' ? 700 : 'normal'
            }}`;

content = content.replace(oldH1Style, newH1Style);

fs.writeFileSync('src/pages/public/PublicPage.tsx', content);
