import Link from 'next/link';
import { Info } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';

const AquaLensLogo = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-primary-foreground"
    >
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
        <path d="M12 15.5c-2.4 0-4-2.01-4-4.5 0-2.48 4-8 4-8s4 5.52 4 8c0 2.49-1.6 4.5-4 4.5z" />
    </svg>
);


export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-md">
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
              <Info className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">About Us</span>
            </Link>
          </Button>
          <HelpModal />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
