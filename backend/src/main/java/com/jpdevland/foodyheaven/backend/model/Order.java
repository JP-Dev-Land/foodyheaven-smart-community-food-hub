package com.jpdevland.foodyheaven.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cook_id", nullable = false)
    private User cook; // The cook responsible for this order

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_agent_id") // Nullable initially
    private User deliveryAgent; // User with ROLE_DELIVERY_AGENT role

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "latitude", column = @Column(name = "pickup_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "pickup_longitude")),
        @AttributeOverride(name = "street", column = @Column(name = "pickup_street")),
        @AttributeOverride(name = "city", column = @Column(name = "pickup_city")),
        @AttributeOverride(name = "postalCode", column = @Column(name = "pickup_postal_code"))
    })
    private Coordinates pickupLocation;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "latitude", column = @Column(name = "delivery_latitude")),
        @AttributeOverride(name = "longitude", column = @Column(name = "delivery_longitude")),
        @AttributeOverride(name = "street", column = @Column(name = "delivery_street")),
        @AttributeOverride(name = "city", column = @Column(name = "delivery_city")),
        @AttributeOverride(name = "postalCode", column = @Column(name = "delivery_postal_code"))
    })
    private Coordinates deliveryLocation;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Cascade operations: if an Order is saved/deleted, its OrderItems are too.
    // orphanRemoval=true: if an OrderItem is removed from this list, it's deleted from DB.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Eager fetch items with order
    @Builder.Default // Initialize with empty list when using @Builder
    private List<OrderItem> items = new ArrayList<>();

    // Helper method to add items and maintain bidirectional relationship
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}