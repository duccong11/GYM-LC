import type { GymData } from '../utils/gym';
import type { Promotion } from '../components/PromotionQuote';
import type { Service, TrainerService } from '../components/Services';
import type { Row } from '../components/Management';
export type Extended = GymData & {
  promotions: (Promotion & Row)[];
  services: Service[];
  trainerServices: TrainerService[];
  users: Row[];
  rooms: Row[];
  equipment: Row[];
  trainers: Row[];
  staffCount: number;
};
export const empty: Extended = {
  promotions: [],
  services: [],
  trainerServices: [],
  members: [],
  plans: [],
  payments: [],
  checkins: [],
  today: '',
  users: [],
  rooms: [],
  trainers: [],
  equipment: [],
  staffCount: 0,
};
