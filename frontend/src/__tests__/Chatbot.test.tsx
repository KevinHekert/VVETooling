/**
 * Tests for Chatbot Component - STORY-082
 * 
 * Tests the AI chatbot interface for residents to ask VVE questions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chatbot from '@/components/ui/Chatbot';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    createChatConversation: jest.fn(),
    addChatMessage: jest.fn(),
    escalateChatConversation: jest.fn(),
  },
}));

describe('Chatbot Component', () => {
  const mockVveId = 'test-vve-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders chatbot with header', () => {
      render(<Chatbot vveId={mockVveId} />);
      expect(screen.getByText('VVE Assistent')).toBeInTheDocument();
      expect(screen.getByText('Stel uw vraag')).toBeInTheDocument();
    });

    it('renders welcome message when no messages', () => {
      render(<Chatbot vveId={mockVveId} />);
      expect(screen.getByText('Welkom bij de VVE Assistent')).toBeInTheDocument();
    });

    it('renders input field', () => {
      render(<Chatbot vveId={mockVveId} />);
      expect(screen.getByPlaceholderText('Typ uw vraag...')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<Chatbot vveId={mockVveId} />);
      expect(screen.getByRole('button', { name: 'Versturen' })).toBeInTheDocument();
    });

    it('renders close button when onClose provided', () => {
      const handleClose = jest.fn();
      render(<Chatbot vveId={mockVveId} onClose={handleClose} />);
      expect(screen.getByRole('button', { name: 'Sluiten' })).toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('allows typing in input field', () => {
      render(<Chatbot vveId={mockVveId} />);
      
      const input = screen.getByPlaceholderText('Typ uw vraag...');
      fireEvent.change(input, { target: { value: 'Wat is mijn contributie?' } });
      
      expect(input).toHaveValue('Wat is mijn contributie?');
    });

    it('disables send button when input is empty', () => {
      render(<Chatbot vveId={mockVveId} />);
      const sendButton = screen.getByRole('button', { name: 'Versturen' });
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has text', () => {
      render(<Chatbot vveId={mockVveId} />);
      
      const input = screen.getByPlaceholderText('Typ uw vraag...');
      fireEvent.change(input, { target: { value: 'Test vraag' } });
      
      const sendButton = screen.getByRole('button', { name: 'Versturen' });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(<Chatbot vveId={mockVveId} onClose={handleClose} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Sluiten' }));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Display', () => {
    it('shows typing indicator during loading', async () => {
      const { api } = require('@/lib/api');
      
      // Create a promise that doesn't resolve immediately
      api.createChatConversation.mockImplementation(() => new Promise(() => {}));
      
      render(<Chatbot vveId={mockVveId} />);
      
      const input = screen.getByPlaceholderText('Typ uw vraag...');
      fireEvent.change(input, { target: { value: 'Test vraag' } });
      fireEvent.click(screen.getByRole('button', { name: 'Versturen' }));
      
      // Check for animation class that indicates typing
      await waitFor(() => {
        expect(document.querySelector('.animate-bounce')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible input label via placeholder', () => {
      render(<Chatbot vveId={mockVveId} />);
      const input = screen.getByPlaceholderText('Typ uw vraag...');
      expect(input).toBeInTheDocument();
    });

    it('has accessible send button', () => {
      render(<Chatbot vveId={mockVveId} />);
      expect(screen.getByRole('button', { name: 'Versturen' })).toBeInTheDocument();
    });

    it('has accessible close button when provided', () => {
      render(<Chatbot vveId={mockVveId} onClose={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Sluiten' })).toBeInTheDocument();
    });
  });
});
