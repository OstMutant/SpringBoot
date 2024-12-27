package org.ost.investigate.springboot.examples.controller;

import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.thymeleaf.spring6.context.webflux.ReactiveDataDriverContextVariable;
import reactor.core.publisher.Flux;

@Slf4j
@Controller
public class WebController {
    @GetMapping(value = "/")
    public String index(Model model) {
        model.addAttribute("name", "Ost");
        model.addAttribute("data", new ReactiveDataDriverContextVariable(getPayload(), 2));

        return "index";
    }

    private Flux<Item> getPayload() {
        return Flux.interval(Duration.ofSeconds(1))
            .take(5)
            .map(sequence -> new Item(sequence, Instant.now()));
    }

    public record Item(long seq, Instant timestamp) {
    }
}
