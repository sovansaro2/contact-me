import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProfileService } from '@/services/profileService';
import { ContactMethodService } from '@/services/contactMethodService';
import { User, Link as LinkIcon, ExternalLink, Settings, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [methodCount, setMethodCount] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await ProfileService.getOwnerProfile();
      setProfileExists(!!(profile && profile.display_name));

      const methods = await ContactMethodService.getOwnerContactMethods();
      setMethodCount({
        total: methods.length,
        active: methods.filter(m => m.enabled).length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">ផ្ទាំងគ្រប់គ្រង (Dashboard)</h1>
          <p className="text-gray-500">សួស្តី, សូមស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រងរបស់អ្នក។</p>
        </div>
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          មើលទំព័ររបស់ខ្ញុំ
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">ប្រវត្តិរូប</h2>
              <p className="text-sm text-gray-500">ការកំណត់ព័ត៌មានផ្ទាល់ខ្លួន</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${profileExists ? 'bg-green-500' : 'bg-amber-400'}`}></div>
              <span className={profileExists ? 'text-gray-700' : 'text-amber-600 font-medium'}>
                {profileExists ? 'បានរៀបចំរួចរាល់' : 'មិនទាន់មានព័ត៌មានពេញលេញទេ'}
              </span>
            </div>
            <Link to="/admin/profile" className="text-indigo-600 text-sm font-medium hover:underline">
              កែប្រែ
            </Link>
          </div>
        </div>

        {/* Methods Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">វិធីទំនាក់ទំនង</h2>
              <p className="text-sm text-gray-500">បណ្តាញសង្គម និងលេខទូរស័ព្ទ</p>
            </div>
          </div>
          
          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">{methodCount.total}</p>
              <p className="text-xs text-gray-500 uppercase font-medium mt-1">សរុប</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">{methodCount.active}</p>
              <p className="text-xs text-gray-500 uppercase font-medium mt-1">កំពុងបង្ហាញ</p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
            <Link to="/admin/methods" className="text-emerald-600 text-sm font-medium hover:underline">
              គ្រប់គ្រង
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gray-500" />
          ប្រព័ន្ធសុវត្ថិភាព
        </h3>
        <p className="text-sm text-gray-600">
          ទិន្នន័យរបស់អ្នកត្រូវបានការពារដោយប្រព័ន្ធសុវត្ថិភាពខ្ពស់។ អ្នកទស្សនាជាសាធារណៈអាចមើលឃើញតែព័ត៌មានដែលអ្នកបានអនុញ្ញាតឱ្យបង្ហាញ (Enabled) ប៉ុណ្ណោះ។
        </p>
      </div>

    </div>
  );
}
