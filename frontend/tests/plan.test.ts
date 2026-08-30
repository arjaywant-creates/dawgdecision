import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setFinancialPlanHousingAction, deleteFinancialPlanAction } from '../app/plan/actions';

const mockPrisma = vi.hoisted(() => ({
  comparison: {
    findUnique: vi.fn(),
  },
  plan: {
    create: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

const mockState = vi.hoisted(() => ({
  session: null as any,
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockImplementation(() => Promise.resolve(mockState.session)),
    }
  }
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockImplementation(() => new Headers()),
}));

describe('Financial Plan Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.session = null;
  });

  describe('setFinancialPlanHousingAction', () => {
    it('should reject unauthenticated users', async () => {
      await expect(setFinancialPlanHousingAction("comp_123", "A")).rejects.toThrow("Unauthorized");
    });

    it('should confirm one user cannot use another users comparison', async () => {
      mockState.session = { user: { id: "user_123" } };
      
      // Mock comparison not found
      mockPrisma.comparison.findUnique.mockResolvedValueOnce(null);
      await expect(setFinancialPlanHousingAction("comp_123", "A")).rejects.toThrow("Comparison not found or unauthorized");

      // Mock comparison owned by another user
      mockPrisma.comparison.findUnique.mockResolvedValueOnce({ id: "comp_123", userId: "other_user" });
      await expect(setFinancialPlanHousingAction("comp_123", "A")).rejects.toThrow("Comparison not found or unauthorized");
    });

    it('should successfully add a housing selection for the owner without overwriting', async () => {
      mockState.session = { user: { id: "user_123" } };
      
      mockPrisma.comparison.findUnique.mockResolvedValueOnce({ id: "comp_123", userId: "user_123" });
      mockPrisma.plan.create.mockResolvedValueOnce({ id: "plan_123", userId: "user_123", comparisonId: "comp_123", selectedScenario: "A" });

      const result = await setFinancialPlanHousingAction("comp_123", "A");
      
      expect(result).toEqual({ success: true });
      expect(mockPrisma.plan.create).toHaveBeenCalledWith({
        data: { userId: "user_123", comparisonId: "comp_123", selectedScenario: "A" },
      });
    });
  });

  describe('deleteFinancialPlanAction', () => {
    it('should reject unauthenticated users', async () => {
      await expect(deleteFinancialPlanAction("plan_123")).rejects.toThrow("Unauthorized");
    });

    it('should successfully delete a specific financial plan', async () => {
      mockState.session = { user: { id: "user_123" } };
      
      mockPrisma.plan.delete.mockResolvedValueOnce({ id: "plan_123" });

      const result = await deleteFinancialPlanAction("plan_123");
      
      expect(result).toEqual({ success: true });
      expect(mockPrisma.plan.delete).toHaveBeenCalledWith({
        where: { id: "plan_123", userId: "user_123" },
      });
    });

    it('should return failure if delete throws an error (e.g., record not found or ownership violation)', async () => {
      mockState.session = { user: { id: "user_123" } };
      
      mockPrisma.plan.delete.mockRejectedValueOnce(new Error("Record to delete does not exist"));

      const result = await deleteFinancialPlanAction("plan_123");
      
      expect(result).toEqual({ success: false, error: "Failed to delete plan." });
    });
  });
});

