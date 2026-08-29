import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/ProfilePage.tsx', 'utf8');

// Replace avatar upload with URL input
const newAvatarUI = `        {/* Avatar URL */}
        <div className="mb-10">
          <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
            តំណភ្ជាប់រូបភាព (Image URL)
          </label>
          <input
            type="url"
            id="avatar_url"
            value={formData.avatar_url || ''}
            onChange={(e) => {
              setFormData({ ...formData, avatar_url: e.target.value });
              setAvatarPreview(e.target.value);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all mb-4"
            placeholder="ឧទាហរណ៍៖ https://example.com/my-photo.jpg"
          />
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = ''; setAvatarPreview(null); }} />
              ) : (
                <Image className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                សូមថតចម្លង (Copy) តំណភ្ជាប់រូបភាពពី Facebook, Telegram ឬវេបសាយផ្សេងៗ រួចយកមកបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងលើ។
              </p>
            </div>
          </div>
        </div>`;

content = content.replace(
  /\{\/\* Avatar Upload \*\/\}(.|\n)*?(?=<div className="pt-6 border-t border-gray-100">)/m,
  newAvatarUI + '\n        '
);

content = content.replace(
  /const \[formData, setFormData\] = useState\(\{[\s\S]*?bio: '',\s*\}\);/m,
  `const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  });`
);

content = content.replace(
  /setFormData\(\{[\s\S]*?display_name: p\.display_name \|\| '',[\s\S]*?bio: p\.bio \|\| '',[\s\S]*?\}\);/m,
  `setFormData({
            display_name: p.display_name || '',
            bio: p.bio || '',
            avatar_url: p.avatar_url || '',
          });`
);

content = content.replace(
  /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?try \{[\s\S]*?let finalAvatarUrl = profile\?\.avatar_url \|\| null;[\s\S]*?if \(avatarFile\) \{[\s\S]*?return; \/\/ Stop save if avatar upload fails\s*\}\s*\}([\s\S]*?)const updates = \{/m,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const updates = {`
);

content = content.replace(
  /avatar_url: finalAvatarUrl,/m,
  `avatar_url: formData.avatar_url,`
);

fs.writeFileSync('src/pages/admin/ProfilePage.tsx', content);
