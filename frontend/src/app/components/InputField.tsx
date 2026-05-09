import React from 'react'

interface InputFieldProps {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  leftIcon: React.ReactNode
  rightElement?: React.ReactNode
}

export default function InputField({ label, type, placeholder, value, onChange, leftIcon, rightElement }: InputFieldProps) {
  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <label className="font-normal italic text-black text-xl md:text-2xl leading-9 tracking-[0]">
        {label}
      </label>
      <div className="flex items-center gap-3 p-3 w-full bg-white rounded border border-solid border-[#5c5c5c]">
        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
          {leftIcon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-normal italic text-black placeholder:text-[#c2c2c2] text-base leading-6 tracking-[0] outline-none bg-transparent"
        />
        {rightElement && (
          <div className="w-6 h-6 shrink-0 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}
