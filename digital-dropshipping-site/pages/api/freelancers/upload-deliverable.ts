import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, description } = req.body;
    const file = req.file;

    if (!projectId || !file || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deliverables')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('deliverables')
      .getPublicUrl(fileName);

    // Determine file type
    const getFileType = (mimetype: string) => {
      if (mimetype.includes('zip') || mimetype.includes('code')) return 'code';
      if (mimetype.includes('image')) return 'image';
      if (mimetype.includes('video')) return 'video';
      return 'document';
    };

    // Insert deliverable record
    const { data: deliverable, error: insertError } = await supabase
      .from('deliverables')
      .insert({
        project_id: projectId,
        name: file.originalname,
        type: getFileType(file.mimetype),
        url: urlData.publicUrl,
        description: description,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    return res.status(200).json({
      success: true,
      deliverable: deliverable
    });

  } catch (error) {
    console.error('Error uploading deliverable:', error);
    return res.status(500).json({
      error: 'Failed to upload deliverable',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
