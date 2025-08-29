
import { Message } from "./data";

export interface ServerToClientEvents {
    receiveMessage: (message: Message) => void;
}
  
export interface ClientToServerEvents {
    joinRoom: (userId: string) => void;
    sendMessage: (message: Message, recipientId: string) => void;
}
