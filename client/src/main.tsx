import {render} from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import App from './App';
import 'antd/dist/antd.less'

const app = <BrowserRouter>
  <App/>
</BrowserRouter>

render(app, document.getElementById('root'));
