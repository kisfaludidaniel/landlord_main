export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  propertyLimit: number | "unlimited";
  aiEnabled: boolean;
  features: string[];
  description: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Ingyenes',
    price: 0,
    propertyLimit: 1,
    aiEnabled: false,
    features: [
      'Alapfunkciók',
      'Manuális adminisztráció', 
      'Bérlő kezelés',
      'Dokumentumkezelés',
      'Email támogatás'
    ],
    description: 'Alapfunkciók, manuális adminisztráció, AI nélkül.'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 4990,
    propertyLimit: 3,
    aiEnabled: true,
    features: [
      'Ingatlan kezelés',
      'Bérlő kezelés',
      'Dokumentumkezelés',
      'Automatikus számlázás',
      'Riportok',
      'AI asszisztens'
    ],
    description: 'Kis bérbeadóknak. Teljes funkcionalitás, AI nélkül.'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9900,
    propertyLimit: 10,
    aiEnabled: true,
    features: [
      'Minden Starter funkció',
      'AI asszisztens',
      'Automatikus emlékeztetők',
      'Fejlett riportok',
      'Predikciók',
      'Prioritásos támogatás'
    ],
    description: 'Kisebb portfóliót kezelőknek, automatizált és AI-asszisztens funkciókkal.'
  },
  {
    id: 'unlimited',
    name: 'Korlátlan',
    price: 34990,
    propertyLimit: "unlimited",
    aiEnabled: true,
    features: [
      'Minden Pro funkció',
      'Korlátlan ingatlan',
      'Teljes automatizálás',
      'API hozzáférés',
      'Dedikált támogatás',
      'Prioritásos support'
    ],
    description: 'Profi bérbeadóknak és cégeknek, teljes automatizálással és prioritásos supporttal.'
  }
];

// Utility functions for plan management
export const getPlanById = (id: string | null | undefined): PricingPlan | undefined => {
  if (!id) return undefined;
  return PRICING_PLANS.find(plan => plan.id === id);
};

export const formatPrice = (price: number): string => {
  if (price === 0) return '0 Ft';
  return `${price.toLocaleString('hu-HU')} Ft`;
};

export const formatPropertyLimit = (limit: number | "unlimited"): string => {
  if (limit === "unlimited") return 'korlátlan';
  return `${limit} ingatlan`;
};

export const formatAiStatus = (enabled: boolean): string => {
  return enabled ? 'AI: igen' : 'AI: nem';
};

// RBAC utility functions
export const canAddProperty = (currentPlan: PricingPlan | undefined, currentPropertyCount: number): boolean => {
  if (!currentPlan) return false;
  if (currentPlan.propertyLimit === "unlimited") return true;
  return currentPropertyCount < currentPlan.propertyLimit;
};

export const canUseAI = (currentPlan: PricingPlan | undefined): boolean => {
  if (!currentPlan) return false;
  return currentPlan.aiEnabled;
};

// Mock user plan for demonstration
export const getCurrentUserPlan = (): PricingPlan => {
  // This would normally come from user authentication/database
  return PRICING_PLANS[0]; // Default to free plan
};

export const getCurrentPropertyCount = (): number => {
  // This would normally come from database
  return 1; // Mock count
};

// Validation helper for plan parameters
export const validatePlanId = (planId: string | null | undefined): boolean => {
  if (!planId) return false;
  return PRICING_PLANS.some(plan => plan.id === planId);
};

// Safe plan getter with fallback
export const getPlanByIdSafe = (id: string | null | undefined): PricingPlan => {
  const plan = getPlanById(id);
  return plan || PRICING_PLANS[0]; // Fallback to free plan
};

function plans(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: plans is not implemented yet.', args);
  return null;
}

export { plans };