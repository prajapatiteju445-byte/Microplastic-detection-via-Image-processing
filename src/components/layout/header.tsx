import Link from 'next/link';
import { Info } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';

const AquaLensLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-8 w-8"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12c0 3.69 2.47 6.86 6 8.25V12H6v-2h2V8.5C8 6.57 9.57 5 11.5 5h2v2h-2C11.22 7 11 7.22 11 7.5V10h3l-.5 2h-2.5v8.25c3.53-1.39 6-4.56 6-8.25 0-5.52-4.48-10-10-10z"
        transform="scale(1.2) translate(-2, -2)"
        pathLength="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 2a9.9 9.9 0 0 1 7.07 2.93A9.9 9.9 0 0 1 22 12c0 5.52-4.48 10-10 10S2 17.52 2 12c0-2.21.71-4.24 1.93-5.93A9.9 9.9 0 0 1 12 2m0-2C6.48 0 2 4.48 2 10c0 3.69 2.47 6.86 6 8.25V10H6V8h2V6.5C8 4.57 9.57 3 11.5 3h2v2h-2C11.22 5 11 5.22 11 5.5V8h3l-.5 2h-2.5v8.25A10 10 0 0 0 22 10c0-5.52-4.48-10-10-10z"
       opacity="0"
      />
       <g transform="translate(2 2) scale(0.8)">
       <path d="M12 21.9c-5.5 0-10-4.5-10-10S6.5 1.9 12 1.9s10 4.5 10 10-4.5 10-10 10zm0-18c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/>
        <path d="M12 15.9c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </g>
    </svg>
)

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
