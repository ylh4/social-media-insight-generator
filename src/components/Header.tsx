import React from 'react';
import { MessageSquare } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-blue-50">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-7 w-7" />
            <span className="inline-block text-2xl font-bold">CHE Social Media Insight Generator</span>
          </div>
        </div>
      </div>
    </header>
  );
}