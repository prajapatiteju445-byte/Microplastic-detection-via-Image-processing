import Link from 'next/link';
import { Info, HelpCircle } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';

const AquaLensLogo = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-primary-foreground"
    >
        <rect width="24" height="24" rx="4" fill="currentColor" />
        <path
            d="M12 18C14.2091 18 16 16.2091 16 14C16 11.7909 12 6 12 6C12 6 8.00001 11.7909 8 14C7.99999 16.2091 9.79086 18 12 18Z"
            fill="hsl(var(--background))"
        />
    </svg>
);


export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-0 rounded-lg shadow-md">
              <AquaLensLogo />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              AquaLens
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">
              <Info className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">About Us</span>
            </Link>
          </Button>
          <HelpModal />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
