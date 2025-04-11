package com.jpdevland.foodyheaven.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Registers the STOMP endpoints, mapping each endpoint to a specific URL
     * and configuring SockJS fallback options.
     * `/ws` is the endpoint that clients will connect to.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for WebSocket connections. SockJS is used for fallback compatibility.
        // Allow connections from the React frontend origin.
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173") // Adjust to your frontend URL
                .withSockJS();
    }

    /**
     * Configures the message broker options.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefixes for messages that are routed to @MessageMapping annotated methods in controllers.
        registry.setApplicationDestinationPrefixes("/app");

        // Prefixes for destinations that the client can subscribe to.
        // The simple broker handles messages in-memory.
        // Use "/topic" for publish-subscribe (one-to-many)
        // Use "/queue" for point-to-point (one-to-one, often user-specific)
        registry.enableSimpleBroker("/topic", "/queue");

        // Optionally configure prefix for user-specific destinations
        // Messages sent to "/user/queue/..." will be routed to a specific user.
         registry.setUserDestinationPrefix("/user");
    }

    // NOTE: WebSocket Security configuration might be needed for production.
    // This basic setup relies on the initial HTTP authentication.
    // Proper WebSocket security involves intercepting CONNECT messages and validating tokens.
}