import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Code2, 
  Trophy, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Search,
  Bell,
  Menu,
  X,
  TrendingUp,
  Activity,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = () => {
    const data = JSON.parse(localStorage.getItem('techmasterai_users') || '[]');
    setUsers(data);
  };

  const handleDelete = (id: number) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    localStorage.setItem('techmasterai_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast.success('Entry deleted');
  };

  const handleClearAll = () => {
    localStorage.setItem('techmasterai_users', JSON.stringify([]));
    setUsers([]);
    toast.success('All entries cleared');
  };

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  useEffect(() => {
    // Check Admin Status
    const adminStatus = localStorage.getItem('techmasterai_admin') === 'true';
    if (!adminStatus) {
      toast.error('Access Denied: Admin privileges required.');
      navigate('/');
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('techmasterai_admin');
    toast.success('Logged out from Admin Panel');
    navigate('/');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'problems', label: 'Problems', icon: Code2 },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0F1422]/90 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 lg:hover:w-64 group'
        }`}
      >
        <div className="h-full flex flex-col p-4">
          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-8 px-2 h-12">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
               <span className="font-bold text-primary">A</span>
            </div>
            <span className={`font-bold text-lg tracking-wide transition-opacity duration-300 ${
              !isSidebarOpen && !isMobile ? 'lg:opacity-0 lg:group-hover:opacity-100' : 'opacity-100'
            }`}>
              Admin Panel
            </span>
            
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(false)} className="ml-auto p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group/item relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-primary' : ''}`} />
                <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${
                  !isSidebarOpen && !isMobile ? 'lg:opacity-0 lg:group-hover:opacity-100' : 'opacity-100'
                }`}>
                  {item.label}
                </span>
                
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/5 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${
                  !isSidebarOpen && !isMobile ? 'lg:opacity-0 lg:group-hover:opacity-100' : 'opacity-100'
              }`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-[#0F1422]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg active"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 bg-[#0B0F19] border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1422]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {activeTab === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <StatsCard 
                      title="Total Users" 
                      value={users.length.toLocaleString()} 
                      change={`+${users.filter(u => new Date(u.submittedAt).toDateString() === new Date().toDateString()).length} today`} 
                      icon={Users} 
                      color="text-blue-400" 
                   />
                   <StatsCard 
                      title="Logins" 
                      value={users.filter(u => u.type === 'login').length.toLocaleString()} 
                      icon={Activity} 
                      color="text-purple-400" 
                   />
                   <StatsCard 
                      title="Sign Ups" 
                      value={users.filter(u => u.type === 'signup').length.toLocaleString()} 
                      change="New"
                      icon={Trophy} 
                      color="text-emerald-400" 
                   />
                   <StatsCard 
                      title="Contacts" 
                      value={users.filter(u => u.type === 'contact').length.toLocaleString()} 
                      icon={TrendingUp} 
                      color="text-orange-400" 
                   />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Activity Chart (Signups per day - Last 7 days) */}
                  <div className="lg:col-span-2 bg-[#0F1422] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">Activity Volume (Last 7 Days)</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                       {Array.from({ length: 7 }).map((_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - i));
                          const count = users.filter(u => new Date(u.submittedAt).toDateString() === date.toDateString()).length;
                          const max = Math.max(1, ...Array.from({ length: 7 }).map((_, j) => {
                             const d = new Date();
                             d.setDate(d.getDate() - (6 - j));
                             return users.filter(u => new Date(u.submittedAt).toDateString() === d.toDateString()).length;
                          }));
                          const height = Math.max(5, (count / max) * 100);
                          
                          return (
                            <div key={i} className="flex-1 flex flex-col justify-end group/bar">
                               <div 
                                  className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all duration-300 relative" 
                                  style={{ height: `${height}%` }}
                               >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                                     {count} events
                                  </div>
                               </div>
                               <span className="text-xs text-center text-gray-500 mt-2">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                            </div>
                          );
                       })}
                    </div>
                  </div>

                  {/* Recent Actions List */}
                  <div className="bg-[#0F1422] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Actions</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                       {users.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">No recent activity.</p>
                       ) : (
                          [...users].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5).map((user, i) => (
                           <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                user.type === 'signup' ? 'bg-purple-500/20 text-purple-400' :
                                user.type === 'login' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium truncate">{user.name || 'Anonymous'}</p>
                                 <p className="text-xs text-gray-400 truncate capitalize">
                                    {user.type === 'signup' ? 'New Account Created' : 
                                     user.type === 'login' ? 'User Logged In' : 'Submitted Contact Form'}
                                 </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {new Date(user.submittedAt).getHours()}:{String(new Date(user.submittedAt).getMinutes()).padStart(2, '0')}
                                </span>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
               <div className="bg-[#0F1422] border border-white/5 rounded-2xl p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold">User Management</h3>
                   <div className="flex gap-2">
                     <button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                     >
                       <Trash2 className="w-4 h-4" />
                       Clear All
                     </button>
                     <Button>Add User</Button>
                   </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                          <th className="p-4">Type</th>
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="p-8 text-center text-gray-500">
                               No users found.
                             </td>
                           </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                  user.type === 'signup' ? 'bg-purple-500/20 text-purple-400' :
                                  user.type === 'contact' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {user.type}
                                </span>
                              </td>
                              <td className="p-4 font-medium">{user.name || '-'}</td>
                              <td className="p-4 text-gray-400">{user.email}</td>
                              <td className="p-4 text-gray-400 text-sm">{new Date(user.submittedAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleDelete(user.id)}
                                  className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                 </div>
               </div>
            )}

            {activeTab === 'problems' && (
               <div className="bg-[#0F1422] border border-white/5 rounded-2xl p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold">Problem Bank</h3>
                   <Button className="bg-primary text-black hover:bg-primary/90">Add Problem</Button>
                 </div>
                 <div className="text-center py-20 text-gray-500">
                    <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Problem management interface will appear here.</p>
                 </div>
               </div>
            )}

            {/* Other tabs would follow similar structure */}

          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Component for Stats Cards
const StatsCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-[#0F1422] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {change && (
        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          {change}
        </span>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1 text-white">{value}</p>
  </div>
);

export default Admin;
