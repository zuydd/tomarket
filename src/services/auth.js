import colors from "colors";
import fileHelper from "../helpers/file.js";
import formatHelper from "../helpers/format.js";
import tokenHelper from "../helpers/token.js";
import rankService from "./rank.js";
import tokenService from "./token.js";
import walletService from "./wallet.js";

class AuthService {
  constructor() {}

  async login(user, skipLog = false) {
    user.http.updateToken(null);
    const body = {
      from: "",
      init_data: user.query_id,
      invite_code: user?.database?.ref || "0000cwVd",
      is_bot: false,
    };
    try {
      const { data } = await user.http.post("user/login", body);

      if (data?.data.access_token) {
        return {
          access: data.data.access_token,
        };
      }
      return null;
    } catch (error) {
      if (!skipLog) {
        user.log.logError(`Đăng nhập thất bại: ${error}`);
      }
      return null;
    }
  }

  async handleLogin(user, isAddWallet = false) {
    console.log(
      `============== Chạy tài khoản ${user.index} | ${user.info.fullName.green} ==============`
    );

    let token = fileHelper.getTokenById(user.info.id);

    if (token && !tokenHelper.isExpired(token)) {
      const info = {
        access: token,
      };
      const profile = await this.handleAfterLogin(user, info, isAddWallet);
      if (profile) {
        return {
          status: 1,
          profile,
        };
      }
    }

    let infoLogin = await this.login(user);

    if (infoLogin) {
      const profile = await this.handleAfterLogin(user, infoLogin, isAddWallet);
      if (profile) {
        return {
          status: 1,
          profile,
        };
      }
    }
    user.log.logError(
      "Quá trình đăng nhập thất bại, vui lòng kiểm tra lại thông tin tài khoản (có thể cần phải lấy mới user data/query_id). Hệ thống sẽ thử đăng nhập lại sau 60s"
    );
    return {
      status: 0,
      profile: null,
    };
  }

  async getProfile(user) {
    try {
      const { data } = await user.http.post(`user/balance`, {});
      if (data) {
        return data.data;
      }
      return null;
    } catch (error) {
      user.log.logError(`Lấy thông tin tài khoản thất bại: ${error.message}`);
      return null;
    }
  }

  async handleAfterLogin(user, info, isAddWallet = false) {
    const accessToken = info.access || null;
    user.http.updateToken(accessToken);
    fileHelper.saveToken(user.info.id, accessToken);
    const profile = await this.getProfile(user);
    if (isAddWallet) {
      const infoWallet = await walletService.getInfo(user);
      const msg =
        colors.green(`Đăng nhập thành công: `) +
        colors.white("Địa chỉ ví: ") +
        (infoWallet.walletAddress
          ? colors.blue(infoWallet.walletAddress)
          : colors.yellow("Chưa liên kết"));
      user.log.log(msg);
    } else {
      const rank = await rankService.getRank(user);
      const token = await tokenService.getBalanceToken(user);
      if (profile) {
        const rankText = rank?.isCreated
          ? `${colors.magenta(
              `Level ${rank?.currentRank?.level} - ${rank?.currentRank?.name}`
            )}`
          : colors.magenta(`Chưa nhận`);
        user.log.log(colors.green("Đăng nhập thành công:"));
        user.log.log(
          `Rank: ${rankText} | ` +
            `Số TOMA token: ${colors.yellow(
              formatHelper.currency(token.total)
            )} 🪙 | ` +
            `Số cà chua: ${
              colors.yellow(formatHelper.currency(profile?.available_balance)) +
              user.currency
            }` +
            ` | Số sao: ${colors.yellow(rank?.currentWeekStars || 0)} ⭐`
        );
        if (!rank?.isCreated) await rankService.creareRank(user);
      }
    }

    return profile;
  }
}

const authService = new AuthService();
export default authService;
