/* eslint-disable-file @typescript-eslint/no-explicit-any */

export type ColorUtility = 'bg' | 'stroke' | 'fill' | 'text'

export const chartColors = {
  primary: {
    bg: 'bg-primary-50',
    stroke: 'stroke-primary-50',
    fill: 'fill-primary-50',
    text: 'text-primary-50'
  },
  slate: {
    bg: 'bg-slate-50',
    stroke: 'stroke-slate-50',
    fill: 'fill-slate-50',
    text: 'text-slate-50'
  },
  gray: {
    bg: 'bg-gray-50',
    stroke: 'stroke-gray-50',
    fill: 'fill-gray-50',
    text: 'text-gray-50'
  }
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string
  }
}

export type AvailableChartColorsKeys = keyof typeof chartColors

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors
) as Array<AvailableChartColorsKeys>

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[]
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>()
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length])
  })
  return categoryColors
}

export const getColorClassName = (color: AvailableChartColorsKeys, type: ColorUtility): string => {
  const fallbackColor = {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500'
  }
  return chartColors[color]?.[type] ?? fallbackColor[type]
}

// Tremor Raw getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined
) => {
  const minDomain = autoMinValue ? 'auto' : minValue ?? 0
  const maxDomain = maxValue ?? 'auto'
  return [minDomain, maxDomain]
}

// Tremor Raw hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(array: any[], keyToCheck: string): boolean {
  const val: any[] = []

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck])
      if (val.length > 1) {
        return false
      }
    }
  }

  return true
}
