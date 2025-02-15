"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { CheckCircle, FileText, Zap } from "lucide-react";

export default function Component() {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  }, [email]);

  return (
    <div className="from-background to-secondary min-h-screen bg-gradient-to-b">
      <header className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-primary text-3xl font-bold">formation</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                > Contact Us </a>
              </li>
            </ul>
          </nav>
        </motion.div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 text-3xl font-semibold md:text-4xl"
          >
            Create Beautiful Forms in Minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-muted-foreground mb-8 text-xl"
          >
            formation makes it easy to design and deploy professional forms for
            any purpose.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center gap-2"
          >
            <Link href="/create">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                Create a Form
              </Button>
            </Link>
            <Link href="/manage">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                Manage Forms
              </Button>
            </Link>
          </motion.div>
        </section>

        <section id="features" className="mb-16">
          <motion.h3
            className="mb-8 text-center text-2xl font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Why Choose Formation?
          </motion.h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: <FileText className="mb-4 h-8 w-8" />,
                title: "Easy to Use",
                description: "Intuitive interface for quick form creation.",
              },
              {
                icon: <Zap className="mb-4 h-8 w-8" />,
                title: "Lightning Fast",
                description: "Create and deploy forms in minutes, not hours.",
              },
              {
                icon: <CheckCircle className="mb-4 h-8 w-8" />,
                title: "Customizable",
                description: "Tailor your forms to match your brand and needs.",
              },
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
                    <h4 className="mb-2 text-xl font-semibold">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-muted fixed bottom-2 left-0 right-0 py-8">
        <div className="text-muted-foreground container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} Formation. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
