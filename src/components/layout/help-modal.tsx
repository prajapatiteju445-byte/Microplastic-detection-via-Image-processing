'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { getHelpContentAction } from '@/app/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { HelpCircle } from 'lucide-react';

export default function HelpModal() {
  const [helpContent, setHelpContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchHelpContent = async () => {
    if (helpContent) return;
    setIsLoading(true);
    const result = await getHelpContentAction();
    if (result.success) {
      setHelpContent(result.data);
    } else {
      setHelpContent('Could not load help content. Please try again later.');
    }
    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchHelpContent();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
            <HelpCircle className="h-5 w-5" />
            <span className="hidden sm:inline ml-2">Help & Instructions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Help & Instructions</DialogTitle>
          <DialogDescription>
            Information about microplastic detection, image processing, and data export.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-4 border rounded-md bg-secondary/50">
          {isLoading ? (
            <div className="space-y-4 p-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <br/>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]}
              className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground prose-h3:text-foreground prose-strong:text-foreground prose-headings:text-foreground prose-li:text-muted-foreground"
            >
              {helpContent || ''}
            </ReactMarkdown>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
