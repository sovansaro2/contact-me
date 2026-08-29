import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/ProfilePage.tsx', 'utf8');
content = content.replace(/const \[profile, setProfile\] = useState<Partial<Profile>>\(\{\}\);/, 
\`const [profile, setProfile] = useState<Partial<Profile>>({});
  const [formData, setFormData] = useState({ display_name: '', bio: '', avatar_url: '' });\`);

content = content.replace(/setProfile\(data\);/g, 
\`setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });\`);

content = content.replace(/value=\{profile.display_name \|\| ''\}/, 'value={formData.display_name || \'\'}');
content = content.replace(/onChange=\{\(e\) => setProfile\(\{ \.\.\.profile, display_name: e\.target\.value \}\)\}/, 'onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}');

content = content.replace(/value=\{profile.bio \|\| ''\}/, 'value={formData.bio || \'\'}');
content = content.replace(/onChange=\{\(e\) => setProfile\(\{ \.\.\.profile, bio: e\.target\.value \}\)\}/, 'onChange={(e) => setFormData({ ...formData, bio: e.target.value })}');

content = content.replace(/await ProfileService\.updateOwnerProfile\(\{[\s\S]*?\}\);/m, 
\`await ProfileService.updateOwnerProfile({
        display_name: formData.display_name || null,
        bio: formData.bio || null,
        avatar_url: formData.avatar_url || null,
        cover_url: profile.cover_url || null,
      });\`);

fs.writeFileSync('src/pages/admin/ProfilePage.tsx', content);
