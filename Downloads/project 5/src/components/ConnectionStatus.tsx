import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  peerId: string;
}

const ConnectionStatusComponent: React.FC<ConnectionStatusProps> = ({ status, peerId }) => {
  return (
    <div className="fixed top-4 left-4 z-10">
      <div className="flex items-center bg-gray-900/80 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-lg">
        {status === 'connected' ? (
          <>
            <Wifi size={16} className="mr-2 text-green-400" />
            <span className="text-sm mr-2">Connected</span>
            <div className="flex items-center bg-gray-800 rounded-full px-2 py-0.5">
              <span className="text-xs font-mono text-gray-300">{peerId.substring(0, 8)}</span>
            </div>
          </>
        ) : status === 'connecting' ? (
          <>
            <Loader2 size={16} className="mr-2 text-yellow-400 animate-spin" />
            <span className="text-sm">Connecting...</span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="mr-2 text-red-400" />
            <span className="text-sm">Disconnected</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusComponent;