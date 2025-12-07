export type RFPStatus = 'Processing' | 'Completed' | 'Error' | 'Awaiting Review';

export interface RFP {
  id: string;
  title: string;
  summary: string;
  status: RFPStatus;
  submissionDate: string;
  client: string;
  url: string;
  riskLevel?: 'High' | 'Medium' | 'Low';
}

export type LegalRisk = {
  clause: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  explanation: string;
};

export type BidStrategy = 'Aggressive' | 'Balanced' | 'Premium';
