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

function HistoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function SwitchIcon() {
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

interface SidebarProps {
  title: string
  homePath: string
  historyPath: string
  switchLabel: string
  switchPath: string
  logoutPath: string
}

export default function Sidebar({ title, homePath, historyPath, switchLabel, switchPath, logoutPath }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    removeToken()
    router.push(logoutPath)
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, href: homePath },
    { id: 'history', label: 'History', icon: <HistoryIcon />, href: historyPath },
    { id: 'switch', label: switchLabel, icon: <SwitchIcon />, href: switchPath },
  ]

  return (
    <aside className="fixed top-0 left-0 flex flex-col w-[242px] h-screen items-center justify-between py-10 bg-white border-r border-[#e6e6e6] z-10">
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center gap-2.5 p-6 w-full">
          <span className="font-semibold text-black text-[40px] leading-[60px] tracking-[0]">
            {title}
          </span>
        </div>
        <nav className="flex flex-col items-center w-full">
          {navItems.map((item) => {
            const isActive = item.id === 'switch'
              ? false
              : item.href === homePath
                ? pathname === homePath
                : pathname?.startsWith(item.href)
            return (
              <div key={item.id} className="w-full p-2">
                <button
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2.5 px-2 py-4 w-full rounded-lg text-left cursor-pointer hover:bg-[#eaf5f9] transition-colors ${isActive ? 'bg-[#eaf5f9]' : ''}`}
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
