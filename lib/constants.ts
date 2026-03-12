export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
export const DEFAULT_REMINDER_TIME = "21:00";

export const MEAL_TAGS = [
  "eggs",
  "chicken",
  "fish",
  "seafood",
  "tofu",
  "rice",
  "noodles",
  "soup",
  "vegetables",
  "fruit",
  "yogurt",
  "sweet drink",
  "fried food",
  "street food",
  "coffee",
  "milk tea",
  "dessert"
] as const;

export const ACTIVITY_TAGS = [
  "walk",
  "run",
  "stretching",
  "strength_home",
  "mobility",
  "rest_day"
] as const;

export const TAG_LABELS: Record<string, string> = {
  eggs: "Яйца",
  chicken: "Курица",
  fish: "Рыба",
  seafood: "Морепродукты",
  tofu: "Тофу",
  rice: "Рис",
  noodles: "Лапша",
  soup: "Суп",
  vegetables: "Овощи",
  fruit: "Фрукты",
  yogurt: "Йогурт",
  "sweet drink": "Сладкий напиток",
  "fried food": "Жареное",
  "street food": "Стритфуд",
  coffee: "Кофе",
  "milk tea": "Милк-ти",
  dessert: "Десерт",
  walk: "Ходьба",
  run: "Бег",
  stretching: "Растяжка",
  strength_home: "Домашняя силовая",
  mobility: "Мобилити",
  rest_day: "День отдыха"
};
