# ការណែនាំអំពីការ Build ជា Android App (Capacitor) សម្រាប់វត្តស្នាយដួច

គម្រោងនេះត្រូវបានរៀបចំរួចរាល់ជាមួយ **Capacitor 8** សម្រាប់បង្កើតជា Android Application (APK/AAB)។

---

### ១. តម្រូវការជាមុន (Prerequisites)
- **Node.js** (v18 ឬថ្មីជាងនេះ)
- **VS Code**
- **Android Studio** (បានដំឡើង Android SDK និង Command Line Tools)
- **Java JDK** (JDK 17 ឬ 21)

---

### ២. របៀបបើក និង Build នៅក្នុង VS Code

1. បើក Folder នៃគម្រោងនេះនៅក្នុង **VS Code**។
2. បើក Terminal ក្នុង VS Code (`Ctrl + ~` ឬ `Cmd + ~`) ហើយដំឡើង packages (ប្រសិនបើទើបតែទាញយកថ្មី)៖
   ```bash
   npm install
   ```

3. Build កូដ Web និង Sync ចូលទៅក្នុង Android Folder៖
   ```bash
   npm run cap:build
   ```
   *(ពាក្យបញ្ជានេះនឹងដំណើរការ `vite build` រួចបញ្ជូន files ទាំងអស់ចូលទៅ `android/`)*

4. បើកគម្រោងក្នុង **Android Studio**៖
   ```bash
   npm run cap:open
   ```
   *(ឬអ្នកអាចបើក Android Studio ដោយផ្ទាល់ ហើយជ្រើសរើសបើក folder `android` នៅក្នុងគម្រោងនេះ)*

---

### ៣. របៀបបង្កើត APK / AAB នៅក្នុង Android Studio

1. នៅពេល Android Studio បើក folder `android` ចប់ សូមរង់ចាំ **Gradle Sync** ដំណើរការឲ្យចប់សព្វគ្រប់ (ប្រហែល ១-២ នាទី)។
2. **សម្រាប់តេស្តផ្ទាល់ (Run Test):**
   - ភ្ជាប់ទូរសព្ទ Android របស់អ្នកតាមខ្សែ USB (បើក USB Debugging) ឬបើក Android Emulator។
   - ចុចប៊ូតុង **Play (▶ Run 'app')** នៅខាងលើ។
3. **សម្រាប់ Export ជា APK យកទៅដំឡើងលើទូរសព្ទ:**
   - ចូលទៅ Menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**។
   - នៅពេល build ចប់ សូមចុចពាក្យ **locate** ដើម្បីយក file `app-debug.apk` ទៅដំឡើង។
4. **សម្រាប់ Release APK / Google Play Store:**
   - ចូលទៅ Menu: **Build** > **Generate Signed Bundle / APK...** ហើយជ្រើសរើស Keystore របស់អ្នក។

---

### ៤. កំណត់ចំណាំសំខាន់ (API & Backend Connection)
- ដោយសារ App ដំណើរការលើទូរសព្ទ វាត្រូវបានកំណត់ឲ្យតភ្ជាប់ទិន្នន័យ (Fetch API) ទៅកាន់ Server ផ្ទាល់គឺ `https://contact.watsnaydouch.site` ដោយស្វ័យប្រវត្តិ។
- ប្រសិនបើអ្នកចង់ប្តូរទៅកាន់ URL ផ្សេងទៀត អ្នកអាចបង្កើត file `.env` ហើយកំណត់៖
  ```env
  VITE_API_BASE_URL=https://your-custom-domain.com
  ```
  រួចដំណើរការ `npm run cap:build` ឡើងវិញ។

---

### ៥. លក្ខណៈពិសេសដែលបានកំណត់រួច៖
- **App Name:** វត្តស្នាយដួច
- **Package ID:** `com.watsnaydouch.contact`
- **App Icons:** យករូបវត្ត `icon.png` ដាក់ចូលគ្រប់ទំហំក្នុង `res/mipmap-*`
- **Android Back Button:** ចុច Back លើទូរសព្ទថយក្រោយធម្មតា និងចាកចេញពី App ប្រសិនបើនៅទំព័រដើម
- **Status Bar:** កំណត់ពណ៌ខ្មៅរលោងស្របតាមរចនាបថ Dark Mode
