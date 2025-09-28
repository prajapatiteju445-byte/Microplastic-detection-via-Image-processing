import Link from 'next/link';
import { Info, HelpCircle, Sun, Droplet } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '../ui/button';

const Logo = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path d="M512 960C264.576 960 64 759.424 64 512C64 264.576 264.576 64 512 64C759.424 64 960 264.576 960 512C960 759.424 759.424 960 512 960ZM512 128C297.184 128 128 297.184 128 512C128 726.816 297.184 896 512 896C726.816 896 896 726.816 896 512C896 297.184 726.816 128 512 128Z" fill="currentColor"/>
      <path d="M512 768C388.224 768 288 667.776 288 544C288 443.36 364.256 320 512 320C659.744 320 736 443.36 736 544C736 667.776 635.776 768 512 768ZM512 384C442.624 384 352 482.336 352 544C352 626.08 422.4 704 512 704C601.6 704 672 626.08 672 544C672 482.336 581.376 384 512 384Z" fill="currentColor"/>
    </svg>
);


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="font-bold text-xl">
              AquaLens
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
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
