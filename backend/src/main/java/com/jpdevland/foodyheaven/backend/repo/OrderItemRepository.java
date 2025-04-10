package com.jpdevland.foodyheaven.backend.repo;

import com.jpdevland.foodyheaven.backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}