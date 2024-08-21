import colors from "colors";
import dayjs from "dayjs";
import datetimeHelper from "../helpers/datetime.js";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
import logHelper from "../helpers/log.js";
import httpService from "./http.js";

class MissionService {
  constructor() {}

  async runMission(info, token, dataUser, ip) {
    const missions = await this.getAllMission(token, dataUser, ip);
    if (missions.length) {
      logHelper.log(
        `Số nhiệm vụ chưa hoàn thành: ${colors.green(missions.length)}`,
        dataUser,
        ip
      );
      for (const mission of missions.slice(0, 4)) {
        this.handleMission(mission, token, dataUser, ip);
        const delayStart = generatorHelper.randomInt(30, 90);
        await delayHelper.delay(delayStart);
      }
    }
  }

  filterMissionCombo(mission) {
    if (mission.type !== "mysterious") return true;
    const end = dayjs(mission.endTime).subtract(1, "hour");
    return dayjs().diff(end, "minute") < 0;
  }

  async getAllMission(token, dataUser, ip) {
    const missionsSkip = [53, 101];
    const typeMissionsSkip = ["classmateInvite"];
    const body = { language_code: "vi" };
    try {
      const response = await httpService.post(
        "tasks/list",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      const allKeysMission = Object.keys(data);
      let arrMission = [];
      allKeysMission.forEach((key) => {
        arrMission = arrMission.concat(data[key]);
      });
      const missions = arrMission.filter(
        (mission) =>
          mission.status !== 3 &&
          this.filterMissionCombo(mission) &&
          !missionsSkip.includes(mission.taskId) &&
          !typeMissionsSkip.includes(mission.type)
      );

      return missions;
    } catch (error) {
      logHelper.logError(
        `Không thể lấy danh sách nhiệm vụ - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
      return [];
    }
  }

  async handleMission(mission, token, dataUser, ip) {
    let status = mission.status;
    const startStatus = status;
    if (status === 0) {
      status = await this.installMission(mission, token, dataUser, ip);
    }
    if (status === 1) {
      let msg = null;
      if (startStatus === 1) {
        msg = `Chờ hoàn thành nhiệm vụ ${mission.taskId}: ${colors.blue(
          mission.title
        )} | Hoàn thành sau: ${colors.blue(
          datetimeHelper.formatDuration(mission.waitSecond + 10)
        )}`;
      }
      await delayHelper.delay(mission.waitSecond + 10, msg, dataUser, ip);
      status = 2;
    }
    if (status === 2) {
      const statusCheck = await this.checkMission(mission, token, dataUser, ip);
      if (statusCheck === 2 || mission.type === "mysterious") {
        await this.claimMission(mission, token, dataUser, ip);
      }
    }
  }

  async installMission(mission, token, dataUser, ip) {
    const body = { task_id: mission.taskId };
    try {
      const response = await httpService.post(
        "tasks/start",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      logHelper.log(
        `Bắt đầu làm nhiệm vụ ${mission.taskId}: ${colors.blue(
          mission.title
        )} | Hoàn thành sau: ${colors.blue(
          datetimeHelper.formatDuration(mission.waitSecond + 10)
        )}`,
        dataUser,
        ip
      );
      return 1;
    } catch (error) {
      logHelper.logError(
        `Không thể bắt đầu nhiệm vụ - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
      return 0;
    }
  }

  async checkMission(mission, token, dataUser, ip) {
    const body = { task_id: mission.taskId };
    try {
      const response = await httpService.post(
        "tasks/check",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data.data;
      return data?.status;
    } catch (error) {
      logHelper.logError(
        `Kiểm tra nhiệm vụ thất bại - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
      return 0;
    }
  }

  async claimMission(mission, token, dataUser, ip) {
    const body = { task_id: mission.taskId };
    try {
      const response = await httpService.post(
        "tasks/claim",
        body,
        token,
        ip ? dataUser.proxy : null
      );
      const data = response.data;
      if (data.status === 0) {
        logHelper.log(
          `Hoàn thành nhiệm vụ ${mission.taskId}, phần thưởng: ${colors.green(
            mission.score
          )} cà chua 🍅`,
          dataUser,
          ip
        );
      } else {
        logHelper.logError(
          `Không thể hoàn thành nhiệm vụ - Lỗi: ${data.message}`,
          dataUser,
          ip
        );
      }
    } catch (error) {
      logHelper.logError(
        `Không thể hoàn thành nhiệm vụ - Lỗi: ${error.message}`,
        dataUser,
        ip
      );
    }
  }
}

const missionService = new MissionService();
export default missionService;
