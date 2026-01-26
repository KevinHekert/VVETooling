/**
 * Tests for TenantSwitcher Component (STORY-024)
 * 
 * Tests multi-tenant context switching functionality:
 * - Rendering with single and multiple VVEs
 * - Tenant selection and switching
 * - Role badges display
 * - Dropdown behavior
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TenantSwitcher } from '@/components/ui/TenantSwitcher';
import type { VVEMembership } from '@/types';

describe('TenantSwitcher', () => {
  const mockMemberships: VVEMembership[] = [
    {
      id: '1',
      vve_id: 'vve-1',
      vve_name: 'VVE Zonnelaan 1-10',
      role: 'beheerder',
      is_active: true,
      joined_at: '2024-01-01',
    },
    {
      id: '2',
      vve_id: 'vve-2',
      vve_name: 'VVE Maanstraat 5',
      role: 'bewoner',
      unit_number: '12',
      is_active: true,
      joined_at: '2024-06-15',
    },
    {
      id: '3',
      vve_id: 'vve-3',
      vve_name: 'VVE Sterplein 20-40',
      role: 'bestuurslid',
      is_active: true,
      joined_at: '2024-03-10',
    },
  ];

  const mockOnTenantChange = jest.fn();

  beforeEach(() => {
    mockOnTenantChange.mockClear();
  });

  it('renders current VVE name when multiple memberships exist', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    expect(screen.getByText('VVE Zonnelaan 1-10')).toBeInTheDocument();
  });

  it('shows single VVE without dropdown when only one membership exists', () => {
    const singleMembership = [mockMemberships[0]];
    
    render(
      <TenantSwitcher
        memberships={singleMembership}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    expect(screen.getByTestId('tenant-single')).toBeInTheDocument();
    expect(screen.queryByTestId('tenant-switcher-trigger')).not.toBeInTheDocument();
  });

  it('opens dropdown menu when trigger is clicked', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    const trigger = screen.getByTestId('tenant-switcher-trigger');
    fireEvent.click(trigger);

    expect(screen.getByTestId('tenant-switcher-menu')).toBeInTheDocument();
    expect(screen.getByText('VVE Maanstraat 5')).toBeInTheDocument();
    expect(screen.getByText('VVE Sterplein 20-40')).toBeInTheDocument();
  });

  it('calls onTenantChange when a different VVE is selected', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    // Open dropdown
    const trigger = screen.getByTestId('tenant-switcher-trigger');
    fireEvent.click(trigger);

    // Click on a different VVE
    const vve2Button = screen.getByText('VVE Maanstraat 5').closest('button');
    if (vve2Button) {
      fireEvent.click(vve2Button);
    }

    expect(mockOnTenantChange).toHaveBeenCalledWith('vve-2');
  });

  it('does not call onTenantChange when same VVE is selected', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    // Open dropdown
    const trigger = screen.getByTestId('tenant-switcher-trigger');
    fireEvent.click(trigger);

    // Click on the same VVE (using aria-selected to identify the current one)
    const menu = screen.getByTestId('tenant-switcher-menu');
    const selectedOption = menu.querySelector('[aria-selected="true"]');
    if (selectedOption) {
      fireEvent.click(selectedOption);
    }

    expect(mockOnTenantChange).not.toHaveBeenCalled();
  });

  it('displays role badges for each membership', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    // Open dropdown
    const trigger = screen.getByTestId('tenant-switcher-trigger');
    fireEvent.click(trigger);

    // Check that role badges are present (using getAllByText since they appear multiple times)
    const beheerderBadges = screen.getAllByText('Beheerder');
    expect(beheerderBadges.length).toBeGreaterThan(0);
    expect(screen.getByText('Bewoner')).toBeInTheDocument();
    expect(screen.getByText('Bestuur')).toBeInTheDocument();
  });

  it('shows unit number for memberships with units', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    // Open dropdown
    const trigger = screen.getByTestId('tenant-switcher-trigger');
    fireEvent.click(trigger);

    expect(screen.getByText('Appartement 12')).toBeInTheDocument();
  });

  it('shows VVE count in trigger button', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
      />
    );

    expect(screen.getByText("3 VVE's")).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    render(
      <TenantSwitcher
        memberships={mockMemberships}
        currentVveId="vve-1"
        onTenantChange={mockOnTenantChange}
        isLoading={true}
      />
    );

    const trigger = screen.getByTestId('tenant-switcher-trigger');
    expect(trigger).toBeDisabled();
  });

  it('shows empty state when no memberships exist', () => {
    render(
      <TenantSwitcher
        memberships={[]}
        currentVveId=""
        onTenantChange={mockOnTenantChange}
      />
    );

    expect(screen.getByText("Geen VVE's beschikbaar")).toBeInTheDocument();
  });
});
