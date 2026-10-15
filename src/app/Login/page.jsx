"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// Inner component that uses useSearchParams — must be inside Suspense
function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const loge2 = "/c1.png"

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please check your credentials and try again.")
          toast.error("Invalid email or password")
        } else if (result.error === "Configuration") {
          setError("Authentication service is not configured properly.")
          toast.error("Authentication error")
        } else {
          setError("Login failed. Please check your email and password.")
          toast.error("Login failed")
        }
      } else {
        toast.success("Login successful!")
        // Go to where they originally wanted to go, or their profile
        const destination = searchParams.get("callbackUrl") || `/pruser/${credentials.email}`
        router.push(destination)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      toast.error("An error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section (Only on Desktop) */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-blue-500/10">
          <Image
            src={loge2 || "/placeholder.svg"}
            alt="Traveler overlooking mountains"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 p-8">
          <h1 className="text-2xl font-semibold text-white">Kanoonikarwayahi</h1>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div suppressHydrationWarning={true} className="relative flex w-full flex-col justify-center px-4 lg:w-1/2 lg:px-8">
        {/* Mobile background image behind form */}
        <div className="absolute inset-0 lg:hidden z-0">
          <Image
            src={loge2 || "/placeholder.svg"}
            alt="Traveler overlooking mountains"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md bg-white/90 p-6 rounded-md backdrop-blur-sm lg:bg-transparent">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#00A3FF]">Welcome</h2>
            <p className="text-sm text-gray-500">Login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={handleInputChange}
                required
                className={`w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#00A3FF] focus:ring-[#00A3FF]"
                }`}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                className={`w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#00A3FF] focus:ring-[#00A3FF]"
                }`}
              />
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="block text-right text-sm text-[#00A3FF] hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#00A3FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0088DD] focus:outline-none focus:ring-2 focus:ring-[#00A3FF] focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => signIn("google", { callbackUrl: searchParams.get("callbackUrl") || "/pruser/homepage" })}
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] focus:ring-offset-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </div>

          {/* Register */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <button onClick={() => router.push("/Register")} className="text-[#00A3FF] hover:underline">
              Register now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Outer page wraps LoginForm in Suspense (required by Next.js for useSearchParams)
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A3FF]" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
