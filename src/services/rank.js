import colors from "colors";

class RankService {
  constructor() {}

  async getRank(user) {
    try {
      const { data } = await user.http.post("rank/data", {});
      return data.data;
    } catch (error) {
      user.log.logError(`Lấy thông tin rank thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async evaluateRank(user) {
    try {
      const { data } = await user.http.post("rank/evaluate", {});
      return data.data;
    } catch (error) {
      user.log.logError(`Lấy thông tin rank thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async creareRank(user) {
    try {
      const evaluateData = await this.evaluateRank(user);
      if (!evaluateData) {
        user.log.logError(`Nhận rank thất bại`);
        return false;
      }
      const { data } = await user.http.post("rank/create", {});

      const rank = data?.data;
      user.log.log(
        `Nhận rank thành công, rank hiện tại: ${colors.magenta(
          `Level ${rank?.currentRank?.level} - ${rank?.currentRank?.name}`
        )} | Số sao: ${colors.yellow(rank?.unusedStars || 0)} ⭐`
      );
      return true;
    } catch (error) {
      user.log.logError(`Nhận rank thất bại - Lỗi: ${error.message}`);
      return false;
    }
  }

  async upRank(user, stars) {
    const body = { stars };
    try {
      const { data } = await user.http.post("rank/upgrade", body);
      const rank = data.data;
      if (data.status === 0) {
        user.log.log(
          `Nâng cấp rank thành công, rank hiện tại: ${colors.magenta(
            `Level ${rank?.currentRank?.level} - ${rank?.currentRank?.name}`
          )}`
        );
        return data.data;
      } else {
        user.log.logError(`Nâng cấp rank thất bại - Lỗi: ${data?.message}`);
        return false;
      }
    } catch (error) {
      user.log.logError(`Nâng cấp rank thất bại - Lỗi: ${error.message}`);
      return false;
    }
  }

  async handleRank(user) {
    let rank = await this.getRank(user);
    if (!rank?.isCreated) return;
    let condition = true;
    while (condition) {
      if (
        rank?.unusedStars >=
        rank?.currentRank?.range - rank?.currentRank?.stars
      ) {
        // có thể nâng rank
        const dataAfterUpRank = await this.upRank(user, rank?.unusedStars);
        if (dataAfterUpRank) {
          rank = dataAfterUpRank;
        } else {
          condition = false;
        }
      } else {
        condition = false;
      }
    }
  }
}

const rankService = new RankService();
export default rankService;
