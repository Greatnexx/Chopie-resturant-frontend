// Color theme utility for dynamic color management
export const colorTheme = {
  // Default theme colors
  primary: '#ef4444',
  secondary: '#f97316', 
  accent: '#10b981',
  background: '#ffffff',
  surface: '#f9fafb',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Status colors
  status: {
    pending: '#f59e0b',
    accepted: '#3b82f6', 
    preparing: '#f97316',
    completed: '#10b981',
    cancelled: '#ef4444'
  },
  
  // VIP colors
  vip: {
    primary: '#fbbf24',
    secondary: '#92400e',
    background: '#fef3c7',
    border: '#fcd34d'
  },
  
  // Regular customer colors
  regular: {
    primary: '#3b82f6',
    secondary: '#1e40af', 
    background: '#dbeafe',
    border: '#93c5fd'
  },
  
  // Utility colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Function to apply theme colors to CSS variables
export const applyTheme = (theme = colorTheme) => {
  const root = document.documentElement;
  
  // Apply main colors
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--secondary-color', theme.secondary);
  root.style.setProperty('--accent-color', theme.accent);
  root.style.setProperty('--background-color', theme.background);
  root.style.setProperty('--surface-color', theme.surface);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--border-color', theme.border);
  root.style.setProperty('--border-light', theme.borderLight);
  
  // Apply status colors
  root.style.setProperty('--status-pending', theme.status.pending);
  root.style.setProperty('--status-accepted', theme.status.accepted);
  root.style.setProperty('--status-preparing', theme.status.preparing);
  root.style.setProperty('--status-completed', theme.status.completed);
  root.style.setProperty('--status-cancelled', theme.status.cancelled);
  
  // Apply VIP colors
  root.style.setProperty('--vip-primary', theme.vip.primary);
  root.style.setProperty('--vip-secondary', theme.vip.secondary);
  root.style.setProperty('--vip-background', theme.vip.background);
  root.style.setProperty('--vip-border', theme.vip.border);
  
  // Apply regular colors
  root.style.setProperty('--regular-primary', theme.regular.primary);
  root.style.setProperty('--regular-secondary', theme.regular.secondary);
  root.style.setProperty('--regular-background', theme.regular.background);
  root.style.setProperty('--regular-border', theme.regular.border);
  
  // Apply utility colors
  root.style.setProperty('--success-color', theme.success);
  root.style.setProperty('--warning-color', theme.warning);
  root.style.setProperty('--error-color', theme.error);
  root.style.setProperty('--info-color', theme.info);
  
  // Apply gradient colors
  root.style.setProperty('--gradient-start', theme.primary);
  root.style.setProperty('--gradient-end', theme.secondary);
};

// Function to get status color
export const getStatusColor = (status) => {
  const colors = {
    pending: 'var(--status-pending)',
    accepted: 'var(--status-accepted)', 
    preparing: 'var(--status-preparing)',
    completed: 'var(--status-completed)',
    cancelled: 'var(--status-cancelled)'
  };
  return colors[status] || 'var(--text-muted)';
};

// Function to get status background classes
export const getStatusBgClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-orange-100 text-orange-800 border-orange-200', 
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Function to create custom theme from branding
export const createThemeFromBranding = (branding) => {
  if (!branding) return colorTheme;
  
  return {
    ...colorTheme,
    primary: branding.primaryColor || colorTheme.primary,
    secondary: branding.secondaryColor || colorTheme.secondary,
    accent: branding.accentColor || colorTheme.accent
  };
};

export default colorTheme;