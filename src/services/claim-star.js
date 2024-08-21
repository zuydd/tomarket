import colors from "colors";
import logHelper from "../helpers/log.js";
import httpService from "./http.js";

class ClaimStarService {
  constructor() {}

  async getInfoClassmate(token, dataUser, ip) {
    try {
      const response = await httpService.post(
        "tasks/classmateTask",
        {},
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      if (data) {
        if (data.status !== 0) {
          logHelper.log(colors.magenta("Đã nhận sao rồi!"), dataUser, ip);
          logHelper.log(
            `Số sao đã nhận được: ${colors.yellow(data.rankData.stars)} ⭐`,
            dataUser,
            ip
          );
        } else {
          logHelper.log(
            colors.yellow("Đang tiến hành nhận sao....."),
            dataUser,
            ip
          );
          await this.claimStarClassmate(data.taskId, token, dataUser, ip);
        }
      }
    } catch (error) {
      logHelper.logError(
        `Kiểm tra thông tin xếp hạng thất bại - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }

  async claimStarClassmate(taskId, token, dataUser, ip) {
    try {
      const body = {
        task_id: taskId,
      };
      const response = await httpService.post(
        "tasks/classmateStars",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      if (data) {
        logHelper.log(
          `Claim sao thành công, nhận được: ${colors.yellow(data.stars)} ⭐`,
          dataUser,
          ip
        );
      }
    } catch (error) {
      logHelper.logError(
        `Claim sao thất bại - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }
}

const claimStarService = new ClaimStarService();
export default claimStarService;
