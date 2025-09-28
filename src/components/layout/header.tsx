import Link from 'next/link';
import { Info, HelpCircle, Droplet, Microscope } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';

const Logo = () => (
  <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M16 24C16 24 22 19.4 22 14.2C22 10.776 19.3137 8 16 8C12.6863 8 10 10.776 10 14.2C10 19.4 16 24 16 24Z"
        fill="white"
      />
    </svg>
);


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <Logo />
            <span className="font-bold text-xl">
              AquaLens
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild size="sm">
            <Link href="/about">
              <Info className="mr-2 h-4 w-4" />
              <span>About Us</span>
            </Link>
          </Button>
          <HelpModal />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
