const HomePage = () => {
  /* ... */
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