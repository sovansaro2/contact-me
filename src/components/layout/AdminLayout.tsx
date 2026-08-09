import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LogOut, LayoutDashboard, User, Link as LinkIcon, Eye, Settings } from 'lucide-react';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'ផ្ទាំងគ្រប់គ្រង', path: '/admin', icon: LayoutDashboard },
    { name: 'ព័ត៌មានផ្ទាល់ខ្លួន', path: '/admin/profile', icon: User },
    { name: 'វិធីទំនាក់ទំនង', path: '/admin/methods', icon: LinkIcon },
    { name: 'ការកំណត់', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col md:min-h-screen">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center md:block">
          <h2 className="text-xl font-bold">Contact Me</h2>
        </div>
        
        <nav className="flex-1 p-4 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <div className="hidden md:block my-4 border-t border-gray-100"></div>
          
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Eye className="w-5 h-5 shrink-0" />
            <span>មើលទំព័រផ្ទាល់</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>ចាកចេញ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
