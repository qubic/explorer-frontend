import type { DecodedContractInput } from '@app/utils/contract-input-decoder'

import ComputorHeatmap from './ComputorHeatmap'
import DecodedInputTable from './DecodedInputTable'
import ExecutionFeeTable from './ExecutionFeeTable'
import OracleReplyCommitTable from './OracleReplyCommitTable'

type Props = Readonly<{
  decoded: DecodedContractInput & { status: 'decoded' }
}>

type VoteCounterValue = { votes: number[]; dataLock: string }
type MiningShareValue = { scores: number[]; dataLock: string }
type ExecutionFeeValue = {
  phaseNumber: number
  entries: { contractIndex: number; executionFee: string }[]
  dataLock?: string
}
type OracleReplyCommitValue = {
  items: { queryId: string; replyDigest: string; knowledgeProof: string }[]
}

const isVoteCounter = (value: unknown): value is VoteCounterValue =>
  !!value &&
  typeof value === 'object' &&
  'votes' in value &&
  Array.isArray((value as VoteCounterValue).votes)

const isMiningShare = (value: unknown): value is MiningShareValue =>
  !!value &&
  typeof value === 'object' &&
  'scores' in value &&
  Array.isArray((value as MiningShareValue).scores)

const isExecutionFee = (value: unknown): value is ExecutionFeeValue =>
  !!value &&
  typeof value === 'object' &&
  'entries' in value &&
  Array.isArray((value as ExecutionFeeValue).entries)

const isOracleReplyCommit = (value: unknown): value is OracleReplyCommitValue =>
  !!value &&
  typeof value === 'object' &&
  'items' in value &&
  Array.isArray((value as OracleReplyCommitValue).items)

export default function ProtocolInputViewer({ decoded }: Props) {
  const { value, inputType } = decoded

  // Type 1 — Vote Counter
  if (inputType === 1 && isVoteCounter(value)) {
    return <ComputorHeatmap values={value.votes} isVote dataLock={value.dataLock} />
  }

  // Type 8 — Mining Share Counter
  if (inputType === 8 && isMiningShare(value)) {
    return <ComputorHeatmap values={value.scores} isVote={false} dataLock={value.dataLock} />
  }

  // Type 9 — Execution Fee Report
  if (inputType === 9 && isExecutionFee(value)) {
    return (
      <ExecutionFeeTable
        phaseNumber={value.phaseNumber}
        entries={value.entries}
        dataLock={value.dataLock}
      />
    )
  }

  // Type 6 — Oracle Reply Commit
  if (inputType === 6 && isOracleReplyCommit(value)) {
    return <OracleReplyCommitTable items={value.items} />
  }

  // All other protocol types — use generic decoded table
  return <DecodedInputTable decoded={decoded} />
}
