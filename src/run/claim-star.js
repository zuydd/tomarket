import colors from "colors";
import dayjs from "dayjs";
import fileHelper from "../helpers/file.js";
import logHelper from "../helpers/log.js";
import authService from "../services/auth.js";
import claimStarService from "../services/claim-star.js";
import httpService from "../services/http.js";

const run = async (user) => {
  const ip = await httpService.checkProxyIP(user.proxy);
  if (ip === -1) {
    logHelper.logError("Proxy lỗi, kiểm tra lại kết nối proxy", user);
    const dataLog = `[No ${user.index} _ ID: ${
      user.user.id
    } _ Time: ${dayjs().format(
      "YYYY-MM-DDTHH:mm:ssZ[Z]"
    )}] Lỗi kết nối proxy - ${user.proxy}`;
    fileHelper.writeLog("log.error.txt", dataLog);
    return;
  }
  // await delayHelper.delay(user.index * 3 - 2);
  let token = await authService.login(user, ip);
  if (!token) {
    logHelper.logError(
      "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin",
      user,
      ip
    );
    return;
  }

  let reStartAfter = 0;
  let lastTimeCheckTask = dayjs("2024/01//01");

  while (true) {
    const ip = await httpService.checkProxyIP(user.proxy);
    if (ip === -1) {
      logHelper.logError("Proxy lỗi, kiểm tra lại kết nối proxy", user);
      const dataLog = `[No ${user.index} _ ID: ${
        user.user.id
      } _ Time: ${dayjs().format(
        "YYYY-MM-DDTHH:mm:ssZ[Z]"
      )}] Lỗi kết nối proxy - ${user.proxy}`;
      fileHelper.writeLog("log.error.txt", dataLog);
      break;
    }
    const info = await authService.getBalance(user, token, ip);
    if (info === 2) {
      logHelper.logError(
        "Lấy dữ liệu thất bại, đang thử đăng nhập lại.....",
        user,
        ip
      );
      token = await authService.login(user, ip);

      // chạy lại
      if (token) {
        reStartAfter = 0.1;
      } else {
        break;
      }
    } else {
      if (!info) {
        logHelper.logError("Lấy dữ liệu thất bại", user, ip);
        break;
      }
      // Claim
      await claimStarService.getInfoClassmate(token, user, ip);
      break;
    }
  }
};

console.log(
  colors.yellow.bold(
    `=============  Tool phát triển và chia sẻ miễn phí bởi ZuyDD  =============`
  )
);
console.log(
  "Mọi hành vi buôn bán tool dưới bất cứ hình thức nào đều không được cho phép!"
);
console.log(
  `Telegram: ${colors.green(
    "https://t.me/zuydd"
  )}  ___  Facebook: ${colors.blue("https://www.facebook.com/zuy.dd")}`
);
console.log(
  `Cập nhật các tool mới nhất tại: ${colors.gray("https://github.com/zuydd")}`
);
console.log("");
console.log("");
console.log("");
console.log("Bắt đầu nhận sao......");
const users = authService.getUser();
for (const [index, user] of users.entries()) {
  await run(user);
}
