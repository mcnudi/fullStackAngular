export interface Activity {
  id: number;
  routines_versions_id: number;
  title: string;
  description?: string;
  activity_categories_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}
