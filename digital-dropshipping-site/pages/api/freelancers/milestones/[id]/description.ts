import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../../../src/lib/mysql';
import { guardMessage } from '../../../../../src/lib/moderation/contactGuard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.freelancerId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get freelancer ID from user_id
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!freelancer) {
      return res.status(403).json({ error: 'Freelancer record not found' });
    }

    const freelancerId = freelancer.id;

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Milestone ID is required' });
    }

    const milestoneId = Number.parseInt(id, 10);
    if (Number.isNaN(milestoneId)) {
      return res.status(400).json({ error: 'Invalid milestone ID' });
    }

    const { description } = req.body;
    if (description === undefined) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Get the milestone and verify it belongs to a project assigned to this freelancer
    const milestone = await queryOne<{
      id: number;
      contract_id: number;
      status: string;
      sort_order: number;
      project_id: number;
      freelancer_id: number;
    }>(
      `SELECT m.id, m.contract_id, m.status, m.sort_order, c.project_id, p.freelancer_id
       FROM milestones m
       INNER JOIN contracts c ON m.contract_id = c.id
       INNER JOIN projects p ON c.project_id = p.id
       WHERE m.id = ? AND p.freelancer_id = ?`,
      [milestoneId, freelancerId]
    );

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found or you do not have permission to edit it' });
    }

    // Validate description for confidential information
    const guardResult = guardMessage(description || '');
    
    if (!guardResult.allowed) {
      // Check if this is a pricing/payment violation
      const isPricingViolation = guardResult.reasons.some(reason => 
        reason.toLowerCase().includes('payment') || 
        reason.toLowerCase().includes('bank') ||
        reason.toLowerCase().includes('price') ||
        reason.toLowerCase().includes('cost') ||
        reason.toLowerCase().includes('fee')
      );

      // Log blocked attempt to admin notifications
      try {
        const project = await queryOne<{ id: number; title: string; client_id: number }>(
          `SELECT id, title, client_id FROM projects WHERE id = ?`,
          [milestone.project_id]
        );

        const userInfo = await queryOne<{ id: number; email: string; display_name: string | null; name: string | null }>(
          `SELECT id, email, display_name, name FROM users WHERE id = ? LIMIT 1`,
          [Number(userId)]
        );

        const notificationType = isPricingViolation ? 'moderation_pricing_violation' : 'moderation_blocked_message';
        const notificationTitle = isPricingViolation
          ? `Freelancer attempted to add pricing/payment information to milestone description`
          : `Blocked milestone description update: Freelancer tried to share contact info`;

        await query(
          `INSERT INTO admin_notifications (
            type, 
            title, 
            message, 
            metadata, 
            user_id, 
            project_id,
            severity,
            is_read,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'FALSE', NOW())`,
          [
            notificationType,
            notificationTitle,
            `User attempted to update milestone description with restricted content: ${guardResult.reasons.join(', ')}. Detected: ${guardResult.detectedContent || 'N/A'}`,
            JSON.stringify({
              projectId: milestone.project_id,
              projectTitle: project?.title || 'Unknown',
              sender: 'freelancer',
              senderUserId: Number(userId),
              senderEmail: userInfo?.email || 'Unknown',
              senderName: userInfo?.display_name || userInfo?.name || userInfo?.email || 'Unknown',
              blockedContent: description.substring(0, 200),
              detectedContent: guardResult.detectedContent,
              reasons: guardResult.reasons,
              violationType: isPricingViolation ? 'pricing_payment' : 'contact_info'
            }),
            Number(userId),
            milestone.project_id,
            'high'
          ]
        );
      } catch (notifError) {
        console.error('Failed to create admin notification:', notifError);
      }

      const errorMessage = isPricingViolation
        ? 'This description cannot be saved. Your description contains payment or budget information, which is not allowed. Please refine your description by removing all payment details, budget amounts, and pricing information. All payments must be processed through Unitiv\'s secure payment system. ⚠️ This attempt has been automatically reported to administrators for review.'
        : 'This description cannot be saved. Your description contains restricted content (phone numbers, email addresses, external links, or personal contact details). Please refine your description by removing all contact information and external references. ⚠️ This attempt has been automatically reported to administrators for review.';

      return res.status(400).json({ 
        error: errorMessage,
        reasons: guardResult.reasons,
        detectedContent: guardResult.detectedContent,
        violationType: isPricingViolation ? 'pricing_payment' : 'contact_info',
        adminNotified: true,
        requiresRefinement: true
      });
    }

    // Check if previous milestone is approved (sequential milestone editing restriction)
    if (milestone.sort_order > 1) {
      const previousMilestone = await queryOne<{ status: string }>(
        `SELECT status FROM milestones 
         WHERE contract_id = ? AND sort_order = ?`,
        [milestone.contract_id, milestone.sort_order - 1]
      );

      if (!previousMilestone || !['approved', 'released'].includes(previousMilestone.status)) {
        return res.status(403).json({ 
          error: `Cannot edit milestone ${milestone.sort_order}. Previous milestone must be approved first.` 
        });
      }
    }

    // Update the milestone description
    await query(
      `UPDATE milestones SET description = ?, updated_at = NOW() WHERE id = ?`,
      [description || null, milestoneId]
    );

    // Get project info for notification
    const project = await queryOne<{ id: number; title: string; client_id: number }>(
      `SELECT id, title, client_id FROM projects WHERE id = ?`,
      [milestone.project_id]
    );

    // Get or create conversation for this project
    let conversation = await queryOne<{ id: number }>(
      `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
      [milestone.project_id]
    );

    if (!conversation) {
      await query(
        `INSERT INTO conversations (project_id, title) VALUES (?, ?)`,
        [milestone.project_id, `Project Discussion`]
      );
      conversation = await queryOne<{ id: number }>(
        `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
        [milestone.project_id]
      );
    }

    // Send notification message to inbox
    if (conversation && project) {
      const milestoneTitle = await queryOne<{ title: string }>(
        `SELECT title FROM milestones WHERE id = ?`,
        [milestoneId]
      );

      // Filter budget information from description for notification
      // This is a comprehensive filter to remove any budget/pricing mentions
      let cleanDescription = description || '';
      
      // Remove patterns like "budget 2000", "budget: 2000", "budget2000", "$ five 2 3 4", etc.
      cleanDescription = cleanDescription
        .replace(/\b(budget|amount|price|cost|fee|charge|payment|invoice|rate|hourly|per hour|quotation|quote|estimate|pricing|pay|paid|compensation|remuneration|salary|wage)\s*:?\s*(\$?\d+(\.\d{1,2})?)\b/gi, '')
        .replace(/\b(budget|amount|price|cost|fee|charge|payment|invoice|quotation|quote|estimate|pricing|pay|paid|compensation|remuneration|salary|wage)\s*(\d+)\b/gi, '')
        .replace(/\b(\$?\d+(\.\d{1,2})?)\s*(dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi, '')
        .replace(/\b(\$?\d+(\.\d{1,2})?)\s*(budget|amount|price|cost|fee|charge|payment|invoice)\b/gi, '')
        .replace(/\$/g, '') // Remove ALL dollar signs first - most aggressive
        .replace(/\$\s*[\d\s\.\-_,a-zA-Z]+|\$\s*$/g, '') // Remove obfuscated dollar amounts like "$ 5.7.8.9", "$ 5 7 8 9", "$ 5-7-8-9", "$ five", "$ "
        .replace(/\$\d+(\.\d{1,2})?/g, '') // Remove standalone dollar amounts like "$2000"
        .replace(/\b\d+[\s.\-_,]+\d+[\s.\-_,]+\d+[\s.\-_,]+\d+/g, '') // Remove obfuscated numbers like "5.7.8.9", "5 7 8 9", "5-7-8-9"
        .replace(/\$\s*(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)[\s\d]*/gi, '') // Remove "$ five 2 3 4"
        .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\s+[\d\s]+/gi, '') // Remove "five 2 3 4"
        .replace(/\b[\d\s]+(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\b/gi, '') // Remove "2 3 4 five"
        .replace(/\b(budget|amount|price|cost|fee|charge|invoice|rate|payment|pay|paid)\s+(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\b/gi, '') // Remove "budget five thousand"
        .replace(/\b\d{3,}\s*(dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi, '') // Remove large numbers with currency
        .replace(/\b(budget|amount|price|cost|fee|charge|payment|invoice|rate|quotation|quote|estimate|pricing|pay|paid|compensation|remuneration|salary|wage)\b/gi, '') // Remove standalone budget-related words
        .replace(/\b[IVXLCDM]{3,}\b/gi, '') // Remove Roman numerals
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/,\s*$/, '') // Remove trailing comma if left after filtering
        .trim();

      const notificationMessage = cleanDescription
        ? `Updated description for milestone "${milestoneTitle?.title || 'Milestone'}": ${cleanDescription}`
        : `Updated description for milestone "${milestoneTitle?.title || 'Milestone'}"`;

      await query(
        `INSERT INTO messages (conversation_id, sender_id, body, message_type, is_read) 
         VALUES (?, ?, ?, 'milestone', 'FALSE')`,
        [
          conversation.id,
          Number(userId),
          notificationMessage
        ]
      );
    }

    // Get updated milestone
    const updatedMilestone = await queryOne<{
      id: number;
      contract_id: number;
      title: string;
      description: string | null;
      amount_cents: number;
      due_date: string | null;
      status: string;
      sort_order: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, contract_id, title, description, amount_cents, due_date, status, sort_order, created_at, updated_at
       FROM milestones
       WHERE id = ?`,
      [milestoneId]
    );

    return res.status(200).json({
      success: true,
      milestone: updatedMilestone
    });

  } catch (error: any) {
    console.error('Error updating milestone description:', error);
    return res.status(500).json({ 
      error: 'Failed to update milestone description',
      details: error.message 
    });
  }
}

