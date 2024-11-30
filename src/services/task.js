import colors from "colors";
import dayjs from "dayjs";
import datetimeHelper from "../helpers/datetime.js";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";

class TaskService {
  constructor() {}

  filterTaskCombo(task) {
    if (task.type !== "mysterious") return true;
    const start = dayjs(task.startTime);
    const end = dayjs(task.endTime);
    const now = dayjs();
    return now.isAfter(start) && now.isBefore(end);
  }

  async getTasks(user) {
    const skipTasks = user?.database?.skipErrorTasks || [];
    const skipTypes = ["classmateInvite"];
    const body = { language_code: "vi" };
    try {
      const { data } = await user.http.post("tasks/list", body);
      const dataResponse = data.data;
      const allKeysTask = Object.keys(dataResponse);
      let arrTasks = [];

      allKeysTask.forEach((key) => {
        if (key === "3rd") {
          if (dataResponse[key].default)
            arrTasks = arrTasks.concat(dataResponse[key].default);
        } else {
          arrTasks = arrTasks.concat(dataResponse[key]);
        }
      });
      const tasks = arrTasks.filter((task) => {
        return (
          task.status !== 3 &&
          this.filterTaskCombo(task) &&
          !skipTasks.includes(task.taskId) &&
          !skipTypes.includes(task.type) &&
          (task.taskId < 4001 || task.taskId > 10000)
        );
      });

      return tasks;
    } catch (error) {
      user.log.logError(
        `Không thể lấy danh sách nhiệm vụ - Lỗi: ${error.message}`
      );
      return [];
    }
  }

  async startTask(user, task) {
    const body = { task_id: task.taskId };
    try {
      const { data } = await user.http.post("tasks/start", body);
      // let delta = 0;
      // if (task?.platform === "youtube" && task.tag === "expire") {
      //   delta = 120;
      // }
      user.log.log(
        `Bắt đầu làm nhiệm vụ ${task.taskId}: ${colors.blue(
          task.title
        )} | Hoàn thành sau: ${colors.blue(
          datetimeHelper.formatDuration(task.waitSecond + 10)
        )}`
      );
      return 1;
    } catch (error) {
      user.log.logError(`Không thể bắt đầu nhiệm vụ - Lỗi: ${error.message}`);
      return 0;
    }
  }

  async checkTask(user, task) {
    const body = { task_id: task.taskId, init_data: user.query_id };
    try {
      const { data } = await user.http.post("tasks/check", body);

      return data.data?.status;
    } catch (error) {
      user.log.logError(`Kiểm tra nhiệm vụ thất bại - Lỗi: ${error.message}`);
      return 0;
    }
  }

  async claimTask(user, task) {
    const body = { task_id: task.taskId, init_data: user.query_id };
    try {
      const { data } = await user.http.post("tasks/claim", body);
      if (data.status === 0) {
        user.log.log(
          `Hoàn thành nhiệm vụ ${task.taskId}, phần thưởng: ${colors.yellow(
            task.score + user.currency
          )}`
        );
      } else {
        user.log.logError(
          `Không thể hoàn thành nhiệm vụ - Lỗi: ${data.message}`
        );
      }
    } catch (error) {
      user.log.logError(
        `Không thể hoàn thành nhiệm vụ - Lỗi: ${error.message}`
      );
    }
  }

  async doTask(user, task) {
    let status = task.status;
    const startStatus = status;
    if (status === 0) {
      status = await this.startTask(user, task);
    }
    if (status === 1) {
      let msg = null;
      // let delta = 0;
      // if (task?.platform === "youtube" && task.tag === "expire") {
      //   delta = 120;
      // }
      if (startStatus === 1) {
        msg = `Chờ hoàn thành nhiệm vụ ${task.taskId}: ${colors.blue(
          task.title
        )} | Hoàn thành sau: ${colors.blue(
          datetimeHelper.formatDuration(task.waitSecond + 10)
        )}`;
        user.log.log(msg);
      }

      await delayHelper.delay(task.waitSecond + 10);
      status = 2;
    }
    if (status === 2) {
      const statusCheck = await this.checkTask(user, task);

      if (
        statusCheck === 2 ||
        task.type === "mysterious" ||
        task.type === "emoji"
      ) {
        await this.claimTask(user, task);
      }
    }
  }

  async handleTask(user) {
    const tasks = await this.getTasks(user);

    if (!tasks.length) {
      user.log.log(colors.magenta("Đã làm hết nhiệm vụ"));
      return;
    }

    if (tasks.length) {
      user.log.log(`Còn ${colors.blue(tasks.length)} nhiệm vụ chưa hoàn thành`);
    }

    for (const task of tasks) {
      await this.doTask(user, task);
      await delayHelper.delay(generatorHelper.randomInt(10, 30));
    }

    user.log.log(colors.magenta("Đã làm xong các nhiệm vụ"));
  }
}

const taskService = new TaskService();
export default taskService;
