import axios from "axios";

const subscribe = async (options = {}) => {
  try {
    const { url, access_key, password } = options;
    const { data } = await axios.post(url, { access_key, password });
    const token = data.token;
    return {
      logEvent: (event, body = {}) => {
        for (const key of ["userid", "username", "message"]) {
          if (!body.hasOwnProperty(key)) {
            body[key] = "";
          }
        }
        body["token"] = token;
        body["event"] = event;
        body["device"] = "browser";
        body["screen"] = {
          name: document.title,
          width: window.screen.width,
          height: window.screen.height,
        };
      },
    };
  } catch (err) {
    console.log(err);
  }
};
