import React from 'react';
import { Typography } from 'antd';

const Header = () =>
  <Typography.Title
    level={2}
    style={{
      textAlign: 'center',
    }}
    className={'app-header'}
  >
    <Typography.Text code={true}>
      WebRTC - Video Chat 🚀
    </Typography.Text>
  </Typography.Title>;


export default Header;