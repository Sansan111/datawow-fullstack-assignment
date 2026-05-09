'use client'

interface DeleteConfirmDialogProps {
  concertName: string
  onCancel: () => void
  onDelete: () => void
}

export default function DeleteConfirmDialog({ concertName, onCancel, onDelete }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <section
        className="flex flex-col w-[422px] items-start gap-2 p-6 bg-white rounded-lg border border-[#e9e9e9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-6 w-full">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 id="delete-title" className="font-bold text-black text-xl text-center leading-8">
              Are you sure to delete?<br />
              &quot;{concertName}&quot;
            </h2>
          </div>
          <div className="flex items-start gap-4 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center gap-2 px-4 py-3 flex-1 bg-white rounded border border-[#c4c4c4] cursor-pointer"
            >
              <span className="font-medium text-[#262626] text-base text-center leading-6">
                Cancel
              </span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center gap-2 px-4 py-3 flex-1 bg-[#e63946] rounded cursor-pointer"
            >
              <span className="font-medium text-white text-base text-center leading-6">
                Yes, Delete
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
