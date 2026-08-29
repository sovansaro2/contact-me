const fs = require('fs');
const file = 'src/pages/admin/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import { supabase } from '@/lib/supabase';", "import { auth } from '@/lib/firebase';\nimport { updatePassword } from 'firebase/auth';");
content = content.replace(
  "const { error } = await supabase.auth.updateUser({\n        password: newPassword,\n      });",
  "if (!auth.currentUser) throw new Error('Not authenticated');\n      await updatePassword(auth.currentUser, newPassword);\n      const error = null;"
);
content = content.replace("} catch (err: any) {\n      setPasswordError(err.message || 'មានបញ្ហាពេលប្តូរពាក្យសម្ងាត់');\n    }", "} catch (err: any) {\n      setPasswordError(err.message || 'មានបញ្ហាពេលប្តូរពាក្យសម្ងាត់');\n    }"); // just checking if it works
fs.writeFileSync(file, content);
