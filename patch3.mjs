import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');
content = content.replace(
  "import config from '../../firebase-applet-config.json';",
  "// Custom Firebase config\nconst config = {\n  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,\n  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,\n  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,\n  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,\n  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,\n  appId: import.meta.env.VITE_FIREBASE_APP_ID\n};\n"
);
fs.writeFileSync('src/lib/firebase.ts', content);
