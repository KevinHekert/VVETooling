'use client';

/**
 * Progress Indicator Component - STORY-007
 * Shows multi-step progress with active, completed, and pending states.
 * Mobile-first: steps stack vertically on small screens.
 */

interface ProgressStep {
  id: string;
  label: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
}: ProgressIndicatorProps) {
  return (
    <nav aria-label="Voortgang">
      {/* Desktop: horizontal layout */}
      <ol className="hidden md:flex items-center gap-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => isCompleted && onStepClick?.(index)}
                disabled={!isCompleted}
                className={`
                  flex items-center gap-2
                  ${isCompleted ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <span
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-600 text-white ring-2 ring-blue-300' : ''}
                    ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? '✓' : index + 1}
                </span>
                <span
                  className={`
                    text-sm font-medium
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isActive ? 'text-blue-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`
                    ml-4 w-12 h-0.5
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: vertical stacked layout */}
      <ol className="flex flex-col gap-2 md:hidden">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <li key={step.id}>
              <button
                onClick={() => isCompleted && onStepClick?.(index)}
                disabled={!isCompleted}
                className={`
                  flex items-center gap-3 w-full p-2 rounded-lg
                  ${isActive ? 'bg-blue-50 border border-blue-200' : ''}
                  ${isCompleted ? 'hover:bg-gray-50' : ''}
                `}
              >
                <span
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-600 text-white' : ''}
                    ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? '✓' : index + 1}
                </span>
                <span
                  className={`
                    text-sm font-medium
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isActive ? 'text-blue-600' : ''}
                    ${isPending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ProgressIndicator;
