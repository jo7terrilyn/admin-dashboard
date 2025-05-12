"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Shield, User, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters" }))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      return
    }

    setIsLoading(true)

    // Simulate registration delay
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to sign in after successful registration
      router.push("/sign-in")
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when typing
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 100

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden flex items-center justify-center">
      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      <div className="container relative z-10 max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            NEXUS OS
          </h1>
          <p className="text-slate-400 mt-2">Create your monitoring account</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-1 border-b border-slate-700/50">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
              <UserPlus className="mr-2 h-6 w-6 text-cyan-500" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Sign Up</span>
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Create an account to access the system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 font-mono">
                  FULL NAME
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-mono">
                  EMAIL
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-mono">
                  PASSWORD
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 font-mono">
                  CONFIRM PASSWORD
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="text-xs text-slate-400">
                <p>Password must be at least 8 characters and include:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li className="text-cyan-400">At least one uppercase letter</li>
                  <li className="text-cyan-400">At least one number</li>
                  <li className="text-cyan-400">At least one special character</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
              <div className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-8">
          <div className="text-xs text-slate-500">&copy; {new Date().getFullYear()} NEXUS OS. All rights reserved.</div>
          <div className="text-xs text-slate-600 mt-1">SYSTEM VERSION 2.4.5</div>
        </div>
      </div>
    </div>
  )
}
