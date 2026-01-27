/**
 * Tests for RoleSwitcher Component - STORY-009
 * 
 * Customer journey touchpoints:
 * - Multi-tenant users switching between VVEs
 * - Role-based dashboard switching
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleBadge, DashboardWidget, DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';

describe('RoleBadge Component', () => {
  it('renders badge for beheerder role', () => {
    const { container } = render(<RoleBadge role="beheerder" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-purple-500');
  });

  it('renders badge for bestuurslid role', () => {
    const { container } = render(<RoleBadge role="bestuurslid" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-500');
  });

  it('renders badge for penningmeester role', () => {
    const { container } = render(<RoleBadge role="penningmeester" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-500');
  });

  it('renders badge for bewoner role', () => {
    const { container } = render(<RoleBadge role="bewoner" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-400');
  });

  it('renders small size by default', () => {
    const { container } = render(<RoleBadge role="beheerder" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('w-6');
    expect(badge).toHaveClass('h-6');
  });

  it('renders medium size when specified', () => {
    const { container } = render(<RoleBadge role="beheerder" size="md" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('w-8');
    expect(badge).toHaveClass('h-8');
  });
});

describe('DashboardWidget Component', () => {
  it('renders widget with title', () => {
    render(
      <DashboardWidget title="Financieel Overzicht">
        <p>Content</p>
      </DashboardWidget>
    );
    
    expect(screen.getByText('Financieel Overzicht')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders widget with actions', () => {
    render(
      <DashboardWidget 
        title="Transacties" 
        actions={<button>Toevoegen</button>}
      >
        <p>Content</p>
      </DashboardWidget>
    );
    
    expect(screen.getByRole('button', { name: 'Toevoegen' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DashboardWidget title="Test" className="my-custom-class">
        <p>Content</p>
      </DashboardWidget>
    );
    
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});

describe('DashboardGrid Component', () => {
  it('renders grid with children', () => {
    render(
      <DashboardGrid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </DashboardGrid>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders with default 3 columns', () => {
    const { container } = render(
      <DashboardGrid>
        <div>Item</div>
      </DashboardGrid>
    );
    
    expect(container.firstChild).toHaveClass('lg:grid-cols-3');
  });

  it('renders with custom column count', () => {
    const { container } = render(
      <DashboardGrid columns={2}>
        <div>Item</div>
      </DashboardGrid>
    );
    
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });

  it('renders with 4 columns when specified', () => {
    const { container } = render(
      <DashboardGrid columns={4}>
        <div>Item</div>
      </DashboardGrid>
    );
    
    expect(container.firstChild).toHaveClass('lg:grid-cols-4');
  });
});

describe('KPICard Component', () => {
  it('renders label and value', () => {
    render(<KPICard label="Totaal Saldo" value="€12.500" />);
    
    expect(screen.getByText('Totaal Saldo')).toBeInTheDocument();
    expect(screen.getByText('€12.500')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<KPICard label="Aantal transacties" value={42} />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders up trend correctly', () => {
    render(
      <KPICard 
        label="Inkomsten" 
        value="€5.000" 
        trend="up" 
        trendLabel="+12% t.o.v. vorige maand" 
      />
    );
    
    const trendText = screen.getByText(/\+12%/);
    expect(trendText).toHaveClass('text-green-600');
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('renders down trend correctly', () => {
    render(
      <KPICard 
        label="Uitgaven" 
        value="€3.000" 
        trend="down" 
        trendLabel="-5% t.o.v. vorige maand" 
      />
    );
    
    const trendText = screen.getByText(/-5%/);
    expect(trendText).toHaveClass('text-red-600');
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('renders neutral trend correctly', () => {
    render(
      <KPICard 
        label="Reservefonds" 
        value="€25.000" 
        trend="neutral" 
        trendLabel="Geen wijziging" 
      />
    );
    
    const trendText = screen.getByText(/Geen wijziging/);
    expect(trendText).toHaveClass('text-gray-500');
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it('renders without trend when not provided', () => {
    render(<KPICard label="Saldo" value="€10.000" />);
    
    expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
    expect(screen.queryByText(/↓/)).not.toBeInTheDocument();
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
  });
});
