import axios from "axios";

const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const setMyCommands = () => {
  const commands = [
    {
      command: "test",
      description: "test",
    },
    {
      command: "test2",
      description: "test2",
    },
  ];

  axios.post(
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

const init = () => {
  setMyCommands();
};

export default init;
