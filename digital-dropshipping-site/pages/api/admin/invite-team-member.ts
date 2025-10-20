import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, role, permissions, message } = req.body;

    // Validate required fields
    if (!email || !role) {
      return res.status(400).json({ 
        error: 'Email and role are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'TEAM_MEMBER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be ADMIN or TEAM_MEMBER' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create invitation record (you could create an Invitation model for this)
    // For now, we'll simulate sending an email invitation
    const invitationData = {
      email: email.toLowerCase(),
      role,
      permissions: permissions || [],
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    // In a real application, you would:
    // 1. Save the invitation to a database
    // 2. Send an email with invitation link
    // 3. Generate a secure invitation token

    // Simulate email sending
    console.log('Sending invitation email to:', email);
    console.log('Invitation data:', invitationData);

    // Mock email sending success
    const emailSent = true; // This would be the result of actual email sending

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Invitation sent successfully',
        invitation: {
          email: invitationData.email,
          role: invitationData.role,
          expiresAt: invitationData.expiresAt
        }
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send invitation email'
      });
    }

  } catch (error) {
    console.error('Error sending team member invitation:', error);
    return res.status(500).json({ 
      error: 'Failed to send invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
