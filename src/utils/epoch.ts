import type { ProcessedTickInterval } from '@app/store/apis/query-service'

interface EpochRange {
  epoch: number
  minFirstTick: number
  maxLastTick: number
}

export function getEpochForTick(
  intervals: ProcessedTickInterval[],
  tickNumber: number
): number | undefined {
  const epochRanges = intervals.reduce<Record<number, EpochRange>>((acc, interval) => {
    const existing = acc[interval.epoch]
    return {
      ...acc,
      [interval.epoch]: existing
        ? {
            epoch: interval.epoch,
            minFirstTick: Math.min(existing.minFirstTick, interval.firstTick),
            maxLastTick: Math.max(existing.maxLastTick, interval.lastTick)
          }
        : {
            epoch: interval.epoch,
            minFirstTick: interval.firstTick,
            maxLastTick: interval.lastTick
          }
    }
  }, {})

  const sortedRanges = Object.values(epochRanges).sort((a, b) => a.epoch - b.epoch)

  const match = sortedRanges.find(
    (range) => tickNumber >= range.minFirstTick && tickNumber <= range.maxLastTick
  )

  if (match) return match.epoch

  // If the tick falls in a gap between two epochs (e.g. last ticks of an epoch
  // not covered by the intervals), attribute it to the earlier epoch
  const gapMatch = sortedRanges.find(
    (range, index) =>
      index < sortedRanges.length - 1 &&
      tickNumber > range.maxLastTick &&
      tickNumber < sortedRanges[index + 1].minFirstTick
  )

  if (gapMatch) return gapMatch.epoch

  // If the tick is beyond all known intervals, assume it belongs to the latest epoch
  const lastRange = sortedRanges[sortedRanges.length - 1]
  if (lastRange && tickNumber > lastRange.maxLastTick) return lastRange.epoch

  return undefined
}
