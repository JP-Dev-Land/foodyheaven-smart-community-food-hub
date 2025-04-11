import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from '../utils/localStorage'; // Assuming you have this helper

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8080/ws';

interface StompHookOptions {
  onConnect?: (client: Client) => void;
  onDisconnect?: () => void;
  onError?: (error: string | Event | unknown) => void;
}

export const useStompClient = (options?: StompHookOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  const onConnectRef = useRef(options?.onConnect);
  const onDisconnectRef = useRef(options?.onDisconnect);
  const onErrorRef = useRef(options?.onError);

  useEffect(() => {
    onConnectRef.current = options?.onConnect;
    onDisconnectRef.current = options?.onDisconnect;
    onErrorRef.current = options?.onError;
  }, [options?.onConnect, options?.onDisconnect, options?.onError]);

  const token = getToken();

  const initializeAndConnect = useCallback(() => {
    console.log('STOMP: Attempting to initialize and connect...');
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (msg) => console.log('STOMP DEBUG:', msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('STOMP: Connected:', frame);
        clientRef.current = client; // Store connected client
        setIsConnected(true);     // Set connected state *after* storing ref
        onConnectRef.current?.(client);
      },
      onStompError: (frame) => {
        console.error('STOMP: Broker error:', frame.headers['message'], frame.body);
        clientRef.current = null; // Clear ref on error
        setIsConnected(false);
        onErrorRef.current?.(frame.headers['message'] || 'STOMP Broker Error');
      },
      onWebSocketError: (event) => {
        console.error('STOMP: WebSocket error:', event);
         clientRef.current = null; // Clear ref on error
        setIsConnected(false);
        onErrorRef.current?.(event);
      },
      onWebSocketClose: (event) => {
        console.log('STOMP: WebSocket closed:', event);
         clientRef.current = null; // Clear ref on close
         setIsConnected(false);
         // Clear subscriptions when the underlying socket closes
         subscriptionsRef.current.clear();
         onDisconnectRef.current?.(); // Trigger disconnect callback
      },
      // onDisconnect is often redundant if onWebSocketClose handles state,
      // but can be useful for STOMP-level disconnect logic.
      onDisconnect: () => {
          console.log('STOMP: Disconnected callback triggered (may be redundant).');
          // Ensure state reflects disconnect if close didn't trigger first
          if (clientRef.current) clientRef.current = null;
          if (isConnected) setIsConnected(false);
      }
    });

    client.activate();
    return client; // Return instance for cleanup reference
  // Add token to dependency only if connectHeaders rely on it directly
  // }, [SOCKET_URL]);
  // If connectHeaders use token, add it:
  }, [SOCKET_URL/*, token*/]); // Recalculate only if URL (or token for headers) changes

  // Effect to manage connection lifecycle based on token presence
  useEffect(() => {
    let activeClient: Client | null = null;

    if (token && !clientRef.current?.active) {
      // Only connect if token exists and we don't have an active client ref
      activeClient = initializeAndConnect();
    } else if (!token && clientRef.current?.active) {
      // Disconnect if token is removed and we have an active client
      console.log('STOMP: No token or token removed, deactivating client...');
      clientRef.current.deactivate();
      // State updates (isConnected=false, clientRef=null) should happen in onWebSocketClose/onDisconnect
    }

    // Cleanup: Deactivate the client instance created *in this effect run*
    return () => {
      if (activeClient?.active) {
        console.log('STOMP: Deactivating client on effect cleanup...');
        activeClient.deactivate();
        // State updates happen in callbacks
      }
    };
  // *** REMOVED isConnected from dependencies ***
  }, [token, initializeAndConnect]);


  // --- subscribe, unsubscribe, publish remain the same as the previous good version ---
  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void): string | null => {
      const currentClient = clientRef.current;
      if (!currentClient?.connected) {
        console.error(`STOMP: Cannot subscribe to ${destination}, client not connected.`);
        return null;
      }
      if (subscriptionsRef.current.has(destination)) {
        console.warn(`STOMP: Already subscribed to ${destination}. Unsubscribing previous.`);
        subscriptionsRef.current.get(destination)?.unsubscribe();
      }
      console.log(`STOMP: Subscribing to ${destination}`);
      const sub = currentClient.subscribe(destination, callback);
      subscriptionsRef.current.set(destination, sub);
      return destination;
    },
    [] // Stable: Relies on clientRef
  );

  const unsubscribe = useCallback((destination: string) => {
    const sub = subscriptionsRef.current.get(destination);
    if (sub) {
      console.log(`STOMP: Unsubscribing from ${destination}`);
      try {
        sub.unsubscribe();
      } catch (error) {
         console.error(`STOMP: Error unsubscribing from ${destination}`, error)
      } finally {
         subscriptionsRef.current.delete(destination);
      }
    } else {
      console.warn(`STOMP: No active subscription found for destination: ${destination} to unsubscribe.`);
    }
  }, []); // Stable

  const publish = useCallback(
    (destination: string, body: string, headers?: Record<string, any>) => {
      const currentClient = clientRef.current;
      if (currentClient?.connected) {
        currentClient.publish({ destination, body, headers });
      } else {
        console.error(`STOMP: Cannot publish to ${destination}, client not connected.`);
      }
    },
    [] // Stable
  );

  return { isConnected, subscribe, unsubscribe, publish, client: clientRef.current };
};