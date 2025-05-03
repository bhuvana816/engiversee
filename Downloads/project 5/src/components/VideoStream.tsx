import React, { useRef, useEffect } from 'react';

interface VideoStreamProps {
  stream: MediaStream;
  muted?: boolean;
  username?: string;
  isLocal?: boolean;
}

const VideoStream: React.FC<VideoStreamProps> = ({ 
  stream, 
  muted = false, 
  username = 'User', 
  isLocal = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-800 shadow-lg transition-all">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${isLocal ? 'mirror' : ''}`}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center gap-2">
          {isLocal && (
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          )}
          <span className="text-white font-medium truncate">
            {isLocal ? `${username} (You)` : username}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoStream;