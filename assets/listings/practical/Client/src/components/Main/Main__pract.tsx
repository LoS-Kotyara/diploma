const Main = () => {
  /* ... */
  return (
    <div>
      <WebSocketProvider value={{ client, data, setData }}>
        <Switch>
          {routesConfig.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              component={route.component}
            />
          ))}
        </Switch>
      </WebSocketProvider>
    </div>
  );
};
