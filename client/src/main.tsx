import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';
import App from './App';
import './index.less';

/**
 * https://vitejs.dev/guide/assets.html#the-public-directory
 * public directory is served as root path during dev and copied to the root of dist on build
 */
const themes = {
  dark: `${import.meta.env.VITE_PUBLIC_BASE_URL}/themes/dark-theme.css`,
  light: `${import.meta.env.VITE_PUBLIC_BASE_URL}/themes/light-theme.css`,
};

const app =
  <ThemeSwitcherProvider
    themeMap={themes}
    defaultTheme={'dark'}
    insertionPoint='styles-insertion-point'>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeSwitcherProvider>;


render(app, document.getElementById('root'));
