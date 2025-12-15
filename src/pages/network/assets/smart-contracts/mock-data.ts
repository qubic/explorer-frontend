// Mock data for fee reserve prototype
// This simulates the data that would come from the API

export type FeeReserveEvent = {
  id: string
  type: 'burn' | 'deduction'
  amount: number
  tick: number
  epoch: number
  timestamp: string
}

export type DailySnapshot = {
  date: string
  balance: number
  inflows: number
  outflows: number
}

export type EpochStats = {
  epoch: number
  startBalance: number
  endBalance: number
  totalInflows: number
  totalOutflows: number
  netChange: number
}

export type FeeReserveData = {
  currentBalance: number
  currentEpoch: number
  epochStartBalance: number
  totalBurned: number
  totalDeducted: number
  dailySnapshots: DailySnapshot[]
  epochStats: EpochStats[]
  recentEvents: FeeReserveEvent[]
}

// Generate mock daily snapshots for the last 90 days
const generateDailySnapshots = (): DailySnapshot[] => {
  const snapshots: DailySnapshot[] = []
  let balance = 50000000 // Starting balance
  const today = new Date()

  for (let i = 89; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const inflows = Math.floor(Math.random() * 500000) + 100000
    const outflows = Math.floor(Math.random() * 400000) + 50000
    balance = balance + inflows - outflows

    snapshots.push({
      date: date.toISOString().split('T')[0],
      balance,
      inflows,
      outflows
    })
  }

  return snapshots
}

// Generate mock epoch statistics (20 epochs for pagination demo)
const generateEpochStats = (): EpochStats[] => {
  const stats: EpochStats[] = []
  let balance = 45000000

  for (let epoch = 172; epoch <= 191; epoch += 1) {
    const inflows = Math.floor(Math.random() * 3000000) + 1000000
    const outflows = Math.floor(Math.random() * 2500000) + 500000
    const endBalance = balance + inflows - outflows

    stats.push({
      epoch,
      startBalance: balance,
      endBalance,
      totalInflows: inflows,
      totalOutflows: outflows,
      netChange: inflows - outflows
    })

    balance = endBalance
  }

  return stats
}

// Generate mock recent events
const generateRecentEvents = (): FeeReserveEvent[] => {
  const events: FeeReserveEvent[] = []
  const baseTimestamp = Date.now()

  for (let i = 0; i < 20; i += 1) {
    const isBurn = Math.random() > 0.4
    events.push({
      id: `event-${i}`,
      type: isBurn ? 'burn' : 'deduction',
      amount: isBurn
        ? Math.floor(Math.random() * 100000) + 10000
        : Math.floor(Math.random() * 50000) + 5000,
      tick: 18500000 - i * 100,
      epoch: 191,
      timestamp: new Date(baseTimestamp - i * 3600000).toISOString()
    })
  }

  return events
}

// Mock data for different smart contracts
export const MOCK_FEE_RESERVES: Record<string, FeeReserveData> = {
  // QX Contract
  BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARMID: {
    currentBalance: 58234567,
    currentEpoch: 191,
    epochStartBalance: 55000000,
    totalBurned: 125000000,
    totalDeducted: 85000000,
    dailySnapshots: generateDailySnapshots(),
    epochStats: generateEpochStats(),
    recentEvents: generateRecentEvents()
  },
  // QUTIL Contract
  EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVWRF: {
    currentBalance: 12450000,
    currentEpoch: 191,
    epochStartBalance: 11800000,
    totalBurned: 45000000,
    totalDeducted: 32000000,
    dailySnapshots: generateDailySnapshots(),
    epochStats: generateEpochStats(),
    recentEvents: generateRecentEvents()
  },
  // Random Contract (default for unknown addresses)
  DEFAULT: {
    currentBalance: 5000000,
    currentEpoch: 191,
    epochStartBalance: 4800000,
    totalBurned: 15000000,
    totalDeducted: 10000000,
    dailySnapshots: generateDailySnapshots(),
    epochStats: generateEpochStats(),
    recentEvents: generateRecentEvents()
  }
}

export const getMockFeeReserveData = (address: string): FeeReserveData => {
  return MOCK_FEE_RESERVES[address] || MOCK_FEE_RESERVES.DEFAULT
}
