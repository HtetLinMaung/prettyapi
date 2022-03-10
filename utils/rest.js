const axios = require("axios");
const prefix = `${process.env.server}/pretty-api-server`;

const rest = {
  get: async (url, params = {}, headers = {}) => {
    try {
      const res = await axios.get(`${prefix}${url}`, {
        params: params,
        headers,
      });
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },
  post: async (url, body = {}, headers = {}) => {
    try {
      const res = await axios.post(`${prefix}${url}`, body, { headers });
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },
  put: async (url, body = {}, headers = {}) => {
    try {
      const res = await axios.put(`${prefix}${url}`, body, { headers });
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  },
};

module.exports = rest;
