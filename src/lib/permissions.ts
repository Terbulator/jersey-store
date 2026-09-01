export const PERMISSION_GROUPS: { module: string; permissions: string[] }[] = [
  { module: 'Store & Gateway', permissions: ['settings.gateway', 'settings.global'] },
  { module: 'Financial', permissions: ['reports.profit', 'reports.export', 'payouts.manage'] },
  { module: 'Staff & Roles', permissions: ['users.manage_all', 'users.create_admin'] },
  { module: 'Pricing & Discounts', permissions: ['coupons.above_cap', 'pricing.override'] },
  { module: 'Orders & Refunds', permissions: ['refunds.approve', 'orders.override'] },
  { module: 'Reseller Program', permissions: ['reseller.commission', 'reseller.floor_ceiling'] },
  { module: 'Platform', permissions: ['feature.flags', 'maintenance.mode'] },
];

export const allPermissions = PERMISSION_GROUPS.flatMap((g) => g.permissions);
