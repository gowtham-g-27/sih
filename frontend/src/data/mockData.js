export const DEMO_USERS = [
  {
    id: 7,
    name: 'Vikram Malhotra',
    role: 'CUSTOMER',
    email: 'vikram@gmail.com',
    phone: '9998887776',
    token: 'demo-token-customer-vikram'
  },
  {
    id: 1,
    name: 'Ramesh Kumar',
    role: 'WORKER',
    email: 'ramesh@sahakarseva.coop',
    phone: '9876543210',
    token: 'demo-token-worker-ramesh'
  },
  {
    id: 99,
    name: 'Federation Directorate',
    role: 'FEDERATION_ADMIN',
    email: 'admin@sahakarseva.coop',
    phone: '9991112220',
    token: 'demo-token-admin-federation'
  }
];

export const DEMO_SERVICES = [
  { id: 1, category: 'Electrical', name: 'Electrical & AC Diagnostics', base_rate: 350, unit: 'per hour / service' },
  { id: 2, category: 'Plumbing', name: 'Plumbing & Sanitary Systems', base_rate: 300, unit: 'per hour / tank' },
  { id: 3, category: 'Carpentry', name: 'Carpentry & Custom Woodwork', base_rate: 400, unit: 'per hour' },
  { id: 4, category: 'Painting', name: 'Wall Painting & Waterproofing', base_rate: 550, unit: 'per room' },
  { id: 5, category: 'Cleaning', name: 'Deep Sanitization & Housekeeping', base_rate: 1200, unit: 'per 2BHK' },
  { id: 6, category: 'Caregiving', name: 'Patient & Senior Care Support', base_rate: 500, unit: 'per 4 hrs' },
  { id: 7, category: 'Gardening', name: 'Landscape & Garden Maintenance', base_rate: 350, unit: 'per session' },
  { id: 8, category: 'Driving', name: 'Commercial & Chauffeur Services', base_rate: 600, unit: 'per 8 hrs' },
  { id: 9, category: 'Technician', name: 'Home Appliance & Inverter Repair', base_rate: 450, unit: 'per diagnosis' },
  { id: 10, category: 'Domestic Help', name: 'Daily Household Assistance', base_rate: 350, unit: 'per day' }
];

export const DEMO_WORKERS = [
  {
    id: 1,
    user_id: 1,
    name: 'Ramesh Kumar',
    phone: '9876543210',
    email: 'ramesh@sahakarseva.coop',
    skills: 'Electrical, AC Diagnostics',
    experience_years: 8,
    certifications: 'NSDC Level 4 Certified, Govt. ITI Gold Medalist',
    police_verification_no: 'DL-POL-VER-2024-8841',
    insurance_policy_no: 'UIIC-COOP-882910',
    insurance_status: 'ACTIVE',
    verification_status: 'VERIFIED',
    rating: 4.95,
    lat: 28.6145,
    lng: 77.2085,
    status: 'ONLINE',
    society_name: 'Delhi Skilled Artisans & Technicians Cooperative (DL/SOC/2023/881)'
  },
  {
    id: 2,
    user_id: 2,
    name: 'Suresh Patil',
    phone: '9876543211',
    email: 'suresh@sahakarseva.coop',
    skills: 'Plumbing, Water Tank Servicing',
    experience_years: 10,
    certifications: 'Skill India Certified Plumber Grade A',
    police_verification_no: 'DL-POL-VER-2024-9102',
    insurance_policy_no: 'UIIC-COOP-882911',
    insurance_status: 'ACTIVE',
    verification_status: 'VERIFIED',
    rating: 4.88,
    lat: 28.6160,
    lng: 77.2105,
    status: 'ONLINE',
    society_name: 'Delhi Skilled Artisans & Technicians Cooperative (DL/SOC/2023/881)'
  },
  {
    id: 3,
    user_id: 3,
    name: 'Sunita Devi',
    phone: '9876543212',
    email: 'sunita@sahakarseva.coop',
    skills: 'Caregiving, Patient Care Support',
    experience_years: 6,
    certifications: 'Red Cross Certified Home Health Aide',
    police_verification_no: 'DL-POL-VER-2024-7721',
    insurance_policy_no: 'UIIC-COOP-882912',
    insurance_status: 'ACTIVE',
    verification_status: 'VERIFIED',
    rating: 4.98,
    lat: 28.6120,
    lng: 77.2070,
    status: 'ONLINE',
    society_name: 'Capital Domestic & Care Services Cooperative (DL/SOC/2024/1042)'
  },
  {
    id: 4,
    user_id: 4,
    name: 'Manish Sharma',
    phone: '9876543213',
    email: 'manish@sahakarseva.coop',
    skills: 'Carpentry, Modular Woodwork',
    experience_years: 9,
    certifications: 'Master Craftsman Trade Guild certified',
    police_verification_no: 'DL-POL-VER-2024-3312',
    insurance_policy_no: 'UIIC-COOP-882913',
    insurance_status: 'ACTIVE',
    verification_status: 'VERIFIED',
    rating: 4.90,
    lat: 28.6180,
    lng: 77.2150,
    status: 'ONLINE',
    society_name: 'NCR Community Builders & Painters Cooperative (DL/SOC/2024/1108)'
  },
  {
    id: 5,
    user_id: 5,
    name: 'Pooja Verma',
    phone: '9876543214',
    email: 'pooja@sahakarseva.coop',
    skills: 'Deep Cleaning, Housekeeping',
    experience_years: 5,
    certifications: 'Eco-Friendly Chemical Hygiene Certified',
    police_verification_no: 'DL-POL-VER-2024-5509',
    insurance_policy_no: 'UIIC-COOP-882914',
    insurance_status: 'ACTIVE',
    verification_status: 'VERIFIED',
    rating: 4.85,
    lat: 28.6110,
    lng: 77.2050,
    status: 'ONLINE',
    society_name: 'Capital Domestic & Care Services Cooperative (DL/SOC/2024/1042)'
  }
];

export const DEMO_SOCIETIES = [
  { id: 1, name: 'Delhi Skilled Artisans & Technicians Cooperative', registration_no: 'DL/SOC/2023/881' },
  { id: 2, name: 'Capital Domestic & Care Services Cooperative', registration_no: 'DL/SOC/2024/1042' },
  { id: 3, name: 'NCR Community Builders & Painters Cooperative', registration_no: 'DL/SOC/2024/1108' }
];

export const DEMO_STATS = {
  total_workers: 52,
  verified_workers: 48,
  pending_verification: 4,
  active_online_workers: 38,
  total_bookings: 142,
  completed_bookings: 128,
  emergency_bookings: 14,
  total_revenue: 124500,
  worker_earnings: 118275,
  welfare_pool_balance: 6225,
  active_insurance_count: 48,
  expiring_insurance_count: 3
};

export const DEMO_FORECASTS = [
  { area: 'Connaught Place & Central Sector', service: 'Electrical & AC Diagnostics', predicted_demand: 28, recommended_allocation: 14, confidence: '96.4%' },
  { area: 'Rohini & Pitampura North', service: 'Plumbing & Sanitary Systems', predicted_demand: 22, recommended_allocation: 11, confidence: '94.8%' },
  { area: 'Saket & South Extension Hub', service: 'Deep Sanitization & Housekeeping', predicted_demand: 18, recommended_allocation: 9, confidence: '92.1%' },
  { area: 'Dwarka Sector 1-12 Sub-City', service: 'Patient & Senior Care Support', predicted_demand: 15, recommended_allocation: 8, confidence: '97.2%' }
];
