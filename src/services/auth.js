import colors from "colors";
import he from "he";
import { parse } from "querystring";
import fileHelper from "../helpers/file.js";
import logHelper from "../helpers/log.js";
import httpService from "./http.js";

class AuthService {
  constructor() {}

  extractIP(url) {
    // Tách phần trước và sau dấu @
    const parts = url.split("@");

    // Nếu không có phần @ thì không hợp lệ
    if (parts.length !== 2) return null;

    // Lấy phần sau dấu @
    const afterAt = parts[1];

    // Tách phần sau dấu @ theo dấu :
    const afterAtParts = afterAt.split(":");

    // IP là phần tử đầu tiên sau dấu @
    const ip = afterAtParts[0];

    return ip;
  }

  getUser(fileName = "users.txt") {
    const rawDatas = fileHelper.readFile(fileName);
    const rawProxies = fileHelper.readFile("proxy.txt");
    const users = rawDatas
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) => line.length > 0 && decodeURIComponent(line).includes("user=")
      );

    const proxies = rawProxies
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (users.length <= 0) {
      console.log(colors.red(`Không tìm thấy dữ liệu`));
      return [];
    } else {
      const usersDecode = users.map((line, index) => {
        const valueParse = parse(he.decode(decodeURIComponent(line)));
        return {
          ...valueParse,
          user: JSON.parse(valueParse.user),
          raw: he.decode(decodeURIComponent(line)),
          index: index + 1,
          proxy: proxies[index] || null,
          // ip: this.extractIP(proxies[index] || ""),
        };
      });
      return usersDecode;
    }
  }

  async login(dataUser, ip) {
    const user = dataUser.user;
    const id = user.id;
    const name = (user.first_name + " " + user.last_name).trim();
    console.log(
      `========== Đăng nhập tài khoản ${dataUser.index} | ${name.green} ==========`
    );

    let token = fileHelper.getTokenById(id);

    if (!token || this.isExpired(token)) {
      const initData = dataUser.raw.replace(/\r/g, "");
      const body = {
        init_data: initData,
        invite_code: "0000cwVd",
      };
      const bodyString = JSON.stringify(body);

      try {
        const response = await httpService.post(
          "user/login",
          bodyString,
          null,
          ip ? dataUser.proxy : null
        );
        if (response.data.data.access_token) {
          token = response.data.data.access_token;
          fileHelper.saveToken(id, token);
          logHelper.logSuccess("Đăng nhập thành công", dataUser, ip);
        }
      } catch (error) {
        logHelper.logError(error.message, dataUser, ip);
      }
    }
    return token;
  }

  async getBalance(dataUser, token, ip) {
    
    try {
      const response = await httpService.post(
        "user/balance",
        {},
        token,
        ip ? dataUser.proxy : null
      );
      if (response.data.status === 400) {
        return 2;
      }
      const info = response.data.data;
      logHelper.log(
        `Số cà chua hiện có: ${colors.green(info?.available_balance)} 🍅`,
        dataUser,
        ip
      );
      return info;
    } catch (error) {
      logHelper.logError(error.message, dataUser, ip);
      return null;
    }
  }

  isExpired(token) {
    // Tách payload từ JWT token
    const base64Url = token.split(".")[1]; // Phần payload nằm ở phần giữa
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Thay đổi ký tự để đúng chuẩn base64

    // Giải mã base64 thành chuỗi JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    // Chuyển chuỗi JSON thành đối tượng JavaScript
    const payload = JSON.parse(jsonPayload);

    // Lấy thông tin exp từ payload
    const exp = payload.exp;
    // Lấy thời gian hiện tại tính bằng giây
    const currentTime = Math.floor(Date.now() / 1000);
    // So sánh thời gian hết hạn với thời gian hiện tại
    return exp < currentTime;
  }
}

const authService = new AuthService();
export default authService;
