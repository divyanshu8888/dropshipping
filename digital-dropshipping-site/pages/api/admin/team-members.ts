import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin access
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  switch (req.method) {
    case 'GET':
      return getTeamMembers(req, res);
    case 'POST':
      return createTeamMember(req, res);
    case 'PUT':
      return updateTeamMember(req, res);
    case 'DELETE':
      return deleteTeamMember(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getTeamMembers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const teamMembers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'TEAM_MEMBER']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        skills: true,
        location: true,
        phone: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      teamMembers
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch team members',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function createTeamMember(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, email, password, role, permissions, skills, location, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, password, role' 
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'TEAM_MEMBER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be ADMIN or TEAM_MEMBER' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create team member
    const teamMember = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: role as any,
        isActive: true,
        skills: skills ? JSON.stringify(skills) : null,
        location: location || null,
        phone: phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        skills: true,
        location: true,
        phone: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      teamMember
    });

  } catch (error) {
    console.error('Error creating team member:', error);
    return res.status(500).json({ 
      error: 'Failed to create team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function updateTeamMember(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, name, email, role, isActive, skills, location, phone } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['ADMIN', 'TEAM_MEMBER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: 'Invalid role. Must be ADMIN or TEAM_MEMBER' 
        });
      }
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }

      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: parseInt(id) }
        }
      });

      if (emailExists) {
        return res.status(400).json({ 
          error: 'Email is already taken by another user' 
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(skills && { skills: JSON.stringify(skills) }),
        ...(location !== undefined && { location }),
        ...(phone !== undefined && { phone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        skills: true,
        location: true,
        phone: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      teamMember: updatedUser
    });

  } catch (error) {
    console.error('Error updating team member:', error);
    return res.status(500).json({ 
      error: 'Failed to update team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function deleteTeamMember(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the last admin user' 
        });
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting team member:', error);
    return res.status(500).json({ 
      error: 'Failed to delete team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
