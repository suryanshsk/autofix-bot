import { Heart, Github, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur mt-auto">
      <div className="container px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AutoFix Bot
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An intelligent AI-powered agent that automatically detects, classifies, and fixes test failures in your GitHub repositories.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  → Home
                </a>
              </li>
              <li>
                <a
                  href="/how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  → How It Works
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  → GitHub <Github className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Powered By</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-secondary to-accent/50 text-foreground text-xs font-medium rounded-full">
                Google Gemini AI
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-secondary to-accent/50 text-foreground text-xs font-medium rounded-full">
                GitHub Actions
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-secondary to-accent/50 text-foreground text-xs font-medium rounded-full">
                React + TypeScript
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          {/* Credits */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-primary fill-primary animate-pulse" />
            <span>by</span>
            <span className="font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Shreya, Sneha & Saloni
            </span>
          </div>

          {/* Copyright */}
          <div className="text-muted-foreground">
            © {new Date().getFullYear()} AutoFix Bot. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
