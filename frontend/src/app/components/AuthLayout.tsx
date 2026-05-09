import React from 'react'

interface AuthLayoutProps {
  quote: string
  children: React.ReactNode
}

export default function AuthLayout({ quote, children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left blue panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#0070a4] flex-col items-start justify-between px-16 lg:px-[100px] py-[110px] min-h-screen">
        <header className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full" />
          <span className="font-semibold italic text-white text-[40px] leading-[60px] tracking-[0]">
            BRAND
          </span>
        </header>
        <section className="flex flex-col items-start gap-8 w-full">
          <h1 className="font-semibold italic text-white text-[40px] leading-[52px] tracking-[0]">
            &quot;{quote}&quot;
          </h1>
          <p className="italic text-white text-base leading-[26px] tracking-[0]">
            Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non
          </p>
        </section>
      </div>

      {/* Mobile top bar */}
      <div className="flex md:hidden items-center gap-3 px-6 py-4 bg-[#0070a4]">
        <div className="w-8 h-8 bg-white rounded-full" />
        <span className="font-semibold italic text-white text-2xl">BRAND</span>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f3f3f3] px-6 py-10 md:px-16 lg:px-[100px]">
        {children}
      </div>
    </div>
  )
}
