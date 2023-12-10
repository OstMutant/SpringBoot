package org.ost.investigate.springboot.examples.redis.repo;

import org.ost.investigate.springboot.examples.redis.model.RedisMessage;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

// https://www.baeldung.com/spring-data-redis-tutorial
@Repository
public interface RedisMessageRepository extends CrudRepository<RedisMessage, String> {
}
