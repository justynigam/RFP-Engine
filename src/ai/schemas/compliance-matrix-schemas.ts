import {z} from 'genkit';

const RequirementSpecSchema = z.object({
  parameter: z.string().describe('The technical parameter (e.g., "Voltage Rating").'),
  value: z.string().describe('The required value for the parameter (e.g., "1100V").'),
});

const ProductSpecSchema = z.object({
  productName: z.string().describe('The name of the product SKU.'),
  specs: z.array(RequirementSpecSchema).describe('The list of technical specifications for the product.'),
});

export const GenerateComplianceMatrixInputSchema = z.object({
  rfpRequirements: z.array(RequirementSpecSchema).describe('An array of technical requirements from the RFP.'),
  productSpecs: z.array(ProductSpecSchema).describe('An array of available products with their specifications.'),
});
export type GenerateComplianceMatrixInput = z.infer<typeof GenerateComplianceMatrixInputSchema>;

const ComplianceResultSchema = z.object({
    productName: z.string().describe('The name of the product SKU.'),
    specMatchPercentage: z.number().describe('The percentage of RFP requirements met by this product.'),
    matchDetails: z.array(z.object({
        requirement: z.string(),
        rfpValue: z.string(),
        productValue: z.string(),
        match: z.boolean(),
    })).describe('A detailed breakdown of how the product specs match the RFP requirements.')
});

export const GenerateComplianceMatrixOutputSchema = z.object({
  topMatchingProduct: ComplianceResultSchema.describe('The product with the highest compliance score.'),
  complianceMatrix: z.array(ComplianceResultSchema).describe('The full compliance matrix for all evaluated products.'),
});
export type GenerateComplianceMatrixOutput = z.infer<typeof GenerateComplianceMatrixOutputSchema>;
