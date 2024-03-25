import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import jwtServiceConfig from './jwtServiceConfig';

const AuthContext = React.createContext();

function AuthProvider({ children }) {

  const [waitAuthCheck, setWaitAuthCheck] = useState(false)

  useEffect(() => {

    axios.defaults.baseURL = process.env.REACT_APP_API_URL;

    const token = window.localStorage.getItem('jwt_access_token');

    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      axios.get(`/Network/TickOverview?epoch=&offset=0`)
        .then((resp) => {
          setWaitAuthCheck(true)
        })
        .catch((error) => {
          axios.post(`${jwtServiceConfig.login}`,
            {
              userName: "guest@qubic.li",
              password: "guest13@Qubic.li",
              twoFactorCode: "",
            }
          ).then((response) => {
            localStorage.setItem('jwt_access_token', response.data.token);
            axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
          })
            .then(() => {
              setWaitAuthCheck(true)
            })
            .catch((err) => {
              console.log(err)
            })
        })
    } else {
      axios.post(`${jwtServiceConfig.login}`,
        {
          userName: "guest@qubic.li",
          password: "guest13@Qubic.li",
          twoFactorCode: "",
        }
      ).then((response) => {
        localStorage.setItem('jwt_access_token', response.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
      })
        .then(() => {
          console.log(axios.defaults.headers.common.Authorization)
          setWaitAuthCheck(true)
        })
        .catch((error) => {
          console.log(error)
        })
    }

  }, []);

  return waitAuthCheck ? (
    <AuthContext.Provider value={{ waitAuthCheck }}>{children}</AuthContext.Provider>
  ) : (
    <FuseSplashScreen />
  );
}

export default AuthProvider;
