import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import jwtServiceConfig from './jwtServiceConfig';

const AuthContext = React.createContext();

function AuthProvider({ children }) {

  const [waitAuthCheck, setWaitAuthCheck] = useState(false)

  useEffect(() => {

    axios.defaults.baseURL = "http://localhost:7003";
    axios.defaults.headers.common.Authorization =`Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJJZCI6ImEzMzJiZTZmLTdkNGMtNDk4Ny05ZjBiLWJlODAzMGE5MmIwZCIsInN1YiI6Imd1ZXN0QHF1YmljLmxpIiwianRpIjoiM2MwNmM2ZDgtNzQ4My00ODRiLWI1NmMtOTBjMDZlMTUzODcxIiwiUHVibGljIjoiIiwibmJmIjoxNzEwOTY1ODU0LCJleHAiOjE3MTEwNTIyNTQsImlhdCI6MTcxMDk2NTg1NCwiaXNzIjoiaHR0cHM6Ly9xdWJpYy5saS8iLCJhdWQiOiJodHRwczovL3F1YmljLmxpLyJ9.tCvBqauAT1wM7nXPm_xPRDyq3N_3HbvVZMTX3SAFrJOCTcRYkKXP6ipLX5rsgGFQnhh9ci9l8z48Fu0rTmLIkA`
    setWaitAuthCheck(true)
    
    // axios.post(`${jwtServiceConfig.login}`,
    //   {
    //     userName: "guest@qubic.li",
    //     password: "guest13@Qubic.li",
    //     twoFactorCode: "",
    //   }
    // ).then((response) => {
    //   axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
    // })
    //   .then(() => {
    //     console.log(axios.defaults.headers.common.Authorization)
    //     setWaitAuthCheck(true)
    //   }
    //   )
    //   .catch((error) => {
    //     console.log(error)
    //   })

  }, []);

  return waitAuthCheck ? (
    <AuthContext.Provider value={{ waitAuthCheck }}>{children}</AuthContext.Provider>
  ) : (
    <FuseSplashScreen />
  );
}

export default AuthProvider;
