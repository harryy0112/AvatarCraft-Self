import axios from "axios";

const baseUrl =
  "https://0z2p883s10.execute-api.eu-west-3.amazonaws.com/dev/transform";

function transform(data) {
  return axios.post(baseUrl, data);
}

export { transform };
