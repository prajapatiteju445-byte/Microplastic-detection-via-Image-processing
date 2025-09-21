import { Beaker } from 'lucide-react';
import HelpModal from './help-modal';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-md">
            <Beaker className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            AquaLens
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <HelpModal />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
