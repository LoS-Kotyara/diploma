import { useContext } from 'react';

import WebSocketContext from '@providers/WebSocket';

import styles from './HomePage.module.css';

import GeneralTab from "@components/Home__GeneralTab"
import StripTab from "@components/Home__StripTab"
import MicrophoneTab from "@components/Home__MicrophoneTab"

const HomePage = () => {
  const { data } = useContext(WebSocketContext)



  return (
    <div className={styles.wrapper__main}>
      <h1 className="header__text">Home</h1>
      <div className={styles.wrapper__tabs_list}>
        <GeneralTab data={data} />

        <StripTab data={data} />

        <MicrophoneTab data={data} />
      </div>
    </div>
  );
};

export default HomePage;
