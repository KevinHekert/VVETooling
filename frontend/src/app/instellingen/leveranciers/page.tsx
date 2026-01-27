'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Supplier, SupplierCreate, SupplierUpdate } from '@/types';

/**
 * Leveranciers Beheer Page - STORY-035
 * 
 * Shows supplier management with:
 * - List of all suppliers with status badges
 * - Create new supplier form
 * - Edit supplier details inline
 * - Archive/activate suppliers
 */

export default function LeveranciersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierContactPerson, setNewSupplierContactPerson] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierSpecialty, setNewSupplierSpecialty] = useState('');
  const [newSupplierNotes, setNewSupplierNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Show inactive toggle
  const [showInactive, setShowInactive] = useState(false);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  const fetchSuppliers = async () => {
    try {
      const data = await api.getSuppliers(vveId, !showInactive);
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon leveranciers niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [showInactive]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setIsCreating(true);
    setError(null);
    
    try {
      const createData: SupplierCreate = {
        name: newSupplierName,
        contact_person: newSupplierContactPerson || undefined,
        email: newSupplierEmail || undefined,
        phone: newSupplierPhone || undefined,
        specialty: newSupplierSpecialty || undefined,
        notes: newSupplierNotes || undefined,
        is_active: true,
      };
      
      await api.createSupplier(vveId, createData);
      await fetchSuppliers();
      
      // Reset form
      setNewSupplierName('');
      setNewSupplierContactPerson('');
      setNewSupplierEmail('');
      setNewSupplierPhone('');
      setNewSupplierSpecialty('');
      setNewSupplierNotes('');
      setShowCreateForm(false);
      
      setSuccessMessage('Leverancier succesvol aangemaakt');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon leverancier niet aanmaken');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSupplier = async (supplierId: string, updates: SupplierUpdate) => {
    setError(null);
    try {
      await api.updateSupplier(vveId, supplierId, updates);
      await fetchSuppliers();
      setEditingSupplier(null);
      setSuccessMessage('Leverancier succesvol bijgewerkt');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon leverancier niet bijwerken');
    }
  };

  const handleToggleActive = async (supplier: Supplier) => {
    await handleUpdateSupplier(supplier.id, { is_active: !supplier.is_active });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leveranciers</h1>
          <p className="text-gray-600 mt-1">
            Beheer leveranciers voor onderhoud en reparaties
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nieuwe Leverancier
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nieuwe Leverancier</h2>
          <form onSubmit={handleCreateSupplier}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam *
                </label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="Bijv. Schildersbedrijf Jansen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialisme
                </label>
                <input
                  type="text"
                  value={newSupplierSpecialty}
                  onChange={(e) => setNewSupplierSpecialty(e.target.value)}
                  placeholder="Bijv. Schilderwerk, Loodgieter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contactpersoon
                </label>
                <input
                  type="text"
                  value={newSupplierContactPerson}
                  onChange={(e) => setNewSupplierContactPerson(e.target.value)}
                  placeholder="Bijv. Jan Jansen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={newSupplierEmail}
                  onChange={(e) => setNewSupplierEmail(e.target.value)}
                  placeholder="info@voorbeeld.nl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoon
                </label>
                <input
                  type="tel"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  placeholder="06-12345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notities
                </label>
                <textarea
                  value={newSupplierNotes}
                  onChange={(e) => setNewSupplierNotes(e.target.value)}
                  placeholder="Extra informatie over de leverancier..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isCreating || !newSupplierName.trim()}
                className={`
                  px-4 py-2 rounded-lg font-medium
                  ${isCreating || !newSupplierName.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isCreating ? 'Aanmaken...' : 'Leverancier Aanmaken'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Toon inactieve leveranciers</span>
        </label>
      </div>

      {/* Suppliers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Geen leveranciers gevonden.</p>
            <p className="mt-2 text-sm">Klik op "Nieuwe Leverancier" om te beginnen.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className={`p-4 hover:bg-gray-50 ${!supplier.is_active ? 'opacity-60' : ''}`}
              >
                {editingSupplier?.id === supplier.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editingSupplier.name}
                        onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Naam"
                      />
                      <input
                        type="text"
                        value={editingSupplier.specialty || ''}
                        onChange={(e) => setEditingSupplier({...editingSupplier, specialty: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Specialisme"
                      />
                      <input
                        type="text"
                        value={editingSupplier.contact_person || ''}
                        onChange={(e) => setEditingSupplier({...editingSupplier, contact_person: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Contactpersoon"
                      />
                      <input
                        type="email"
                        value={editingSupplier.email || ''}
                        onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="E-mail"
                      />
                      <input
                        type="tel"
                        value={editingSupplier.phone || ''}
                        onChange={(e) => setEditingSupplier({...editingSupplier, phone: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Telefoon"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingSupplier(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Annuleren
                      </button>
                      <button
                        onClick={() => handleUpdateSupplier(supplier.id, {
                          name: editingSupplier.name,
                          specialty: editingSupplier.specialty,
                          contact_person: editingSupplier.contact_person,
                          email: editingSupplier.email,
                          phone: editingSupplier.phone,
                        })}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Opslaan
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <span
                          className={`
                            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${supplier.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                            }
                          `}
                        >
                          {supplier.is_active ? 'Actief' : 'Inactief'}
                        </span>
                        {supplier.specialty && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {supplier.specialty}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {supplier.contact_person && (
                          <p>👤 {supplier.contact_person}</p>
                        )}
                        <div className="flex flex-wrap gap-4">
                          {supplier.email && (
                            <span>✉️ {supplier.email}</span>
                          )}
                          {supplier.phone && (
                            <span>📞 {supplier.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingSupplier(supplier)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => handleToggleActive(supplier)}
                        className={`text-sm ${
                          supplier.is_active 
                            ? 'text-orange-600 hover:text-orange-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {supplier.is_active ? 'Deactiveren' : 'Activeren'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
