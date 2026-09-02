import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf-8');

// Update Title
content = content.replace(/<title>វត្តវារីបាការាម\(ស្នាយដួច\)<\/title>/g, '<title>វត្តស្នាយដួច</title>');
content = content.replace(/content="វត្តវារីបាការាម\(ស្នាយដួច\)"/g, 'content="វត្តស្នាយដួច"');
content = content.replace(/content="វត្តវារីបាការាម"/g, 'content="វត្តស្នាយដួច"');

// Update Icons
content = content.replace(/href="\/favicon\.png"/g, 'href="/icon.png"');
content = content.replace(/href="\/favicon\.ico"/g, 'href="/icon.png"');
content = content.replace(/content="\/favicon\.png"/g, 'content="/icon.png"');
content = content.replace(/href="\/pwa-192x192\.png"/g, 'href="/icon.png"');

fs.writeFileSync('index.html', content);
