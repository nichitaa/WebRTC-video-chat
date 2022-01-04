import React, { useState } from 'react';
import { Button, Col, Input, message, Row, Typography } from 'antd';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { useStoreContext } from '../../../context/useStoreContext';

const Controls = () => {
  const navigate = useNavigate();

  const { nickname, setNickname } = useStoreContext();

  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [joinRoomId, setJoinRoomId] = useState<string | undefined>(undefined);

  const onGenerateNickname = () => {
    const name = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-' });
    message.warning(`Hello ${name} :)`);
    setNickname(name);
  };

  const onGenerateRoomId = () => {
    const id = nanoid(8);
    setRoomId(id);
    message.success(`New room ID: ${roomId}`);
  };

  const onJoinPersonalRoom = () => {
    if (!nickname || nickname.trim() === '') return message.error('Your nickname is required!', 3);
    if (!roomId) return message.error('Generate a room ID!', 3);
    navigate(`/room/${roomId}`);
  };

  const onJoinRoom = () => {
    if (!nickname || nickname.trim() === '') return message.error('Your nickname is required!', 3);
    if (!joinRoomId) return message.error('Room ID is required!');
    navigate(`/room/${joinRoomId}`);
  };

  const onCopyToClipboard = async () => {
    if (!roomId) return message.error('Generate a room ID!', 3);
    await navigator.clipboard.writeText(roomId);
    message.success(`Room ID ${roomId} copied to clipboard`);
  };

  return (
    <div className={'controls-container'}>
      <Row gutter={8}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} className={'responsive-col'}>
          <Typography.Title level={4} className={'controls-text'}>
            <Typography.Text code={true}>About you</Typography.Text>
          </Typography.Title>
          <Input value={nickname}
                 onChange={(e) => setNickname(e.target.value)}
                 className={'mb-8'}
                 placeholder={'nickname'} />
          <Button className={'mb-8'}
                  onClick={onGenerateNickname}
                  block={true}
                  type={'primary'}>
            Generate Nickname
          </Button>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} className={'responsive-col'}>
          <Typography.Title level={4} className={'controls-text'}>
            <Typography.Text code={true}>Make a room</Typography.Text>
          </Typography.Title>
          <Input value={roomId}
                 disabled={true}
                 className={'mb-8'}
                 placeholder={'room ID'} />
          <Button onClick={onGenerateRoomId}
                  block={true}
                  className={'mb-8'}
                  type={'primary'}>
            Generate ID
          </Button>
          <Button onClick={onCopyToClipboard}
                  block={true}
                  className={'mb-8'}
                  type={'default'}>
            Copy
          </Button>
          <Button onClick={onJoinPersonalRoom}
                  block={true}
                  className={'mb-8'}
                  type={'default'}>
            Join your room
          </Button>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} className={'responsive-col'}>
          <Typography.Title level={4} className={'controls-text'}>
            <Typography.Text code={true}>Join a call</Typography.Text>
          </Typography.Title>
          <Input value={joinRoomId}
                 onChange={(e) => setJoinRoomId(e.target.value)}
                 className={'mb-8'}
                 placeholder={'room ID'} />
          <Button block={true}
                  className={'mb-8'}
                  type={'primary'}
                  onClick={onJoinRoom}>
            Join Room
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Controls;