import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';

const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [waitAuthCheck, setWaitAuthCheck] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('jwt_access_token');

    if (token) {
      axios
        .get(`${process.env.REACT_APP_QLI_URL}/Network/TickOverview?epoch=&offset=0`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((resp) => {
          setWaitAuthCheck(true);
        })
        .catch((error) => {
          axios
            .post(
              `${process.env.REACT_APP_QLI_URL}/Auth/Login`,
              {
                userName: 'guest@qubic.li',
                password: 'guest13@Qubic.li',
                twoFactorCode: '',
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((response) => {
              localStorage.setItem('jwt_access_token', response.data.token);
            })
            .then(() => {
              setWaitAuthCheck(true);
            })
            .catch((err) => {
              console.log(err);
            });
        });
    } else {
      axios
        .post(`${process.env.REACT_APP_QLI_URL}/Auth/Login`, {
          userName: 'guest@qubic.li',
          password: 'guest13@Qubic.li',
          twoFactorCode: '',
        })
        .then((response) => {
          localStorage.setItem('jwt_access_token', response.data.token);
        })
        .then(() => {
          setWaitAuthCheck(true);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  return waitAuthCheck ? (
    <AuthContext.Provider value={{ waitAuthCheck }}>{children}</AuthContext.Provider>
  ) : (
    <FuseSplashScreen />
  );
}

export default AuthProvider;
