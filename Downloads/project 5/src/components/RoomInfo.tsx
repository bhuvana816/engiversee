import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

interface RoomInfoProps {
  roomId: string;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ roomId }) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="fixed top-4 right-4 z-10">
      <div className="bg-gray-900/80 backdrop-blur-sm text-white rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs text-gray-300 mb-1">Room ID (Share to invite)</div>
        <div className="flex items-center">
          <span className="text-sm font-mono mr-2 truncate max-w-[150px]">{roomId}</span>
          <button 
            onClick={copyToClipboard} 
            className="text-gray-300 hover:text-white transition-colors"
            title="Copy Room ID"
          >
            {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;