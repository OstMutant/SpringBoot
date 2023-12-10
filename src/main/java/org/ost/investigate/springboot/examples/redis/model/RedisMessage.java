package org.ost.investigate.springboot.examples.redis.model;

import lombok.Builder;
import lombok.ToString;
import org.springframework.data.redis.core.RedisHash;

@Builder
@ToString
@RedisHash("RedisMessage")
public class RedisMessage {
    private String id;

    private String message;
}
