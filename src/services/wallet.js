import colors from "colors";

class WalletService {
  constructor() {}

  async getInfo(user) {
    try {
      const { data } = await user.http.post("tasks/walletTask", {});
      return data.data;
    } catch (error) {
      user.log.logError(`Lấy thông tin ví thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async add(user) {
    try {
      const body = { wallet_address: user.wallet };
      const { data } = await user.http.post("tasks/address", body);
      if (data.status === 0) {
        user.log.log(
          `Kết nối địa chỉ ví ${colors.blue(user.wallet)} thành công`
        );
        return true;
      } else if (data.status === 500) {
        user.log.logError(
          `Địa chỉ ví ${colors.blue(
            user.wallet
          )} không tồn tại, hoặc đã liên kết với tài khoản khác`
        );
      }

      return false;
    } catch (error) {
      user.log.logError(`Liên kết ví thất bại - Lỗi: ${error.message}`);
      return null;
    }
  }

  async handleWallet(user) {
    const info = await this.getInfo(user);

    if (!info?.walletAddress) {
      if (user.wallet === "skip") {
        user.log.log(
          colors.yellow(
            `Đã cài đặt bỏ qua không liên kết ví cho tài khoản này!`
          )
        );
      } else if (user.wallet) {
        await this.add(user);
      } else {
        user.log.log(
          colors.yellow(
            `Chưa cài đặt địa chỉ ví, vui lòng thêm địa chỉ ví vào file wallet.txt`
          )
        );
      }
    }
  }
}

const walletService = new WalletService();
export default walletService;
