package org.ost.investigate.springboot.examples.repository;

import org.ost.investigate.springboot.examples.entyties.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface UserRepository extends ReactiveCrudRepository<User, Long>, UserRepositoryCustom {
    Flux<User> findByIdBetween(Long startId, Long endId, Pageable pageable);

    Flux<User> findAllByOrderByUpdatedAtDesc();

    Flux<User> findByIdBetweenOrderByUpdatedAtDesc(Long startId, Long endId);
}
