package org.ost.investigate.springboot.examples.jpa.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.ToString;
import org.springframework.data.redis.core.RedisHash;

@Builder
@ToString
@Entity
public class H2Message {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private String id;

    private String message;
}
