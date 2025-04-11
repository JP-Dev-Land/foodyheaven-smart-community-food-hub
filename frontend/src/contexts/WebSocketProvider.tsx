import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useStompClient } from '../hooks/useStompClient'; // Adjust path if needed
import { Client, IMessage } from '@stomp/stompjs';

interface WebSocketContextType {
    isConnected: boolean;
    subscribe: (destination: string, callback: (message: IMessage) => void) => string | null;
    unsubscribe: (identifier: string) => void; // Identifier is the destination string
    publish: (destination: string, body: string, headers?: { [key: string]: any }) => void;
    client: Client | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize the hook within the provider
    const stompHookValue = useStompClient({
        // Optional global handlers
        // onConnect: () => console.log("Global WebSocket Connected"),
        // onDisconnect: () => console.log("Global WebSocket Disconnected"),
        // onError: (error) => console.error("Global WebSocket Error:", error),
    });

    // Memoize the context value object itself.
    // The hook now returns stable functions, so this might seem redundant,
    // but it's good practice, especially if the hook returned more values.
    const contextValue = useMemo(() => ({
        isConnected: stompHookValue.isConnected,
        subscribe: stompHookValue.subscribe,
        unsubscribe: stompHookValue.unsubscribe,
        publish: stompHookValue.publish,
        client: stompHookValue.client,
    }), [
        stompHookValue.isConnected,
        stompHookValue.subscribe,
        stompHookValue.unsubscribe,
        stompHookValue.publish,
        stompHookValue.client,
    ]);


    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

// Custom hook remains the same
export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (context === undefined) { // Check for undefined explicitly
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};