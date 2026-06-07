import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(501).json({
    error: 'Supplier onboarding has not been migrated to the SQL backend yet.',
    nextStep: 'Create SQL suppliers, supplier_documents, and supplier_audit tables before enabling this route.',
  });
}
