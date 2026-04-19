export interface IInspection {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  serviceType?: string; // Optional field
  notes?: string;       // Optional field
  scheduledDate: string; // From step 1 of the UI (e.g., "2026-04-21")
  scheduledTime: string; // From step 2 of the UI (e.g., "10:30 AM CDT")
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'; // For your Admin dashboard
  sender: 'DFW_ESTIMATE' | 'ABILENE_INSPECTION'; // To track which page it came from
}