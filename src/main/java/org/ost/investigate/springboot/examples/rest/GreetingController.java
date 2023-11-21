package org.ost.investigate.springboot.examples.rest;

import io.micrometer.core.annotation.Timed;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
public class GreetingController {

    @GetMapping("/greeting")
    @LogExecutionTime
    @Timed(value = "api.greeting.timer", description = "Time taken to process my API endpoint")
    public Mono<String> greeting() {
        log.info("Greetings from Spring Boot!");
        return Mono.just("Greetings from Spring Boot!");
    }
}
