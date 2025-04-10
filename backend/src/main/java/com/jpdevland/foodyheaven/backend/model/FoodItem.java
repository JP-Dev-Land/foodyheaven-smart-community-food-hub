package com.jpdevland.foodyheaven.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "food_items")
@Data // Includes @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@NoArgsConstructor
@AllArgsConstructor
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // Fetch User only when needed
    @JoinColumn(name = "cook_id", nullable = false) // Foreign key column
    private User cook; // The user who added/owns this item

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT") // For longer descriptions
    private String description;

    @Column(nullable = false, precision = 10, scale = 2) // Suitable for currency
    private BigDecimal price;

    @Column(name = "image_url", length = 2048) // Store URL to image
    private String imageUrl;

    // Simple approach for tags (stored in a separate table automatically)
    @ElementCollection(fetch = FetchType.EAGER) // Fetch tags immediately with FoodItem
    @CollectionTable(name = "food_item_tags", joinColumns = @JoinColumn(name = "food_item_id"))
    @Column(name = "tag") // Column name in the join table
    private List<String> tags;

    @Column(nullable = false)
    private boolean available = true; // Default to available

    // Timestamps (Optional but recommended)
     @CreationTimestamp
     private Instant createdAt;
     @UpdateTimestamp
     private Instant updatedAt;
}