'use client'

import { useRouter, usePathname } from 'next/navigation'
import { removeToken } from '@/app/lib/auth'

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function SwitchAdminIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
}

export default function UserSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/user' },
    { id: 'switch', label: 'Switch to Admin', icon: <SwitchAdminIcon />, href: '/admin/login' },
  ]

  return (
    <aside className="fixed top-0 left-0 flex flex-col w-[242px] h-screen items-center justify-between py-10 bg-white border-r border-[#e6e6e6] z-10">
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center gap-2.5 p-6 w-full">
          <span className="font-semibold text-black text-[40px] leading-[60px] tracking-[0]">
            User
          </span>
        </div>
        <nav className="flex flex-col items-center w-full">
          {navItems.map((item) => {
            const isActive = item.href === '/user'
              ? pathname === '/user'
              : item.id === 'switch'
                ? false
                : pathname?.startsWith(item.href || '')
            return (
              <div key={item.id} className="w-full p-2">
                <button
                  type="button"
                  onClick={() => item.href && router.push(item.href)}
                  className={`flex items-center gap-2.5 px-2 py-4 w-full rounded-lg text-left cursor-pointer ${isActive ? 'bg-[#eaf5f9]' : ''}`}
                >
                  {item.icon}
                  <span className="font-normal text-black text-2xl leading-9 tracking-[0]">
                    {item.label}
                  </span>
                </button>
              </div>
            )
          })}
        </nav>
      </div>
      <div className="w-full p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2 py-4 w-full text-left cursor-pointer"
        >
          <LogoutIcon />
          <span className="font-normal text-black text-2xl leading-9 tracking-[0]">
            Logout
          </span>
        </button>
      </div>
    </aside>
  )
}
