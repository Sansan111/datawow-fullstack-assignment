'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/app/components/AuthLayout'
import InputField from '@/app/components/InputField'
import { PersonIcon, LockIcon, EyeIcon, EyeOffIcon } from '@/app/components/AuthIcons'
import { loginUser, saveToken } from '@/app/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(email, password)
      saveToken(data.access_token)
      router.push('/user')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
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
    <AuthLayout quote="Your digital workspace, simplified.">
      <div className="flex flex-col w-full max-w-[520px] items-center gap-[35px]">
        <h1 className="font-semibold italic text-black text-3xl md:text-[40px] leading-[60px] tracking-[0]">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-9 w-full">
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-300 rounded text-red-600 text-sm italic">
              {error}
            </div>
          )}

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your Email Address"
            value={email}
            onChange={setEmail}
            leftIcon={<PersonIcon />}
          />

          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your Password"
            value={password}
            onChange={setPassword}
            leftIcon={<LockIcon />}
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2.5 px-4 py-3 w-full bg-[#1591eb] rounded hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <span className="font-medium italic text-white text-xl md:text-2xl leading-9 tracking-[0]">
              {loading ? 'Logging in...' : 'Login as User'}
            </span>
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 w-full">
          <span className="font-normal italic text-black text-base md:text-xl leading-9 tracking-[0]">
            Don&apos;t have an account?
          </span>
          <Link href="/register" className="font-normal italic text-[#1692ec] text-base md:text-xl leading-9 tracking-[0]">
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
