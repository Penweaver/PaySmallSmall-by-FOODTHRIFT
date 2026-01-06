
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum PlanFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING'
}

export interface FoodPlan {
  id: string;
  name: string;
  description?: string;
  category: 'Foodstuff' | 'Livestock' | 'Meat' | 'Bundle' | 'Oils & Spices' | 'Sharing';
  subcategory?: string;
  numberOfSlots?: number;
  amount: number;
  frequency: PlanFrequency;
  durationInWeeks: number;
  imageUrl: string;
  deactivationReason?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  nextPaymentDate: string;
  totalPaid: number;
  totalTarget: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface LedgerTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  ref: string;
  type: 'CONTRIBUTION';
  provider: 'Paystack' | 'Flutterwave';
  planName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
}

export type AppView = 'CUSTOMER_DASHBOARD' | 'ADMIN_DASHBOARD' | 'PLAN_DETAILS' | 'SYSTEM_DESIGN' | 'AUTH' | 'EXPORT_DATA' | 'PROFILE';
