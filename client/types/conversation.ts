export type Conversation = {
  _id: string;

  otherUser: {
    _id: string;
    username: string;
  };

  lastMessage?: string;

  unread: number;
};