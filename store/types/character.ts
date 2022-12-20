export type SignUpPayload = {
  name: string;
  nickname: string;
  username: string;
  email: string | null;
  password: string;
};

export type SignInPayload = {
  key: string;
  password: string;
};

export type InitialData = {
  id: number;
  csrfToken: string;
  notificationToken: string;
  existsUnreadNotification: boolean;
  existsUnreadMail: boolean;
  administrator: boolean;
};

export type NotificationPayload = {
  message: string;
};
