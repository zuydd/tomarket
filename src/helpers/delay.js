import logHelper from "./log.js";

class DelayHelper {
  constructor() {}

  delay(seconds, msg = null, dataUser = null, ip = null) {
    if (msg) {
      logHelper.log(msg, dataUser, ip);
    }
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}

const delayHelper = new DelayHelper();
export default delayHelper;
