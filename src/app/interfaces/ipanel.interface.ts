export interface Interests {
  id?: number;
  interest_name?: string;
  color?: string;
}

export interface Goals {
  id?: number;
  users_id?: number;
  interest_id?: number;
  goals_name?: string;
  description?: string;
  hours_per_week?: number;
}

export interface Availability {
  id?: number;
  users_id?: number;
  weekday?: number;
  start_time?: string;
  end_time?: string;
}