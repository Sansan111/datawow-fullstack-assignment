import Link from 'next/link'

function UserCardIcon() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="68" height="60" rx="7" stroke="#0070A4" strokeWidth="4" fill="none" />
      <circle cx="39" cy="28" r="11" stroke="#0070A4" strokeWidth="4" fill="none" />
      <path d="M14 62 C14 46 64 46 64 62" stroke="#0070A4" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M30 65 L39 80 L48 65" fill="#0070A4" />
    </svg>
  )
}

function AdminCardIcon() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="34" cy="25" r="13" stroke="white" strokeWidth="4" fill="none" />
      <path d="M6 74 C6 54 62 54 62 74" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="70" cy="62" r="13" stroke="white" strokeWidth="3" fill="none" />
      <circle cx="70" cy="62" r="5" fill="white" />
      <line x1="70" y1="45" x2="70" y2="49" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="75" x2="70" y2="79" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="53" y1="62" x2="57" y2="62" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="83" y1="62" x2="87" y2="62" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#fbfbfb]">
      {/* Header */}
      <header className="flex items-center gap-3 p-8 md:p-10 bg-white">
        <div className="w-6 h-6 bg-[#0070a4] rounded-full" />
        <span className="font-semibold italic text-[#0070a4] text-xl md:text-2xl leading-9 tracking-[0]">
          BRAND
        </span>
      </header>

      {/* Main content */}
      <section className="flex-1 flex flex-col items-center justify-center gap-10 md:gap-[65px] px-6 md:px-[94px] py-10 md:py-[63px]">
        <div className="flex flex-col items-center gap-1 max-w-[681px] w-full">
          <h1 className="font-semibold italic text-black text-3xl md:text-5xl text-center leading-tight md:leading-[72px] tracking-[0]">
            Select Access Level
          </h1>
          <p className="font-normal italic text-black text-base md:text-xl text-center leading-[26px] tracking-[0]">
            Lorem ipsum dolor sit amet consectetur. Elit purus nam.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-[90px] w-full justify-center">
          {/* User card */}
          <article className="flex flex-col w-full max-w-[581px] items-start justify-center gap-5 p-10 md:p-[100px] bg-white rounded-[10px] shadow-[0px_4px_22px_#0000000d]">
            <div className="flex flex-col items-start gap-20 w-full">
              <div className="flex flex-col items-start gap-8 w-full">
                <UserCardIcon />
                <h2 className="font-semibold italic text-[#0070a4] text-3xl md:text-4xl leading-[46.8px] tracking-[0]">
                  User
                </h2>
                <p className="font-normal italic text-[#0070a4] text-base leading-[26px] tracking-[0]">
                  Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non
                </p>
              </div>
              <Link href="/login" className="w-full">
                <button className="flex items-center justify-center gap-2.5 px-4 py-3 w-full bg-[#0070a4] rounded hover:opacity-95 transition-opacity">
                  <span className="font-medium italic text-white text-xl md:text-2xl leading-9 tracking-[0]">
                    Enter Workspace
                  </span>
                  <ArrowIcon color="white" />
                </button>
              </Link>
            </div>
          </article>

          {/* Administrator card */}
          <article className="flex flex-col w-full max-w-[581px] items-start justify-center gap-5 p-10 md:p-[100px] bg-[#0070a4] rounded-[10px]">
            <div className="flex flex-col items-start gap-20 w-full">
              <div className="flex flex-col items-start gap-8 w-full">
                <AdminCardIcon />
                <h2 className="font-semibold italic text-white text-3xl md:text-4xl leading-[46.8px] tracking-[0]">
                  Administrator
                </h2>
                <p className="font-normal italic text-white text-base leading-[26px] tracking-[0]">
                  Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non
                </p>
              </div>
              <Link href="/admin/login" className="w-full">
                <button className="flex items-center justify-center gap-2.5 px-4 py-3 w-full bg-white rounded hover:opacity-95 transition-opacity">
                  <span className="font-medium italic text-[#0070a4] text-xl md:text-2xl leading-9 tracking-[0]">
                    Enter Portal
                  </span>
                  <ArrowIcon color="#0070a4" />
                </button>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
