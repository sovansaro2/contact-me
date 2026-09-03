import { useState, useEffect } from 'react';
import { SyncService } from '@/services/syncService';
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminDataSyncManager() {
  const [syncUrl, setSyncUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingSync, setTestingSync] = useState(false);

  useEffect(() => {
    setSyncUrl(SyncService.getSyncUrl());
  }, []);

  const handleSaveUrl = () => {
    SyncService.setSyncUrl(syncUrl);
    setStatusMsg({
      type: 'success',
      text: 'បានរក្សាទុកតំណភ្ជាប់រួចរាល់'
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCopyJson = () => {
    const data = SyncService.exportData();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setStatusMsg({
      type: 'success',
      text: 'បានចម្លងទិន្នន័យរួចរាល់សម្រាប់យកទៅបិទភ្ជាប់ក្នុង Gist'
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleTestSync = async () => {
    if (!syncUrl.trim()) return;
    setTestingSync(true);
    setStatusMsg(null);
    const res = await SyncService.syncFromRemote(syncUrl);
    setTestingSync(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'ការតភ្ជាប់ដំណើរការល្អ (ទាញយកជោគជ័យ)' });
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'មិនអាចទាញយកបានទេ សូមពិនិត្យ Link ឡើងវិញ' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">ការបន្ស៊ីទិន្នន័យ (Data Sync)</h2>
        <p className="text-sm text-gray-500 mt-1">
          កំណត់តំណភ្ជាប់ GitHub Gist ដើម្បីធ្វើបច្ចុប្បន្នភាពព័ត៌មានទៅកាន់ទូរសព្ទអ្នកប្រើប្រាស់
        </p>
      </div>

      <div className="p-6 space-y-5">
        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-sm font-medium ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            តំណភ្ជាប់ GitHub Gist (Raw URL)
          </label>
          <input
            type="url"
            value={syncUrl}
            onChange={(e) => setSyncUrl(e.target.value)}
            placeholder="https://gist.githubusercontent.com/.../raw/data.json"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-sm"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            នៅពេលលោកអ្នកកែប្រែទិន្នន័យលើ Gist កម្មវិធីនឹងផ្ញើដំណឹងរំលឹកអ្នកប្រើប្រាស់ឱ្យ Update ដោយស្វ័យប្រវត្តិ។
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveUrl}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all"
          >
            រក្សាទុក Link
          </button>

          <button
            type="button"
            disabled={testingSync || !syncUrl.trim()}
            onClick={handleTestSync}
            className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${testingSync ? 'animate-spin' : ''}`} />
            សាកល្បង Sync
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
            <span>{copied ? 'បានចម្លង' : 'ចម្លងទិន្នន័យ (JSON)'}</span>
          </button>
        </div>

        <details className="text-xs text-gray-500 pt-3 border-t border-gray-100 cursor-pointer">
          <summary className="font-medium text-gray-700 hover:text-gray-900 select-none">
            របៀបយក Link ពី GitHub Gist
          </summary>
          <ol className="list-decimal list-inside mt-2.5 space-y-1.5 text-gray-600 pl-1 leading-relaxed">
            <li>ចុចប៊ូតុង <strong>«ចម្លងទិន្នន័យ (JSON)»</strong> ខាងលើ</li>
            <li>
              ចូលទៅកាន់{' '}
              <a
                href="https://gist.github.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline inline-flex items-center gap-0.5"
              >
                gist.github.com <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>ដាក់ឈ្មោះ File ថា <code>data.json</code> ហើយបិទភ្ជាប់ (Paste) ទិន្នន័យចូល</li>
            <li>ចុច <strong>Create public gist</strong></li>
            <li>ចុចប៊ូតុង <strong>Raw</strong> រួចចម្លងតំណភ្ជាប់ (URL) មកដាក់ក្នុងប្រអប់ខាងលើ ហើយចុច <strong>រក្សាទុក</strong></li>
          </ol>
        </details>
      </div>
    </div>
  );
}
