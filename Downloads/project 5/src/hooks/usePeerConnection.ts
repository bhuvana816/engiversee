import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { PeerConnection, ConnectionStatus } from '../types';

export const usePeerConnection = (username: string) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const dataConnectionRef = useRef<Map<string, Peer.DataConnection>>(new Map());

  // Initialize peer connection
  const initializePeer = useCallback(() => {
    setStatus('connecting');
    try {
      const newPeer = new Peer(undefined, {
        debug: 3,
      });

      newPeer.on('open', (id) => {
        console.log('My peer ID is:', id);
        setPeerId(id);
        setStatus('connected');
      });

      newPeer.on('error', (err) => {
        console.error('Peer connection error:', err);
        setError(err);
        setStatus('disconnected');
      });

      newPeer.on('disconnected', () => {
        console.log('Peer disconnected');
        setStatus('disconnected');
      });

      newPeer.on('close', () => {
        console.log('Peer connection closed');
        setStatus('disconnected');
      });

      // Handle incoming calls
      newPeer.on('call', (call) => {
        if (localStreamRef.current) {
          call.answer(localStreamRef.current);
          
          call.on('stream', (remoteStream) => {
            // Check if connection already exists
            if (!connections.some(conn => conn.peerId === call.peer)) {
              setConnections(prev => [
                ...prev,
                { 
                  peerId: call.peer, 
                  call, 
                  stream: remoteStream,
                  username: 'User'  // Default until we get the real username
                }
              ]);
            }
          });
        }
      });

      // Handle data connection
      newPeer.on('connection', (conn) => {
        dataConnectionRef.current.set(conn.peer, conn);
        
        conn.on('data', (data) => {
          if (data.type === 'username') {
            setConnections(prev => 
              prev.map(connection => 
                connection.peerId === conn.peer 
                  ? { ...connection, username: data.username }
                  : connection
              )
            );
          }
        });

        // Send our username to the other peer
        conn.on('open', () => {
          conn.send({ type: 'username', username });
        });
      });

      setPeer(newPeer);
      return newPeer;
    } catch (err) {
      console.error('Failed to initialize peer:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize peer'));
      setStatus('disconnected');
      return null;
    }
  }, [username]);

  // Set local stream
  const setLocalStream = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
  }, []);

  // Call a peer
  const callPeer = useCallback(async (remotePeerId: string) => {
    if (!peer || !localStreamRef.current) {
      throw new Error('Peer not initialized or local stream not available');
    }
    
    try {
      // Create data connection first to exchange usernames
      const dataConnection = peer.connect(remotePeerId);
      dataConnectionRef.current.set(remotePeerId, dataConnection);
      
      dataConnection.on('open', () => {
        dataConnection.send({ type: 'username', username });
      });
      
      dataConnection.on('data', (data) => {
        if (data.type === 'username') {
          setConnections(prev => 
            prev.map(connection => 
              connection.peerId === remotePeerId 
                ? { ...connection, username: data.username }
                : connection
            )
          );
        }
      });

      // Now make the media call
      const call = peer.call(remotePeerId, localStreamRef.current);
      
      call.on('stream', (remoteStream) => {
        setConnections(prev => {
          // Check if connection already exists
          const existingConnection = prev.find(conn => conn.peerId === remotePeerId);
          if (existingConnection) {
            return prev.map(conn => 
              conn.peerId === remotePeerId 
                ? { ...conn, call, stream: remoteStream } 
                : conn
            );
          } else {
            return [...prev, { 
              peerId: remotePeerId, 
              call, 
              stream: remoteStream,
              username: 'User'  // Default until we get the real username from data channel
            }];
          }
        });
      });
      
      call.on('close', () => {
        console.log('Call closed:', remotePeerId);
        setConnections(prev => prev.filter(conn => conn.peerId !== remotePeerId));
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        setConnections(prev => prev.filter(conn => conn.peerId !== remotePeerId));
      });
    } catch (err) {
      console.error('Error calling peer:', err);
      throw err;
    }
  }, [peer, username]);

  // Send a message to all peers
  const sendMessage = useCallback((text: string) => {
    const message = {
      id: uuidv4(),
      text,
      sender: username,
      timestamp: Date.now(),
    };

    dataConnectionRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: 'message', message });
      }
    });

    return {
      ...message,
      isLocal: true,
    };
  }, [username]);

  // Disconnect from all peers
  const disconnect = useCallback(() => {
    connections.forEach(connection => {
      if (connection.call) {
        connection.call.close();
      }
    });
    
    dataConnectionRef.current.forEach((conn) => {
      conn.close();
    });
    
    if (peer) {
      peer.destroy();
    }
    
    setConnections([]);
    setPeer(null);
    setPeerId('');
    setStatus('disconnected');
  }, [connections, peer]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    peer,
    peerId,
    status,
    error,
    connections,
    initializePeer,
    setLocalStream,
    callPeer,
    sendMessage,
    disconnect,
  };
};