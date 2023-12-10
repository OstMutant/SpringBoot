package org.ost.investigate.springboot.examples.rest;

import io.micrometer.core.annotation.Timed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.logexecutiontime.LogExecutionTime;
import org.ost.investigate.springboot.examples.redis.model.RedisMessage;
import org.ost.investigate.springboot.examples.redis.repo.RedisMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@AllArgsConstructor
public class GreetingController {
    private final RedisMessageRepository redisMessageRepository;

    @GetMapping("/greeting")
    @LogExecutionTime
    @Timed(value = "api.greeting.timer", description = "Time taken to process my API endpoint")
    public Mono<String> greeting() {
        log.info("Greetings from Spring Boot!");
        redisMessageRepository.findAll().forEach(v->log.info("-redis keys-" + v));
        redisMessageRepository.save(RedisMessage.builder().id("testId").message("Greetings from Spring Boot!").build());
        return Mono.just("Greetings from Spring Boot!");
    }
}
