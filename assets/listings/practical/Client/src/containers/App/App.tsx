import styles from './App.module.css';

import Header from '@components/Header';
import Main from '@components/Main';

const App = () => (
  <div className={styles.wrapper}>
    <Header />
    <div className={styles.break_line}></div>
    <Main />
  </div>
);

export default App;
