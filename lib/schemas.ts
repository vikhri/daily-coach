import { z } from "zod";
import { ACTIVITY_TAGS, DEFAULT_REMINDER_TIME, DEFAULT_TIMEZONE, MEAL_TAGS } from "@/lib/constants";

const mealTags = z.array(z.enum(MEAL_TAGS)).default([]);
const activityTags = z.array(z.enum(ACTIVITY_TAGS)).default([]);

export const telegramAuthSchema = z.object({
  initData: z.string().min(1)
});

export const profileSettingsSchema = z.object({
  timezone: z.string().default(DEFAULT_TIMEZONE),
  reminder_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default(DEFAULT_REMINDER_TIME),
  goal_text: z.string().max(500).nullable().optional()
});

export const weightLogSchema = z.object({
  log_date: z.string().date(),
  weight_kg: z.coerce.number().min(20).max(400),
  note: z.string().max(240).nullable().optional()
});

export const reportFormSchema = z.object({
  report_date: z.string().date(),
  water_glasses: z.coerce.number().int().min(0).max(30).default(0),
  breakfast_tags: mealTags,
  breakfast_note: z.string().max(500).nullable().optional(),
  lunch_tags: mealTags,
  lunch_note: z.string().max(500).nullable().optional(),
  dinner_tags: mealTags,
  dinner_note: z.string().max(500).nullable().optional(),
  snacks_tags: mealTags,
  snacks_note: z.string().max(500).nullable().optional(),
  activity_tags: activityTags,
  walking_minutes: z.coerce.number().int().min(0).max(600).default(0),
  steps: z.coerce.number().int().min(0).max(100000).nullable().optional(),
  running_minutes: z.coerce.number().int().min(0).max(300).default(0),
  home_workout_minutes: z.coerce.number().int().min(0).max(300).default(0),
  energy_level: z.coerce.number().int().min(1).max(5).nullable().optional(),
  evening_hunger: z.coerce.number().int().min(1).max(10).nullable().optional(),
  bloating_or_heaviness: z.boolean().default(false),
  heat_or_dehydration_feeling: z.boolean().default(false),
  difficulties_note: z.string().max(500).nullable().optional()
});

export const aiFeedbackSchema = z.object({
  what_good: z.array(z.string()),
  what_to_improve: z.array(z.string()),
  change_tomorrow: z.array(z.string()),
  tomorrow_plan: z.object({
    food: z.array(z.string()),
    water: z.array(z.string()),
    movement: z.array(z.string()),
    focus: z.string()
  }),
  risk_flags: z.object({
    low_protein: z.boolean(),
    low_hydration: z.boolean(),
    high_fried_food: z.boolean(),
    high_sugary_drinks: z.boolean(),
    low_activity: z.boolean()
  })
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
export type WeightLogValues = z.infer<typeof weightLogSchema>;
export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
export type AiFeedbackValues = z.infer<typeof aiFeedbackSchema>;
