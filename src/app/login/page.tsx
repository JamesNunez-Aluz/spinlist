import Link from 'next/link'
import { signIn } from '@/app/actions'
import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 sm:p-10">
        <h1 className="font-display text-4xl font-bold mb-2">Welcome back</h1>
        <p className="text-white/60 mb-8">Sign in to spin your list.</p>

        <AuthForm action={signIn} submitLabel="Sign in" />

        <p className="text-sm text-white/60 mt-6 text-center">
          New here?{' '}
          <Link href="/signup" className="text-pink-400 hover:text-pink-300 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
