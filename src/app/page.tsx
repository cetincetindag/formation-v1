"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CheckCircle,
  FileText,
  Zap,
  Coffee,
  Mail,
  Github,
  Linkedin,
  Lock,
  LayoutDashboard,
  Eye,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function Component() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentForms, setRecentForms] = useState<any[]>([]);
  useEffect(() => {
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    try {
      const storedForms = localStorage.getItem("recentForms");
      if (storedForms) {
        // Deduplicate forms by title
        const parsedForms = JSON.parse(storedForms);
        const titleMap = new Map();

        // Keep only the first occurrence of each form title
        parsedForms.forEach((form: any) => {
          if (!titleMap.has(form.title)) {
            titleMap.set(form.title, form);
          }
        });

        setRecentForms(Array.from(titleMap.values()));
      }
    } catch (e) {
      console.error("Error loading recent forms:", e);
    }
  }, [email]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Unknown date";
    }
  };
  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/forms/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formUrl, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("formAuthToken", data.token || "authenticated");
        router.push(`/manage/${formUrl}`);
      } else {
        toast.error("Invalid form URL or password");
      }
    } catch (error) {
      toast.error("An error occurred while trying to access the form");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: i * 0.1 },
    }),
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };
  return (
    <div className="from-background to-secondary flex min-h-screen flex-col bg-gradient-to-b">
      <motion.header
        className="container mx-auto px-4 py-6"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-primary cursor-effect font-serif text-3xl font-extralight">
            formation
          </h1>
          <nav>
            <ul className="flex items-center space-x-4">
              <li>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="link"
                      className="hover:text-primary text-muted-foreground p-0 hover:no-underline"
                    >
                      Contact Me
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src="/cetincetindag.jpeg"
                          alt="Cetin Cetindag"
                        />
                        <AvatarFallback>CC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Cetin Cetindag</p>
                        <div className="mt-2 flex space-x-3">
                          <a
                            href="mailto:cetincetindag@proton.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary text-muted-foreground"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                          <a
                            href="https://github.com/cetindag"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary text-muted-foreground"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                          <a
                            href="https://linkedin.com/in/cetincetindag"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary text-muted-foreground"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 border-t pt-4">
                      <Link
                        href="https://buymeacoffee.com/cetincetindag"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:no-underline"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-black"
                        >
                          <Coffee className="mr-2 h-4 w-4" />
                          Buy Me a Coffee
                        </Button>
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>
              </li>
            </ul>
          </nav>
        </div>
      </motion.header>
      <main className="container mx-auto flex flex-grow flex-col items-center justify-center px-4 py-12">
        <motion.section
          className="mb-12 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-3xl font-light md:text-4xl"
          >
            create beautiful forms in minutes.
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mb-8 text-xl"
          >
            no login, no signup, create & share.
          </motion.p>
        </motion.section>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          className="grid w-full max-w-4xl gap-8 md:grid-cols-2"
        >
          <motion.div variants={itemVariants}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Access Dashboard
                </CardTitle>
                <CardDescription>
                  Enter your form URL and password to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManageSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="formUrl" className="text-sm font-medium">
                      Form URL
                    </label>
                    <Input
                      id="formUrl"
                      placeholder="Enter your form URL"
                      value={formUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormUrl(e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your form password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Accessing..." : "Access Dashboard"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Form Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium">Create a New Form</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Start from scratch and build a customized form for your
                    needs
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => router.push("/create")}
                  >
                    Create Form
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-muted-foreground flex justify-center border-t p-4 text-center text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>All form data is encrypted and secure</span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </main>
      {}
      {recentForms.length > 0 && (
        <div className="container mx-auto mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <h3 className="mb-4 text-xl font-medium">Recent Forms</h3>
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="grid divide-y">
                {recentForms.map((form) => (
                  <div key={form.id} className="hover:bg-accent/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{form.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {formatDate(
                            form.createdAt || new Date().toISOString(),
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/view/${form.id}`,
                            );
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          <Copy className="mr-1 h-4 w-4" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(`/view/${form.id}`, "_blank");
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormUrl(form.id);

                            setTimeout(() => {
                              const passwordInput =
                                document.getElementById("password");
                              if (passwordInput) passwordInput.focus();
                            }, 100);
                          }}
                        >
                          Access
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <footer className="bg-muted py-8">
        <div className="text-muted-foreground container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} Formation. All rights reserved.
          </p>
        </div>
      </footer>
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .cursor-effect::after {
          content: "|";
          display: inline-block;
          margin-left: 1px;
          font-weight: 400;
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
}
