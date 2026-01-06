
import React from 'react';
import { FoodPlan, PlanFrequency, UserRole } from './types';

export const APP_NAME = "PaySmallSmall";
export const DEVELOPER_CREDIT = "Products of DARE ADU";

export const MOCK_PLANS: FoodPlan[] = [
  {
    id: 'plan_1',
    name: 'Rice & Grains Bundle',
    category: 'Foodstuff',
    amount: 5000,
    frequency: PlanFrequency.WEEKLY,
    durationInWeeks: 12,
    imageUrl: 'https://picsum.photos/seed/rice/400/300'
  },
  {
    id: 'plan_2',
    name: 'Organic Cow Share',
    category: 'Livestock',
    amount: 25000,
    frequency: PlanFrequency.MONTHLY,
    durationInWeeks: 24,
    imageUrl: 'https://picsum.photos/seed/cow/400/300'
  },
  {
    id: 'plan_3',
    name: 'Festive Chicken Pack',
    category: 'Meat',
    amount: 3500,
    frequency: PlanFrequency.WEEKLY,
    durationInWeeks: 10,
    imageUrl: 'https://picsum.photos/seed/chicken/400/300'
  },
  {
    id: 'plan_4',
    name: 'Family Mixed Foodstuff',
    category: 'Bundle',
    amount: 15000,
    frequency: PlanFrequency.MONTHLY,
    durationInWeeks: 12,
    imageUrl: 'https://picsum.photos/seed/mixed/400/300'
  }
];

export const MOCK_USER = {
  id: 'user_001',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+234 801 234 5678',
  role: UserRole.CUSTOMER,
  avatarUrl: 'https://i.pravatar.cc/150?u=john'
};

export const MOCK_ADMIN = {
  id: 'admin_001',
  name: 'Dare Adu',
  email: 'admin@foodthrift.com',
  phone: '+234 800 000 0000',
  role: UserRole.ADMIN,
  avatarUrl: 'https://i.pravatar.cc/150?u=admin'
};
