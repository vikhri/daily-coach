import { serverEnv } from "@/lib/env.server";
import { aiFeedbackSchema, type AiFeedbackValues } from "@/lib/schemas";
import type { DailyReport, Profile, WeightLog } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

type AnalyzeInput = {
  profile: Profile;
  currentReport: Record<string, unknown>;
  latestWeight: WeightLog | null;
  recentReports: DailyReport[];
};

function buildPrompt(input: AnalyzeInput) {
  return [
    "Ты поддерживающий AI-коуч по питанию и активности.",
    "Цель: помочь пользователю безопасно снизить вес на 2-3 кг за 1-2 месяца.",
    "Контекст: пользователь живет во Вьетнаме, климат жаркий и влажный, возможны уличная еда, прогулки, бег и домашние тренировки.",
    "Никогда не стыди пользователя. Давай короткие, практичные и мягкие рекомендации.",
    "Уделяй внимание гидратации, когда это уместно.",
    "Отвечай строго JSON-объектом по заданной схеме.",
    "",
    JSON.stringify(input, null, 2)
  ].join("\n");
}

function extractTextOutput(response: Record<string, unknown>) {
  const output = response.output;
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (
      item &&
      typeof item === "object" &&
      "content" in item &&
      Array.isArray((item as { content?: unknown[] }).content)
    ) {
      for (const block of (item as { content: unknown[] }).content) {
        if (
          block &&
          typeof block === "object" &&
          "text" in block &&
          typeof (block as { text?: unknown }).text === "string"
        ) {
          return (block as { text: string }).text;
        }
      }
    }
  }

  return null;
}

export async function analyzeReport(input: AnalyzeInput): Promise<AiFeedbackValues> {
  if (!serverEnv.OPENAI_API_KEY) {
    return buildFallbackAnalysis(input);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: buildPrompt(input),
      text: {
        format: {
          type: "json_schema",
          name: "daily_coach_feedback",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              what_good: { type: "array", items: { type: "string" } },
              what_to_improve: { type: "array", items: { type: "string" } },
              change_tomorrow: { type: "array", items: { type: "string" } },
              tomorrow_plan: {
                type: "object",
                additionalProperties: false,
                properties: {
                  food: { type: "array", items: { type: "string" } },
                  water: { type: "array", items: { type: "string" } },
                  movement: { type: "array", items: { type: "string" } },
                  focus: { type: "string" }
                },
                required: ["food", "water", "movement", "focus"]
              },
              risk_flags: {
                type: "object",
                additionalProperties: false,
                properties: {
                  low_protein: { type: "boolean" },
                  low_hydration: { type: "boolean" },
                  high_fried_food: { type: "boolean" },
                  high_sugary_drinks: { type: "boolean" },
                  low_activity: { type: "boolean" }
                },
                required: [
                  "low_protein",
                  "low_hydration",
                  "high_fried_food",
                  "high_sugary_drinks",
                  "low_activity"
                ]
              }
            },
            required: [
              "what_good",
              "what_to_improve",
              "change_tomorrow",
              "tomorrow_plan",
              "risk_flags"
            ]
          }
        }
      }
    })
  });

  if (!response.ok) {
    return buildFallbackAnalysis(input);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const outputText = extractTextOutput(raw);
  const parsed = outputText ? safeJsonParse<AiFeedbackValues>(outputText) : null;

  if (!parsed) {
    return buildFallbackAnalysis(input);
  }

  return aiFeedbackSchema.parse(parsed);
}

export function buildFallbackAnalysis(input: AnalyzeInput): AiFeedbackValues {
  const report = input.currentReport as {
    water_glasses?: number;
    walking_minutes?: number;
    running_minutes?: number;
    home_workout_minutes?: number;
  };

  const lowHydration = (report.water_glasses ?? 0) < 5;
  const activityTotal =
    (report.walking_minutes ?? 0) +
    (report.running_minutes ?? 0) +
    (report.home_workout_minutes ?? 0);

  return {
    what_good: [
      "Ты продолжаешь вести отчет, а это уже сильная база для снижения веса.",
      input.latestWeight
        ? `Есть актуальный вес в контексте: ${input.latestWeight.weight_kg} кг.`
        : "Можно добавить вес, чтобы советы стали точнее."
    ],
    what_to_improve: [
      lowHydration
        ? "Воды было маловато, особенно для жаркого и влажного климата."
        : "Гидратация выглядит неплохо, важно сохранить этот уровень.",
      activityTotal < 30
        ? "Движения сегодня маловато для цели жиросжигания."
        : "Старайся держать движение регулярным и распределять его по неделе."
    ],
    change_tomorrow: [
      "Добавь один более белковый прием пищи: яйца, курицу, рыбу, тофу или йогурт.",
      "Заранее запланируй воду на первую половину дня.",
      "Сделай короткую прогулку 20-30 минут после еды или вечером."
    ],
    tomorrow_plan: {
      food: [
        "В каждом основном приеме пищи оставь источник белка и овощи.",
        "Если выбираешь стритфуд, уменьши сладкие напитки и жареные блюда."
      ],
      water: [
        "Начни день со стакана воды.",
        "Ориентир на завтра: 6-8 стаканов, больше при жаре и прогулках."
      ],
      movement: [
        "Ходьба 25-35 минут в удобном темпе.",
        "Если есть силы, добавь 10-15 минут домашней тренировки."
      ],
      focus: "Завтра цель не в идеальности, а в 1-2 маленьких улучшениях."
    },
    risk_flags: {
      low_protein: false,
      low_hydration: lowHydration,
      high_fried_food: false,
      high_sugary_drinks: false,
      low_activity: activityTotal < 30
    }
  };
}
