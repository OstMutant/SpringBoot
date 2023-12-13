package org.ost.investigate.springboot.examples.rest;

import io.micrometer.core.annotation.Timed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.logexecutiontime.LogExecutionTime;
import org.ost.investigate.springboot.examples.r2dbc.model.Message;
import org.ost.investigate.springboot.examples.r2dbc.repo.MessageRepository;
import org.ost.investigate.springboot.examples.mappers.GreetingMessageMapper;
import org.ost.investigate.springboot.examples.model.GreetingIncomeMessage;
import org.ost.investigate.springboot.examples.model.GreetingOutgoingMessage;
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
    private final MessageRepository messageRepository;
    private final GreetingMessageMapper greetingMessageMapper;

    @PostMapping("/addMessage")
    @LogExecutionTime
    @Timed(value = "api.greeting.add.message.timer", description = "Time taken to process my API endpoint")
    public Mono<Message> addMessage(@RequestBody GreetingIncomeMessage greetingIncomeMessage) {
        log.info("Greeting addMessage: {}", greetingIncomeMessage);
        return messageRepository.save(greetingMessageMapper.toMessageModel(greetingIncomeMessage));
    }

    @GetMapping("/messages")
    @LogExecutionTime
    @Timed(value = "api.greeting.get.messages.timer", description = "Time taken to process my API endpoint")
    public Flux<GreetingOutgoingMessage> getMessages() {
        log.info("Greeting getMessages");
        return messageRepository.findAll().map(v -> GreetingOutgoingMessage.builder().message(v.getMessage()).build());
    }
}
