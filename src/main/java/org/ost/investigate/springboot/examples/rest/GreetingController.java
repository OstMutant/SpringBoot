package org.ost.investigate.springboot.examples.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class GreetingController {
    @GetMapping("/greeting")
    public Mono<String> greeting() {
        return Mono.just("Greetings from Spring Boot!");
    }
}
