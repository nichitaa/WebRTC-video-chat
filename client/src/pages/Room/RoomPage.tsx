import { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import ReactJson from 'react-json-view';

interface ILogs {
  roomId?: string;
  mySocketId?: string;
  callerSocketId?: string;
  answeredSocketId?: string;
  receivedOffers: any[];
  sentOffers: any[];
  receivedAnswers: any[],
  sentAnswers: any[],
  receivedICECandidates: any[],
  sentICECandidates: any[],
  localDescription: any,
  remoteDescription: any
}

interface ISdpDto {
  target: string,
  caller: string,
  sdp: RTCSessionDescription
}

interface IIceCandidateDto {
  target: string;
  candidate: RTCIceCandidate;
}

const socket = io('http://localhost:8080');

const RoomPage = () => {
  const { roomId } = useParams();

  const [logs, setLogs] = useState<ILogs>({
    roomId,
    callerSocketId: undefined,
    mySocketId: undefined,
    answeredSocketId: undefined,
    localDescription: undefined,
    remoteDescription: undefined,
    receivedOffers: [],
    sentOffers: [],
    receivedAnswers: [],
    sentAnswers: [],
    sentICECandidates: [],
    receivedICECandidates: [],
  });

  const myVideo = useRef<HTMLVideoElement>(null!);
  const partnerVideo = useRef<HTMLVideoElement>(null!);

  const peerRef = useRef<RTCPeerConnection>(null!);
  const otherUserId = useRef<string>(null!);
  const myStream = useRef<MediaStream>(null!);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => rtcPeerLogic(stream))
      .catch(err => console.log('error: ', err));
  }, []);

  const rtcPeerLogic = (stream: MediaStream) => {
    myVideo.current.srcObject = stream;
    myStream.current = stream;

    setLogs(prev => ({ ...prev, mySocketId: socket.id }));

    // notify the server that someone joined the room
    socket.emit('joinRoom', roomId);

    socket.on('otherUserId', (userId: string) => {
      setLogs(prev => ({ ...prev, callerSocketId: userId }));
      otherUserId.current = userId;
      peerRef.current = createPeer(userId);
      // 1 track for the video and 1 for the audio
      // gives access to the video and audio stream to our peer
      myStream.current?.getTracks().forEach(track => peerRef.current?.addTrack(track, myStream.current));
    });

    socket.on('userJoined', (userId: string) => {
      setLogs(prev => ({ ...prev, answeredSocketId: userId }));
      otherUserId.current = userId;
    });

    socket.on('offer', (offer: ISdpDto) => {
      setLogs(prev => ({ ...prev, receivedOffers: [...prev.receivedOffers, offer] }));
      // we are receiving the offer (call), we are not initiating the call, so we do not send the offer
      // no need to pass the otherUserId
      peerRef.current = createPeer();
      const description = new RTCSessionDescription(offer.sdp);
      peerRef.current.setRemoteDescription(description)
        .then(() => {
          setLogs(prev => ({ ...prev, remoteDescription: JSON.parse(JSON.stringify(description)) }));
          myStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, myStream.current));
        })
        .then(() => peerRef.current.createAnswer())
        .then(answer => {
          setLogs(prev => ({ ...prev, localDescription: JSON.parse(JSON.stringify(answer)) }));
          return peerRef.current.setLocalDescription(answer);
        })
        .then(() => {
          const payload: ISdpDto = {
            target: offer.caller,
            caller: socket.id,
            sdp: peerRef.current.localDescription!,
          };
          setLogs(prev => ({ ...prev, sentAnswers: [...prev.sentAnswers, payload] }));
          socket.emit('answer', payload);
        });
    });

    socket.on('answer', (answer: ISdpDto) => {
      setLogs(prev => ({ ...prev, receivedAnswers: [...prev.receivedAnswers, answer] }));
      const description = new RTCSessionDescription(answer.sdp);
      peerRef.current.setRemoteDescription(description)
        .then(() => setLogs(prev => ({ ...prev, remoteDescription: JSON.parse(JSON.stringify(description)) })))
        .catch(err => console.log('error: ', err));
    });

    socket.on('ICECandidate', (ICECandidate) => {
      setLogs(prev => ({ ...prev, receivedICECandidates: [...prev.receivedICECandidates, ICECandidate] }));
      const candidate = new RTCIceCandidate(ICECandidate);
      peerRef.current.addIceCandidate(candidate)
        .catch(err => console.log('error: ', err));
    });
  };

  const createPeer = (userId?: string): RTCPeerConnection => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org',
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com',
        },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        const payload: IIceCandidateDto = {
          target: otherUserId.current,
          candidate: event.candidate,
        };
        setLogs(prev => ({ ...prev, sentICECandidates: [...prev.sentICECandidates, payload] }));
        socket.emit('ICECandidate', payload);
      }
    };

    peer.ontrack = (event) => {
      partnerVideo.current.srcObject = event.streams[0];
    };

    // will be triggered only for the second peer
    peer.onnegotiationneeded = () => {
      if (userId) {
        peerRef.current.createOffer()
          .then(offer => {
            setLogs(prev => ({ ...prev, localDescription: JSON.parse(JSON.stringify(offer)) }));
            return peerRef.current.setLocalDescription(offer);
          })
          .then(() => {
            const payload: ISdpDto = {
              target: userId,
              caller: socket.id,
              sdp: peerRef.current.localDescription!,
            };
            setLogs(prev => ({ ...prev, sentOffers: [...prev.sentOffers, payload] }));
            socket.emit('offer', payload);
          })
          .catch(err => console.log('error: ', err));
      }
    };

    return peer;
  };

  return (
    <div>
      <ReactJson
        src={logs}
        displayDataTypes={false}
        indentWidth={2}
        shouldCollapse={(field) => {
          const keys = ['sdp', 'remoteDescription', 'localDescription'];
          if (field.type === 'array') return true;
          return field.name ? keys.includes(field.name) : false;
        }}
        enableClipboard={false}
      />
      <p>Me</p>
      <video width={200} ref={myVideo} autoPlay={true} muted={true} />
      <br />
      <p>Partner</p>
      <video controls={true} width={200} ref={partnerVideo} autoPlay={true} muted={true} />
    </div>
  );
};

export default RoomPage;