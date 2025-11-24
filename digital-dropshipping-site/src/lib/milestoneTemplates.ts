/**
 * Milestone Templates
 * 
 * Pre-configured milestone structures based on project size and best practices.
 * These templates can be used when creating new projects to ensure proper milestone distribution.
 */

export interface MilestoneTemplate {
  title: string;
  description: string;
  percentage: number; // Percentage of total project budget
  sortOrder: number;
}

export interface ProjectMilestoneTemplate {
  name: string;
  description: string;
  milestones: MilestoneTemplate[];
  totalPercentage: number;
}

/**
 * Template for $10,000 projects (5 milestones)
 */
export const template10k: ProjectMilestoneTemplate = {
  name: 'Standard Project ($10,000)',
  description: 'Recommended structure for medium-sized projects',
  milestones: [
    {
      title: 'Discovery & Specification',
      description: 'Scope finalization, success metrics, timelines, wireframe/plan, and requirements documentation',
      percentage: 15,
      sortOrder: 1
    },
    {
      title: 'Foundations & Architecture',
      description: 'Architecture setup, design system, base components, core flows, and initial infrastructure',
      percentage: 25,
      sortOrder: 2
    },
    {
      title: 'Feature Pack 1',
      description: 'First major feature set with demo, testing, and client acceptance',
      percentage: 25,
      sortOrder: 3
    },
    {
      title: 'Feature Pack 2',
      description: 'Additional features/modules, integration testing, and refinement',
      percentage: 20,
      sortOrder: 4
    },
    {
      title: 'Handover & Launch',
      description: 'Final QA, documentation, deployment, knowledge transfer, and 7-14 days warranty support',
      percentage: 15,
      sortOrder: 5
    }
  ],
  totalPercentage: 100
};

/**
 * Template for $3,000 projects (3 milestones)
 */
export const template3k: ProjectMilestoneTemplate = {
  name: 'Small Project ($3,000)',
  description: 'Streamlined structure for smaller projects',
  milestones: [
    {
      title: 'Planning & Setup',
      description: 'Requirements gathering, project setup, and initial planning',
      percentage: 30,
      sortOrder: 1
    },
    {
      title: 'Development & Implementation',
      description: 'Core development work, feature implementation, and testing',
      percentage: 40,
      sortOrder: 2
    },
    {
      title: 'Delivery & Launch',
      description: 'Final testing, deployment, documentation, and handover',
      percentage: 30,
      sortOrder: 3
    }
  ],
  totalPercentage: 100
};

/**
 * Template for $3,000 projects (alternative 3 milestones)
 */
export const template3kAlt: ProjectMilestoneTemplate = {
  name: 'Small Project Alternative ($3,000)',
  description: 'Alternative structure with different percentage split',
  milestones: [
    {
      title: 'Discovery & Planning',
      description: 'Requirements, wireframes, and project planning',
      percentage: 20,
      sortOrder: 1
    },
    {
      title: 'Development',
      description: 'Core development and implementation',
      percentage: 50,
      sortOrder: 2
    },
    {
      title: 'Launch & Support',
      description: 'Testing, deployment, and initial support',
      percentage: 30,
      sortOrder: 3
    }
  ],
  totalPercentage: 100
};

/**
 * Template for large projects ($20,000+)
 */
export const templateLarge: ProjectMilestoneTemplate = {
  name: 'Large Project ($20,000+)',
  description: 'Detailed structure for large, complex projects',
  milestones: [
    {
      title: 'Discovery & Specification',
      description: 'Comprehensive requirements, user research, technical specification, and project roadmap',
      percentage: 10,
      sortOrder: 1
    },
    {
      title: 'Design & Architecture',
      description: 'System architecture, design system, UI/UX design, and technical foundation',
      percentage: 20,
      sortOrder: 2
    },
    {
      title: 'Core Development Phase 1',
      description: 'First major development phase with core features and infrastructure',
      percentage: 20,
      sortOrder: 3
    },
    {
      title: 'Core Development Phase 2',
      description: 'Second development phase with additional features and integrations',
      percentage: 20,
      sortOrder: 4
    },
    {
      title: 'Advanced Features',
      description: 'Advanced features, optimizations, and enhancements',
      percentage: 15,
      sortOrder: 5
    },
    {
      title: 'Testing & Refinement',
      description: 'Comprehensive testing, bug fixes, performance optimization, and refinements',
      percentage: 10,
      sortOrder: 6
    },
    {
      title: 'Launch & Handover',
      description: 'Final deployment, documentation, training, knowledge transfer, and warranty period',
      percentage: 5,
      sortOrder: 7
    }
  ],
  totalPercentage: 100
};

/**
 * Template for hourly/weekly time blocks
 */
export const templateHourly: ProjectMilestoneTemplate = {
  name: 'Hourly/Weekly Blocks',
  description: 'For hourly projects - weekly time blocks as milestones',
  milestones: [
    {
      title: 'Week 1 - Initial Setup',
      description: 'Project setup, requirements clarification, and initial work',
      percentage: 25,
      sortOrder: 1
    },
    {
      title: 'Week 2 - Core Development',
      description: 'Main development work for the week',
      percentage: 25,
      sortOrder: 2
    },
    {
      title: 'Week 3 - Continued Development',
      description: 'Ongoing development and progress',
      percentage: 25,
      sortOrder: 3
    },
    {
      title: 'Week 4 - Finalization',
      description: 'Completion, testing, and delivery',
      percentage: 25,
      sortOrder: 4
    }
  ],
  totalPercentage: 100
};

/**
 * Get milestone amounts based on template and total budget
 */
export function calculateMilestoneAmounts(
  template: ProjectMilestoneTemplate,
  totalBudgetCents: number
): Array<{ template: MilestoneTemplate; amountCents: number }> {
  return template.milestones.map(milestone => ({
    template: milestone,
    amountCents: Math.round((totalBudgetCents * milestone.percentage) / 100)
  }));
}

/**
 * Get recommended template based on project budget
 */
export function getRecommendedTemplate(budgetCents: number): ProjectMilestoneTemplate {
  const budget = budgetCents / 100;
  
  if (budget >= 20000) {
    return templateLarge;
  } else if (budget >= 5000) {
    return template10k;
  } else {
    return template3k;
  }
}

/**
 * All available templates
 */
export const allTemplates: ProjectMilestoneTemplate[] = [
  template3k,
  template3kAlt,
  template10k,
  templateLarge,
  templateHourly
];

