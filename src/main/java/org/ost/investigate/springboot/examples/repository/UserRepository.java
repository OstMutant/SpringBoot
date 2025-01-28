package org.ost.investigate.springboot.examples.repository;

import org.ost.investigate.springboot.examples.entyties.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface UserRepository extends ReactiveCrudRepository<User, Long> {

    // Method to find all users ordered by UpdatedAt in descending order
    Flux<User> findAllByOrderByUpdatedAtDesc();

    // Method to find users by ID range ordered by UpdatedAt in descending order
    Flux<User> findByIdBetweenOrderByUpdatedAtDesc(Long startId, Long endId);
}
