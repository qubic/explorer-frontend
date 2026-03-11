export interface User {
  id: string
  name: string
  avatar: string | null
  status: string
  privileges: string[]
  is2FAEnabled: boolean
}

export interface GetUserResponse {
  success: boolean
  token: string
  refreshToken: string
  user: User
}

export interface TickQualityResponse {
  created: string
  calculationTick: number
  epochTicksEmpty: number
  epochTicksNonEmpty: number
  last3000Empty: number
  last3000NonEmpty: number
  last10000Empty: number
  last10000NonEmpty: number
}
