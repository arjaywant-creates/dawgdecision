import { vi, describe, it, expect, beforeEach } from 'vitest';
import { deleteComparisonAction, saveComparisonAction, updateComparisonAction } from '../app/compare/actions';

const mockPrisma = vi.hoisted(() => ({
  comparison: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  scenario: {
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
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
      const result = await (auth.api as any).signUp({ email: "new@example.com", password: "password123", name: "New User" });
      expect(result.user.id).toBe("new_user_123");
      expect(result.user.email).toBe("new@example.com");
    });

    it('should successfully log in an existing user', async () => {
      const { auth } = await import('@/lib/auth');
      const result = await (auth.api as any).signIn({ email: "test@example.com", password: "password" });
      expect(result.user.id).toBe("test_user_123");
    });

    it('should reject login with invalid credentials', async () => {
      const { auth } = await import('@/lib/auth');
      await expect((auth.api as any).signIn({ email: "wrong@example.com", password: "wrong" }))
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

    it('should prevent unauthenticated access to update comparison', async () => {
      const result = await updateComparisonAction("comp_123", {} as any, {} as any, {} as any);
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

      const scenarioA = { name: "A", housing_cost: 500, cost_period_months: 1, contract_months: 12, utilities: 100, transportation: 50 };
      const scenarioB = { name: "B", housing_cost: 600, cost_period_months: 1, contract_months: 12, utilities: 100, transportation: 50 };
      const validDecisionResult = {
        scenario_name: "A",
        monthly_housing_cost: 500,
        monthly_recurring_cost: 650,
        term_cost: 7800,
        upfront_costs: 0,
        housing_cost: 500,
        utilities: 100,
        mandatory_fees: 0,
        parking: 0,
        transportation: 50,
        commute_minutes: 0,
        missing_recurring_costs: [],
        recurring_costs_complete: true,
        term_cost_complete: true,
      };

      const compareResult = { 
        first_result: validDecisionResult,
        second_result: { ...validDecisionResult, scenario_name: "B", monthly_recurring_cost: 750, term_cost: 9000 },
        monthly_difference: 100,
        term_difference: 1200,
        housing_cost_difference: 100,
        utilities_difference: 0,
        mandatory_fees_difference: 0,
        parking_difference: 0,
        transportation_difference: 0,
        upfront_cost_difference: 0,
        commute_difference: 0,
        tradeoffs: [{ type: "Lower Monthly Cost", favored_scenario: "A", difference: 100 }],
      };

      const result = await saveComparisonAction(scenarioA as any, scenarioB as any, compareResult as any);

      expect(result.success).toBe(true);
      expect(mockPrisma.comparison.create).toHaveBeenCalledTimes(1);
      
      const callArgs = mockPrisma.comparison.create.mock.calls[0][0];
      expect(callArgs.data.user.connect.id).toBe("test_user_123");
    });



    it('should update an existing comparison for the logged-in user', async () => {
      mockPrisma.comparison.findUnique.mockResolvedValueOnce({ 
        id: "comp_123", 
        userId: "test_user_123",
        firstScenarioId: "scen_1",
        secondScenarioId: "scen_2" 
      } as any);

      mockPrisma.scenario.update.mockResolvedValue({} as any);
      mockPrisma.comparison.update.mockResolvedValue({ id: "comp_123" } as any);

      const scenarioA = { name: "Updated A", housing_cost: 500, cost_period_months: 1, contract_months: 12, utilities: 100, transportation: 50 };
      const scenarioB = { name: "Updated B", housing_cost: 600, cost_period_months: 1, contract_months: 12, utilities: 100, transportation: 50 };
      const validDecisionResult = {
        scenario_name: "Updated A",
        monthly_housing_cost: 500,
        monthly_recurring_cost: 650,
        term_cost: 7800,
        upfront_costs: 0,
        housing_cost: 500,
        utilities: 100,
        mandatory_fees: 0,
        parking: 0,
        transportation: 50,
        commute_minutes: 0,
        missing_recurring_costs: [],
        recurring_costs_complete: true,
        term_cost_complete: true,
      };

      const compareResult = { 
        first_result: validDecisionResult,
        second_result: { ...validDecisionResult, scenario_name: "Updated B", monthly_recurring_cost: 750, term_cost: 9000 },
        monthly_difference: 100,
        term_difference: 1200,
        housing_cost_difference: 100,
        utilities_difference: 0,
        mandatory_fees_difference: 0,
        parking_difference: 0,
        transportation_difference: 0,
        upfront_cost_difference: 0,
        commute_difference: 0,
        tradeoffs: [{ type: "Lower Monthly Cost", favored_scenario: "Updated A", difference: 100 }],
      };

      const result = await updateComparisonAction("comp_123", scenarioA as any, scenarioB as any, compareResult as any);

      expect(result.success).toBe(true);
      expect(mockPrisma.comparison.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "comp_123", userId: "test_user_123" } })
      );
      expect(mockPrisma.scenario.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.comparison.update).toHaveBeenCalledTimes(1);
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
      expect(result.error).toBe("Comparison not found.");
      expect(mockPrisma.comparison.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "comp_victim_123", userId: "malicious_user" } })
      );
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should prevent updating another users comparison', async () => {
      mockPrisma.comparison.findUnique.mockResolvedValueOnce(null);

      const result = await updateComparisonAction("comp_victim_123", {} as any, {} as any, {} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Comparison not found.");
      expect(mockPrisma.comparison.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "comp_victim_123", userId: "malicious_user" } })
      );
      expect(mockPrisma.scenario.update).not.toHaveBeenCalled();
    });
  });
});
