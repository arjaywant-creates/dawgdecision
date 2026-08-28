import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZodError } from "zod";
import { getHousingSources, getHousingSourceById } from "@/lib/decision-engine";

const MOCK_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

describe("Housing API Integration (FastAPI + Zod)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  const validHousingPayload = {
    id: "test-123",
    category: "on_campus",
    property_name: "Test Hall",
    configuration: "2 Bed 1 Bath",
    housing_cost: 1000,
    price_type: "term_rate",
    cost_period_months: 1,
    contract_months: 12,
    utilities: 50,
    mandatory_fees: null,
    parking: null,
    transportation: null,
    upfront_costs: 200,
    commute_minutes: 15,
    source: {
      name: "UGA Housing",
      url: "https://housing.uga.edu",
      last_checked: "2026-08-28T00:00:00Z",
    },
  };

  describe("getHousingSources", () => {
    it("should successfully fetch and parse valid FastAPI data", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ housing_options: [validHousingPayload] }),
      } as Response);

      const result = await getHousingSources();

      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/api/housing-sources`);
      expect(result.housing_options).toHaveLength(1);
      expect(result.housing_options[0].property_name).toBe("Test Hall");
    });

    it("should strictly reject payload with incorrect types (e.g. string instead of number)", async () => {
      const invalidPayload = { ...validHousingPayload, housing_cost: "1000" }; // Should be number

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ housing_options: [invalidPayload] }),
      } as Response);

      await expect(getHousingSources()).rejects.toThrow(ZodError);
    });

    it("should throw standard Error on FastAPI 500 failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      await expect(getHousingSources()).rejects.toThrow(
        "Python API Error: Internal Server Error"
      );
    });
  });

  describe("getHousingSourceById", () => {
    it("should successfully fetch and parse a single FastAPI document", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => validHousingPayload,
      } as Response);

      const result = await getHousingSourceById("test-123");

      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/api/housing-sources/test-123`
      );
      expect(result.id).toBe("test-123");
    });
  });
});
