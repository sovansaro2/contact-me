import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/ProfilePage.tsx', 'utf8');

// Replace the image upload element directly in the string
content = content.replace(/<input[\s\n]*type="file"[\s\S]*?className="hidden"[\s\n]*\/>/g, '');
content = content.replace(/<button[\s\n]*type="button"[\s\n]*onClick=\{\(\) => fileInputRef.current\?\.click\(\)\}[\s\S]*?<\/button>/g, '');
content = content.replace(/<p className="text-xs text-gray-500">គាំទ្រ PNG, JPG ឬ WebP \(អតិបរមា 5MB\)<\/p>/g, '');
content = content.replace(/<div className="flex flex-col gap-2 items-start">/g, 
  '<div className="flex flex-col gap-2 items-start w-full">' +
  `
                <input
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="តំណភ្ជាប់រូបភាព (ឧទាហរណ៍៖ https://...)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500">សូមថតចម្លង (Copy) តំណភ្ជាប់រូបភាពពី Facebook, Telegram ឬវេបសាយផ្សេងៗ រួចយកមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងលើ។</p>
`
);

content = content.replace(/<img[\s\n]*src=\{profile.avatar_url\}[\s\n]*alt="Profile"[\s\n]*className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"[\s\n]*\/>/g, 
  '<img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100" onError={(e) => { e.currentTarget.src = \'\'; setProfile({ ...profile, avatar_url: null }); }} />');

fs.writeFileSync('src/pages/admin/ProfilePage.tsx', content);
