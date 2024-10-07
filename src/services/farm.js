import colors from "colors";
import dayjs from "dayjs";
import authService from "./auth.js";

class FarmService {
  constructor() {
    this.gameId = {
      daily: "fa873d13-d831-4d6f-8aee-9cff7a1d0db1",
      drop: "59bcd12e-04e2-404c-a172-311a0084587d",
      farm: "53b22103-c7ff-413d-bc63-20f6fb806a07",
    };
  }

  async startFarming(user) {
    try {
      const body = {
        game_id: this.gameId.farm,
      };
      const { data } = await user.http.post("farm/start", body);
      const dataResponse = data.data;
      const start = dayjs.unix(dataResponse.start_at);
      const end = dayjs.unix(dataResponse.end_at);
      const difference = end.diff(start, "minute");
      user.log.log(
        `Bắt đầu farming....... Thu hoạch sau: ${colors.blue(
          difference + " phút"
        )}`
      );
    } catch (error) {
      user.log.logError(`Không thể bắt đầu farming - Lỗi: ${error.message}`);
    }
  }

  async endFarming(user) {
    try {
      const body = {
        game_id: this.gameId.farm,
      };
      const { data } = await user.http.post("farm/claim", body);
      const point = data.data.claim_this_time;
      user.log.log(
        `Thu hoạch thành công, phần thưởng: ${colors.yellow(
          point + user.currency
        )}`
      );
      await this.startFarming(user);
    } catch (error) {
      user.log.logError(`Không thể thu hoạch - Lỗi: ${error.message}`);
    }
  }

  async handleFarm(user) {
    const profile = await authService.getProfile(user);
    if (!profile) return;
    const timestamp = profile.timestamp;
    const currentDatetime = dayjs.unix(timestamp);
    if (!profile.farming) {
      await this.startFarming(user);
    } else if (timestamp > profile.farming.end_at) {
      // Thu hoạch cà chua
      await this.endFarming(user);
    } else {
      const end = dayjs.unix(profile.farming.end_at);
      const difference = end.diff(currentDatetime, "minute");
      user.log.log(
        `Đang farm, thu hoạch sau: ${colors.blue(difference + " phút")}`
      );
    }
  }
}

const farmService = new FarmService();
export default farmService;
