import React from 'react';
import { Button, Tag, Tooltip, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { PhoneOutlined } from '@ant-design/icons';

interface MainProps {
  myNickname: string | undefined;
  otherUserNickname: string | undefined;

  onCallHangUp(): void;
}

const Header = (props: MainProps) => {
  const { myNickname, otherUserNickname, onCallHangUp } = props;
  const { roomId } = useParams();
  return (
    <Typography.Title level={2} className={'app-header'}>
      <Typography.Text code={true}>
        <Tooltip title={'Hang up'}>
          <Button
            onClick={onCallHangUp}
            style={{ marginRight: '8px' }}
            danger={true}
            type={'primary'}
            icon={<PhoneOutlined />} />
        </Tooltip>
        Room ID - {roomId}
        &nbsp;
        <Tag color={'lime'}>me: {myNickname}</Tag>
        {otherUserNickname && <Tag color={'orange'}>partner: {otherUserNickname}</Tag>}
      </Typography.Text>
    </Typography.Title>
  );
};

export default Header;