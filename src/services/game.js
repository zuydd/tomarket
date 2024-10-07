import colors from "colors";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
import authService from "./auth.js";

class GameService {
  constructor() {
    this.gameId = {
      daily: "fa873d13-d831-4d6f-8aee-9cff7a1d0db1",
      drop: "59bcd12e-04e2-404c-a172-311a0084587d",
      farm: "53b22103-c7ff-413d-bc63-20f6fb806a07",
    };
  }

  async playGame(user) {
    try {
      const body = {
        game_id: this.gameId.drop,
      };
      const { data } = await user.http.post("game/play", body);
      user.log.log(
        `Bắt đầu chơi game, kết thúc và nhận thưởng sau: ${colors.blue("30s")}`
      );
      return true;
    } catch (error) {
      user.log.logError(`Không thể chơi game - Lỗi: ${error.message}`);
      return false;
    }
  }

  async claimGame(user) {
    try {
      const points = generatorHelper.randomInt(370, 450);
      const body = {
        game_id: this.gameId.drop,
        points,
      };
      const { data } = await user.http.post("game/claim", body);
      user.log.log(
        `Chơi game xong, phần thưởng: ${colors.yellow(points + user.currency)}`
      );
    } catch (error) {
      user.log.logError(`Chơi game thất bại - Lỗi: ${error.message}`);
    }
  }

  async handleGame(user, playPasses) {
    const profile = await authService.getProfile(user);
    if (profile) playPasses = profile?.play_passes;
    user.log.log(`Còn ${colors.blue(playPasses + " lượt")} chơi game`);

    while (playPasses > 0) {
      playPasses--;
      const statusPlay = await this.playGame(user);
      if (!statusPlay) return;
      await delayHelper.delay(30);
      await this.claimGame(user);
    }
  }
}

const gameService = new GameService();
export default gameService;
