import colors from "colors";
import dayjs from "dayjs";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";

class PuzzleService {
  constructor() {}

  filterTask(user, task) {
    const start = dayjs(task.startTime);
    const end = dayjs(task.endTime);
    const now = dayjs();
    return (
      now.isAfter(start) &&
      now.isBefore(end) &&
      task.type === "puzzle" &&
      task.taskId === user.database.puzzle.task_id
    );
  }

  async getPuzzle(user) {
    try {
      const { data } = await user.http.post("tasks/puzzle", {});
      if (data?.status === 0) {
        const tasks = data.data.filter((task) => this.filterTask(user, task));
        return tasks;
      } else {
        user.log.logError(
          `Lấy danh sách puzzle thất bại - Lỗi: ${data?.message}`
        );
        return [];
      }
    } catch (error) {
      user.log.logError(
        `Lấy danh sách puzzle thất bại - Lỗi: ${error.message}`
      );
      return [];
    }
  }

  async claimPuzzle(user, task) {
    const body = user.database.puzzle;

    try {
      const { data } = await user.http.post("tasks/puzzleClaim", body);

      if (data?.status === 0) {
        user.log.log(
          `Hoàn thành ${colors.blue("Puzzle")} ${colors.gray(
            `[${task.taskId}]`
          )}, phần thưởng: ${colors.yellow(
            task.score + user.currency
          )} | ${colors.yellow(task.star)} ⭐ | ${colors.yellow(task.games)} 🕹️`
        );
        return true;
      } else {
        user.log.logError(`Làm Puzzle thất bại - Lỗi: ${data?.message}`);
        return false;
      }
    } catch (error) {
      user.log.logError(`Làm Puzzle thất bại - Lỗi: ${error.message}`);
      return false;
    }
  }

  async handlePuzzle(user) {
    const tasks = await this.getPuzzle(user);
    if (tasks.length) {
      const task = tasks[0];
      if (!task) {
        user.log.log(
          colors.yellow(
            `Chưa có combo Puzzle của hôm nay, liên hệ @zuydd để update combo`
          )
        );
        return;
      }
      if (task.status === 0) {
        const delay = generatorHelper.randomInt(40, 80);
        user.log.log(
          `Bắt đầu làm ${colors.blue("Puzzle")} ${colors.gray(
            `[${task.taskId}]`
          )}, hoàn thành sau: ${colors.blue(delay + "s")}`
        );
        await delayHelper.delay(delay);
        await this.claimPuzzle(user, task);
      }
    }
  }
}

const puzzleService = new PuzzleService();
export default puzzleService;
