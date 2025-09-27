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
        d="M10 22V13C10 12.4477 10.4477 12 11 12H21C21.5523 12 22 12.4477 22 13V22"
        stroke="hsl(var(--background))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 22V18M16 18C17.1046 18 18 17.1046 18 16C18 14.8954 17.1046 14 16 14C14.8954 14 14 14.8954 14 16C14 17.1046 14.8954 18 16 18Z"
        stroke="hsl(var(--background))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
);


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <Logo />
            <span className="font-bold text-xl tracking-tight">
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
