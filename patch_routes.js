import fs from 'fs';

let content = fs.readFileSync('src/routes/index.tsx', 'utf-8');

content = content.replace('<Route path="/" element={<Navigate to="/contact" replace />} />', '');
content = content.replace('<Route path="/contact/:id?" element={<PublicPage />} />', '<Route path="/:id?" element={<PublicPage />} />');
content = content.replace('<Route path="*" element={<Navigate to="/contact" replace />} />', '<Route path="*" element={<Navigate to="/" replace />} />');

fs.writeFileSync('src/routes/index.tsx', content);
