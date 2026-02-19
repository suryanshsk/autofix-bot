import { Link, useLocation } from 'react-router-dom';
import { Bot, Home, HelpCircle } from 'lucide-react';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <Bot className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AutoFix Bot
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              AI-Powered CI/CD Healing
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/"
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
              isActive('/')
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            to="/how-it-works"
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
              isActive('/how-it-works')
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
                : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">How It Works</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
