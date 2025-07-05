export interface Interests {
  id?: number;
  interest_name?: string;
  color?: string;
}

export interface InterestsResponse {
  success?: boolean;
  interest?: Interests;
}

export interface Goals {
  id?: number;
  users_id?: number;
  users_interests_id?: number;
  goals_name?: string;
  description?: string;
  hours_per_week?: number;
}

export interface GoalsResponse {
  success?: boolean;
  goal?: Goals;
}

export interface Availability {
  id?: number;
  users_id?: number;
  weekday?: number | undefined;
  start_time?: string;
  end_time?: string;
}
