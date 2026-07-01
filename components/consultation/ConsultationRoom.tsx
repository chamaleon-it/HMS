"use client";

import { JitsiMeeting } from '@jitsi/react-sdk';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

interface ConsultationRoomProps {
  roomId: string;
  meetingUrl: string;
  userName: string;
  onEndConsultation: () => void;
  domain?: string;
}

export default function ConsultationRoom({
  roomId,
  meetingUrl,
  userName,
  onEndConsultation,
  domain = '8x8.vc',
}: ConsultationRoomProps) {
  const router = useRouter();
  const apiRef = useRef<any>(null);
  
  // According to requirement: Use localhost:8000 for Jitsi domain from env or default
  // Defaulting to meet.jit.si since localhost:8000 fails to load HTTPS script locally
  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';

  const handleReadyToClose = () => {
    onEndConsultation();
  };

  return (
    <div className="w-full h-full min-h-screen bg-gray-900">
      <JitsiMeeting
        domain={jitsiDomain}
        roomName={roomId}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startScreenSharing: true,
          enableEmailInStats: false,
          disableRecordAudioNotification: true,
          disableRemoteMute: true,
          remoteVideoMenu: {
            disableKick: true,
          },
          prejoinPageEnabled: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'settings',
            'raisehand', 'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur',
            'recording', 'localrecording'
          ],
        }}
        userInfo={{
          displayName: userName,
          email: ""
        }}
        onApiReady={(externalApi) => {
          apiRef.current = externalApi;
          externalApi.addListener('readyToClose', handleReadyToClose);
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100vh';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
