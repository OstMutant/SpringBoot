package org.ost.investigate.springboot.examples.redis.repo;

import org.ost.investigate.springboot.examples.redis.model.RedisMessage;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RedisMessageRepository extends CrudRepository<RedisMessage, String> {
}
