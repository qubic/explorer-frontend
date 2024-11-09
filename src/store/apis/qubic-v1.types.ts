export interface GetEpochTicksArgs {
  epoch: number
  pageSize: number
  page: number
}

export interface GetEpochTicksResponse {
  pagination: {
    totalRecords: number
    currentPage: number
    totalPages: number
    pageSize: number
    nextPage: number
    previousPage: number
  }
  ticks: { tickNumber: number; isEmpty: boolean }[]
}
