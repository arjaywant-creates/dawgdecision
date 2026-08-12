import { test, expect, describe } from 'vitest';

import * as fs from 'fs';
import * as path from 'path';

import { 
  ScenarioSchema, 
  DecisionResultSchema, 
  ComparisonResultSchema, 
  CompareRequestSchema 
} from '../types/comparison';

describe('Schema Synchronization', () => {

  test('Scenario schema matches between Python API, Prisma DB, and TS Types', async () => {
    let apiFields = new Set<string>();

    const response = await fetch('http://127.0.0.1:8000/openapi.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI schema: ${response.statusText}`);
    }
    const openapiSchema = await response.json();
    const scenarioSchemaApi = openapiSchema?.components?.schemas?.Scenario?.properties || {};
    Object.keys(scenarioSchemaApi).forEach(k => apiFields.add(k));
    
    expect(apiFields.size).toBeGreaterThan(5);

    // 2. Parse TS types using Zod Schema
    const tsFields = new Set(Object.keys(ScenarioSchema.shape));
    
    // 3. Parse Prisma schema
    const prismaFilePath = path.join(__dirname, '../prisma/schema.prisma');
    const prismaContent = fs.readFileSync(prismaFilePath, 'utf-8');
    
    const prismaScenarioMatch = prismaContent.match(/model Scenario \{([^}]+)\}/);
    expect(prismaScenarioMatch).not.toBeNull();
    
    const prismaFields = new Set<string>();
    const prismaLines = prismaScenarioMatch![1].split('\n');
    
    // Fields to ignore in Prisma schema (relations, timestamps, IDs, output fields)
    const ignorePrismaFields = new Set([
      'id', 'userId', 'user', 'planId', 'plan', 'createdAt', 'updatedAt', 
      'comparisonsAsFirst', 'comparisonsAsSecond', 'monthlyExpenses', 
      'leaseExpenses', 'monthlySurplus', 'leaseSurplus'
    ]);

    for (const line of prismaLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) {
        continue;
      }
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const fieldName = parts[0];
        if (!ignorePrismaFields.has(fieldName)) {
          prismaFields.add(fieldName);
        }
      }
    }

    // Helper to convert snake_case to camelCase
    const toCamelCase = (str: string) => {
      return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    };

    const apiFieldsCamel = new Set(Array.from(apiFields).map(toCamelCase));
    
    // Assert API fields match TS fields (Using Zod!)
    expect(Array.from(apiFields).sort()).toEqual(Array.from(tsFields).sort());
    
    // Assert API fields (camelCase) match Prisma fields
    expect(Array.from(apiFieldsCamel).sort()).toEqual(Array.from(prismaFields).sort());
  });

  test('DecisionResult schema matches between Python API and TS Types', async () => {
    const response = await fetch('http://127.0.0.1:8000/openapi.json');
    if (!response.ok) throw new Error('Failed to fetch OpenAPI schema');
    const openapiSchema = await response.json();
    
    // API
    const apiSchema = openapiSchema?.components?.schemas?.DecisionResult?.properties || {};
    const apiFields = new Set(Object.keys(apiSchema));
    expect(apiFields.size).toBeGreaterThan(0);

    // TS Using Zod
    const tsFields = new Set(Object.keys(DecisionResultSchema.shape));
    
    expect(Array.from(apiFields).sort()).toEqual(Array.from(tsFields).sort());
  });

  test('ComparisonResult schema matches between Python API and TS Types', async () => {
    const response = await fetch('http://127.0.0.1:8000/openapi.json');
    if (!response.ok) throw new Error('Failed to fetch OpenAPI schema');
    const openapiSchema = await response.json();
    
    // API
    const apiSchema = openapiSchema?.components?.schemas?.ComparisonResult?.properties || {};
    const apiFields = new Set(Object.keys(apiSchema));
    expect(apiFields.size).toBeGreaterThan(0);

    // TS Using Zod
    const tsFields = new Set(Object.keys(ComparisonResultSchema.shape));
    
    expect(Array.from(apiFields).sort()).toEqual(Array.from(tsFields).sort());
  });

  test('CompareRequest schema matches between Python API and TS Types', async () => {
    const response = await fetch('http://127.0.0.1:8000/openapi.json');
    if (!response.ok) throw new Error('Failed to fetch OpenAPI schema');
    const openapiSchema = await response.json();
    
    // API
    const apiSchema = openapiSchema?.components?.schemas?.CompareRequest?.properties || {};
    const apiFields = new Set(Object.keys(apiSchema));
    expect(apiFields.size).toBeGreaterThan(0);

    // TS Using Zod
    const tsFields = new Set(Object.keys(CompareRequestSchema.shape));
    
    expect(Array.from(apiFields).sort()).toEqual(Array.from(tsFields).sort());
  });
});
