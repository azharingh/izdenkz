export const ARTICLE_CATEGORIES = {
  lessons: "Өмір сабақтары",
  facts: "Қызық фактілер",
  news: "Жаңалықтар",
} as const

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES

export const ARTICLE_FILTER_CATEGORIES = {
  all: "Барлығы",
  ...ARTICLE_CATEGORIES,
} as const
