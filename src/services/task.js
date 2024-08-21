import colors from "colors";
import dayjs from "dayjs";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
import logHelper from "../helpers/log.js";
import httpService from "./http.js";

class TaskService {
  constructor() {
    this.gameId = {
      daily: "fa873d13-d831-4d6f-8aee-9cff7a1d0db1",
      drop: "59bcd12e-04e2-404c-a172-311a0084587d",
      farm: "53b22103-c7ff-413d-bc63-20f6fb806a07",
    };
  }

  async runTask(info, token, dataUser, ip) {
    const timestamp = info.timestamp;
    let playPasses = info.play_passes;
    const currentDatetime = dayjs.unix(timestamp);

    const lastCheckin = dayjs.unix(info.daily?.last_check_ts).add(8, "hour");

    const canClaim =
      lastCheckin.isBefore(currentDatetime, "day") &&
      currentDatetime.hour() >= 7;

    // Chạy điểm danh hàng ngày
    if (!info?.daily || canClaim) {
      await this.dailyClaim(token, dataUser, ip);
    }

    // Kiểm tra xem có băt đầu farm chưa?
    if (!info.farming) {
      await this.startFarming(token, dataUser, ip);
    } else if (timestamp > info.farming.end_at) {
      // Thu hoạch cà chua
      await this.endFarming(token, dataUser, ip);
    } else {
      const end = dayjs.unix(info.farming.end_at);
      const difference = end.diff(currentDatetime, "minute");
      logHelper.log(
        `Thu hoạch sau: ${colors.green(difference + " phút")}`,
        dataUser,
        ip
      );
    }

    // Chơi game
    logHelper.log(
      `Lượt chơi game còn lại: ${colors.green(playPasses)}`,
      dataUser,
      ip
    );
    if (playPasses > 0) {
      for (let index = 0; index < 9999 && playPasses > 0; index++) {
        playPasses--;
        const statusPlay = await this.playGame(token, dataUser, ip);
        if (!statusPlay) return;
        const msgDelay = colors.yellow(
          `Cần chờ 30s trước khi hoàn thành chơi game.......`
        );
        await delayHelper.delay(30, msgDelay, dataUser, ip);
        await this.claimGame(token, dataUser, ip);
      }
    }
    const reStartAfter = generatorHelper.randomInt(10, 13);
    return reStartAfter;
  }

  async dailyClaim(token, dataUser, ip) {
    try {
      const body = {
        game_id: this.gameId.daily,
      };
      const response = await httpService.post(
        "daily/claim",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      const point = data.today_points;
      logHelper.log(
        `Điểm danh thành công, phần thưởng: ${colors.green(point)} cà chua 🍅`,
        dataUser,
        ip
      );
    } catch (error) {
      logHelper.logError(
        `Không thể điểm danh hàng ngày - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }

  async startFarming(token, dataUser, ip) {
    try {
      const body = {
        game_id: this.gameId.farm,
      };
      const response = await httpService.post(
        "farm/start",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      const start = dayjs.unix(data.start_at);
      const end = dayjs.unix(data.end_at);
      const difference = end.diff(start, "minute");
      logHelper.log(
        `Bắt đầu farming....... Thu hoạch sau: ${colors.green(
          difference + " phút"
        )}`,
        dataUser,
        ip
      );
    } catch (error) {
      logHelper.logError(
        `Không thể bắt đầu farming - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }

  async endFarming(token, dataUser, ip) {
    try {
      const body = {
        game_id: this.gameId.farm,
      };
      const response = await httpService.post(
        "farm/claim",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      const point = data.claim_this_time;
      logHelper.log(
        `Thu hoạch thành công, phần thưởng: ${colors.green(point)} cà chua 🍅`,
        dataUser,
        ip
      );
      await this.startFarming(token, dataUser, ip);
    } catch (error) {
      logHelper.logError(
        `Không thể thu hoạch - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }

  async playGame(token, dataUser, ip) {
    try {
      const body = {
        game_id: this.gameId.drop,
      };
      const response = await httpService.post(
        "game/play",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      logHelper.logSuccess("Bắt đầu chơi game.....", dataUser, ip);
      return true;
    } catch (error) {
      logHelper.logError(
        `Không thể chơi game - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
      return false;
    }
  }

  async claimGame(token, dataUser, ip) {
    try {
      const points = generatorHelper.randomInt(370, 450);
      const body = {
        game_id: this.gameId.drop,
        points,
      };
      const response = await httpService.post(
        "game/claim",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      logHelper.log(
        `Chơi game hoàn tất, phần thưởng: ${colors.green(points)} cà chua 🍅`,
        dataUser,
        ip
      );
    } catch (error) {
      logHelper.logError(
        `Chơi game thất bại - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }
}

const taskService = new TaskService();
export default taskService;
