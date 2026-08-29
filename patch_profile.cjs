const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/ProfilePage.tsx', 'utf8');

const target = `<div className="flex flex-col gap-2 items-start w-full">
                <input
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="តំណភ្ជាប់រូបភាព (ឧទាហរណ៍៖ https://...)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500">សូមថតចម្លង (Copy) តំណភ្ជាប់រូបភាពពី Facebook, Telegram ឬវេបសាយផ្សេងៗ រួចយកមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងលើ។</p>
                
                
              </div>`;

const replacement = `              <div className="flex flex-col gap-2 items-start">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium text-sm"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingAvatar ? 'កំពុងអាប់ឡូត...' : 'ប្តូររូបភាព'}
                </button>
                <p className="text-xs text-gray-500">គាំទ្រទម្រង់ JPG, PNG ឬ WebP (អតិបរមា 5MB)</p>
              </div>`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/admin/ProfilePage.tsx', code);
  console.log("Replaced successfully!");
} else {
  console.log("Target not found!");
}
