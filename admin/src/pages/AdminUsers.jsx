import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, MoreVertical, Edit2, ShieldAlert, Ban, Star, Loader2, X } from 'lucide-react'
import { usersService } from '../services/services'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: usersService.getUsers
  })

  const banMutation = useMutation({
    mutationFn: ({ id, banned }) => usersService.banUser(id, banned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: (user) => usersService.updateUser(user.id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setIsModalOpen(false)
      setEditingUser(null)
    }
  })

  const handleBanToggle = (user) => {
    banMutation.mutate({ id: user.id, banned: !user.is_banned })
  }

  const users = response?.data || []

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View progress, adjust points, and manage user accounts.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 dark:border-slate-800">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all" 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors flex-1 justify-center">
              <Filter size={16} /> Roles
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors flex-1 justify-center">
              <Filter size={16} /> Status
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 dark:bg-slate-800/20 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium">XP Balance</th>
                <th className="px-6 py-4 font-medium">Rewards (SP)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500" size={24} />
                    <p className="mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors group dark:hover:bg-slate-800/30 ${user.is_banned ? 'opacity-75' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/50 dark:to-violet-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                        {(user.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {user.name || 'Unknown'}
                          {user.role === 'admin' && <ShieldAlert size={14} className="text-violet-500" />}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20' : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 max-w-[120px]">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                        <div 
                          className={`h-full rounded-full ${user.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{ width: `${user.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium dark:text-slate-200">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      {(user.profiles?.xp || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-purple-600 font-bold dark:text-purple-400">
                      <Sparkles size={14} />
                      {(user.wallets?.[0]?.balance || 0).toLocaleString()} SP
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      !user.is_banned ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        !user.is_banned ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'
                      }`}></span>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-500/20 dark:hover:text-blue-400" title="Edit Points/Progress"><Edit2 size={16} /></button>
                      <button 
                        onClick={() => handleBanToggle(user)}
                        disabled={banMutation.isPending}
                        className={`p-2 rounded-lg transition-colors ${
                        user.is_banned 
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/20' 
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 dark:hover:text-red-400'
                      }`} title={user.is_banned ? 'Unban User' : 'Ban User'}>
                        {banMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => updateUserMutation.mutate(data)}
          isLoading={updateUserMutation.isPending}
        />
      )}
    </div>
  )
}

function UserModal({ user, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState(user || {})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'points' || name === 'progress' ? Number(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Map points back to study_points if the backend expects it, though the form captures it as points.
    // The backend users controller returns user.points = user.study_points
    onSave({ ...formData, study_points: formData.points })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm mt-20 md:mt-0 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Edit User Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input type="text" name="name" value={formData.name || ''} disabled className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select name="role" value={formData.role || 'user'} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Progress (%)</label>
            <input type="number" name="progress" min="0" max="100" value={formData.progress || 0} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Points</label>
            <input type="number" name="points" value={formData.points || 0} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
