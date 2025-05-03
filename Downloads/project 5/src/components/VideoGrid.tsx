import React from 'react';
import VideoStream from './VideoStream';
import { PeerConnection } from '../types';

interface VideoGridProps {
  localStream: MediaStream | null;
  connections: PeerConnection[];
  username: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ localStream, connections, username }) => {
  const totalStreams = (localStream ? 1 : 0) + connections.length;
  
  const getGridClass = () => {
    switch (totalStreams) {
      case 0:
        return 'hidden';
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
      case 4:
        return 'grid-cols-1 sm:grid-cols-2';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 w-full max-w-6xl mx-auto p-4`}>
      {localStream && (
        <div className={`${totalStreams === 1 ? 'col-span-full' : ''} transition-all duration-300 ease-in-out`}>
          <VideoStream 
            stream={localStream} 
            muted 
            username={username} 
            isLocal 
          />
        </div>
      )}
      
      {connections.map((connection) => (
        connection.stream && (
          <div key={connection.peerId} className="transition-all duration-300 ease-in-out">
            <VideoStream 
              stream={connection.stream} 
              username={connection.username} 
            />
          </div>
        )
      ))}
    </div>
  );
};

export default VideoGrid;