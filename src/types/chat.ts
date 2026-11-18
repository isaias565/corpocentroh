export type ChatMessageKind = 'chat' | 'saludo' | 'peticion';

export interface ChatMessage {
  id: string;
  author: string;
  location: string;
  stationId: string;
  stationLabel: string;
  kind: ChatMessageKind;
  text: string;
  createdAt: string;
  hearts: number;
  isCabin?: boolean;
}

export type ServerWsEvent =
  | {
      type: 'init';
      messages: ChatMessage[];
      onlineCount: number;
    }
  | {
      type: 'chat:message';
      message: ChatMessage;
    }
  | {
      type: 'chat:reaction';
      messageId: string;
      hearts: number;
    }
  | {
      type: 'presence:update';
      onlineCount: number;
    }
  | {
      type: 'error';
      error: string;
    };
