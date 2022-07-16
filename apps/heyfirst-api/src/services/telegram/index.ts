import axios from "axios";

const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

type SendMessageParams = { text: string; replyToMessageID?: number };

export const sendTextMessage = ({
  text,
  replyToMessageID,
}: SendMessageParams) =>
  axios.post(
    `https://api.telegram.org/bot${TELEGRAM_SECRET_TOKEN}/sendMessage`,
    {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      reply_to_message_id: replyToMessageID,
    }
  );

type TelegramCommand = {
  command: string; // if set command is 'check', it will be available as '/check'
  description: string;
};

export const setMyChatCommands = (commands: TelegramCommand[]) => {
  return axios.post(
    `https://api.telegram.org/bot${TELEGRAM_SECRET_TOKEN}/setMyCommands`,
    {
      commands,
      scope: {
        type: "chat",
        chat_id: TELEGRAM_CHAT_ID,
      },
    }
  );
};

export default {
  sendTextMessage,
  setMyChatCommands,
};
