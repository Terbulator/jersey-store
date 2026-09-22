import {
  LayoutDashboard,
  Package,
  Layers,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  Star,
  Home,
  LayoutTemplate,
  Image as ImageIcon,
  Megaphone,
  TicketPercent,
  BadgePercent,
  BarChart3,
  TrendingUp,
  Truck,
  CreditCard,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    title: 'Store',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Collections', href: '/admin/collections', icon: Layers },
      { label: 'Categories', href: '/admin/categories', icon: Tags },
      { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    ],
  },
  {
    title: 'Orders',
    items: [
      { label: 'All Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Pending', href: '/admin/orders?status=PENDING', icon: ShoppingCart },
      { label: 'Processing', href: '/admin/orders?status=PROCESSING', icon: ShoppingCart },
      { label: 'Delivered', href: '/admin/orders?status=DELIVERED', icon: ShoppingCart },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    title: 'Website',
    items: [
      { label: 'Homepage', href: '/admin/homepage', icon: Home },
      { label: 'Homepage Sections', href: '/admin/homepage-sections', icon: LayoutTemplate },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Promotional Slides', href: '/admin/promo-slides', icon: Megaphone },
      { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { label: 'Navigation', href: '/admin/navigation', icon: LayoutTemplate },
      { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
      { label: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
      { label: 'Offers', href: '/admin/offers', icon: BadgePercent },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Overview', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Sales', href: '/admin/analytics?view=sales', icon: TrendingUp },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Shipping', href: '/admin/shipping', icon: Truck },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Admin Users', href: '/admin/admin-users', icon: Shield },
    ],
  },
];

export const ADMIN_TOKEN = {
  bg: '#080808',
  sidebar: '#0D0D0D',
  card: '#111111',
  surface: '#171717',
  border: '#292929',
  text: '#EFECE6',
  secondary: '#A8A8A8',
  muted: '#666666',
  accent: '#B3001B',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#60A5FA',
} as const;