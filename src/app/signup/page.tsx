import Link from 'next/link'
import { signUp } from '@/app/actions'
import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 sm:p-10">
        <h1 className="font-display text-4xl font-bold mb-2">Join SpinList</h1>
        <p className="text-white/60 mb-8">Add your tasks. Let the wheel decide.</p>

        <AuthForm action={signUp} submitLabel="Create account" />

        <p className="text-sm text-white/60 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-pink-400 hover:text-pink-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
