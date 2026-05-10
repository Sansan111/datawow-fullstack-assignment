'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/app/components/AuthLayout'
import InputField from '@/app/components/InputField'
import { PersonIcon, LockIcon, EyeIcon, EyeOffIcon } from '@/app/components/AuthIcons'
import { registerUser, saveToken } from '@/app/lib/auth'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Please enter your full name')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const data = await registerUser(form.name, form.email, form.password, 'ADMIN')
      saveToken(data.access_token)
      router.push('/admin')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || msg)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout quote="Powering the tools that&#10;power the team.">
      <div className="flex flex-col w-full max-w-[520px] items-center gap-[35px]">
        <h1 className="font-semibold italic text-black text-3xl md:text-[40px] leading-[60px] tracking-[0]">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-9 w-full">
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-300 rounded text-red-600 text-sm italic">
              {error}
            </div>
          )}

          <InputField
            label="Full name"
            type="text"
            placeholder="Enter your Full Name"
            value={form.name}
            onChange={(val) => setForm({ ...form, name: val })}
            leftIcon={<PersonIcon />}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your Email Address"
            value={form.email}
            onChange={(val) => setForm({ ...form, email: val })}
            leftIcon={<PersonIcon />}
          />

          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a Password"
            value={form.password}
            onChange={(val) => setForm({ ...form, password: val })}
            leftIcon={<LockIcon />}
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            }
          />

          <InputField
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your Password"
            value={form.confirmPassword}
            onChange={(val) => setForm({ ...form, confirmPassword: val })}
            leftIcon={<LockIcon />}
            rightElement={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="focus:outline-none">
                {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2.5 px-4 py-3 w-full bg-[#1591eb] rounded hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <span className="font-medium italic text-white text-xl md:text-2xl leading-9 tracking-[0]">
              {loading ? 'Creating account...' : 'Create an account'}
            </span>
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 w-full">
          <span className="font-normal italic text-black text-base md:text-xl leading-9 tracking-[0]">
            Already have an account?
          </span>
          <Link href="/admin/login" className="font-normal italic text-[#1692ec] text-base md:text-xl leading-9 tracking-[0]">
            Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
