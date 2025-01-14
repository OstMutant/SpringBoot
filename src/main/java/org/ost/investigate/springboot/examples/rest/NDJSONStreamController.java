package org.ost.investigate.springboot.examples.rest;

import static org.springframework.http.MediaType.APPLICATION_NDJSON_VALUE;

import io.micrometer.core.annotation.Timed;
import java.time.Duration;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
public class NDJSONStreamController {

    @PostMapping(value = "/stream-json", produces = APPLICATION_NDJSON_VALUE)
    @LogExecutionTime
    @Timed(value = "api.stream-json.timer", description = "Time taken to process 'stream-sse' API endpoint")
    public Flux<Data> serverJSONStream(@RequestBody Filter filter) {
        log.info("Server JSON Stream from Spring Boot!");

        return Flux.interval(Duration.ofMillis(500))
            .take(10)
            .map(i -> new Data(i, Instant.now()))
            .filter(data -> filter.getSeqNo() == null || data.seqNo == filter.getSeqNo())
            .filter(data -> filter.getTimestamp() == null || data.timestamp.equals(filter.getTimestamp()))
            .concatWithValues(new Data(-1, Instant.now()));
    }

    public record Data(long seqNo, Instant timestamp) {
    }

    @NoArgsConstructor
    @Getter
    @Setter
    public static class Filter {
        private Long seqNo;
        private Instant timestamp;
    }
}
