import { RFP } from './types';

const mockRfps: RFP[] = [
  {
    id: 'rfp-001',
    title: 'Supply of High Voltage Cables - Metro Project',
    summary: 'Tender for the supply of 110kV and 220kV XLPE insulated cables for the new metro line expansion. Requires strict adherence to fire safety standards.',
    status: 'Completed',
    submissionDate: '2024-07-15',
    client: 'Metro Rail Corp',
    url: 'https://example.com/rfp-001',
    riskLevel: 'Low',
  },
  {
    id: 'rfp-002',
    title: 'Overhead Wires Tender - State Electricity Board',
    summary: 'Procurement of ACSR conductors and overhead transmission wires for rural electrification projects. Price sensitivity is high.',
    status: 'Awaiting Review',
    submissionDate: '2024-07-20',
    client: 'State Electricity Board',
    url: 'https://example.com/rfp-002',
    riskLevel: 'Medium',
  },
  {
    id: 'rfp-003',
    title: 'Underground Cabling for Industrial Park',
    summary: 'Turnkey project for supply and installation of underground power cables for a new industrial zone. Includes testing and commissioning.',
    status: 'Processing',
    submissionDate: '2024-07-22',
    client: 'Industrial Dev Authority',
    url: 'https://example.com/rfp-003',
  },
  {
    id: 'rfp-004',
    title: 'Fiber Optic & Copper Cabling - Data Center',
    summary: 'Supply of high-speed fiber optic cables and copper cabling for a large data center facility. Low latency and high bandwidth specs required.',
    status: 'Error',
    submissionDate: '2024-06-30',
    client: 'Global Data Systems',
    url: 'https://example.com/rfp-004',
    riskLevel: 'High',
  }
];

export async function getRFPs(): Promise<RFP[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRfps;
}

export async function getRFPById(id: string): Promise<RFP | undefined> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockRfps.find(rfp => rfp.id === id);
}
