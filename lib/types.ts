export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Profile = {
  id: string;
  telegram_user_id: string;
  telegram_chat_id: string | null;
  display_name: string | null;
  timezone: string;
  reminder_time: string;
  goal_text: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyReport = {
  id: string;
  profile_id: string;
  report_date: string;
  water_glasses: number;
  breakfast_tags: string[];
  breakfast_note: string | null;
  lunch_tags: string[];
  lunch_note: string | null;
  dinner_tags: string[];
  dinner_note: string | null;
  snacks_tags: string[];
  snacks_note: string | null;
  activity_tags: string[];
  walking_minutes: number;
  steps: number | null;
  running_minutes: number;
  home_workout_minutes: number;
  energy_level: number | null;
  evening_hunger: number | null;
  bloating_or_heaviness: boolean;
  heat_or_dehydration_feeling: boolean;
  difficulties_note: string | null;
  weight_snapshot: number | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

export type WeightLog = {
  id: string;
  profile_id: string;
  log_date: string;
  weight_kg: number;
  note: string | null;
  created_at: string;
};

export type FeedbackPayload = {
  what_good: string[];
  what_to_improve: string[];
  change_tomorrow: string[];
  tomorrow_plan: {
    food: string[];
    water: string[];
    movement: string[];
    focus: string;
  };
  risk_flags: {
    low_protein: boolean;
    low_hydration: boolean;
    high_fried_food: boolean;
    high_sugary_drinks: boolean;
    low_activity: boolean;
  };
};

export type AiFeedback = {
  id: string;
  report_id: string;
  profile_id: string;
  model: string | null;
  what_good: string[];
  what_to_improve: string[];
  change_tomorrow: string[];
  tomorrow_plan: FeedbackPayload["tomorrow_plan"];
  risk_flags: FeedbackPayload["risk_flags"];
  raw_response: Json | null;
  created_at: string;
};
