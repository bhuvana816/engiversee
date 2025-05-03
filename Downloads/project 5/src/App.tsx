import React, { useState, useEffect, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { Mic, MicOff, Video, VideoOff, Share2, MessageSquare, Users, Copy, Link } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { Message } from './types';

interface Participant {
  id: string;
  stream: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
}

const App: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage: sendMessage,
    addReceivedMessage,
  } = useChat((text: string) => ({
    id: uuidv4(),
    text,
    sender: username || 'You',
    timestamp: Date.now(),
    isLocal: true,
  }));

  useEffect(() => {
    // Check if there's a room ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('room');
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
  }, []);

  useEffect(() => {
    if (isInCall && localStream) {
      // Initialize PeerJS
      const peer = new Peer(roomId);
      peerRef.current = peer;

      peer.on('open', (id: string) => {
        console.log('My peer ID is: ' + id);
      });

      peer.on('call', (call: MediaConnection) => {
        if (localStream) {
          call.answer(localStream);
          call.on('stream', (remoteStream: MediaStream) => {
            setParticipants((prev: Participant[]) => [...prev, { id: call.peer, stream: remoteStream, isMuted: false, isVideoOff: false }]);
          });
        }
      });

      return () => {
        if (peerRef.current) {
          peerRef.current.destroy();
        }
      };
    }
  }, [isInCall, localStream, roomId]);

  const handleCreateRoom = async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      setIsHost(true);
      setIsInCall(true);
      
      // Initialize local stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username || !roomId) return;
    
    setIsLoading(true);
    try {
      setIsInCall(true);
      
      // Initialize local stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Connect to the host
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', (id: string) => {
        const call = peer.call(roomId, stream);
        call.on('stream', (remoteStream: MediaStream) => {
          setParticipants((prev: Participant[]) => [...prev, { id: roomId, stream: remoteStream, isMuted: false, isVideoOff: false }]);
        });
      });
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(roomLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Join or Create a Meeting</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="Enter room ID or leave empty to create new"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleCreateRoom}
                disabled={!username || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded"
              >
                Create Room
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!username || !roomId || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Meeting Room: {roomId}</h1>
          {isHost && (
            <button
              onClick={copyRoomLink}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              <Link size={20} />
              <span>Copy Room Link</span>
              {showCopied && <span className="text-green-500 ml-2">Copied!</span>}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Video Area */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[60vh] rounded-lg bg-black"
              />
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button
                  onClick={handleToggleVideo}
                  className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'}`}
                >
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
                <button
                  onClick={handleShareScreen}
                  className="p-2 rounded-full bg-gray-700"
                >
                  <Share2 size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Chat and Participants */}
          <div className="space-y-4">
            {/* Chat */}
            <div className="bg-gray-800 rounded-lg p-4 h-[40vh]">
              <div className="flex items-center mb-4">
                <MessageSquare size={20} className="mr-2" />
                <h3 className="text-lg font-semibold">Chat</h3>
              </div>
              <div className="h-[calc(100%-8rem)] overflow-y-auto mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <span className="font-semibold">{msg.sender}: </span>
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-700 rounded px-3 py-2"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Users size={20} className="mr-2" />
                <h3 className="text-lg font-semibold">Participants</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>{username || 'You'}</span>
                </div>
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Participant {participant.id.slice(0, 5)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;