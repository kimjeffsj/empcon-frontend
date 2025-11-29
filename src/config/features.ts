/**
 * Features list for Empcon MVP
 *
 * Controls which features are visible in the navigation menu.
 * Hidden features are still accessible via direct URL for testing
 *
 */

export const FEATURES = {
  EMPLOYEES: true,
  DEPARTMENTS: true,
  SCHEDULES: true,
  TIMECLOCKS: false,
  LEAVES: false,
  PAYROLL: false,
  REPORTS: false,
} as const;

/**
 * Type for feature keys
 */
export type FeatureKey = keyof typeof FEATURES;

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureKey): boolean => {
  return FEATURES[feature];
};

/**
 * Helper type for menu items
 */

export interface FeatureMenuItem {
  href: string;
  label: string;
  icon: any;
  feature?: FeatureKey;
}
