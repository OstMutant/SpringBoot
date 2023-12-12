package org.ost.investigate.springboot.examples.rest;

import io.micrometer.core.annotation.Timed;
import java.util.stream.StreamSupport;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.logexecutiontime.LogExecutionTime;
import org.ost.investigate.springboot.examples.jpa.repo.H2MessageRepository;
import org.ost.investigate.springboot.examples.mappers.GreetingMessageMapper;
import org.ost.investigate.springboot.examples.model.GreetingIncomeMessage;
import org.ost.investigate.springboot.examples.model.GreetingOutgoingMessage;
import org.ost.investigate.springboot.examples.redis.repo.RedisMessageRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/greeting")
public class GreetingController {
    private final RedisMessageRepository redisMessageRepository;
    private final H2MessageRepository h2MessageRepository;
    private final GreetingMessageMapper greetingMessageMapper;

    @PostMapping("/addMessage")
    @LogExecutionTime
    @Timed(value = "api.greeting.add.message.timer", description = "Time taken to process my API endpoint")
    public Mono<String> addMessage(@RequestBody GreetingIncomeMessage greetingIncomeMessage) {
        log.info("Greetings addMessag: {}", greetingIncomeMessage);
        redisMessageRepository.save(greetingMessageMapper.toRedisMessageModel(greetingIncomeMessage));
        h2MessageRepository.save(greetingMessageMapper.toH2MessageModel(greetingIncomeMessage));
        return Mono.empty();
    }

    @GetMapping("/messages")
    @LogExecutionTime
    @Timed(value = "api.greeting.get.messages.timer", description = "Time taken to process my API endpoint")
    public Flux<GreetingOutgoingMessage> getMessages() {
        log.info("Greetings getMessages");
        redisMessageRepository.findAll().forEach(v -> log.info("-redis keys-" + v));
        h2MessageRepository.findAll().forEach(v -> log.info("-H2 rows-" + v));
        return Flux.fromStream(StreamSupport.stream(redisMessageRepository.findAll().spliterator(), false))
            .map(v -> GreetingOutgoingMessage.builder().message(v.getMessage()).build());
    }
}
