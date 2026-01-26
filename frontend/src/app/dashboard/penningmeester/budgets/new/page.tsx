'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { BudgetCreate, BudgetItemCreate, TransactionCategory } from '@/types';

/**
 * New Budget Form - STORY-006: Begroting opstellen en exporteren
 * 
 * Implements:
 * - Form to create new budget with multiple items
 * - Inline validation with clear feedback
 * - Dynamic addition/removal of budget items
 * - Success message as toast (auto-dismiss)
 * - Consistent with jaarrekening format (table layout)
 */

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'contribution', label: 'Contributie' },
  { value: 'maintenance', label: 'Onderhoud' },
  { value: 'energy', label: 'Energie' },
  { value: 'insurance', label: 'Verzekering' },
  { value: 'administrative', label: 'Administratief' },
  { value: 'reserve', label: 'Reserve' },
  { value: 'other', label: 'Overig' },
];

interface FormErrors {
  year?: string;
  name?: string;
  items?: Record<number, { description?: string; planned_amount?: string }>;
}

export default function NewBudgetPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  // Budget metadata
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Budget items
  const [items, setItems] = useState<BudgetItemCreate[]>([
    { category: 'maintenance', description: '', planned_amount: 0 },
  ]);
  
  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { category: 'other', description: '', planned_amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      addToast('Minimaal één item is vereist', 'error');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
    
    // Clean up errors for this item
    if (errors.items) {
      const newItemErrors = { ...errors.items };
      delete newItemErrors[index];
      setErrors({ ...errors, items: newItemErrors });
    }
  };

  const updateItem = (index: number, field: keyof BudgetItemCreate, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    
    // Clear error for this field
    if (errors.items?.[index]?.[field as 'description' | 'planned_amount']) {
      const newErrors = { ...errors };
      if (newErrors.items) {
        delete newErrors.items[index][field as 'description' | 'planned_amount'];
        if (Object.keys(newErrors.items[index]).length === 0) {
          delete newErrors.items[index];
        }
      }
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate year
    if (year < 2000 || year > 2100) {
      newErrors.year = 'Voer een geldig jaar in (2000-2100)';
    }

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Voer een naam in';
    }

    // Validate items
    const itemErrors: Record<number, { description?: string; planned_amount?: string }> = {};
    items.forEach((item, index) => {
      const itemError: { description?: string; planned_amount?: string } = {};
      
      if (!item.description.trim()) {
        itemError.description = 'Beschrijving is verplicht';
      }
      
      if (item.planned_amount === 0 || item.planned_amount === null) {
        itemError.planned_amount = 'Voer een bedrag in';
      }
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (Object.keys(itemErrors).length > 0) {
      newErrors.items = itemErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(itemErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Controleer de invoervelden', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const budgetData: BudgetCreate = {
        year,
        name,
        description: description || undefined,
        status: 'draft',
        items,
      };

      // TODO: Get vveId from context
      const vveId = 'demo-vve-id';
      await api.createBudget(vveId, budgetData);

      // Success toast (auto-dismiss as per UX guidelines)
      addToast('Begroting succesvol aangemaakt', 'success');

      // Redirect back to budgets list
      router.push('/dashboard/penningmeester/budgets');
    } catch (err) {
      // Inline error feedback (no modal)
      addToast(
        err instanceof Error ? err.message : 'Kon begroting niet opslaan',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nieuwe Begroting</h1>
        <p className="text-gray-600">Stel een nieuwe begroting op voor de VVE</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Budget metadata */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Begroting Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Jaar *
              </label>
              <input
                type="number"
                id="year"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => {
                  setYear(parseInt(e.target.value));
                  if (errors.year) setErrors({ ...errors, year: undefined });
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.year ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Naam *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Begroting 2026"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Beschrijving (optioneel)
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Voeg een beschrijving toe..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Inline toelichting voor het begroting overzicht
            </p>
          </div>
        </div>

        {/* Budget items table */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Begroting Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Item Toevoegen
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschrijving
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bedrag (€)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notities
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value as TransactionCategory)}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className={`block w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.items?.[index]?.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Beschrijving"
                      />
                      {errors.items?.[index]?.description && (
                        <p className="mt-1 text-xs text-red-600">{errors.items[index].description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.planned_amount}
                        onChange={(e) => updateItem(index, 'planned_amount', parseFloat(e.target.value) || 0)}
                        className={`block w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.items?.[index]?.planned_amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.items?.[index]?.planned_amount && (
                        <p className="mt-1 text-xs text-red-600">{errors.items[index].planned_amount}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateItem(index, 'notes', e.target.value || undefined)}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optioneel"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right font-medium text-gray-900">
                    Totaal:
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    € {calculateTotal().toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Performance: &lt;2s op datasets tot het MVP-volume
          </p>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 bg-white shadow rounded-lg p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Bezig...' : 'Begroting Opslaan'}
          </button>
        </div>
      </form>
    </div>
  );
}
