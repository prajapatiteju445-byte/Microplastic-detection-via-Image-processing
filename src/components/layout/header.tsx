import { Beaker } from 'lucide-react';
import HelpModal from './help-modal';

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Beaker className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-headline">
            AquaLens
          </h1>
        </div>
        <HelpModal />
      </div>
    </header>
  );
}
