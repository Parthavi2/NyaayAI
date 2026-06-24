"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Scale, Menu, X, Sparkles, LogIn, LogOut, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center shadow-glow">
                <Scale size={16} className="text-navy-950" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse opacity-80" />
            </div>
            <span className="font-display font-700 text-lg tracking-tight">
              <span className="gradient-text">Nyaay</span>
              <span className="text-slate-300">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-teal-400 bg-teal-400/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <UserCircle size={16} className="text-teal-400" />
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
                <Link
                  href="/analyze"
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                >
                  <Sparkles size={14} />
                  Analyze Notice
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
                >
                  <LogIn size={14} />
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                >
                  <Sparkles size={14} />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-white/[0.06]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  pathname === link.href
                    ? "text-teal-400 bg-teal-400/10"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-slate-500 flex items-center gap-1.5">
                    <UserCircle size={14} className="text-teal-400" />
                    {user.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary block px-4 py-2.5 text-sm font-semibold text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
