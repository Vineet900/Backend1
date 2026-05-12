import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  LayoutDashboard,
  Wallet,
  Zap,
  RefreshCw,
  Trophy,
  Edit2,
  X,
  Activity,
  ShieldAlert,
  Ban,
  CheckCircle
} from 'lucide-react'
import { adminAPI } from '../lib/api'
import { Link } from 'react-router-dom'
import AppLogo from '../components/AppLogo'
import { toast } from 'react-hot-toast'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ xp: 0, sp: 0 })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes, healthRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getStats(),
        adminAPI.getHealth()
      ])
      if (usersRes.data) setUsers(usersRes.data.data)
      if (statsRes.data) setStats(statsRes.data.data)
      if (healthRes.data) setHealth(healthRes.data.data)
    } catch (err) {
      toast.error('Failed to sync admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditForm({
      xp: user.profiles?.[0]?.xp || 0,
      sp: user.wallets?.[0]?.balance || 0
    })
  }

  const handleSaveStats = async () => {
    if (!editingUser) return
    setIsSaving(true)
    try {
      const currentXP = editingUser.profiles?.[0]?.xp || 0
      const currentSP = editingUser.wallets?.[0]?.balance || 0
      if (editForm.sp !== currentSP) {
        await adminAPI.adjustPoints(editingUser.id, editForm.sp - currentSP, 'Admin Adjustment')
      }
      await adminAPI.manageUser(editingUser.id, { xp: editForm.xp })
      toast.success('User synchronized')
      fetchData()
      setEditingUser(null)
    } catch (err) {
      toast.error('Sync failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleBan = async (user) => {
    const isBanned = user.profiles?.[0]?.is_verified === false
    try {
      await adminAPI.banUser(user.id, !isBanned)
      toast.success(isBanned ? 'User unbanned' : 'User banned')
      fetchData()
    } catch (err) {
      toast.error('Action failed')
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.profiles?.[0]?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-brand-cyan/30">
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl z-50 hidden lg:block">
        <div className="p-8"><AppLogo size={32} /></div>
        <nav className="px-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="Overview" active />
          <NavItem icon={Users} label="Users" />
          <NavItem icon={ShieldAlert} label="Security" />
          <NavItem icon={Activity} label="System Health" />
        </nav>
      </aside>

      <main className="lg:ml-64 p-8 lg:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black">Admin HQ</h1>
            <p className="text-white/40 font-medium">Platform control and real-time analytics.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..." 
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:border-brand-cyan outline-none transition-all w-full md:w-64"
                />
             </div>
             <button onClick={fetchData} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <StatBox title="Platform Users" value={stats?.totalUsers || 0} icon={<Users/>} color="brand-cyan" trend="+12% this week" />
           <StatBox title="Active Roadmaps" value={stats?.totalCourses || 0} icon={<Zap/>} color="yellow-400" trend="Stable" />
           <StatBox title="CPU Usage" value={`${Math.round(health?.cpu?.[0] * 100 || 0)}%`} icon={<Activity/>} color="brand-purple" trend="Nominal" />
           <StatBox title="System Uptime" value={`${Math.round((health?.uptime || 0) / 3600)} hrs`} icon={<Shield/>} color="green-400" trend="99.9% SL" />
        </div>

        {/* User Table */}
        <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden bg-white/[0.01]">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black">Interstellar Learners</h2>
            <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">{filteredUsers.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6">Authority</th>
                  <th className="px-8 py-6">Telemetry</th>
                  <th className="px-8 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const isBanned = user.profiles?.[0]?.is_verified === false
                  return (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                            <img src={user.profiles?.[0]?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="" />
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isBanned ? 'text-red-400 line-through' : 'text-white'}`}>{user.profiles?.[0]?.username || 'Anonymous'}</p>
                            <p className="text-xs text-white/30">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                           <div><p className="text-[10px] text-white/20 uppercase font-black">XP</p><p className="text-xs font-bold text-brand-cyan">{user.profiles?.[0]?.xp || 0}</p></div>
                           <div><p className="text-[10px] text-white/20 uppercase font-black">SP</p><p className="text-xs font-bold text-brand-purple">{user.wallets?.[0]?.balance || 0}</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button onClick={() => handleEditClick(user)} className="p-2 text-white/20 hover:text-brand-cyan transition-all"><Edit2 size={18}/></button>
                        <button onClick={() => handleToggleBan(user)} className={`p-2 transition-all ${isBanned ? 'text-green-500 hover:text-green-400' : 'text-red-500/20 hover:text-red-500'}`}>
                           {isBanned ? <CheckCircle size={18}/> : <Ban size={18}/>}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div onClick={() => !isSaving && setEditingUser(null)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
           <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-md glass-card p-10 rounded-[3rem] border-white/10 bg-[#0a0f1e]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black">Override Metrics</h3>
                 <button onClick={() => setEditingUser(null)}><X size={24}/></button>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-2">XP</label><input type="number" value={editForm.xp} onChange={e => setEditForm({...editForm, xp: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-cyan"/></div>
                    <div><label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-2">SP</label><input type="number" value={editForm.sp} onChange={e => setEditForm({...editForm, sp: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-purple"/></div>
                 </div>
                 <button onClick={handleSaveStats} disabled={isSaving} className="w-full py-4 rounded-2xl bg-brand-cyan text-bg-deep font-black hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    {isSaving ? <RefreshCw className="animate-spin"/> : 'Commit Overrides'}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  )
}

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-black text-sm transition-all ${active ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      <Icon size={20} /> {label}
    </button>
  )
}

function StatBox({ title, value, icon, color, trend }) {
  return (
    <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
      <div className={`w-12 h-12 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color} mb-6 group-hover:rotate-6 transition-transform`}>{icon}</div>
      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black mb-2">{value}</p>
      <p className={`text-[10px] font-bold ${trend.includes('+') ? 'text-green-500' : 'text-white/20'}`}>{trend}</p>
    </div>
  )
}
