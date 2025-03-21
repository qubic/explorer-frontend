export type NodeInfo = {
  address: string
  port: string
  peers: string[]
  last_tick: number
  last_update: number
}

export type NetworkStatus = {
  max_tick: number
  last_update: number
  number_of_configured_nodes: number
  reliable_nodes: NodeInfo[]
  most_reliable_node: NodeInfo
}
