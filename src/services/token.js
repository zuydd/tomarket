import colors from "colors";

class TokenService {
  constructor() {}

  async getBalanceToken(user) {
    try {
      const { data } = await user.http.post("token/balance", {});

      return data.data;
    } catch (error) {
      user.log.logError(
        `Lấy thông tin số dư token TOMA thất bại - Lỗi: ${error.message}`
      );
      return null;
    }
  }

  async getBalanceTomatoes(user) {
    try {
      const { data } = await user.http.post("token/tomatoes", {});

      return data.data;
    } catch (error) {
      user.log.logError(
        `Lấy thông tin số dư Tomatoes thất bại - Lỗi: ${error.message}`
      );
      return null;
    }
  }

  async tomatoToStar(user, stars) {
    try {
      const { data } = await user.http.post("token/tomatoToStar", {});
      const tomatoes = stars * 20000;
      user.log.log(
        `Chuyển đổi thành công ${colors.yellow(
          tomatoes + user.currency
        )} thành ${colors.yellow(stars)} ⭐`
      );
      return true;
    } catch (error) {
      user.log.logError(`Chuyển đổi Tomatoes thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async getListWeek(user) {
    try {
      const { data } = await user.http.post("token/weeks", {});

      return data?.data?.filter((week) => week.status === 2 && !week.claimed);
    } catch (error) {
      user.log.logError(`Lấy thông tin week thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async claimTokenWeek(user, round) {
    try {
      const body = { round };
      const { data } = await user.http.post("token/claim", body);
      user.log.log(
        `${colors.blue(round)} - Claim thành công ${colors.yellow(
          data.data.tomarketReward
        )} 🪙 TOMA`
      );
      return data.data;
    } catch (error) {
      user.log.logError(
        `Claim token TOMA hàng tuần thất bại - Lỗi: ${error.message}`
      );
      return null;
    }
  }

  async handleToken(user) {
    const balanceTomatoes = await this.getBalanceTomatoes(user);
    if (balanceTomatoes && balanceTomatoes.balance) {
      const stars = Math.floor(parseInt(balanceTomatoes.balance) / 20000);
      if (stars > 0) {
        await this.tomatoToStar(user, stars);
      }
    }
    const dataWeeks = await this.getListWeek(user);
    if (dataWeeks && dataWeeks?.length) {
      for (const week of dataWeeks) {
        await this.claimTokenWeek(user, week.round.name);
      }
    }
  }
}

const tokenService = new TokenService();
export default tokenService;
