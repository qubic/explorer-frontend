import { CardItem } from '@app/pages/network/components'
import type { NodeInfo } from '@app/store/apis/testnet-qubic-rpc-v1'
import NodeInfoCard from './NodeInfoCard'

type Props = {
  data: {
    max_tick: number
    last_update: number
    number_of_configured_nodes: number
    reliable_nodes: NodeInfo[]
    most_reliable_node: NodeInfo
  }
}

export default function NetworkStatusCard({ data }: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-20 rounded-2xl p-6 shadow-lg">
      <CardItem className="space-y-6 p-10">
        <h2 className="text-xl font-bold">Network Overview</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Max Tick:</strong> {data.max_tick}
          </div>
          <div>
            <strong>Last Update:</strong> {new Date(data.last_update * 1000).toLocaleString()}
          </div>
          <div>
            <strong>Configured Nodes:</strong> {data.number_of_configured_nodes}
          </div>
        </div>
      </CardItem>

      <CardItem className="space-y-6 p-16">
        <h3 className="mb-2 text-lg font-semibold">Most Reliable Node</h3>
        <NodeInfoCard node={data.most_reliable_node} highlight />
      </CardItem>

      <CardItem className="space-y-6 p-16">
        <h3 className="mb-2 text-lg font-semibold">Reliable Nodes</h3>
        <div className="flex flex-wrap gap-4 md:grid-cols-2">
          {data.reliable_nodes.map((node) => (
            <NodeInfoCard key={node.address} node={node} />
          ))}
        </div>
      </CardItem>
    </div>
  )
}
