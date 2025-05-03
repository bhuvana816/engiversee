import { useState, useEffect, useRef } from 'react';

interface PermissionState {
  camera: 'prompt' | 'granted' | 'denied';
  microphone: 'prompt' | 'granted' | 'denied';
}

export const useMediaStream = (videoEnabled: boolean = true, audioEnabled: boolean = true) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(videoEnabled);
  const [isAudioEnabled, setIsAudioEnabled] = useState(audioEnabled);
  const [permissionState, setPermissionState] = useState<PermissionState>({
    camera: 'prompt',
    microphone: 'prompt'
  });
  const streamRef = useRef<MediaStream | null>(null);

  // Check permission status
  const checkPermissions = async () => {
    try {
      const permissions = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName })
      ]);

      setPermissionState({
        camera: permissions[0].state,
        microphone: permissions[1].state
      });

      // Listen for permission changes
      permissions.forEach((permission, index) => {
        permission.addEventListener('change', () => {
          setPermissionState(prev => ({
            ...prev,
            [index === 0 ? 'camera' : 'microphone']: permission.state
          }));
        });
      });
    } catch (err) {
      console.warn('Permission API not supported:', err);
    }
  };

  // Initialize the media stream
  useEffect(() => {
    const getMediaStream = async () => {
      try {
        // Check permissions first
        await checkPermissions();

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });
        
        streamRef.current = mediaStream;
        setStream(mediaStream);
        
        // Set initial tracks state
        if (!videoEnabled && mediaStream.getVideoTracks().length > 0) {
          mediaStream.getVideoTracks().forEach(track => {
            track.enabled = false;
          });
        }
        
        if (!audioEnabled && mediaStream.getAudioTracks().length > 0) {
          mediaStream.getAudioTracks().forEach(track => {
            track.enabled = false;
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        
        // Handle specific permission errors
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError(new Error('Camera and microphone access is required. Please allow access in your browser settings and refresh the page.'));
        } else if (error.name === 'NotFoundError') {
          setError(new Error('No camera or microphone found. Please connect a device and refresh the page.'));
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setError(new Error('Could not access your camera or microphone. Please ensure no other application is using them.'));
        } else {
          setError(error);
        }
        console.error('Error accessing media devices:', error);
      }
    };

    getMediaStream();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const newState = !isVideoEnabled;
        videoTracks.forEach(track => {
          track.enabled = newState;
        });
        setIsVideoEnabled(newState);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newState = !isAudioEnabled;
        audioTracks.forEach(track => {
          track.enabled = newState;
        });
        setIsAudioEnabled(newState);
      }
    }
  };

  // Get screen share stream
  const getScreenShareStream = async (): Promise<MediaStream | null> => {
    try {
      // @ts-ignore - TypeScript doesn't fully recognize getDisplayMedia
      return await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch (err) {
      console.error('Error sharing screen:', err);
      return null;
    }
  };

  return {
    stream,
    error,
    isVideoEnabled,
    isAudioEnabled,
    permissionState,
    toggleVideo,
    toggleAudio,
    getScreenShareStream,
  };
};