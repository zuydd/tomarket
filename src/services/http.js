import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export class HttpService {
  constructor(log, proxy = null) {
    this.baseURL = "https://api-web.tomarket.ai/tomarket-game/v1/";
    this.proxy = proxy;
    this.log = log;
    this.token = null;
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

  updateToken(token) {
    this.token = token;
  }

  initConfig() {
    const headers = {
      ...this.headers,
    };

    if (this.token) {
      headers["authorization"] = `${this.token}`;
    }
    const config = {
      headers,
    };
    if (this.proxy && this.proxy !== "skip") {
      config["httpsAgent"] = new HttpsProxyAgent(this.proxy);
    }
    return config;
  }

  async get(endPoint) {
    const url = this.baseURL + endPoint;
    const config = this.initConfig();
    return axios.get(url, config);
  }

  async post(endPoint, body) {
    const url = this.baseURL + endPoint;
    const config = this.initConfig();
    return axios.post(url, body, config);
  }

  put(endPoint, body) {
    const url = this.baseURL + endPoint;
    const config = this.initConfig();
    return axios.put(url, body, config);
  }

  async checkProxyIP() {
    if (!this.proxy || this.proxy === "skip") {
      this.log.updateIp("🖥️");
      return null;
    }
    try {
      const proxyAgent = new HttpsProxyAgent(this.proxy);
      const response = await axios.get("https://api.ipify.org?format=json", {
        httpsAgent: proxyAgent,
      });
      if (response.status === 200) {
        const ip = response.data.ip;
        this.log.updateIp(ip);
        return ip;
      } else {
        throw new Error("Proxy lỗi, kiểm tra lại kết nối proxy");
      }
    } catch (error) {
      this.log.updateIp("🖥️");
      return -1;
    }
  }
}
