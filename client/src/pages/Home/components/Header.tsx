import React from 'react';
import { Typography } from 'antd';
import MoonImg from '../../../assets/img/moon.png';
import SunImg from '../../../assets/img/sun.png';
import { useThemeSwitcher } from 'react-css-theme-switcher';

const Header = () => {
  const { switcher, themes, currentTheme } = useThemeSwitcher();

  const onThemeChange = () => {
    switcher({ theme: currentTheme === 'light' ? themes.dark : themes.light });
  };

  return <>
    <div className={'theme-switcher'}>
      <img onClick={onThemeChange}
           src={currentTheme === 'dark' ? MoonImg : SunImg}
           alt='toggle theme image'
           style={{ maxWidth: '40px' }} />
    </div>
    <Typography.Title
      level={2}
      style={{ textAlign: 'center' }}
      className={'app-header'}
    >
      <Typography.Text code={true}>
        WebRTC - Video Chat 🚀
      </Typography.Text>
    </Typography.Title>
  </>;
};


export default Header;