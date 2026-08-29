import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/ProfilePage.tsx', 'utf8');

// The original file seems to be different from what I patched previously.
// Let's replace the whole avatar section.
const avatarSectionRegex = /<div className="flex items-center gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m;

const urlInput = `
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
                  onError={(e) => { e.currentTarget.src = ''; setProfile({ ...profile, avatar_url: null }); }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col gap-2 w-full">
                <input
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="តំណភ្ជាប់រូបភាព (ឧទាហរណ៍៖ https://...)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500">សូមថតចម្លង (Copy) តំណភ្ជាប់រូបភាពពី Facebook, Telegram ឬវេបសាយផ្សេងៗ រួចយកមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងលើ។</p>
              </div>
            </div>
          </div>
`;

content = content.replace(avatarSectionRegex, urlInput);

fs.writeFileSync('src/pages/admin/ProfilePage.tsx', content);
