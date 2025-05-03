import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  MessageSquare,
  X,
} from 'lucide-react';

interface ControlPanelProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => void;
  endCall: () => void;
  toggleChat: () => void;
  isChatOpen: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  toggleAudio,
  toggleVideo,
  startScreenShare,
  endCall,
  toggleChat,
  isChatOpen,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg z-10 transition-all duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`control-btn ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`control-btn ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        
        <button
          onClick={startScreenShare}
          className="control-btn bg-gray-700 hover:bg-gray-600"
          title="Share your screen"
        >
          <ScreenShare size={20} />
        </button>
        
        <button
          onClick={toggleChat}
          className={`control-btn ${isChatOpen ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={isChatOpen ? 'Close chat' : 'Open chat'}
        >
          <MessageSquare size={20} />
        </button>
        
        <button
          onClick={endCall}
          className="control-btn bg-red-600 hover:bg-red-500"
          title="End call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;