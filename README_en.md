<p align="center">
  <img src="https://github.com/user-attachments/assets/b6eff61a-2f5e-4a2c-94a0-192eeaadf40a" alt="Tomarket Banner" width="15%" />
</p>

# Automation Tool for Tomarket ($TOMA) with NodeJS by ZuyDD

**This tool is developed and shared for free by ZuyDD**

<a href="https://www.facebook.com/zuy.dd"><img src="https://raw.githubusercontent.com/zuydd/image/main/facebook.svg" alt="Facebook"></a>
<a href="https://t.me/zuydd"><img src="https://raw.githubusercontent.com/zuydd/image/main/telegram.svg" alt="Telegram"></a>

> [!WARNING]
> The sale of this tool in any form is strictly prohibited!

## 🛠️ Installation Guide

> **NodeJS is required** to be installed on your system.

1. Download the latest version of the tool [here ⬇️](https://github.com/zuydd/tomarket/archive/refs/heads/main.zip).
2. Extract the downloaded tool.
3. Open the extracted folder and run the command `npm install` to install all the necessary dependencies.

## 💾 Adding Account Data

> The tool supports both `user` and `query_id` formats (using `user` is recommended).

> All the required data is located in the files within the 📁 `src/data` directory.

- [users.txt](src/data/users.txt): Contains the list of [users]((#📋-step-by-step-guide-to-extract-query_id)) or [query_id](#📋-step-by-step-guide-to-extract-query_id) for each account, one per line.
- [proxy.txt](src/data/proxy.txt): Contains the proxy list. Each proxy corresponds to the account in the same line in `users.txt`. Leave blank if no proxy is used.
- [wallet.txt](src/data/wallet.txt): Contains the list of TON wallet addresses to be linked. Each wallet address corresponds to the account in the same line in `users.txt`. Leave blank or write `skip` if you don't want to link a wallet.
- [token.json](src/data/token.json): Contains the list of tokens generated from `user` or `query_id`. You can copy tokens from other tools into this file (as long as the format is the same).

> Proxy format: `http://user:pass@ip:port`

## 📋 Step-by-Step Guide to Extract query_id

### Prerequisites
- You need to log in to **Telegram Web** or **Telegram Desktop**.
- Make sure **Inspect Element** is enabled in your settings (for **Telegram Desktop**, go to **Advanced Settings** and turn on **InsectAllow**).

### Steps to Extract `query_id` or `user`:

1. **Login to Web Telegram or Telegram Desktop**.
2. Open the **TOMARKET miniapp**.
3. Press `Ctrl + Shift + I` (Windows/Linux) or `Cmd + Option + I` (Mac) to open the **Inspect Element** tool.

### Method 1: Using Application Storage

1. Navigate to the **Application** tab in the Inspect tool.
2. Under **Storage**, look for **Session Storage**.
3. Search for the key `user=xxx` or `query_id=xxxx`.
4. Copy the value of `user` or `query_id` to use in the bot script.

### Method 2: Using the Console

1. Go to the **Console** section in the Inspect tool. (`allow pasting`)
2. In the console, paste the following command:
    ```javascript
    copy(decodeURIComponent(sessionStorage.SourceTarget).split('#tgWebAppData=')[1].split('&tgWebAppVersion=')[0])
    ```
   This command will copy the `user=xxx` or `query_id=xxxx` directly to your clipboard.
3. Simply paste the value into the bot script - **src/data/users.txt**.

> **Note**: After extracting the `user` or `query_id`, you can use them in the respective data file **src/data/users.txt** in the format mentioned above.

> **Note:** `user` and `query_id` have a lifespan of about 1-2 days for token generation, while tokens last for 30 days. If login fails, generate a new `user` or `query_id`.

## >\_ Commands and Their Functions

| Command           | Function                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| `npm run start`   | Runs the tool to claim rewards, complete tasks, play games, etc.                        |
| `npm run wallet`  | Links the wallet to the account                                                         |

## 🕹️ Features of the Tool

- Automatic daily check-in
- Auto task completion
- Auto daily combo
- Auto claim
- Auto gameplay
- Auto rank collection and rank upgrade
- Auto spin
- Auto Puzzle completion
- Auto proxy detection and reconnection in case of errors. Add proxies to `proxy.txt` in the corresponding account line, leave blank or write `skip` if not using proxies.
- Multi-threading: Run as many accounts as you want without interference. Game replay happens after a set time.
- Countdown display for the next run. You can disable it by setting `IS_SHOW_COUNTDOWN = false` to reduce lag.

> [!WARNING]
>
> - You can set the maximum number of spins using stars (maximum 3, minimum 0). The default is 0 (disabled). To change this, find the variable `MAX_SPIN_STAR = 0`.
> - You can set the limit for free spins (minimum 0, default 1). To change this, find `MIN_SPIN_FREE = 1`.
> - Rank upgrades will only happen when you have enough stars.
> - Wallet linking only applies to accounts that haven't linked a wallet yet.
> - Wallet addresses must be TON addresses generated from Bitget Wallet.

## ♾ Multi-threading Configuration

- By default, the tool runs in multi-thread mode based on the number of accounts provided, no additional setup required.
- By default, each account (thread) starts 10 seconds apart in the first loop to avoid spam requests. You can adjust this delay by modifying `DELAY_ACC = 10` in the file [index.js](src/run/index.js).

## ❌ Retry Mechanism for Errors

- For proxy connection errors, the system retries every 30 seconds. You can set a retry limit by modifying `MAX_RETRY_PROXY = 20` in the file [index.js](src/run/index.js). After the limit is reached, the tool will stop for that account and log the error in [log.error.txt](src/data/log.error.txt).
- For login failure, the system retries every 60 seconds. You can set a retry limit by modifying `MAX_RETRY_LOGIN = 20` in [index.js](src/run/index.js). After the limit is reached, the tool will stop for that account and log the error in [log.error.txt](src/data/log.error.txt).

## 🔄 Update History

> Latest version: `v1.0.2`

<details>
<summary>v1.0.2 - 📅 16/10/2024</summary>
  
- Fixed issue with Puzzle data retrieval
</details>
<details>
<summary>v1.0.1 - 📅 16/10/2024</summary>
  
- Added auto Puzzle completion (new daily combo)
- Fixed various bugs
</details>
<details>
<summary>v1.0.0 - 📅 07/10/2024</summary>
  
- Added auto rank collection and upgrades
- Added auto spinning
- Added wallet linking feature
- Added countdown to the next run
- Optimized login and retry mechanisms
</details>
<details>
<summary>v0.0.7 - 📅 05/09/2024</summary>
  
- Fixed balance retrieval
</details>
<details>
<summary>v0.0.6 - 📅 20/08/2024</summary>
  
- Added auto daily combo
- Fixed bugs
- Updated README
</details>
<details>
<summary>v0.0.5 - 📅 18/08/2024</summary>
  
- Bug fixes
</details>

## 🎁 Donations

We are thrilled to share our scripts and open-source resources with the airdrop community for free. If you find our tools and documentation helpful and wish to support our continued development and maintenance, you can make a donation.

Your contributions will help us maintain the quality of our services and continue providing valuable resources to the airdrop community. We sincerely appreciate your support!

Please refer to the main [README.md](README.md) for details on how to donate.

<p align="center">
  <img src="https://raw.githubusercontent.com/zuydd/image/main/qr-momo.png" alt="QR Momo" height="340" />
  <img src="https://raw.githubusercontent.com/zuydd/image/main/qr-binance.jpg" alt="QR Binance" height="340" />
</p>
