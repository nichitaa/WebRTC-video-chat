export interface ILogs {
  myNickname: string | undefined;
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

export interface ISignalDto {
  otherUserSocketId: string,
  otherUserNickname: string
}

export interface ISdpDto {
  target: string,
  caller: string,
  sdp: RTCSessionDescription
}

export interface IIceCandidateDto {
  target: string;
  candidate: RTCIceCandidate;
}