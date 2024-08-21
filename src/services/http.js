import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

class HttpService {
  constructor() {
    this.baseURL = "https://api-web.tomarket.ai/tomarket-game/v1/";
    this.headers = {
      host: "api-web.tomarket.ai",
      connection: "keep-alive",
      accept: "application/json, text/plain, */*",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      "content-type": "application/json",
      origin: "https://mini-app.tomarket.ai",
      "x-requested-with": "tw.nekomimi.nekogram",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://mini-app.tomarket.ai/",
      "accept-language": "en-US,en;q=0.9",
    };
  }

  initConfig(token, proxy) {
    const headers = {
      ...this.headers,
    };
    if (token) {
      headers["authorization"] = token;
    }
    const config = {
      headers,
    };
    if (proxy) {
      config["httpsAgent"] = new HttpsProxyAgent(proxy);
    }
    return config;
  }

  get(endPoint, token = null, proxy = null) {
    const url = this.baseURL + endPoint;
    const config = this.initConfig(token, proxy);
    return axios.get(url, config);
  }

  post(endPoint, body, token = null, proxy = null) {
    const url = this.baseURL + endPoint;
    const config = this.initConfig(token, proxy);
    return axios.post(url, body, config);
  }

  async checkProxyIP(proxy) {
    if (!proxy || proxy === "skip") return null;
    try {
      const proxyAgent = new HttpsProxyAgent(proxy);
      const response = await axios.get("https://api.ipify.org?format=json", {
        httpsAgent: proxyAgent,
      });
      if (response.status === 200) {
        return response.data.ip;
      } else {
        return -1;
      }
    } catch (error) {
      return -1;
    }
  }
}

const httpService = new HttpService();
export default httpService;
