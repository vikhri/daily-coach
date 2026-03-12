export type TelegramMiniUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type TelegramInitPayload = {
  auth_date?: string;
  chat_type?: string;
  chat_instance?: string;
  query_id?: string;
  hash?: string;
  user?: TelegramMiniUser;
};
