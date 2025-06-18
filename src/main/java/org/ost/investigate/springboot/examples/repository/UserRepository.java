package org.ost.investigate.springboot.examples.repository;

import org.ost.investigate.springboot.examples.entyties.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface UserRepository extends ReactiveCrudRepository<User, Long>, UserRepositoryCustom {
}
