import { Switch, Route } from 'react-router-dom';

import { WebSocketProvider } from '@providers/WebSocket';
import routesConfig from '@routes/routesConfig';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { useState, useMemo } from 'react';

import DataType from './../../types/WebSocketServerResponseType'
import React from 'react';

const newClient = () => new W3CWebSocket('ws://192.168.0.219:8000')

const Main = () => {
  const client = useMemo<W3CWebSocket>(() => newClient(), [])

  const [data, setData] = useState<DataType>({
    general: {
      wss: false,
      strip: false,
      microphone: false,
    },
    strip: {
      brightness: 0,
      fps: 0
    },
    microphone: {
      lowerBound: 0,
      noisePercent: 0
    }
  });

  client.onopen = () => {
    setInterval(() => {
      client.send(JSON.stringify({ type: 'get' }))
    }, 1000)
  }

  client.onmessage = (message) => {
    setData(JSON.parse(message.data.toString()) as DataType)
  }

  client.onclose = () => {
    console.log('Disconnected from server');
  }

  client.onerror = () => {
    client.close()

  }


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

export default React.memo(Main);
