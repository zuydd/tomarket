class FormatHelper {
  constructor() {}

  currency(num) {
    return parseInt(num).toLocaleString("en-US");
  }
}

const formatHelper = new FormatHelper();
export default formatHelper;
