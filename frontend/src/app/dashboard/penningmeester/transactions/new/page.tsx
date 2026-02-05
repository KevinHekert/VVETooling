'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import type { TransactionCreate, TransactionCategory } from '@/types';

/**
 * Transaction Form - STORY-001: Transactie toevoegen
 * 
 * Implements:
 * - Form with datum, bedrag, categorie, reserve en beschrijving
 * - Inline validation with clear feedback
 * - Success message as toast (auto-dismiss)
 * - No errorboxes or modals for validation
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
  amount?: string;
  transaction_date?: string;
  category?: string;
  description?: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { currentVveId } = useAuth();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('contribution');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [reserveFundId, setReserveFundId] = useState('');
  
  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'Voer een geldig bedrag in';
    } else if (amountNum === 0) {
      newErrors.amount = 'Bedrag mag niet nul zijn';
    }

    // Validate date
    if (!transactionDate) {
      newErrors.transaction_date = 'Selecteer een datum';
    }

    // Validate category
    if (!category) {
      newErrors.category = 'Selecteer een categorie';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction: TransactionCreate = {
        amount: parseFloat(amount),
        category,
        transaction_date: new Date(transactionDate).toISOString(),
        description: description || undefined,
        reserve_fund_id: reserveFundId || undefined,
      };

      if (!currentVveId) {
        addToast('Geen VVE geselecteerd', 'error');
        return;
      }

      await api.createTransaction(currentVveId, transaction);

      // Success toast (auto-dismiss as per UX guidelines)
      addToast('Transactie succesvol toegevoegd', 'success');

      // Redirect back to transactions list
      router.push('/dashboard/penningmeester/transactions');
    } catch (err) {
      // Inline error feedback (no modal)
      addToast(
        err instanceof Error ? err.message : 'Kon transactie niet opslaan',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactie Toevoegen</h1>
        <p className="text-gray-600">Voeg een nieuwe transactie toe aan het financieel overzicht</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Amount field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Bedrag (€) *
          </label>
          <div className="mt-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              €
            </span>
            <input
              type="number"
              id="amount"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors({ ...errors, amount: undefined });
              }}
              className={`block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {/* Inline error (no errorbox) */}
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Gebruik negatieve waarde voor uitgaven
          </p>
        </div>

        {/* Date field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Datum *
          </label>
          <input
            type="date"
            id="date"
            value={transactionDate}
            onChange={(e) => {
              setTransactionDate(e.target.value);
              if (errors.transaction_date) setErrors({ ...errors, transaction_date: undefined });
            }}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.transaction_date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.transaction_date && (
            <p className="mt-1 text-sm text-red-600">{errors.transaction_date}</p>
          )}
        </div>

        {/* Category field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categorie *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as TransactionCategory);
              if (errors.category) setErrors({ ...errors, category: undefined });
            }}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Reserve fund (optional) */}
        <div>
          <label htmlFor="reserve" className="block text-sm font-medium text-gray-700">
            Reserve Fonds (optioneel)
          </label>
          <select
            id="reserve"
            value={reserveFundId}
            onChange={(e) => setReserveFundId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Geen reserve fonds</option>
            {/* TODO: Populate from API */}
            <option value="reserve-1">Onderhoudsfonds</option>
            <option value="reserve-2">Dakfonds</option>
          </select>
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Beschrijving (optioneel)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Voeg een beschrijving toe..."
          />
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
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
            {isSubmitting ? 'Bezig...' : 'Transactie Opslaan'}
          </button>
        </div>
      </form>
    </div>
  );
}
