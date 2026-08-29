const fs = require('fs');
let code = fs.readFileSync('src/pages/public/PublicPage.tsx', 'utf8');
code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useParams } from 'react-router-dom';");
code = code.replace("export default function PublicPage() {", "export default function PublicPage() {\n  const { id } = useParams<{ id: string }>();");
code = code.replace("const p = await ProfileService.getPublicProfile();", "const p = await ProfileService.getPublicProfile(id);");
fs.writeFileSync('src/pages/public/PublicPage.tsx', code);
