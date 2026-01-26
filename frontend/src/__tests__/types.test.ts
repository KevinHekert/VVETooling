/**
 * Tests for TypeScript types
 * Validates that types are correctly defined and can be used
 */

import type {
  User,
  UserRole,
  TransactionCategory,
  Transaction,
  Unit,
  SplitsingssleutelEntry,
  SplitsingssleutelValidation,
  Contribution,
  ContributionStatus,
  BewonersStatus,
  Document,
} from '@/types';

describe('TypeScript Types', () => {
  describe('User Types', () => {
    it('should define valid User type', () => {
      const user: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_email_verified: false,
        created_at: '2026-01-26T00:00:00Z',
      };
      
      expect(user.email).toBe('test@example.com');
      expect(user.is_active).toBe(true);
    });

    it('should accept valid UserRole values', () => {
      const roles: UserRole[] = ['bewoner', 'penningmeester', 'bestuurslid', 'beheerder'];
      
      expect(roles).toHaveLength(4);
      expect(roles).toContain('beheerder');
    });
  });

  describe('Transaction Types', () => {
    it('should define valid Transaction type', () => {
      const transaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        vve_id: '123e4567-e89b-12d3-a456-426614174001',
        amount: 150.00,
        category: 'contribution',
        transaction_date: '2026-01-26T00:00:00Z',
        created_at: '2026-01-26T00:00:00Z',
        updated_at: '2026-01-26T00:00:00Z',
      };
      
      expect(transaction.amount).toBe(150.00);
      expect(transaction.category).toBe('contribution');
    });

    it('should accept valid TransactionCategory values', () => {
      const categories: TransactionCategory[] = [
        'contribution',
        'maintenance',
        'energy',
        'insurance',
        'administrative',
        'reserve',
        'other',
      ];
      
      expect(categories).toHaveLength(7);
    });
  });

  describe('Unit and Splitsingssleutel Types (STORY-002)', () => {
    it('should define valid Unit type', () => {
      const unit: Unit = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        vve_id: '123e4567-e89b-12d3-a456-426614174001',
        unit_number: 'A1',
        share_percentage: 25.5,
        is_active: true,
        created_at: '2026-01-26T00:00:00Z',
      };
      
      expect(unit.unit_number).toBe('A1');
      expect(unit.share_percentage).toBe(25.5);
    });

    it('should define valid SplitsingssleutelValidation type', () => {
      const validation: SplitsingssleutelValidation = {
        units: [
          { unit_id: '1', unit_number: 'A1', share_percentage: 50 },
          { unit_id: '2', unit_number: 'A2', share_percentage: 50 },
        ],
        total_percentage: 100,
        is_valid: true,
        validation_message: 'Splitsingssleutel is geldig (100%)',
      };
      
      expect(validation.is_valid).toBe(true);
      expect(validation.total_percentage).toBe(100);
      expect(validation.units).toHaveLength(2);
    });
  });

  describe('Contribution Types (STORY-003)', () => {
    it('should define valid Contribution type', () => {
      const contribution: Contribution = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        unit_id: '123e4567-e89b-12d3-a456-426614174001',
        vve_id: '123e4567-e89b-12d3-a456-426614174002',
        year: 2026,
        month: 1,
        amount_due: 250.00,
        amount_paid: 250.00,
        due_date: '2026-01-31T00:00:00Z',
        status: 'paid',
        created_at: '2026-01-26T00:00:00Z',
      };
      
      expect(contribution.status).toBe('paid');
      expect(contribution.amount_due).toBe(250.00);
    });

    it('should accept valid ContributionStatus values', () => {
      const statuses: ContributionStatus[] = ['pending', 'paid', 'overdue'];
      
      expect(statuses).toHaveLength(3);
    });

    it('should define valid BewonersStatus type', () => {
      const status: BewonersStatus = {
        unit_id: '123e4567-e89b-12d3-a456-426614174000',
        unit_number: 'A1',
        vve_name: 'Test VVE',
        current_month_due: 250.00,
        current_month_paid: 250.00,
        current_month_status: 'paid',
        total_due_year: 3000.00,
        total_paid_year: 3000.00,
        outstanding_balance: 0,
        recent_contributions: [],
        is_up_to_date: true,
        has_overdue_payments: false,
      };
      
      expect(status.is_up_to_date).toBe(true);
      expect(status.outstanding_balance).toBe(0);
    });
  });

  describe('Document Types (STORY-004)', () => {
    it('should define valid Document type', () => {
      const doc: Document = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        vve_id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Jaarverslag 2025',
        file_name: 'jaarverslag-2025.pdf',
        file_type: 'application/pdf',
        file_size_bytes: 1024000,
        category: 'jaarverslag',
        is_public: true,
        created_at: '2026-01-26T00:00:00Z',
      };
      
      expect(doc.title).toBe('Jaarverslag 2025');
      expect(doc.is_public).toBe(true);
    });
  });
});
