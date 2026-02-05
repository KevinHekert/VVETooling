'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import type { VVEMembership, UserRole } from '@/types';

/**
 * Member Management Page - Leden Beheren
 * 
 * Implements on/offboarding functionality for VVE members:
 * - View all members of the current VVE
 * - Add new members (onboarding)
 * - Remove members (offboarding)
 * - Update member roles
 */

interface MemberWithDetails extends VVEMembership {
  email?: string;
  first_name?: string;
  last_name?: string;
}

export default function LedenBeheerPage() {
  const { currentVveId, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('bewoner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      if (!currentVveId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getVVEMembers(currentVveId);
        setMembers(data);
        setError(null);
      } catch (err) {
        // For demo, show mock data when API is not available
        setMembers([]);
        setError(err instanceof Error ? err.message : 'Kon leden niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    if (!authLoading) {
      fetchMembers();
    }
  }, [currentVveId, authLoading]);

  const handleAddMember = async () => {
    if (!currentVveId || !newMemberEmail) return;
    
    setIsSubmitting(true);
    try {
      await api.inviteVVEMember(currentVveId, {
        email: newMemberEmail,
        role: newMemberRole,
      });
      addToast(`Uitnodiging verstuurd naar ${newMemberEmail}`, 'success');
      setShowAddModal(false);
      setNewMemberEmail('');
      setNewMemberRole('bewoner');
      // Refresh member list
      const data = await api.getVVEMembers(currentVveId);
      setMembers(data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Kon lid niet toevoegen',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!currentVveId) return;
    
    if (!confirm(`Weet u zeker dat u ${memberName} wilt verwijderen uit deze VVE?`)) {
      return;
    }
    
    try {
      await api.removeVVEMember(currentVveId, memberId);
      addToast(`${memberName} is verwijderd uit de VVE`, 'success');
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Kon lid niet verwijderen',
        'error'
      );
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    if (!currentVveId) return;
    
    try {
      await api.updateVVEMember(currentVveId, memberId, { role: newRole });
      addToast('Rol bijgewerkt', 'success');
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Kon rol niet bijwerken',
        'error'
      );
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentVveId) {
    return (
      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm text-yellow-700">
          Geen VVE geselecteerd. Selecteer eerst een VVE via het menu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leden Beheren</h1>
          <p className="text-gray-600">
            Beheer de leden van uw VVE - on- en offboarding
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Lid Toevoegen
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-4">👥</div>
            <p>Geen leden gevonden</p>
            <p className="text-sm mt-2">
              Klik op &quot;Lid Toevoegen&quot; om iemand uit te nodigen.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eenheid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinds
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.unit_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleUpdateRole(member.id, e.target.value as UserRole)
                      }
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="bewoner">Bewoner</option>
                      <option value="penningmeester">Penningmeester</option>
                      <option value="bestuurslid">Bestuurslid</option>
                      <option value="beheerder">Beheerder</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        handleRemoveMember(
                          member.id,
                          `${member.first_name} ${member.last_name}`
                        )
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Nieuw Lid Uitnodigen
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="bewoner@email.nl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bewoner">Bewoner</option>
                  <option value="penningmeester">Penningmeester</option>
                  <option value="bestuurslid">Bestuurslid</option>
                  <option value="beheerder">Beheerder</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddMember}
                disabled={isSubmitting || !newMemberEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Bezig...' : 'Uitnodigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
