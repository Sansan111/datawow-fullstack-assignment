function SeatIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ReserveIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function CancelIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

interface StatCardsProps {
  totalSeats: number
  reserved: number
  cancelled: number
}

export default function StatCards({ totalSeats, reserved, cancelled }: StatCardsProps) {
  const cards = [
    { title: 'Total of seats', value: totalSeats, bg: 'bg-[#0070a4]', icon: <SeatIcon /> },
    { title: 'Reserve', value: reserved, bg: 'bg-[#00a58b]', icon: <ReserveIcon /> },
    { title: 'Cancel', value: cancelled, bg: 'bg-[#e84e4e]', icon: <CancelIcon /> },
  ]

  return (
    <section className="flex flex-col sm:flex-row w-full items-end justify-between gap-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`flex flex-col w-full sm:w-[350px] items-center justify-center gap-2.5 px-4 py-6 rounded-lg ${card.bg}`}
        >
          {card.icon}
          <h2 className="font-normal text-white text-2xl leading-9 tracking-[0]">
            {card.title}
          </h2>
          <p className="font-normal text-white text-6xl leading-[90px] tracking-[0]">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  )
}
