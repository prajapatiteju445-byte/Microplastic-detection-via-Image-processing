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
      className="text-primary"
    >
        <path d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C23.18 29 29 23.18 29 16C29 8.82 23.18 3 16 3ZM16 27C10.486 27 6 22.514 6 17C6 13.629 9.052 10.224 10.938 9.002C11.536 11.231 13.561 13 16 13C18.439 13 20.464 11.231 21.062 9.002C22.948 10.224 26 13.629 26 17C26 22.514 21.514 27 16 27Z" fill="currentColor"/>
    </svg>
);


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="font-bold">
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
