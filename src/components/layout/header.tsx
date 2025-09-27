import Link from 'next/link';
import { Info, HelpCircle } from 'lucide-react';
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
    className="text-foreground"
  >
    <rect width="32" height="32" rx="8" fill="currentColor" />
    <path
      d="M10.8571 22.8571C10.8571 22.8571 16 24 16 18.8571C16 13.7143 10.8571 9.14286 10.8571 9.14286"
      stroke="#AEAEAE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.1429 9.14286C21.1429 9.14286 16 8 16 13.1429C16 18.2857 21.1429 22.8571 21.1429 22.8571"
      stroke="#AEAEAE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="font-bold text-xl">
              AquaLens
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild size="sm">
            <Link href="/about">
              <Info className="mr-1 h-4 w-4" />
              <span>About Us</span>
            </Link>
          </Button>
          <HelpModal />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
