/**
 * Tests for ProgressIndicator component - STORY-007
 * Validates progress indicator for onboarding wizard
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

const mockSteps = [
  { id: 'step1', label: 'Stap 1' },
  { id: 'step2', label: 'Stap 2' },
  { id: 'step3', label: 'Stap 3' },
];

describe('ProgressIndicator', () => {
  it('renders all steps', () => {
    render(<ProgressIndicator steps={mockSteps} currentStep={0} />);
    
    expect(screen.getAllByText('Stap 1')).toHaveLength(2); // Desktop and mobile
    expect(screen.getAllByText('Stap 2')).toHaveLength(2);
    expect(screen.getAllByText('Stap 3')).toHaveLength(2);
  });

  it('marks current step as active', () => {
    render(<ProgressIndicator steps={mockSteps} currentStep={1} />);
    
    // Step 1 should be completed (checkmark)
    const step1Buttons = screen.getAllByRole('button');
    expect(step1Buttons[0]).toHaveTextContent('✓');
    
    // Step 2 should be active (number 2)
    expect(step1Buttons[1]).toHaveTextContent('2');
  });

  it('marks completed steps with checkmark', () => {
    render(<ProgressIndicator steps={mockSteps} currentStep={2} />);
    
    const buttons = screen.getAllByRole('button');
    // First two steps should show checkmarks
    expect(buttons[0]).toHaveTextContent('✓');
    expect(buttons[1]).toHaveTextContent('✓');
    // Current step shows number
    expect(buttons[2]).toHaveTextContent('3');
  });

  it('calls onStepClick for completed steps only', () => {
    const mockOnStepClick = jest.fn();
    render(
      <ProgressIndicator
        steps={mockSteps}
        currentStep={2}
        onStepClick={mockOnStepClick}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    
    // Click on completed step (step 1) - should call handler
    fireEvent.click(buttons[0]);
    expect(mockOnStepClick).toHaveBeenCalledWith(0);
    
    // Click on current step (step 3) - should not call handler (disabled)
    fireEvent.click(buttons[2]);
    expect(mockOnStepClick).toHaveBeenCalledTimes(1);
  });

  it('disables pending steps', () => {
    render(<ProgressIndicator steps={mockSteps} currentStep={0} />);
    
    const buttons = screen.getAllByRole('button');
    
    // Steps 2 and 3 should be disabled (pending)
    expect(buttons[1]).toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });
});
