import { AppLoader } from '@app/components/ui/loaders'
import { QLI_API_ENDPOINTS } from '@app/services/qli/endpoints'
import axios from 'axios'
import { createContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext({ waitAuthCheck: false })

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [waitAuthCheck, setWaitAuthCheck] = useState(false)

  const contextValue = useMemo(() => ({ waitAuthCheck }), [waitAuthCheck])

  const loginAsGuest = async () => {
    try {
      const response = await axios.post(QLI_API_ENDPOINTS.LOGIN, {
        userName: 'guest@qubic.li',
        password: 'guest13@Qubic.li',
        twoFactorCode: ''
      })
      localStorage.setItem('jwt_access_token', response.data.token)
      setWaitAuthCheck(true)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during guest login:', error)
    }
  }

  const verifyToken = async (token: string) => {
    try {
      await axios.get(QLI_API_ENDPOINTS.TICK_OVERVIEW, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setWaitAuthCheck(true)
    } catch (error) {
      await loginAsGuest()
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('jwt_access_token')
    if (token) {
      verifyToken(token)
    } else {
      loginAsGuest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return waitAuthCheck ? (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  ) : (
    <AppLoader />
  )
}

export { AuthContext, AuthProvider }
