import colors from "colors";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import authService from "./auth.js";
dayjs.extend(utc);

class DailyService {
  constructor() {
    this.gameId = {
      daily: "fa873d13-d831-4d6f-8aee-9cff7a1d0db1",
      drop: "59bcd12e-04e2-404c-a172-311a0084587d",
      farm: "53b22103-c7ff-413d-bc63-20f6fb806a07",
    };
  }

  async dailyClaim(user) {
    try {
      const body = {
        game_id: this.gameId.daily,
      };
      const { data } = await user.http.post("daily/claim", body);
      const point = data.data.today_points;
      user.log.logSuccess(
        `Điểm danh thành công, phần thưởng: ${colors.yellow(
          point + user.currency
        )}`
      );
    } catch (error) {
      user.log.logError(
        `Không thể điểm danh hàng ngày - Lỗi: ${error.message}`
      );
    }
  }

  async handleDaily(user, countLoop) {
    const profile = await authService.getProfile(user);
    if (!profile) return;
    const lastCheckin = profile.daily?.last_check_ymd;
    const utcTime = dayjs().utc();
    const currentDay = parseInt(utcTime.format("YYYYMMDD"));

    const canClaim = lastCheckin !== currentDay;

    // Chạy điểm danh hàng ngày
    if (!profile?.daily || canClaim) {
      await this.dailyClaim(user);
    } else {
      if (countLoop === 0) {
        user.log.log(colors.magenta(`Đã điểm danh hôm nay!`));
      }
    }
  }
}

const dailyService = new DailyService();
export default dailyService;
