export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot: boolean;
};

export type TelegramMessage = {
  message_id: number;
  chat: TelegramUser;
  text: string;
  date: number;
  edit_date?: number;
  from?: TelegramUser;
};

export type TelegramRequestBody = {
  update_id: string;
  edited_message?: TelegramMessage;
  message?: TelegramMessage;
};

export type TelegramCommand = {
  command: string; // if set command is 'check', it will be available as '/check'
  description: string;
};
