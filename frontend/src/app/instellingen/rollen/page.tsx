'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Rollen & Rechten Page - STORY-021
 * Central UI for managing roles and permissions.
 * Displays role profiles, linked permissions, and assigned users.
 * Supports inline editing with toast feedback.
 */

// Types
interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'documents' | 'users' | 'settings' | 'dashboard';
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  permissions: string[];
  user_count: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  status: 'active' | 'inactive' | 'pending';
  last_login?: string;
}

// Mock data
const PERMISSIONS: Permission[] = [
  // Financial
  { id: 'transactions.view', name: 'Transacties bekijken', description: 'Bekijk transactieoverzicht', category: 'financial' },
  { id: 'transactions.create', name: 'Transacties aanmaken', description: 'Voeg nieuwe transacties toe', category: 'financial' },
  { id: 'transactions.edit', name: 'Transacties bewerken', description: 'Wijzig bestaande transacties', category: 'financial' },
  { id: 'transactions.delete', name: 'Transacties verwijderen', description: 'Verwijder transacties', category: 'financial' },
  { id: 'budget.view', name: 'Begroting bekijken', description: 'Bekijk begrotingen', category: 'financial' },
  { id: 'budget.manage', name: 'Begroting beheren', description: 'Maak en wijzig begrotingen', category: 'financial' },
  { id: 'contributions.view', name: 'Contributies bekijken', description: 'Bekijk contributie overzicht', category: 'financial' },
  { id: 'contributions.manage', name: 'Contributies beheren', description: 'Beheer contributies', category: 'financial' },
  
  // Documents
  { id: 'documents.view', name: 'Documenten bekijken', description: 'Bekijk openbare documenten', category: 'documents' },
  { id: 'documents.upload', name: 'Documenten uploaden', description: 'Upload nieuwe documenten', category: 'documents' },
  { id: 'documents.manage', name: 'Documenten beheren', description: 'Beheer alle documenten', category: 'documents' },
  
  // Users
  { id: 'users.view', name: 'Gebruikers bekijken', description: 'Bekijk gebruikerslijst', category: 'users' },
  { id: 'users.invite', name: 'Gebruikers uitnodigen', description: 'Nodig nieuwe gebruikers uit', category: 'users' },
  { id: 'users.manage', name: 'Gebruikers beheren', description: 'Beheer gebruikers en rollen', category: 'users' },
  
  // Settings
  { id: 'settings.view', name: 'Instellingen bekijken', description: 'Bekijk VVE instellingen', category: 'settings' },
  { id: 'settings.manage', name: 'Instellingen beheren', description: 'Wijzig VVE instellingen', category: 'settings' },
  { id: 'splitsing.manage', name: 'Splitsingssleutel beheren', description: 'Configureer splitsingssleutel', category: 'settings' },
  
  // Dashboard
  { id: 'dashboard.personal', name: 'Persoonlijk dashboard', description: 'Toegang tot eigen status', category: 'dashboard' },
  { id: 'dashboard.overview', name: 'Overzicht dashboard', description: 'Toegang tot overzichtsdashboard', category: 'dashboard' },
  { id: 'audit.view', name: 'Audit logs bekijken', description: 'Bekijk audit logboek', category: 'dashboard' },
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'beheerder',
    name: 'beheerder',
    display_name: 'Beheerder',
    description: 'Volledige toegang tot alle functies van de VVE',
    is_system: true,
    permissions: PERMISSIONS.map(p => p.id),
    user_count: 1,
  },
  {
    id: 'penningmeester',
    name: 'penningmeester',
    display_name: 'Penningmeester',
    description: 'Financieel beheer en rapportage',
    is_system: true,
    permissions: [
      'transactions.view', 'transactions.create', 'transactions.edit',
      'budget.view', 'budget.manage',
      'contributions.view', 'contributions.manage',
      'documents.view', 'documents.upload',
      'dashboard.personal', 'dashboard.overview',
    ],
    user_count: 1,
  },
  {
    id: 'bestuurslid',
    name: 'bestuurslid',
    display_name: 'Bestuurslid',
    description: 'Inzage in financiën en documenten',
    is_system: true,
    permissions: [
      'transactions.view',
      'budget.view',
      'contributions.view',
      'documents.view', 'documents.upload',
      'dashboard.personal', 'dashboard.overview',
    ],
    user_count: 2,
  },
  {
    id: 'bewoner',
    name: 'bewoner',
    display_name: 'Bewoner',
    description: 'Basis toegang voor eigenaren',
    is_system: true,
    permissions: [
      'contributions.view',
      'documents.view',
      'dashboard.personal',
    ],
    user_count: 8,
  },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@vve.nl', role_id: 'beheerder', status: 'active', last_login: '2026-01-26T10:00:00Z' },
  { id: '2', name: 'P. Pietersen', email: 'penningmeester@vve.nl', role_id: 'penningmeester', status: 'active', last_login: '2026-01-25T14:30:00Z' },
  { id: '3', name: 'B. Bakker', email: 'bestuur1@vve.nl', role_id: 'bestuurslid', status: 'active', last_login: '2026-01-24T09:15:00Z' },
  { id: '4', name: 'D. de Vries', email: 'bestuur2@vve.nl', role_id: 'bestuurslid', status: 'active' },
  { id: '5', name: 'J. Jansen', email: 'jansen@email.nl', role_id: 'bewoner', status: 'active', last_login: '2026-01-23T18:00:00Z' },
  { id: '6', name: 'K. Klaassen', email: 'klaassen@email.nl', role_id: 'bewoner', status: 'pending' },
];

const PERMISSION_CATEGORIES = [
  { id: 'financial', label: 'Financieel', icon: '💰' },
  { id: 'documents', label: 'Documenten', icon: '📁' },
  { id: 'users', label: 'Gebruikers', icon: '👥' },
  { id: 'settings', label: 'Instellingen', icon: '⚙️' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
];

export default function RollenEnRechtenPage() {
  const { addToast } = useToast();
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

  // Load data
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Toggle permission for a role
  const togglePermission = useCallback(async (roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.is_system && roleId === 'beheerder') {
      addToast('Beheerder rol kan niet worden gewijzigd', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setRoles(prev => prev.map(r => {
        if (r.id !== roleId) return r;
        const hasPermission = r.permissions.includes(permissionId);
        return {
          ...r,
          permissions: hasPermission
            ? r.permissions.filter(p => p !== permissionId)
            : [...r.permissions, permissionId],
        };
      }));

      // Update selected role if viewing it
      if (selectedRole?.id === roleId) {
        setSelectedRole(prev => {
          if (!prev) return null;
          const hasPermission = prev.permissions.includes(permissionId);
          return {
            ...prev,
            permissions: hasPermission
              ? prev.permissions.filter(p => p !== permissionId)
              : [...prev.permissions, permissionId],
          };
        });
      }

      addToast('Permissie bijgewerkt', 'success');
    } catch {
      addToast('Fout bij bijwerken permissie', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [roles, selectedRole, addToast]);

  // Change user role
  const changeUserRole = useCallback(async (userId: string, newRoleId: string) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update user counts
      const oldUser = users.find(u => u.id === userId);
      if (oldUser) {
        setRoles(prev => prev.map(r => ({
          ...r,
          user_count: r.id === oldUser.role_id
            ? r.user_count - 1
            : r.id === newRoleId
              ? r.user_count + 1
              : r.user_count,
        })));
      }

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role_id: newRoleId } : u
      ));

      addToast('Gebruikersrol bijgewerkt', 'success');
    } catch {
      addToast('Fout bij bijwerken rol', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [users, addToast]);

  // Get role badge color
  const getRoleBadgeColor = (roleId: string) => {
    switch (roleId) {
      case 'beheerder': return 'bg-purple-100 text-purple-800';
      case 'penningmeester': return 'bg-blue-100 text-blue-800';
      case 'bestuurslid': return 'bg-green-100 text-green-800';
      case 'bewoner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active': return { text: 'Actief', color: 'bg-green-100 text-green-800' };
      case 'inactive': return { text: 'Inactief', color: 'bg-gray-100 text-gray-600' };
      case 'pending': return { text: 'In afwachting', color: 'bg-yellow-100 text-yellow-800' };
      default: return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-2">
            <span>Instellingen</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Rollen & Rechten</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Rollen & Rechten Beheer</h1>
          <p className="text-gray-600 mt-1">
            Beheer rollen, permissies en gebruikerstoewijzingen voor uw VVE.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('roles')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔑 Rollen & Permissies
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Gebruikers ({users.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rollen</h2>
              <div className="space-y-2">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(role.id)}`}>
                          {role.display_name}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{role.user_count} 👤</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedRole ? `Permissies: ${selectedRole.display_name}` : 'Selecteer een rol'}
                </h2>
                {selectedRole?.is_system && selectedRole.id === 'beheerder' && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    🔒 Systeemrol
                  </span>
                )}
              </div>

              {selectedRole ? (
                <div className="space-y-6">
                  {PERMISSION_CATEGORIES.map(category => (
                    <div key={category.id}>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        {category.icon} {category.label}
                      </h3>
                      <div className="space-y-2">
                        {PERMISSIONS
                          .filter(p => p.category === category.id)
                          .map(permission => {
                            const hasPermission = selectedRole.permissions.includes(permission.id);
                            const isDisabled = selectedRole.id === 'beheerder';
                            
                            return (
                              <label
                                key={permission.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  hasPermission ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                                } ${isDisabled ? 'opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={hasPermission}
                                    disabled={isDisabled || isSaving}
                                    onChange={() => togglePermission(selectedRole.id, permission.id)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                    <div className="text-xs text-gray-500">{permission.description}</div>
                                  </div>
                                </div>
                                {hasPermission && (
                                  <span className="text-green-600 text-sm">✓</span>
                                )}
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Selecteer een rol om permissies te bekijken en bewerken</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gebruiker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laatste Login</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => {
                    const statusBadge = getStatusBadge(user.status);
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role_id}
                            onChange={(e) => changeUserRole(user.id, e.target.value)}
                            disabled={isSaving}
                            className={`text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${getRoleBadgeColor(user.role_id)} border-0`}
                          >
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>{role.display_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login
                            ? new Date(user.last_login).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })
                            : 'Nooit'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {users.map(user => {
                const statusBadge = getStatusBadge(user.status);
                return (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{user.email}</div>
                    <div className="flex items-center justify-between">
                      <select
                        value={user.role_id}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        disabled={isSaving}
                        className={`text-sm rounded-lg border-gray-300 ${getRoleBadgeColor(user.role_id)} border-0`}
                      >
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.display_name}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-400">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString('nl-NL')
                          : 'Nooit ingelogd'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audit Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>📋 Audit logging:</strong> Alle wijzigingen aan rollen en permissies worden automatisch gelogd. 
            Bekijk het <a href="/dashboard/beheerder/audit" className="underline hover:text-blue-900">audit logboek</a> voor details.
          </p>
        </div>
      </div>
    </div>
  );
}
