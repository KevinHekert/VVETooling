'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import type { TransactionCategory } from '@/types';

/**
 * Transaction Import Page - STORY-011
 * 
 * Implements:
 * - Upload CAMT/CSV files
 * - Inline validation for missing fields/duplicates
 * - Category mapping (reusable)
 * - Preview with checkboxes for selective import
 * - Mobile: summary per row, details in accordion
 */

// Category labels
const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  contribution: 'Contributie',
  maintenance: 'Onderhoud',
  energy: 'Energie',
  insurance: 'Verzekering',
  administrative: 'Administratief',
  reserve: 'Reserve',
  other: 'Overig',
};

interface ImportedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: TransactionCategory | null;
  isDuplicate: boolean;
  hasError: boolean;
  errorMessage?: string;
  selected: boolean;
}

// Mock category mappings (would be stored in backend)
const SAVED_MAPPINGS: Record<string, TransactionCategory> = {
  'vve bijdrage': 'contribution',
  'contributie': 'contribution',
  'onderhoud': 'maintenance',
  'reparatie': 'maintenance',
  'energie': 'energy',
  'gas': 'energy',
  'elektra': 'energy',
  'verzekering': 'insurance',
  'polis': 'insurance',
};

export default function TransactionImportPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    // Simulate parsing file
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock parsed transactions
    const parsed: ImportedTransaction[] = [
      {
        id: '1',
        date: '2026-01-25',
        description: 'VVE Bijdrage januari - Unit A1',
        amount: 450.00,
        category: 'contribution',
        isDuplicate: false,
        hasError: false,
        selected: true,
      },
      {
        id: '2',
        date: '2026-01-24',
        description: 'Onderhoud lift - Schindler BV',
        amount: -2500.00,
        category: 'maintenance',
        isDuplicate: false,
        hasError: false,
        selected: true,
      },
      {
        id: '3',
        date: '2026-01-23',
        description: 'Energie voorschot Q1',
        amount: -850.00,
        category: 'energy',
        isDuplicate: false,
        hasError: false,
        selected: true,
      },
      {
        id: '4',
        date: '2026-01-22',
        description: 'VVE Bijdrage januari - Unit A1',
        amount: 450.00,
        category: 'contribution',
        isDuplicate: true,
        hasError: true,
        errorMessage: 'Mogelijk duplicaat gevonden',
        selected: false,
      },
      {
        id: '5',
        date: '2026-01-20',
        description: 'Onbekende betaling',
        amount: 125.00,
        category: null,
        isDuplicate: false,
        hasError: true,
        errorMessage: 'Categorie niet herkend',
        selected: true,
      },
    ];

    // Apply saved mappings
    const withMappings = parsed.map(tx => {
      if (!tx.category) {
        const lowerDesc = tx.description.toLowerCase();
        for (const [keyword, cat] of Object.entries(SAVED_MAPPINGS)) {
          if (lowerDesc.includes(keyword)) {
            return { ...tx, category: cat, hasError: false, errorMessage: undefined };
          }
        }
      }
      return tx;
    });

    setTransactions(withMappings);
    setIsProcessing(false);
    setStep('preview');
    
    addToast(`${withMappings.length} transacties gevonden`, 'success');
  }, [addToast]);

  const toggleTransaction = (id: string) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, selected: !tx.selected } : tx
    ));
  };

  const toggleAll = (selected: boolean) => {
    setTransactions(prev => prev.map(tx => ({ ...tx, selected })));
  };

  const updateCategory = (id: string, category: TransactionCategory) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, category, hasError: false, errorMessage: undefined } : tx
    ));
  };

  const handleImport = async () => {
    setIsProcessing(true);
    
    const selectedTx = transactions.filter(tx => tx.selected && !tx.isDuplicate);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addToast(`${selectedTx.length} transacties geïmporteerd`, 'success');
    router.push('/dashboard/penningmeester/transactions');
  };

  const selectedCount = transactions.filter(tx => tx.selected && !tx.isDuplicate).length;
  const errorCount = transactions.filter(tx => tx.hasError).length;
  const duplicateCount = transactions.filter(tx => tx.isDuplicate).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacties Importeren</h1>
          <p className="text-gray-600">Upload een CAMT of CSV bestand</p>
        </div>
        <Link
          href="/dashboard/penningmeester/transactions"
          className="text-gray-500 hover:text-gray-700"
        >
          Annuleren
        </Link>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-600 mb-2">
              Sleep een bestand hierheen of klik om te selecteren
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Ondersteunde formaten: CAMT.053, CSV
            </p>
            <input
              type="file"
              accept=".csv,.xml"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Geselecteerd</p>
              <p className="text-2xl font-bold text-blue-600">{selectedCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Waarschuwingen</p>
              <p className="text-2xl font-bold text-yellow-600">{errorCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Duplicaten</p>
              <p className="text-2xl font-bold text-red-600">{duplicateCount}</p>
            </div>
          </div>

          {/* File info */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500">{transactions.length} transacties</p>
              </div>
            </div>
            <button
              onClick={() => { setStep('upload'); setTransactions([]); }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Ander bestand
            </button>
          </div>

          {/* Bulk actions */}
          <div className="flex gap-4">
            <button
              onClick={() => toggleAll(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Alles selecteren
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Niets selecteren
            </button>
          </div>

          {/* Transaction List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedCount === transactions.filter(tx => !tx.isDuplicate).length}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschrijving</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bedrag</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className={`
                        ${tx.isDuplicate ? 'bg-red-50' : ''}
                        ${tx.hasError && !tx.isDuplicate ? 'bg-yellow-50' : ''}
                      `}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={tx.selected}
                          disabled={tx.isDuplicate}
                          onChange={() => toggleTransaction(tx.id)}
                          className="w-4 h-4 text-blue-600 rounded disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tx.description}</td>
                      <td className="px-4 py-3">
                        <select
                          value={tx.category || ''}
                          onChange={(e) => updateCategory(tx.id, e.target.value as TransactionCategory)}
                          className={`
                            text-sm border rounded-lg px-2 py-1
                            ${!tx.category ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}
                          `}
                        >
                          <option value="">-- Kies --</option>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.amount >= 0 ? '+' : ''}€ {Math.abs(tx.amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.isDuplicate && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Duplicaat
                          </span>
                        )}
                        {tx.hasError && !tx.isDuplicate && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            ⚠️ {tx.errorMessage}
                          </span>
                        )}
                        {!tx.hasError && !tx.isDuplicate && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-200">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-4 ${tx.isDuplicate ? 'bg-red-50' : ''} ${tx.hasError && !tx.isDuplicate ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={tx.selected}
                      disabled={tx.isDuplicate}
                      onChange={() => toggleTransaction(tx.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(tx.date).toLocaleDateString('nl-NL')}
                        </span>
                        <span className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount >= 0 ? '+' : ''}€ {Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{tx.description}</p>
                      {tx.hasError && (
                        <p className="text-xs text-yellow-700 mb-2">⚠️ {tx.errorMessage}</p>
                      )}
                      <select
                        value={tx.category || ''}
                        onChange={(e) => updateCategory(tx.id, e.target.value as TransactionCategory)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option value="">-- Categorie --</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
            <button
              onClick={() => { setStep('upload'); setTransactions([]); }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Bezig...' : `${selectedCount} transacties importeren`}
            </button>
          </div>
        </>
      )}

      {/* Processing Overlay */}
      {isProcessing && step === 'upload' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Bestand wordt verwerkt...</p>
          </div>
        </div>
      )}
    </div>
  );
}
