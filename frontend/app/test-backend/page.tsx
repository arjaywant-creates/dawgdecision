"use client";

import { useActionState } from "react";
import { testAnalyzeAction, testCompareAction } from "./actions";
import { Input, Label, TextField, Button, Card, Tabs, Spinner } from "@heroui/react";

export default function TestBackendPage() {
  const [analyzeState, analyzeAction, isAnalyzePending] = useActionState(testAnalyzeAction, null);
  const [compareState, compareAction, isComparePending] = useActionState(testCompareAction, null);

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground">
            Python Backend Test
          </h2>
          <p className="mt-2 text-sm text-default-500">
            Submit these forms to test the Next.js Server Actions communicating with both FastAPI Python endpoints.
          </p>
        </div>

        <div className="flex w-full flex-col">
          <Tabs aria-label="Backend Test Endpoints">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Options">
                <Tabs.Tab id="analyze">
                  1. Test /analyze Endpoint
                </Tabs.Tab>
                <Tabs.Tab id="compare">
                  2. Test /compare Endpoint
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="analyze">
              <Card className="w-full mt-4">
                <Card.Header>
                  <Card.Title>Scenario Calculator</Card.Title>
                  <Card.Description>Calculate financial surplus using Python engine</Card.Description>
                </Card.Header>
                <Card.Content>
                  <form action={analyzeAction} className="flex flex-col gap-6 py-2">
                    <TextField className="w-full" name="name" type="text" defaultValue="Seattle Move" isRequired>
                      <Label>Scenario Name</Label>
                      <Input id="name" placeholder="e.g. Seattle Move" />
                    </TextField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField className="w-full" name="monthly_income" type="number" defaultValue="6000" isRequired>
                        <Label>Monthly Income ($)</Label>
                        <Input id="monthly_income" placeholder="6000" />
                      </TextField>

                      <TextField className="w-full" name="rent" type="number" defaultValue="2000" isRequired>
                        <Label>Rent ($)</Label>
                        <Input id="rent" placeholder="2000" />
                      </TextField>

                      <TextField className="w-full" name="utilities" type="number" defaultValue="150" isRequired>
                        <Label>Utilities ($)</Label>
                        <Input id="utilities" placeholder="150" />
                      </TextField>

                      <TextField className="w-full" name="transportation" type="number" defaultValue="100" isRequired>
                        <Label>Transportation ($)</Label>
                        <Input id="transportation" placeholder="100" />
                      </TextField>
                    </div>

                    <Button type="submit" isPending={isAnalyzePending} className="w-full font-medium" size="lg">
                      {({isPending}) => (
                        <>
                          {isPending ? <Spinner color="current" size="sm" className="mr-2" /> : null}
                          Analyze Scenario
                        </>
                      )}
                    </Button>
                  </form>
                </Card.Content>
              </Card>

              {analyzeState && (
                <Card className="w-full mt-8">
                  <Card.Header>
                    <Card.Title>Response from /analyze</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    {analyzeState.success ? (
                      <div className="p-4 bg-success-50 text-success-900 rounded-lg">
                        <pre className="text-sm overflow-auto">{JSON.stringify(analyzeState.data, null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="p-4 bg-danger-50 text-danger-900 rounded-lg">
                        <p className="text-sm font-semibold mb-2">Error connecting to backend:</p>
                        <p className="text-sm mb-4">{analyzeState.error}</p>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              )}
            </Tabs.Panel>

            <Tabs.Panel id="compare">
              <Card className="w-full mt-4">
                <Card.Header>
                  <Card.Title>Scenario Comparer</Card.Title>
                  <Card.Description>Compare two scenarios to find the cheaper option</Card.Description>
                </Card.Header>
                <Card.Content>
                  <form action={compareAction} className="flex flex-col gap-8 py-2">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Scenario A */}
                      <div className="flex flex-col gap-4 p-4 border border-default-200 rounded-xl bg-default-50">
                        <h3 className="font-bold text-lg">Scenario A</h3>
                        
                        <TextField className="w-full" name="a_name" type="text" defaultValue="Seattle" isRequired>
                          <Label>Scenario Name</Label>
                          <Input placeholder="Seattle" />
                        </TextField>

                        <TextField className="w-full" name="a_monthly_income" type="number" defaultValue="6000" isRequired>
                          <Label>Monthly Income ($)</Label>
                          <Input placeholder="6000" />
                        </TextField>

                        <TextField className="w-full" name="a_rent" type="number" defaultValue="2000" isRequired>
                          <Label>Rent ($)</Label>
                          <Input placeholder="2000" />
                        </TextField>

                        <TextField className="w-full" name="a_utilities" type="number" defaultValue="150" isRequired>
                          <Label>Utilities ($)</Label>
                          <Input placeholder="150" />
                        </TextField>

                        <TextField className="w-full" name="a_transportation" type="number" defaultValue="100" isRequired>
                          <Label>Transportation ($)</Label>
                          <Input placeholder="100" />
                        </TextField>
                      </div>

                      {/* Scenario B */}
                      <div className="flex flex-col gap-4 p-4 border border-default-200 rounded-xl bg-default-50">
                        <h3 className="font-bold text-lg">Scenario B</h3>
                        
                        <TextField className="w-full" name="b_name" type="text" defaultValue="Austin" isRequired>
                          <Label>Scenario Name</Label>
                          <Input placeholder="Austin" />
                        </TextField>

                        <TextField className="w-full" name="b_monthly_income" type="number" defaultValue="5000" isRequired>
                          <Label>Monthly Income ($)</Label>
                          <Input placeholder="5000" />
                        </TextField>

                        <TextField className="w-full" name="b_rent" type="number" defaultValue="1500" isRequired>
                          <Label>Rent ($)</Label>
                          <Input placeholder="1500" />
                        </TextField>

                        <TextField className="w-full" name="b_utilities" type="number" defaultValue="120" isRequired>
                          <Label>Utilities ($)</Label>
                          <Input placeholder="120" />
                        </TextField>

                        <TextField className="w-full" name="b_transportation" type="number" defaultValue="80" isRequired>
                          <Label>Transportation ($)</Label>
                          <Input placeholder="80" />
                        </TextField>
                      </div>
                    </div>

                    <Button type="submit" isPending={isComparePending} className="w-full font-medium" size="lg">
                      {({isPending}) => (
                        <>
                          {isPending ? <Spinner color="current" size="sm" className="mr-2" /> : null}
                          Compare Scenarios
                        </>
                      )}
                    </Button>
                  </form>
                </Card.Content>
              </Card>

              {compareState && (
                <Card className="w-full mt-8">
                  <Card.Header>
                    <Card.Title>Response from /compare</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    {compareState.success ? (
                      <div className="p-4 bg-success-50 text-success-900 rounded-lg">
                        <pre className="text-sm overflow-auto">{JSON.stringify(compareState.data, null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="p-4 bg-danger-50 text-danger-900 rounded-lg">
                        <p className="text-sm font-semibold mb-2">Error connecting to backend:</p>
                        <p className="text-sm mb-4">{compareState.error}</p>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              )}
            </Tabs.Panel>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
