'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Loader2, 
  Users,
  Edit,
  Trash2,
  Mail,
  Shield,
  Cpu
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'OPERATOR' | 'QUALITY'
  active: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | 'QUALITY'>('OPERATOR')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setEmail('')
    setPassword('')
    setName('')
    setRole('OPERATOR')
    setEditingUser(null)
  }

  function handleEdit(user: User) {
    setEditingUser(user)
    setEmail(user.email)
    setName(user.name)
    setRole(user.role)
    setPassword('')
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingUser) {
        const body: Record<string, string> = { email, name, role }
        if (password) body.password = password

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Failed to update')
        toast.success('User updated')
      } else {
        if (!password) {
          toast.error('Password is required for new users')
          setSubmitting(false)
          return
        }
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create')
        }
        toast.success('User created')
      }

      setDialogOpen(false)
      resetForm()
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(user: User) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(user.active ? 'User deactivated' : 'User activated')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const roleColors = {
    ADMIN: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    OPERATOR: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    QUALITY: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6">
        <div className="absolute inset-0 text-purple-500 opacity-10">
          <CircuitPattern />
        </div>
        <GlowLine position="top" color="emerald" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400 text-xs font-mono">ADMIN</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Users</h1>
              <p className="text-slate-400 text-sm">Manage system users</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Add User'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@factory.com"
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!editingUser}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATOR">Operator</SelectItem>
                    <SelectItem value="QUALITY">Quality</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-slate-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {users.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No users yet</h3>
            <p className="text-slate-500 mt-1">
              Create your first user
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className={`border-slate-200 hover:border-purple-200 transition-colors ${!user.active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      user.active ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {user.name}
                        {!user.active && (
                          <Badge variant="outline" className="text-xs border-slate-300">Inactive</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[user.role]}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="hover:bg-slate-100">
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleToggleActive(user)}
                      className={user.active ? 'hover:bg-red-50' : 'hover:bg-emerald-50'}
                    >
                      <Trash2 className={`h-4 w-4 ${user.active ? 'text-red-500' : 'text-emerald-500'}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Created {formatDate(user.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
