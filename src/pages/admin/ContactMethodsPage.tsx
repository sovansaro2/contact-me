import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { ContactMethodService } from '@/services/contactMethodService';
import { ProfileService } from '@/services/profileService';
import type { ContactMethod } from '@/types/database.types';
import { 
  Plus, Edit2, Trash2, ArrowUp, ArrowDown 
} from 'lucide-react';
import { getIconForType, contactMethodTypes } from '@/lib/iconMapping';

const getPlaceholderForType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'telegram': return 'បញ្ចូល Telegram username ឧ. @username';
    case 'messenger': return 'បញ្ចូល Messenger URL ឧ. m.me/username';
    case 'phone': return 'បញ្ចូលលេខទូរស័ព្ទ ឧ. 012345678';
    case 'whatsapp': return 'បញ្ចូលលេខទូរស័ព្ទ WhatsApp ឧ. 85512345678';
    case 'email': return 'បញ្ចូល Email ឧ. name@example.com';
    case 'website': return 'បញ្ចូល Website URL ឧ. https://example.com';
    case 'facebook': return 'បញ្ចូល Facebook Page URL';
    default: return 'បញ្ចូលតំណភ្ជាប់ (URL) ឬតម្លៃ';
  }
};

export default function ContactMethodsPage() {
  const [methods, setMethods] = useState<ContactMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'telegram',
    label: '',
    value: '',
    enabled: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      setLoading(true);
      await ProfileService.getOwnerProfile(); // Ensure profile exists
      const data = await ContactMethodService.getOwnerContactMethods();
      setMethods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      type: 'telegram',
      label: 'Telegram',
      value: '',
      enabled: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (method: ContactMethod) => {
    setEditingId(method.id);
    setFormData({
      type: method.type,
      label: method.label,
      value: method.value,
      enabled: method.enabled
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    
    // Find the definition to get default Khmer label if needed, or just use English label
    const definition = contactMethodTypes.find(def => def.type === type);
    let defaultLabel = type;
    
    // Custom label mappings in Khmer for common types
    const labelMapping: Record<string, string> = {
      telegram: 'Telegram',
      messenger: 'Messenger',
      phone: 'ហៅទូរស័ព្ទ',
      whatsapp: 'WhatsApp',
      email: 'អ៊ីមែល',
      facebook: 'Facebook',
      website: 'គេហទំព័រ',
      sms: 'សារ SMS',
    };
    
    if (labelMapping[type]) {
      defaultLabel = labelMapping[type];
    } else if (definition) {
      defaultLabel = definition.label;
    }
    
    setFormData(prev => ({
      ...prev,
      type,
      label: defaultLabel
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await ContactMethodService.updateContactMethod(editingId, {
          type: formData.type,
          label: formData.label,
          value: formData.value,
          enabled: formData.enabled
        });
      } else {
        await ContactMethodService.createContactMethod({
          type: formData.type,
          label: formData.label,
          value: formData.value,
          icon: null,
          enabled: formData.enabled,
          sort_order: methods.length // Appended at the end
        });
      }
      await loadMethods();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('មិនអាចរក្សាទុកបានទេ សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await ContactMethodService.deleteContactMethod(deletingId);
      await loadMethods();
    } catch (err) {
      console.error(err);
      alert('មិនអាចលុបបានទេ សូមព្យាយាមម្តងទៀត');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const toggleEnabled = async (method: ContactMethod) => {
    try {
      // Optimistic update
      setMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: !m.enabled } : m));
      await ContactMethodService.toggleContactMethod(method.id, !method.enabled);
    } catch (err) {
      console.error(err);
      // Revert on error
      await loadMethods();
    }
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= methods.length) return;

    const newMethods = [...methods];
    const temp = newMethods[index];
    newMethods[index] = newMethods[index + direction];
    newMethods[index + direction] = temp;

    setMethods(newMethods);

    try {
      await ContactMethodService.reorderContactMethods(newMethods.map(m => m.id));
    } catch (err) {
      console.error(err);
      await loadMethods(); // revert
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">វិធីទំនាក់ទំនង ({methods.length})</h1>
        <button
          onClick={openAddModal}
          className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          បន្ថែមថ្មី
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : methods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">អ្នកមិនទាន់បានបន្ថែមវិធីទំនាក់ទំនងណាមួយនៅឡើយទេ</p>
          <button
            onClick={openAddModal}
            className="text-gray-900 font-medium hover:underline"
          >
            + បន្ថែមវិធីទំនាក់ទំនងដំបូងរបស់អ្នក
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method, index) => {
            const Icon = getIconForType(method.type);
            
            return (
              <div key={method.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 truncate">
                    <h3 className="font-semibold text-gray-900">{method.label}</h3>
                    <p className="text-sm text-gray-500 truncate">{method.value}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  {/* Status Toggle */}
                  <label className="flex items-center cursor-pointer mr-2">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={method.enabled} 
                        onChange={() => toggleEnabled(method)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${method.enabled ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${method.enabled ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600 hidden md:block">
                      {method.enabled ? 'បង្ហាញ' : 'លាក់'}
                    </span>
                  </label>

                  {/* Ordering */}
                  <div className="flex bg-gray-50 rounded-lg">
                    <button 
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-l-lg disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveItem(index, 1)}
                      disabled={index === methods.length - 1}
                      className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-r-lg disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={() => openEditModal(method)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => confirmDelete(method.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold">{editingId ? 'កែប្រែវិធីទំនាក់ទំនង' : 'បន្ថែមវិធីទំនាក់ទំនងថ្មី'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ប្រភេទ (Type) *</label>
                  <select 
                    value={formData.type} 
                    onChange={handleTypeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
                  >
                    {contactMethodTypes.map(def => (
                      <option key={def.type} value={def.type}>{def.label}</option>
                    ))}
                    <option value="other">ផ្សេងៗ (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ឈ្មោះបង្ហាញ (Label) *</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder="ឧទាហរណ៍៖ Telegram ផ្ទាល់ខ្លួន"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ព័ត៌មាន/តំណភ្ជាប់ (Value) *</label>
                  <input
                    type="text"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    placeholder={getPlaceholderForType(formData.type)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {getPlaceholderForType(formData.type)}
                  </p>
                </div>

                <div className="flex items-center mt-2">
                  <input
                    id="enabled-checkbox"
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <label htmlFor="enabled-checkbox" className="ml-2 text-sm font-medium text-gray-900">
                    បង្ហាញជាសាធារណៈ (Show publicly)
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'រក្សាទុក'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">បញ្ជាក់ការលុប</h3>
            <p className="text-gray-500 mb-6">តើអ្នកពិតជាចង់លុបវិធីទំនាក់ទំនងនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                បោះបង់
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {isDeleting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'លុប'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
