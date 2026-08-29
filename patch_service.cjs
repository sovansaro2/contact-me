const fs = require('fs');
let code = fs.readFileSync('src/services/profileService.ts', 'utf8');
code = code.replace("alert('ការបង្ហោះរូបភាពមិនទាន់អាចប្រើបានទេ (ត្រូវការ File Storage)');", "");
code = code.replace("throw new Error('Not implemented');", `return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });`);
fs.writeFileSync('src/services/profileService.ts', code);
