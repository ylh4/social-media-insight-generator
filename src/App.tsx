import React from 'react';
import { Brain, Database } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { DataViewer } from './components/DataViewer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Viewer Panel */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Social Media Data</h2>
            </div>
            <DataViewer />
          </div>

          {/* Chat Interface Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">AI Analysis Assistant</h2>
            </div>
            <ChatInterface />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}