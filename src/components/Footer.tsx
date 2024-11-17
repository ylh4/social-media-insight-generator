import React from 'react';

export function Footer() {
  return (
    <footer className="sticky bottom-0 w-full border-t bg-blue-50 py-4">
      <div className="container flex items-center justify-between">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} CHE Social Media Generator. All rights reserved.
        </p>
      </div>
    </footer>
  );
}