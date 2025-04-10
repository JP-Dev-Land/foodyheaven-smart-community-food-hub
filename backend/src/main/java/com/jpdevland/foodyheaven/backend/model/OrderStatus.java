package com.jpdevland.foodyheaven.backend.model;

public enum OrderStatus {
    PENDING,        // Order placed, waiting for cook confirmation
    ACCEPTED,       // Cook accepted the order
    COOKING,        // Cook is preparing the food
    READY_FOR_PICKUP, // Food ready, waiting for delivery agent
    OUT_FOR_DELIVERY, // Delivery agent picked up
    DELIVERED,      // Order completed
    CANCELLED       // Order cancelled (by user or admin)
}