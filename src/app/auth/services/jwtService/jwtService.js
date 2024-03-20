import FuseUtils from '@fuse/utils/FuseUtils';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import jwtServiceConfig from './jwtServiceConfig';

/* eslint-disable camelcase */

class JwtService extends FuseUtils.EventEmitter {
  init() {
    this.handleAuthentication();
  }

  handleAuthentication = () => {
    const access_token = this.getAccessToken();

    if (!access_token) {
      this.signInWithEmailAndPassword({
        userName: "guest@qubic.li",
        password: "guest13@Qubic.li",
        twoFactorCode: "",
      })
      this.emit('onLogin', 'access_token expired');
    } else {
      this.signInWithToken()
    }
  };

  signInWithEmailAndPassword = (data) => {
    return new Promise((resolve, reject) => {
      console.log(data)
      axios
        .post(`${jwtServiceConfig.login}`,
          data
        )
        .then((response) => {
          this.setSession(response.data.token);
          resolve(response.data.user);
          this.emit('onLogin', response.data.user);
        }).catch((error) => {
          reject(error.response.data)
        });
    });
  };

  signInWithToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .post(`${jwtServiceConfig.getUser}`,)
        .then((response) => {
          if (response.data.user) {
            this.setSession(response.data.token);
            resolve(response.data.user);
          } else {
            this.logout();
            reject(new Error('Failed to login with token.'));
          }
        })
        .catch((error) => {
          this.logout();
          reject(new Error('Failed to login with token.'));
        });
    });
  };

  logout = () => {
    this.setSession(null);
    this.emit('onLogout', 'Logged out');
  };

  setSession = (access_token) => {
    if (access_token) {
      localStorage.setItem('jwt_access_token', access_token);
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      localStorage.removeItem('jwt_access_token');
      delete axios.defaults.headers.common.Authorization;
    }
  };

  getAccessToken = () => {
    return window.localStorage.getItem('jwt_access_token');
  };
}

const instance = new JwtService();

export default instance;
