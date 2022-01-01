import {useNavigate} from "react-router-dom";
import {Button} from 'antd';
import {nanoid} from 'nanoid';

const HomePage = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    const id = nanoid(10)
    navigate(`/room/${id}`)
  }
  
  return (
    <div>
      <Button onClick={createRoom}>Create Room</Button>
    </div>
  );
};

export default HomePage;