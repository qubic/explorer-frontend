import type { NodeInfo } from '@app/store/apis/testnet-qubic-rpc-v1'

type NodeProps = {
  node: NodeInfo
  highlight?: boolean
}

export default function NodeCard({ node, highlight = false }: NodeProps) {
  return (
    <div
      className={`space-y-2 rounded-xl p-4 ${
        highlight
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <div className={`font-medium ${highlight ? 'text-[#D2FDD1]' : 'text-gray-500'}`}>
        {node.address}:{node.port}
      </div>
      <div className="text-sm text-muted-foreground">
        <strong>Last Tick:</strong> {node.last_tick}
      </div>
      <div className="text-sm text-muted-foreground">
        <strong>Last Update:</strong> {new Date(node.last_update * 1000).toLocaleString()}
      </div>
      <div className="flex space-x-16">
        <strong className="text-sm text-gray-700">Peers:</strong>
        <ul className="ml-5 flex list-disc flex-wrap gap-x-20 text-sm text-muted-foreground">
          {node.peers.map((peer) => (
            <li key={peer}>{peer}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
