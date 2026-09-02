import fs from 'fs';

let adminLayout = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf-8');
adminLayout = adminLayout.replace('href={`/contact/${user?.id || \'\'}`}', 'href={`/${user?.id || \'\'}`}');
fs.writeFileSync('src/components/layout/AdminLayout.tsx', adminLayout);

let adminPage = fs.readFileSync('src/pages/admin/AdminPage.tsx', 'utf-8');
adminPage = adminPage.replace('to="/contact"', 'to="/"');
fs.writeFileSync('src/pages/admin/AdminPage.tsx', adminPage);
