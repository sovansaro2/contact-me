const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');
code = code.replace("href=\"/contact\"", "href={`/contact/${user?.id || ''}`}");
code = code.replace("const { signOut } = useAuth();", "const { signOut, user } = useAuth();");
fs.writeFileSync('src/components/layout/AdminLayout.tsx', code);
