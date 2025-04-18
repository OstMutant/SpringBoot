package org.ost.investigate.springboot.examples.repository;

import org.ost.investigate.springboot.examples.dto.UserFilter;
import org.ost.investigate.springboot.examples.entyties.User;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserRepositoryCustom {
    Flux<User> findByFilter(UserFilter filter, Pageable pageable);

    Mono<Long> countByFilter(UserFilter filter);
}
