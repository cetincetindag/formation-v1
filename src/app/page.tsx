'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent } from "~/components/ui/card"
import { CheckCircle, FileText, Zap } from 'lucide-react'

export default function Component() {
  const [email, setEmail] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)

  useEffect(() => {
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  }, [email])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-primary">formation</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </nav>
        </motion.div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl font-semibold mb-4"
          >
            Create Beautiful Forms in Minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-8"
          >
            formation makes it easy to design and deploy professional forms for any purpose.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/create">
              <Button size="lg" className="animate-pulse bg-blue-500 hover:bg-blue-600">Get Started</Button>
            </Link>
          </motion.div>
        </section>

        <section id="features" className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Why Choose Formation?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FileText className="h-8 w-8 mb-4" />, title: "Easy to Use", description: "Intuitive drag-and-drop interface for quick form creation." },
              { icon: <Zap className="h-8 w-8 mb-4" />, title: "Lightning Fast", description: "Create and deploy forms in minutes, not hours." },
              { icon: <CheckCircle className="h-8 w-8 mb-4" />, title: "Customizable", description: "Tailor your forms to match your brand and needs." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    {feature.icon}
                    <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Simple Pricing</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <h4 className="text-2xl font-bold mb-4">Pro Plan</h4>
                <p className="text-4xl font-bold mb-4">$19<span className="text-xl text-muted-foreground">/month</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Unlimited Forms</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Advanced Analytics</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-green-500" /> Custom Branding</li>
                </ul>
                <Button className="w-full">Start Free Trial</Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section id="contact" className="max-w-md mx-auto">
          <h3 className="text-2xl font-semibold mb-8 text-center">Stay Updated</h3>
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" className="w-full" disabled={!isEmailValid}>
                  Subscribe to Newsletter
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-muted mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2023 Formation. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
