/**
 * Tests for Button Component
 * 
 * Customer journey touchpoints:
 * - All forms and actions use buttons
 * - Save, Cancel, Delete actions
 * - Navigation and confirmation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, IconButton } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with children text', () => {
      render(<Button>Opslaan</Button>);
      expect(screen.getByRole('button', { name: 'Opslaan' })).toBeInTheDocument();
    });

    it('renders button with default primary variant', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Annuleren</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border');
    });

    it('renders destructive variant correctly', () => {
      render(<Button variant="destructive">Verwijderen</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('renders ghost variant correctly', () => {
      render(<Button variant="ghost">Details</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Klein</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('renders medium size correctly (default)', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('renders large size correctly', () => {
      render(<Button size="lg">Groot</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Uitgeschakeld</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('handles loading state', () => {
      render(<Button isLoading>Laden...</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('shows spinner when loading', () => {
      render(<Button isLoading>Laden</Button>);
      // Spinner is an SVG with animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(<Button leftIcon={<span data-testid="left-icon">+</span>}>Toevoegen</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(<Button rightIcon={<span data-testid="right-icon">→</span>}>Volgende</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button 
          isLoading 
          leftIcon={<span data-testid="left-icon">+</span>}
        >
          Laden
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('renders full width when specified', () => {
      render(<Button fullWidth>Volledige Breedte</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Events', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Klik mij</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Uitgeschakeld</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} isLoading>Laden</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('accepts custom className', () => {
      render(<Button className="my-custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('my-custom-class');
    });
  });
});

describe('IconButton Component', () => {
  it('renders icon button with aria-label', () => {
    render(
      <IconButton 
        icon={<span>✓</span>} 
        aria-label="Bevestigen" 
      />
    );
    expect(screen.getByRole('button', { name: 'Bevestigen' })).toBeInTheDocument();
  });

  it('renders icon button with correct size', () => {
    render(
      <IconButton 
        icon={<span>+</span>} 
        aria-label="Toevoegen"
        size="lg"
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-12');
    expect(button).toHaveClass('h-12');
  });
});
