import Link from 'next/link';
import { Info, HelpCircle } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';

const Logo = () => (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
        <path
            d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z"
            stroke="currentColor"
            strokeWidth="2"
        />
        <path
            d="M18 24.75C21.7279 24.75 24.75 21.7279 24.75 18C24.75 14.2721 21.7279 11.25 18 11.25C14.2721 11.25 11.25 14.2721 11.25 18C11.25 21.7279 14.2721 24.75 18 24.75Z"
            stroke="currentColor"
            strokeWidth="2"
        />
        <path
            d="M18 11.25C17.0796 11.25 15.375 14.2721 15.375 18C15.375 21.7279 18 24.75 18 24.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
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
