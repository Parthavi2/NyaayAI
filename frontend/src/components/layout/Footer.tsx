import Link from "next/link";
import { Scale, Github, Twitter, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-violet-500 flex items-center justify-center">
                <Scale size={16} className="text-navy-950" strokeWidth={2.5} />
              </div>
              <span className="font-display font-700 text-lg">
                <span className="gradient-text">Nyaay</span>
                <span className="text-slate-300">AI</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-powered legal assistance for every Indian citizen. Understand your rights, detect scams, and get guided.
            </p>
            <div className="flex gap-3 mt-5">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-400/20 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Platform",
              links: [
                { label: "Analyze Notice", href: "/analyze" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "History", href: "/history" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "eCourts Portal", href: "https://ecourts.gov.in" },
                { label: "NALSA Legal Aid", href: "#" },
                { label: "Bar Council of India", href: "#" },
              ],
            },
            {
              title: "SDG Goals",
              links: [
                { label: "SDG 16 – Justice", href: "#" },
                { label: "SDG 10 – Equality", href: "#" },
                { label: "SDG 1 – No Poverty", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-700 tracking-widest uppercase text-slate-500 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2025 NyaayAI by Team Avinya · TESSERACT '26 · VIT Pune
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            Built with <Heart size={11} className="text-rose-500" /> for access to justice
          </p>
        </div>
      </div>
    </footer>
  );
}
