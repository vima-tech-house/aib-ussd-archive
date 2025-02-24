export interface InsurerCreationAttributes {
  name: string;
  email: string;
  display: string;
  favorite?: boolean;
  insuranceTypes: string[];
  avatar_url?: string;
  phone_number: string;
  address?: string;
  contact_person: string;
  is_active?: boolean;
}