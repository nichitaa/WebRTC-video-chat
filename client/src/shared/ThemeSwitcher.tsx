import React from 'react';
import MoonImg from '../assets/img/moon.png';
import SunImg from '../assets/img/sun.png';
import { useThemeSwitcher } from 'react-css-theme-switcher';

const ThemeSwitcher = () => {
  const { switcher, themes, currentTheme } = useThemeSwitcher();

  const onThemeChange = () => {
    switcher({ theme: currentTheme === 'light' ? themes.dark : themes.light });
  };

  return (
    <div className={'theme-switcher'}>
      <img onClick={onThemeChange}
           src={currentTheme === 'dark' ? MoonImg : SunImg}
           alt='toggle theme image'
           style={{ maxWidth: '40px' }} />
    </div>
  );
};

export default ThemeSwitcher;