package org.ost.investigate.springboot.examples.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@Slf4j
public class GreetingController {

    @GetMapping("/greeting")
//    @Timed("my.metric.name")
    public Mono<String> greeting() {
        log.info("Greetings from Spring Boot!");
        return Mono.just("Greetings from Spring Boot!");
    }
}
