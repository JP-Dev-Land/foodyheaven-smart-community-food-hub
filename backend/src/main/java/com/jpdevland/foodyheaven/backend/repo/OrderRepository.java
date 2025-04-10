package com.jpdevland.foodyheaven.backend.repo;

import com.jpdevland.foodyheaven.backend.model.Order;
import com.jpdevland.foodyheaven.backend.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findByCookIdOrderByCreatedAtDesc(Long cookId);

    List<Order> findByDeliveryAgentIdOrderByCreatedAtDesc(Long deliveryAgentId);

    // Example: Find orders available for delivery agents to pick up
    List<Order> findByStatusAndDeliveryAgentIdIsNull(OrderStatus status);

    // Find specific order ensuring customer owns it
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :orderId AND o.customer.id = :customerId")
    Order findByIdAndCustomerIdWithItems(Long orderId, Long customerId);

    // Find specific order ensuring cook owns it (or admin potentially)
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :orderId AND o.cook.id = :cookId")
    Order findByIdAndCookIdWithItems(Long orderId, Long cookId);
}