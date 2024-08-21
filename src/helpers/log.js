import colors from "colors";

class LogHelper {
  constructor() {}

  log(msg, userData, ip = null) {
    console.log(
      `[ No ${userData.index} _ ID: ${userData.user.id} _ IP: ${
        ip || "🖥️"
      } ] ${msg}`
    );
  }

  logError(msg, userData, ip = null) {
    console.log(
      `[ No ${userData.index} _ ID: ${userData.user.id} _ IP: ${
        ip || "🖥️"
      } ] ${colors.red(msg)}`
    );
  }

  logSuccess(msg, userData, ip = null) {
    console.log(
      `[ No ${userData.index} _ ID: ${userData.user.id} _ IP: ${
        ip || "🖥️"
      } ] ${colors.green(msg)}`
    );
  }
}

const logHelper = new LogHelper();
export default logHelper;
