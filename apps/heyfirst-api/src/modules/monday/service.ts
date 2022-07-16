import type { TelegramMessage } from "@/services/telegram/telegram.type";
import telegram from "@/services/telegram";

export const handleMessage = async (message: TelegramMessage) => {
  await telegram.sendTextMessage({
    text: message.text,
    replyToMessageID: message.message_id,
  });
};
