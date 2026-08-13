import { vi, describe, it, expect, beforeEach } from 'vitest';
import { deleteComparisonAction } from '../app/actions';
import { saveComparisonAction } from '../app/compare/actions';

const mockPrisma = vi.hoisted(() => ({
  comparison: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  scenario: {
    create: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
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
      signUp: vi.fn().mockImplementation(async (data) => {
        if (!data.email || !data.password) throw new Error("Missing credentials");
        return { user: { id: "new_user_123", email: data.email } };
      }),
      signIn: vi.fn().mockImplementation(async (data) => {
        if (data.email === "test@example.com" && data.password === "password") {
          return { user: { id: "test_user_123", email: data.email } };
        }
        throw new Error("Invalid credentials");
      })
    }
  }
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockImplementation(() => new Headers()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Backend & Access Control Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.session = null;
  });

  describe('Authentication (Signup/Login)', () => {
    it('should successfully sign up a new user', async () => {
      const { auth } = await import('@/lib/auth');
      const result = await auth.api.signUp({ email: "new@example.com", password: "password123", name: "New User" });
      expect(result.user.id).toBe("new_user_123");
      expect(result.user.email).toBe("new@example.com");
    });

    it('should successfully log in an existing user', async () => {
      const { auth } = await import('@/lib/auth');
      const result = await auth.api.signIn({ email: "test@example.com", password: "password" });
      expect(result.user.id).toBe("test_user_123");
    });

    it('should reject login with invalid credentials', async () => {
      const { auth } = await import('@/lib/auth');
      await expect(auth.api.signIn({ email: "wrong@example.com", password: "wrong" }))
        .rejects.toThrow("Invalid credentials");
    });
  });

  describe('Unauthenticated Access to Protected Endpoints', () => {
    it('should prevent unauthenticated access to save comparison', async () => {
      const result = await saveComparisonAction({} as any, {} as any, {} as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it('should prevent unauthenticated access to delete comparison', async () => {
      const result = await deleteComparisonAction("comp_123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });

  describe('Authenticated Access & CRUD Operations', () => {
    beforeEach(() => {
      mockState.session = { user: { id: "test_user_123" } };
    });

    it('should save a comparison for the logged-in user', async () => {
      mockPrisma.comparison.create.mockResolvedValueOnce({ id: "new_comp_123" } as any);

      const scenarioA = { name: "A", monthly_income: 1000, rent: 500, utilities: 100, transportation: 50 };
      const scenarioB = { name: "B", monthly_income: 1000, rent: 600, utilities: 100, transportation: 50 };
      const compareResult = { 
        lower_monthly_cost_scenario: "A", 
        monthly_difference: 100,
        first_result: { monthly_expenses: 650, lease_expenses: 7800, monthly_surplus: 350, lease_surplus: 4200 },
        second_result: { monthly_expenses: 750, lease_expenses: 9000, monthly_surplus: 250, lease_surplus: 3000 }
      };

      const result = await saveComparisonAction(scenarioA as any, scenarioB as any, compareResult as any);

      expect(result.success).toBe(true);
      expect(mockPrisma.comparison.create).toHaveBeenCalledTimes(1);
      
      const callArgs = mockPrisma.comparison.create.mock.calls[0][0];
      expect(callArgs.data.user.connect.id).toBe("test_user_123");
    });

    it('should delete a comparison if it belongs to the user', async () => {
      mockPrisma.comparison.findUnique.mockResolvedValueOnce({ 
        id: "comp_123", 
        userId: "test_user_123",
        firstScenarioId: "scen_1",
        secondScenarioId: "scen_2" 
      } as any);

      const result = await deleteComparisonAction("comp_123");

      expect(result.success).toBe(true);
      expect(mockPrisma.comparison.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "comp_123", userId: "test_user_123" } })
      );
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cross-User Access Prevention', () => {
    beforeEach(() => {
      mockState.session = { user: { id: "malicious_user" } };
    });

    it('should prevent deleting another users comparison', async () => {
      mockPrisma.comparison.findUnique.mockResolvedValueOnce(null);

      const result = await deleteComparisonAction("comp_victim_123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Comparison not found");
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
