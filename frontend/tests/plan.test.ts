import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  setFinancialPlanHousingAction,
  removeFinancialPlanHousingAction,
} from "../app/plan/actions";

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

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

const mockState = vi.hoisted(() => ({
  session: null as any,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi
        .fn()
        .mockImplementation(() => Promise.resolve(mockState.session)),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockImplementation(() => new Headers()),
}));

describe("Financial Plan Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.session = null;
  });

  describe("setFinancialPlanHousingAction", () => {
    it("should reject unauthenticated users", async () => {
      await expect(
        setFinancialPlanHousingAction("comp_123", "A"),
      ).rejects.toThrow("Unauthorized");
    });

    it("should prevent one user from using another user's comparison", async () => {
      mockState.session = { user: { id: "user_123" } };

      mockPrisma.comparison.findUnique.mockResolvedValueOnce(null);

      await expect(
        setFinancialPlanHousingAction("comp_123", "A"),
      ).rejects.toThrow("Comparison not found or unauthorized");

      mockPrisma.comparison.findUnique.mockResolvedValueOnce({
        id: "comp_123",
        userId: "other_user",
      });

      await expect(
        setFinancialPlanHousingAction("comp_123", "A"),
      ).rejects.toThrow("Comparison not found or unauthorized");
    });

    it("should successfully create a Financial Plan for the owner", async () => {
      mockState.session = { user: { id: "user_123" } };

      mockPrisma.comparison.findUnique.mockResolvedValueOnce({
        id: "comp_123",
        userId: "user_123",
      });

      mockPrisma.plan.create.mockResolvedValueOnce({
        id: "plan_123",
        userId: "user_123",
        comparisonId: "comp_123",
        selectedScenario: "A",
      });

      const result = await setFinancialPlanHousingAction("comp_123", "A");

      expect(result).toEqual({ success: true });

      expect(mockPrisma.plan.create).toHaveBeenCalledWith({
        data: {
          userId: "user_123",
          comparisonId: "comp_123",
          selectedScenario: "A",
        },
      });
    });

    it("should create a plan with scenario B when B is selected", async () => {
      mockState.session = { user: { id: "user_123" } };

      mockPrisma.comparison.findUnique.mockResolvedValueOnce({
        id: "comp_123",
        userId: "user_123",
      });

      mockPrisma.plan.create.mockResolvedValueOnce({
        id: "plan_123",
        userId: "user_123",
        comparisonId: "comp_123",
        selectedScenario: "B",
      });

      const result = await setFinancialPlanHousingAction("comp_123", "B");

      expect(result).toEqual({ success: true });

      expect(mockPrisma.plan.create).toHaveBeenCalledWith({
        data: {
          userId: "user_123",
          comparisonId: "comp_123",
          selectedScenario: "B",
        },
      });
    });
  });

  describe("removeFinancialPlanHousingAction", () => {
    it("should reject unauthenticated users", async () => {
      await expect(
        removeFinancialPlanHousingAction("plan_123"),
      ).rejects.toThrow("Unauthorized");
    });

    it("should reject deletion of a missing or unauthorized plan", async () => {
      mockState.session = { user: { id: "user_123" } };

      mockPrisma.plan.findUnique.mockResolvedValueOnce(null);

      await expect(
        removeFinancialPlanHousingAction("plan_123"),
      ).rejects.toThrow("Plan not found or unauthorized");

      mockPrisma.plan.findUnique.mockResolvedValueOnce({
        id: "plan_123",
        userId: "other_user",
      });

      await expect(
        removeFinancialPlanHousingAction("plan_123"),
      ).rejects.toThrow("Plan not found or unauthorized");
    });

    it("should successfully delete a Financial Plan owned by the user", async () => {
      mockState.session = { user: { id: "user_123" } };

      mockPrisma.plan.findUnique.mockResolvedValueOnce({
        id: "plan_123",
        userId: "user_123",
      });

      mockPrisma.plan.delete.mockResolvedValueOnce({
        id: "plan_123",
      });

      const result =
        await removeFinancialPlanHousingAction("plan_123");

      expect(result).toEqual({ success: true });

      expect(mockPrisma.plan.delete).toHaveBeenCalledWith({
        where: {
          id: "plan_123",
        },
      });
    });
  });
});