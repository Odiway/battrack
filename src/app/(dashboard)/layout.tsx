'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Battery, 
  LayoutDashboard, 
  Box, 
  Settings, 
  Users, 
  ClipboardList,
  Cog,
  LogOut,
  ChevronDown,
  Loader2,
  Cpu,
  Zap,
  ShieldAlert
} from 'lucide-react'
import { StatusLeds } from '@/components/ui/tech-pattern'

const navigation = [
  { name: 'Ana Sayfa', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATOR', 'QUALITY'] },
  { name: 'Batarya Kutuları', href: '/battery-boxes', icon: Box, roles: ['ADMIN', 'OPERATOR', 'QUALITY'] },
  { name: 'Uygunsuzluklar', href: '/defects', icon: ShieldAlert, roles: ['ADMIN', 'QUALITY'] },
]

const adminNavigation = [
  { name: 'Prosesler', href: '/admin/processes', icon: Cog },
  { name: 'Kontrol Listeleri', href: '/admin/checklists', icon: ClipboardList },
  { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-3 text-slate-400 text-sm">Loading system...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* TEMSA Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0066B3] to-[#004080] rounded-lg flex items-center justify-center border border-blue-400/30">
                  <span className="text-white font-bold text-sm tracking-tight">TEMSA</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-slate-800 rounded flex items-center justify-center border border-emerald-500/50">
                  <Zap className="w-2 h-2 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-lg text-white">TrackBat</span>
                <div className="flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
                </div>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation
                .filter(item => item.roles.includes(user.role))
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#0066B3] text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              
              {/* Admin Dropdown */}
              {user.role === 'ADMIN' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      className={`gap-2 ${
                        pathname.startsWith('/admin') 
                          ? 'bg-[#0066B3] text-white hover:bg-[#004080] hover:text-white' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Yönetim
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    {adminNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center gap-2 cursor-pointer text-slate-200 focus:bg-slate-700 focus:text-white">
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Right Side - Status + User */}
            <div className="flex items-center gap-4">
              <StatusLeds />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066B3] to-cyan-600 flex items-center justify-center font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-slate-400 text-xs">{user.email}</div>
                    <div className="text-xs mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                          : user.role === 'QUALITY'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {user.role === 'ADMIN' ? 'YÖNETİCİ' : user.role === 'QUALITY' ? 'KALİTE' : 'OPERATÖR'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-slate-800 border-b border-slate-700 px-4 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {navigation
            .filter(item => item.roles.includes(user.role))
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  isActive(item.href)
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 bg-slate-700'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          {user.role === 'ADMIN' && adminNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                isActive(item.href)
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 bg-slate-700'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
