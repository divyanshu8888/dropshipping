/**
 * Milestone Workflow Enforcement
 * 
 * Defines valid status transitions and enforces workflow rules
 */

export type MilestoneStatus = 
  | 'pending' 
  | 'funded' 
  | 'in_progress' 
  | 'submitted' 
  | 'approved' 
  | 'released' 
  | 'rejected';

/**
 * Valid status transitions
 * Key = current status, Value = array of allowed next statuses
 */
export const VALID_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  'pending': ['funded', 'rejected'], // Can fund or reject before starting
  'funded': ['in_progress', 'pending'], // Can start work or refund
  'in_progress': ['submitted', 'rejected'], // Can submit or reject
  'submitted': ['approved', 'rejected'], // Client can approve or reject
  'approved': ['released'], // Auto-releases funds
  'released': [], // Final state - no further transitions
  'rejected': ['submitted', 'pending'] // Can resubmit or reset
};

/**
 * Check if a status transition is valid
 */
export function isValidTransition(
  currentStatus: MilestoneStatus,
  newStatus: MilestoneStatus
): boolean {
  // Same status is always valid (no-op)
  if (currentStatus === newStatus) {
    return true;
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  return allowedTransitions?.includes(newStatus) ?? false;
}

/**
 * Get the next valid statuses for a given current status
 */
export function getNextValidStatuses(
  currentStatus: MilestoneStatus
): MilestoneStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

/**
 * Workflow rules:
 * - Freelancers can only submit when status is 'in_progress'
 * - Clients can only approve/reject when status is 'submitted'
 * - Funds auto-release when status changes to 'approved'
 * - Work can only start when status is 'funded'
 */
export const WORKFLOW_RULES = {
  /**
   * Can freelancer submit this milestone?
   */
  canFreelancerSubmit: (status: MilestoneStatus): boolean => {
    return status === 'in_progress';
  },

  /**
   * Can client approve/reject this milestone?
   */
  canClientApprove: (status: MilestoneStatus): boolean => {
    return status === 'submitted';
  },

  /**
   * Can work start on this milestone?
   */
  canStartWork: (status: MilestoneStatus): boolean => {
    return status === 'funded';
  },

  /**
   * Is milestone in a completed state?
   */
  isCompleted: (status: MilestoneStatus): boolean => {
    return status === 'released';
  },

  /**
   * Is milestone in a pending review state?
   */
  isPendingReview: (status: MilestoneStatus): boolean => {
    return status === 'submitted';
  },

  /**
   * Is milestone funded and ready for work?
   */
  isFunded: (status: MilestoneStatus): boolean => {
    return status === 'funded' || status === 'in_progress';
  }
};

/**
 * Get status display information
 */
export function getStatusInfo(status: MilestoneStatus) {
  const statusInfo: Record<MilestoneStatus, { label: string; color: string; description: string }> = {
    'pending': {
      label: 'Pending',
      color: 'gray',
      description: 'Milestone created, awaiting funding'
    },
    'funded': {
      label: 'Funded',
      color: 'blue',
      description: 'Funds in escrow, ready to start work'
    },
    'in_progress': {
      label: 'In Progress',
      color: 'yellow',
      description: 'Freelancer is working on this milestone'
    },
    'submitted': {
      label: 'Submitted',
      color: 'orange',
      description: 'Awaiting client approval (5 business days)'
    },
    'approved': {
      label: 'Approved',
      color: 'green',
      description: 'Client approved - funds will be released'
    },
    'released': {
      label: 'Released',
      color: 'green',
      description: 'Funds released to freelancer'
    },
    'rejected': {
      label: 'Rejected',
      color: 'red',
      description: 'Client rejected - can be resubmitted'
    }
  };

  return statusInfo[status] || {
    label: status,
    color: 'gray',
    description: 'Unknown status'
  };
}

