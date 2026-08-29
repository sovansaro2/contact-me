const fs = require('fs');
let lines = fs.readFileSync('src/pages/admin/ProfilePage.tsx', 'utf8').split('\n');

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

lines.splice(159, 13, replacement);
fs.writeFileSync('src/pages/admin/ProfilePage.tsx', lines.join('\n'));
console.log("Replaced using lines.");
