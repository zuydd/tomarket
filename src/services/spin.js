import colors from "colors";
import delayHelper from "../helpers/delay.js";

class SpinService {
  constructor() {
    this.categoryText = {
      ticket_spin_1: "miễn phí",
      tomarket: "dùng star",
    };
  }

  async getAssets(user) {
    try {
      const { data } = await user.http.post("spin/assets", {});
      return data.data;
    } catch (error) {
      user.log.logError(`Lấy dữ liệu spin thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async getTicket(user) {
    try {
      const { data } = await user.http.post("user/tickets", {});
      return data.data;
    } catch (error) {
      user.log.logError(`Lấy dữ liệu ticket thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  logResult(user, results, showDelay, category) {
    for (const result of results) {
      let type = result.type;
      if (result.type === "Tomato") type = "🍅";
      else if ((result.type = "Star")) type = "⭐";
      let msgDelay = colors.magenta(
        ` Đã dùng hết lượt quay ${this.categoryText[category]}`
      );
      if (showDelay)
        msgDelay = ` Chờ ${colors.blue("10s")} để quay lần tiếp theo`;
      user.log.log(
        `Quay số ${
          this.categoryText[category]
        } thành công, phần thưởng: ${colors.yellow(
          result.amount + " " + type
        )} ${msgDelay}. `
      );
    }
  }

  async spin(user, category, showDelay = true) {
    const body = {
      category,
    };
    try {
      const { data } = await user.http.post("spin/raffle", body);
      if (data.status === 0) {
        this.logResult(user, data?.data?.results, showDelay, category);
        return true;
      } else if (data.status === 400 && category === "tomarket") {
        user.log.log(
          colors.red(
            `Quay số ${this.categoryText[category]} thất bại. Đã dùng hết 3 lượt quay bằng sao của ngày hôm nay!`
          )
        );
        return 2;
      }
    } catch (error) {
      user.log.logError(
        `Quay số ${this.categoryText[category]} thất bại - Lỗi: ${error.message}`
      );
      return false;
    }
  }

  async handleSpin(user, countLoop, maxSpinStar, minFreeSpin) {
    const assets = await this.getAssets(user);
    const ticket = await this.getTicket(user);

    // spin free
    if (ticket?.ticket_spin_1 >= minFreeSpin) {
      for (let index = 0; index < ticket?.ticket_spin_1; index++) {
        await this.spin(
          user,
          "ticket_spin_1",
          index !== ticket?.ticket_spin_1 - 1
        );
        if (index !== ticket?.ticket_spin_1 - 1) {
          await delayHelper.delay(10);
        }
      }
    }

    // spin star

    if (assets?.balances[2]?.balance >= maxSpinStar && countLoop === 0) {
      for (let index = 0; index < maxSpinStar; index++) {
        const statusSpin = await this.spin(
          user,
          "tomarket",
          index !== maxSpinStar - 1
        );
        if (statusSpin === 1) break;
        if (index !== maxSpinStar - 1) {
          await delayHelper.delay(10);
        }
      }
    }
  }
}

const spinService = new SpinService();
export default spinService;
