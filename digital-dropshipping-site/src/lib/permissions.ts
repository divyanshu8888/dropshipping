// Define permissions for different roles
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// Available permissions
export const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and information', category: 'User Management' },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user information and settings', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'User Management' },
  { id: 'users.ban', name: 'Ban Users', description: 'Ban or suspend user accounts', category: 'User Management' },

  // Team Management
  { id: 'team.view', name: 'View Team', description: 'View team members and their information', category: 'Team Management' },
  { id: 'team.create', name: 'Add Team Members', description: 'Add new team members', category: 'Team Management' },
  { id: 'team.edit', name: 'Edit Team Members', description: 'Edit team member information', category: 'Team Management' },
  { id: 'team.delete', name: 'Remove Team Members', description: 'Remove team members', category: 'Team Management' },

  // Product Management
  { id: 'products.view', name: 'View Products', description: 'View product catalog', category: 'Product Management' },
  { id: 'products.create', name: 'Create Products', description: 'Add new products to catalog', category: 'Product Management' },
  { id: 'products.edit', name: 'Edit Products', description: 'Edit product information', category: 'Product Management' },
  { id: 'products.delete', name: 'Delete Products', description: 'Remove products from catalog', category: 'Product Management' },

  // Order Management
  { id: 'orders.view', name: 'View Orders', description: 'View customer orders', category: 'Order Management' },
  { id: 'orders.edit', name: 'Edit Orders', description: 'Update order status and information', category: 'Order Management' },
  { id: 'orders.process', name: 'Process Orders', description: 'Process and fulfill orders', category: 'Order Management' },

  // Financial Management
  { id: 'finance.view', name: 'View Finance', description: 'View financial reports and data', category: 'Financial Management' },
  { id: 'finance.manage', name: 'Manage Finance', description: 'Manage financial operations', category: 'Financial Management' },
  { id: 'finance.payouts', name: 'Manage Payouts', description: 'Manage freelancer payouts', category: 'Financial Management' },

  // Content Moderation
  { id: 'moderation.view', name: 'View Moderation', description: 'View moderation queue and reports', category: 'Content Moderation' },
  { id: 'moderation.moderate', name: 'Moderate Content', description: 'Moderate user content and chats', category: 'Content Moderation' },
  { id: 'moderation.ban', name: 'Ban Content', description: 'Ban inappropriate content', category: 'Content Moderation' },

  // System Administration
  { id: 'system.view', name: 'View System', description: 'View system status and health', category: 'System Administration' },
  { id: 'system.settings', name: 'Manage Settings', description: 'Manage system settings', category: 'System Administration' },
  { id: 'system.logs', name: 'View Logs', description: 'View system logs and audit trails', category: 'System Administration' },

  // Analytics & Reports
  { id: 'analytics.view', name: 'View Analytics', description: 'View platform analytics and reports', category: 'Analytics & Reports' },
  { id: 'analytics.export', name: 'Export Data', description: 'Export analytics data', category: 'Analytics & Reports' },

  // Support
  { id: 'support.view', name: 'View Support', description: 'View support tickets and requests', category: 'Support' },
  { id: 'support.respond', name: 'Respond to Support', description: 'Respond to support tickets', category: 'Support' },
];

// Role-based permissions configuration
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'ADMIN',
    permissions: PERMISSIONS // Admins have all permissions
  },
  {
    role: 'TEAM_MEMBER',
    permissions: [
      // User Management (limited)
      { id: 'users.view', name: 'View Users', description: 'View user profiles and information', category: 'User Management' },
      
      // Team Management (limited)
      { id: 'team.view', name: 'View Team', description: 'View team members and their information', category: 'Team Management' },
      
      // Product Management
      { id: 'products.view', name: 'View Products', description: 'View product catalog', category: 'Product Management' },
      { id: 'products.create', name: 'Create Products', description: 'Add new products to catalog', category: 'Product Management' },
      { id: 'products.edit', name: 'Edit Products', description: 'Edit product information', category: 'Product Management' },
      
      // Order Management
      { id: 'orders.view', name: 'View Orders', description: 'View customer orders', category: 'Order Management' },
      { id: 'orders.edit', name: 'Edit Orders', description: 'Update order status and information', category: 'Order Management' },
      { id: 'orders.process', name: 'Process Orders', description: 'Process and fulfill orders', category: 'Order Management' },
      
      // Financial Management (limited)
      { id: 'finance.view', name: 'View Finance', description: 'View financial reports and data', category: 'Financial Management' },
      
      // Content Moderation
      { id: 'moderation.view', name: 'View Moderation', description: 'View moderation queue and reports', category: 'Content Moderation' },
      { id: 'moderation.moderate', name: 'Moderate Content', description: 'Moderate user content and chats', category: 'Content Moderation' },
      
      // Analytics & Reports
      { id: 'analytics.view', name: 'View Analytics', description: 'View platform analytics and reports', category: 'Analytics & Reports' },
      
      // Support
      { id: 'support.view', name: 'View Support', description: 'View support tickets and requests', category: 'Support' },
      { id: 'support.respond', name: 'Respond to Support', description: 'Respond to support tickets', category: 'Support' },
    ]
  },
  {
    role: 'FREELANCER',
    permissions: [
      // Limited permissions for freelancers
      { id: 'products.view', name: 'View Products', description: 'View product catalog', category: 'Product Management' },
      { id: 'orders.view', name: 'View Orders', description: 'View customer orders', category: 'Order Management' },
    ]
  },
  {
    role: 'CLIENT',
    permissions: [
      // Very limited permissions for clients
      { id: 'products.view', name: 'View Products', description: 'View product catalog', category: 'Product Management' },
    ]
  }
];

// Helper functions
export function getUserPermissions(role: string): Permission[] {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePermissions ? rolePermissions.permissions : [];
}

export function hasPermission(userRole: string, permissionId: string): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions.some(p => p.id === permissionId);
}

export function getPermissionsByCategory(role: string): { [category: string]: Permission[] } {
  const permissions = getUserPermissions(role);
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as { [category: string]: Permission[] });
}

export function canAccessAdminDashboard(userRole: string): boolean {
  return hasPermission(userRole, 'system.view');
}

export function canManageTeam(userRole: string): boolean {
  return hasPermission(userRole, 'team.create');
}

export function canManageProducts(userRole: string): boolean {
  return hasPermission(userRole, 'products.create');
}

export function canManageOrders(userRole: string): boolean {
  return hasPermission(userRole, 'orders.process');
}

export function canModerateContent(userRole: string): boolean {
  return hasPermission(userRole, 'moderation.moderate');
}
