'use client';

import { useEffect, useState } from 'react';
import Chatbot from '@/components/ui/Chatbot';
import { useAuth } from '@/hooks/useAuth';

/**
 * Chatbot Page - STORY-082: AI chatbot vraag stellen
 * 
 * Full-page chatbot interface for the bewoner dashboard.
 * Allows residents to ask questions about VVE matters.
 */
export default function ChatbotPage() {
  const { currentVveId } = useAuth();
  const [vveId, setVveId] = useState<string | null>(null);

  useEffect(() => {
    // Use currentVveId from auth context
    if (currentVveId) {
      setVveId(currentVveId);
    }
  }, [currentVveId]);

  if (!vveId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">VVE Assistent</h1>
        <p className="text-gray-600">
          Stel uw vraag over contributie, onderhoud, vergaderingen of andere VVE-zaken.
        </p>
      </div>

      {/* Chatbot container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
        <Chatbot vveId={vveId} />
      </div>

      {/* Info section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Stel uw vraag in normale taal</li>
          <li>• Klik op vervolgvragen voor snelle antwoorden</li>
          <li>• Geen antwoord gevonden? Stuur uw vraag door naar het bestuur</li>
        </ul>
      </div>
    </div>
  );
}
