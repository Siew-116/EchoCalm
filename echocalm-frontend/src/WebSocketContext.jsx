import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = (endpoint = 'default') => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context.getConnection(endpoint);
};

export const WebSocketProvider = ({ children }) => {
  const sockets = useRef({});
  const handlers = useRef({});
  const readiness = useRef({});
  const [_, forceUpdate] = useState(0); // to trigger rerender

  const initWebSocket = (endpoint) => {
    const url = `ws://localhost:5555/${endpoint}`;
    const socket = new WebSocket(url);
    sockets.current[endpoint] = socket;
    readiness.current[endpoint] = false;

    socket.onopen = () => {
      readiness.current[endpoint] = true;
      forceUpdate((n) => n + 1); // notify reactivity
    };

    socket.onmessage = (event) => {
      const handler = handlers.current[endpoint];
      if (typeof handler === 'function') handler(event);
    };

    socket.onclose = () => {
      readiness.current[endpoint] = false;
      forceUpdate((n) => n + 1);
    };

    socket.onerror = (err) => {
      readiness.current[endpoint] = false;
      forceUpdate((n) => n + 1);
    };
  };

  const getConnection = (endpoint) => {
    if (!sockets.current[endpoint]) {
      initWebSocket(endpoint);
    }

    return {
      socket: sockets.current[endpoint],
      isReady: readiness.current[endpoint] || false,
      send: (data) => {
        const sock = sockets.current[endpoint];
        if (sock && sock.readyState === WebSocket.OPEN) {
          sock.send(JSON.stringify(data));
        }
      },
      setMessageHandler: (handler) => {
        handlers.current[endpoint] = handler;
      },
      close: () => {
        sockets.current[endpoint]?.close();
        delete sockets.current[endpoint];
        delete handlers.current[endpoint];
        delete readiness.current[endpoint];
      }
    };
  };

  return (
    <WebSocketContext.Provider value={{ getConnection }}>
      {children}
    </WebSocketContext.Provider>
  );
};
