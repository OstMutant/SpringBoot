package org.ost.investigate.springboot.examples.rest;

import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@Slf4j
public class GreetingController {

    @GetMapping("/greeting")
    @LogExecutionTime
//    @Timed("my.metric.name")
    public Mono<String> greeting() {
        log.info("Greetings from Spring Boot!");
        return Mono.just("Greetings from Spring Boot!");
    }
}
