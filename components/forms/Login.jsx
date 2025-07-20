"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor, complete todos los campos");
      return;
    }
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      // Si el usuario marcó 'Recordarme', la cookie será persistente
      remember: rememberMe,
    });
    setIsLoading(false);
    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Credenciales inválidas" : result.error);
    } else if (result?.ok) {
      router.push("/view");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 px-4 py-12 sm:px-6 lg:px-8 dark">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-zinc-900 opacity-90 z-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/3 -left-16 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10 border border-zinc-800 bg-zinc-950 shadow-xl rounded-xl">
        {/* Card Header */}
        <div className="p-6 space-y-1 border-b border-zinc-800">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
            {/* Car Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-orange-500"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-white">Iniciar sesión</h2>
          <p className="text-center text-zinc-400">Acceda a su cuenta para gestionar sus servicios automotrices</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Error message */}
            {error && <div className="p-3 text-sm text-white bg-red-600/90 rounded-md">{error}</div>}

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Correo electrónico
              </label>
              <div className="relative">
                {/* Mail Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  className="pl-10 w-full rounded-md bg-zinc-900 border border-zinc-800 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Contraseña
                </label>
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-400 hover:underline">
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <div className="relative">
                {/* Lock Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 w-full rounded-md bg-zinc-900 border border-zinc-800 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" x2="22" y1="2" y2="22"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm font-normal text-zinc-400">
                  Recordarme
                </label>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-6 pt-0 space-y-4">
            {/* Login button */}
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">O continúe con</span>
              </div>
            </div>

            {/* Social login buttons eliminados */}

            {/* Register link */}
            <p className="text-center text-sm text-zinc-500 mt-2">
              ¿No tiene una cuenta?{" "}
              <Link href="/register" className="text-orange-500 hover:text-orange-400 hover:underline">
                Registrarse
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
