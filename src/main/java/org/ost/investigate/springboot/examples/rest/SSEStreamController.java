package org.ost.investigate.springboot.examples.rest;

import static org.springframework.http.MediaType.APPLICATION_NDJSON_VALUE;
import static org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE;

import io.micrometer.core.annotation.Timed;
import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
public class SSEStreamController {
    @GetMapping(value = "/stream-sse", produces = TEXT_EVENT_STREAM_VALUE)
    @LogExecutionTime
    @Timed(value = "api.stream-sse.timer", description = "Time taken to process 'stream-sse' API endpoint")
    public Flux<ServerSentEvent<Object>> serverSentEventStream() {
        log.info("Server Sent Event Stream from Spring Boot!");

        ServerSentEvent<Object> retrySettings = ServerSentEvent.builder().retry(Duration.ofSeconds(10)).build();
        ServerSentEvent<Object> error = ServerSentEvent.builder().event("error").data("test Error").build();
        ServerSentEvent<Object> close = ServerSentEvent.builder().event("close").data("test close").build();

        return Flux.just(retrySettings, error)
            .concatWith(getPayload())
            .concatWith(Mono.just(close));
    }

    @GetMapping(value = "/stream-json", produces = APPLICATION_NDJSON_VALUE)
    @LogExecutionTime
    @Timed(value = "api.stream-json.timer", description = "Time taken to process 'stream-sse' API endpoint")
    public Flux<Data> serverJSONStream() {
        log.info("Server JSON Stream from Spring Boot!");
        return Flux.interval(Duration.ofSeconds(1))
            .take(5)
            .map(i -> new Data(i, Instant.now()));
    }

    private Flux<ServerSentEvent<Object>> getPayload() {
        return Flux.interval(Duration.ofSeconds(1))
            .take(5)
            .map(sequence -> ServerSentEvent.builder()
                .id(String.valueOf(sequence))
                .event("message")
                .data(new Data(sequence, Instant.now()))
                .build());
    }

    public record Data(long seqNo, Instant timestamp) {
    }
}
