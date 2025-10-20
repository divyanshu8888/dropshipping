import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const formData = await parseFormData(req);
    
    const {
      company_name,
      business_type,
      contact_email,
      contact_phone,
      website,
      address,
      tax_id,
      payment_terms,
      minimum_order_value,
      lead_time_days,
      shipping_regions,
      certifications,
      business_license,
      tax_certificate,
      insurance_certificate
    } = formData;

    // Validate required fields
    if (!company_name || !business_type || !contact_email || !contact_phone || !tax_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from session (you'll need to implement proper auth)
    const userData = req.headers.authorization;
    if (!userData) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For now, we'll create a supplier record
    // In a real implementation, you'd verify the user's authentication token
    
    // Upload files to Supabase Storage if provided
    const uploadedFiles: Record<string, string> = {};
    
    if (business_license) {
      const fileName = `business-license-${Date.now()}.pdf`;
      const { data: licenseData, error: licenseError } = await supabase.storage
        .from('supplier-documents')
        .upload(fileName, business_license);
      
      if (!licenseError) {
        uploadedFiles.business_license_url = licenseData.path;
      }
    }

    if (tax_certificate) {
      const fileName = `tax-certificate-${Date.now()}.pdf`;
      const { data: taxData, error: taxError } = await supabase.storage
        .from('supplier-documents')
        .upload(fileName, tax_certificate);
      
      if (!taxError) {
        uploadedFiles.tax_certificate_url = taxData.path;
      }
    }

    if (insurance_certificate) {
      const fileName = `insurance-certificate-${Date.now()}.pdf`;
      const { data: insuranceData, error: insuranceError } = await supabase.storage
        .from('supplier-documents')
        .upload(fileName, insurance_certificate);
      
      if (!insuranceError) {
        uploadedFiles.insurance_certificate_url = insuranceData.path;
      }
    }

    // Parse JSON fields
    const addressObj = typeof address === 'string' ? JSON.parse(address) : address;
    const shippingRegionsArray = typeof shipping_regions === 'string' ? JSON.parse(shipping_regions) : shipping_regions;
    const certificationsArray = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;

    // Create supplier record
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        company_name,
        business_type,
        contact_email,
        contact_phone,
        website: website || null,
        address: addressObj,
        tax_id,
        payment_terms: parseInt(payment_terms) || 30,
        minimum_order_value: parseFloat(minimum_order_value) || 0,
        lead_time_days: parseInt(lead_time_days) || 7,
        shipping_regions: shippingRegionsArray,
        certifications: certificationsArray,
        status: 'pending',
        ...uploadedFiles
      })
      .select()
      .single();

    if (supplierError) {
      console.error('Error creating supplier:', supplierError);
      return res.status(500).json({ error: 'Failed to create supplier record' });
    }

    // Create KYC verification record
    const { error: kycError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: supplierData.user_id, // You'll need to get this from auth
        status: 'pending',
        document_type: 'business_license',
        verification_data: {
          business_license_url: uploadedFiles.business_license_url,
          tax_certificate_url: uploadedFiles.tax_certificate_url,
          insurance_certificate_url: uploadedFiles.insurance_certificate_url,
          submitted_at: new Date().toISOString()
        }
      });

    if (kycError) {
      console.error('Error creating KYC verification:', kycError);
      // Don't fail the entire request for KYC error
    }

    // Log audit event
    await supabase
      .from('audit_log')
      .insert({
        entity_type: 'supplier',
        entity_id: supplierData.id,
        action: 'create',
        new_values: {
          company_name,
          business_type,
          status: 'pending'
        }
      });

    return res.status(200).json({
      success: true,
      supplier_id: supplierData.id,
      message: 'Supplier application submitted successfully. You will be notified once your application is reviewed.'
    });

  } catch (error) {
    console.error('Supplier onboarding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to parse multipart form data
async function parseFormData(req: NextApiRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    const formData: any = {};
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type']?.split('boundary=')[1];
        
        if (!boundary) {
          reject(new Error('No boundary found'));
          return;
        }
        
        const parts = buffer.toString().split(`--${boundary}`);
        
        for (const part of parts) {
          if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            if (!nameMatch) continue;
            
            const name = nameMatch[1];
            const headerEnd = part.indexOf('\r\n\r\n');
            const content = part.slice(headerEnd + 4, -2); // Remove trailing \r\n
            
            if (part.includes('filename=')) {
              // This is a file upload
              const filenameMatch = part.match(/filename="([^"]+)"/);
              if (filenameMatch) {
                formData[name] = {
                  filename: filenameMatch[1],
                  content: Buffer.from(content, 'binary')
                };
              }
            } else {
              // This is a regular field
              formData[name] = content;
            }
          }
        }
        
        resolve(formData);
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', reject);
  });
}
