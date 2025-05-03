import React, { useState } from 'react';
import { Video, UserPlus } from 'lucide-react';

interface JoinFormProps {
  username: string;
  setUsername: (username: string) => void;
  roomId: string;
  setRoomId: (roomId: string) => void;
  onJoin: () => void;
  onCreate: () => void;
  isLoading: boolean;
}

const JoinForm: React.FC<JoinFormProps> = ({
  username,
  setUsername,
  roomId,
  setRoomId,
  onJoin,
  onCreate,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300">
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Video className="text-white" size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Video Chat
        </h2>
        
        <div className="mb-6">
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex border-b border-gray-300 dark:border-gray-600 mb-4">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'join'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('join')}
          >
            Join a Room
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create a Room
          </button>
        </div>
        
        {activeTab === 'join' ? (
          <>
            <div className="mb-6">
              <label 
                htmlFor="roomId" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              onClick={onJoin}
              disabled={!username || !roomId || isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </>
        ) : (
          <button
            onClick={onCreate}
            disabled={!username || isLoading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create New Room'}
          </button>
        )}
      </div>
      
      <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Secure, peer-to-peer video chat with no data stored on servers
        </p>
      </div>
    </div>
  );
};

export default JoinForm;