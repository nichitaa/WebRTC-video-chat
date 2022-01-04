import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import ReactJson from 'react-json-view';
import { Col, message, Modal, Row, Tag, Typography } from 'antd';
import { useStoreContext } from '../../context/useStoreContext';
import { PhoneOutlined } from '@ant-design/icons';
import Header from './components/Header';
import { IIceCandidateDto, ILogs, ISdpDto, ISignalDto } from '../../types';
import { signalingServerUrl } from '../../consts';

console.log('signalingServerUrl: ', signalingServerUrl);
const socket = io(signalingServerUrl);

const RoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { nickname } = useStoreContext();

  const [otherUserNickname, setOtherUserNickname] = useState<string | undefined>(undefined);

  const [logs, setLogs] = useState<ILogs>({
    myNickname: nickname,
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

    // cleanup on unmount
    return removeMyStream;
  }, []);

  const rtcPeerLogic = (stream: MediaStream) => {
    myVideo.current!.srcObject = stream;
    myStream.current = stream;

    setLogs(prev => ({ ...prev, mySocketId: socket.id }));

    // notify the server that someone joined the room
    socket.emit('joinRoom', { roomId, nickname });

    socket.on('otherUserId', (args: ISignalDto) => {
      const { otherUserNickname, otherUserSocketId } = args;

      message.success(`Successfully accepted: ${otherUserNickname}`, 5);

      setLogs(prev => ({ ...prev, callerSocketId: otherUserSocketId }));
      otherUserId.current = otherUserSocketId;
      peerRef.current = createPeer(otherUserSocketId);

      // 1 track for the video and 1 for the audio
      // gives access to the video and audio stream to our peer
      myStream.current?.getTracks().forEach(track => peerRef.current?.addTrack(track, myStream.current));
    });

    socket.on('userJoined', (args: ISignalDto) => {
      const { otherUserSocketId, otherUserNickname } = args;
      showConfirmModal(otherUserNickname);
      setLogs(prev => ({ ...prev, answeredSocketId: otherUserSocketId }));
      otherUserId.current = otherUserSocketId;
    });

    socket.on('acceptedBy', (name: string) => {
      message.success(`Successfully accepted by user: ${name}`, 6);
      setOtherUserNickname(name);
    });

    socket.on('waitingToBeAcceptedBy', (name: string) => {
      message.warning(`Waiting to be accepted by ${name}`);
    });

    socket.on('callRejected', (name: string) => {
      message.error(`User ${name} did not accept your call!`, 10);
      navigate('/');
    });

    socket.on('otherUserDisconnected', (name: string) => {
      message.warning(`${name} just disconnected!`, 6);
      partnerVideo.current.srcObject = null;
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

  const showConfirmModal = (otherUserNickname: string) => {
    Modal.confirm({
      icon: <PhoneOutlined />,
      content: <Typography.Title level={5}>
        user <Tag style={{ marginRight: 0 }} color={'volcano'}>{otherUserNickname}</Tag> wants to connect
      </Typography.Title>,
      cancelText: 'Reject',
      okText: 'Accept',
      onOk: () => {
        socket.emit('callAccepted', { roomId, nickname });
        setOtherUserNickname(otherUserNickname);
      },
      onCancel: () => {
        socket.emit('callRejected', { roomId, nickname });
      },
    });
  };

  const createPeer = (otherUserSocketId?: string): RTCPeerConnection => {
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
        {
          urls: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
        {
          urls: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
        {
          urls: 'turn:turn.bistri.com:80',
          credential: 'homeo',
          username: 'homeo',
        },
        {
          urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
          credential: 'webrtc',
          username: 'webrtc',
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
      if (otherUserSocketId) {
        peerRef.current.createOffer()
          .then(offer => {
            setLogs(prev => ({ ...prev, localDescription: JSON.parse(JSON.stringify(offer)) }));
            return peerRef.current.setLocalDescription(offer);
          })
          .then(() => {
            const payload: ISdpDto = {
              target: otherUserSocketId,
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

  const removeMyStream = () => {
    myStream.current.getTracks().forEach((track) => {
      track.stop();
      track.dispatchEvent(new Event('ended'));
    });
  };

  const onCallHangUp = () => {
    removeMyStream();
    socket.disconnect();
    navigate('/');
  };

  /**
   * On page close / refresh
   */
  window.addEventListener('beforeunload', (ev) => {
    ev.preventDefault();
    removeMyStream();
    return true;
  });

  return (
    <>
      <Header
        myNickname={nickname}
        otherUserNickname={otherUserNickname}
        onCallHangUp={onCallHangUp}
      />
      <Row style={{
        padding: '10px',
      }} gutter={10}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <div className={'video-container'}>
            {/*ME*/}
            <video
              className={'my-video'}
              ref={myVideo}
              autoPlay={true}
              muted={true} />

            {/*PARTNER*/}
            <video
              className={'partner-video'}
              controls={true}
              ref={partnerVideo}
              autoPlay={true}
              muted={true} />

          </div>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <ReactJson
            name={'WebRTC-logs'}
            src={logs}
            theme={'harmonic'}
            collapsed={true}
            displayDataTypes={false}
            indentWidth={2}
            shouldCollapse={(field) => {
              const keys = ['sdp', 'remoteDescription', 'localDescription'];
              if (field.type === 'array') return true;
              return field.name ? keys.includes(field.name) : false;
            }}
            enableClipboard={false}
          />
        </Col>
      </Row>
    </>
  );
};

export default RoomPage;