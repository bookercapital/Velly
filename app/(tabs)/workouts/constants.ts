export const CATEGORIES = ['push', 'pull', 'legs', 'core', 'cardio', 'other'] as const
export const UNITS = ['lb', 'kg', 'bodyweight'] as const

export type Category = (typeof CATEGORIES)[number]
export type Unit = (typeof UNITS)[number]
