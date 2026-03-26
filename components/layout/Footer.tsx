import Link from "next/link";
import { Users, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                Group<span className="text-primary">Share</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Discover and share the best Instagram community group links. Connect with like-minded people worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Browse Groups</Link></li>
              <li><Link href="/create-post" className="hover:text-foreground transition-colors">Share a Group</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["WhatsApp", "Instagram", "LinkedIn", "Facebook", "Discord"].map((cat) => (
                <li key={cat}>
                  <Link href={`/?category=${cat}`} className="hover:text-foreground transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © 2024 GroupShare. Built for community discovery.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
