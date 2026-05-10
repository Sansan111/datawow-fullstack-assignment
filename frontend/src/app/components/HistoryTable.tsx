import type { AuditLog } from '@/app/lib/concerts'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const actionLabel: Record<string, string> = {
  RESERVE: 'Reserve',
  CANCEL: 'Cancel',
  EVENT_DELETED: 'Event Deleted',
}

interface HistoryTableProps {
  logs: AuditLog[]
  showUsername?: boolean
}

export default function HistoryTable({ logs, showUsername = false }: HistoryTableProps) {
  const headers = showUsername
    ? ['Date time', 'Username', 'Concert name', 'Action', 'Event Status']
    : ['Date time', 'Concert name', 'Action', 'Event Status']

  return (
    <div className="flex flex-col items-start w-full">
      <div className="w-full bg-white rounded overflow-hidden border border-[#5b5b5b]">
        <div className="flex w-full">
          {headers.map((header) => (
            <div
              key={header}
              className="flex-1 px-3 py-2.5 border-t border-l border-[#5b5b5b] first:border-l-0"
            >
              <span className="font-semibold text-black text-xl leading-[30px] tracking-[0]">
                {header}
              </span>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="flex w-full">
            <div className="flex-1 px-3 py-2.5 border-t border-[#5b5b5b] text-[#5c5c5c] text-base italic">
              No reservation history yet.
            </div>
          </div>
        )}
        {logs.map((row) => (
          <div key={row.id} className="flex w-full">
            <div className="flex-1 px-3 py-2.5 border-t border-l border-[#5b5b5b] first:border-l-0">
              <span className="font-normal text-black text-base leading-6 tracking-[0]">
                {formatDate(row.createdAt)}
              </span>
            </div>
            {showUsername && (
              <div className="flex-1 px-3 py-2.5 border-t border-l border-[#5b5b5b]">
                <span className="font-normal text-black text-base leading-6 tracking-[0]">
                  {row.user?.email || '-'}
                </span>
              </div>
            )}
            <div className="flex-1 px-3 py-2.5 border-t border-l border-[#5b5b5b]">
              <span className="font-normal text-black text-base leading-6 tracking-[0]">
                {row.concert?.name || '-'}
              </span>
            </div>
            <div className="flex-1 px-3 py-2.5 border-t border-l border-[#5b5b5b]">
              <span className="font-normal text-black text-base leading-6 tracking-[0]">
                {actionLabel[row.action]}
              </span>
            </div>
            <div className="flex-1 px-3 py-2.5 border-t border-l border-[#5b5b5b]">
              <span className="font-normal text-black text-base leading-6 tracking-[0]">
                {row.concert?.deletedAt ? 'Event Canceled' : 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
