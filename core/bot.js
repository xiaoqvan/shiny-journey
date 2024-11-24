import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from "dotenv";
import fs from "fs";
import yaml from "js-yaml";
import { registerCommands } from "../commands/index.js";
import { logMessage } from "./utils/Logging.js"; // 引入logMessage

dotenv.config();

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const botToken = process.env.BOT_TOKEN;

const cookie = yaml.load(fs.readFileSync("config/cookie.yaml", "utf-8"));
const botconfig = yaml.load(fs.readFileSync("config/bot.yaml", "utf-8"));
const stringSession = new StringSession(cookie.stringSession || "");

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    botAuthToken: botToken,
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  client.sendMessage(botconfig.creator_id, { message: "bot已经上线" });

  cookie.stringSession = client.session.save();
  fs.writeFileSync("config/cookie.yaml", yaml.dump(cookie));

  registerCommands(client);

  // 添加事件处理器来打印所有接收到的消息
  client.addEventHandler((event) => {
    logMessage(event);
  }, new TelegramClient.events.NewMessage({}));
})();
