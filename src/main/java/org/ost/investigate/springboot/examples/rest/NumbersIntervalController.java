package org.ost.investigate.springboot.examples.rest;

import static org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE;

import io.micrometer.core.annotation.Timed;
import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
public class NumbersIntervalController {
    @GetMapping(value = "/numbers_interval", produces = TEXT_EVENT_STREAM_VALUE)
    @LogExecutionTime
    @Timed(value = "api.numbers_interval.timer", description = "Time taken to process 'numbers_interval' API endpoint")
    public Flux<Data> numberInterval() {
        log.info("Numbers interval from Spring Boot!");
        return interval();
    }

    private Flux<Data> interval() {
        return Flux.interval(Duration.ofSeconds(1))
            .take(5)
            .map(i -> new Data(i, Instant.now()));
    }

    public record Data(long seqNo, Instant timestamp) {
    }
}
