export interface PeerConnection {
  peerId: string;
  call?: any;
  stream?: MediaStream;
  username: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';