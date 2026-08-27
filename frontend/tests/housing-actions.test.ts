import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getHousingSources, getHousingSourceById, clearHousingCache } from '../app/actions/housing';

describe('Housing Sources Actions', () => {
  beforeEach(() => {
    clearHousingCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load the sourced dataset successfully', async () => {
    const data = await getHousingSources();
    expect(data.housing_options).toBeDefined();
    expect(data.housing_options.length).toBeGreaterThan(0);
  });

  it('should contain expected categories (on_campus and off_campus)', async () => {
    const data = await getHousingSources();
    const categories = new Set(data.housing_options.map(o => o.category));
    expect(categories.has('on_campus')).toBe(true);
    expect(categories.has('off_campus')).toBe(true);
  });

  it('should return a valid matching sourced housing record by ID', async () => {
    const data = await getHousingSources();
    const firstOptionId = data.housing_options[0].id;
    
    const option = await getHousingSourceById(firstOptionId);
    expect(option).toBeDefined();
    expect(option?.id).toBe(firstOptionId);
  });

  it('should return null for an invalid ID', async () => {
    const option = await getHousingSourceById('non_existent_id');
    expect(option).toBeNull();
  });

  it('should preserve null', async () => {
    const option = await getHousingSourceById('woodsong_cypress_4x4');
    expect(option).toBeDefined();
    expect(option?.contract_months).toBeNull();
  });

  it('should preserve explicit 0', async () => {
    const option = await getHousingSourceById('river_club_4x4_classic');
    expect(option).toBeDefined();
    expect(option?.parking).toBe(0);
  });

  it('should preserve price_type', async () => {
    const option = await getHousingSourceById('woodsong_cypress_4x4');
    expect(option).toBeDefined();
    expect(option?.price_type).toBe('starting_inclusive_installment');
  });

  it('should preserve source metadata', async () => {
    const option = await getHousingSourceById('payne_double_community');
    expect(option).toBeDefined();
    expect(option?.source.name).toBe('UGA University Housing');
    expect(option?.source.url).toBe('https://housing.uga.edu/rates/');
    expect(option?.source.last_checked).toBeDefined();
    expect(option?.source.notes).toBeDefined();
  });

  it('should work for guests (no auth required)', async () => {
    // Server actions do not require auth unless checked inside.
    // Just verify it executes without error.
    const data = await getHousingSources();
    expect(data.housing_options).toBeDefined();
  });
});
