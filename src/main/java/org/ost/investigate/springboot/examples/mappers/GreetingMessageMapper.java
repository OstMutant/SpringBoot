package org.ost.investigate.springboot.examples.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.ost.investigate.springboot.examples.jpa.model.H2Message;
import org.ost.investigate.springboot.examples.model.GreetingIncomeMessage;
import org.ost.investigate.springboot.examples.redis.model.RedisMessage;

@Mapper(componentModel = "spring")
public interface GreetingMessageMapper {
    default RedisMessage toRedisMessageModel(GreetingIncomeMessage greetingIncomeMessage) {
        return toRedisMessage(greetingIncomeMessage);
    }

    default H2Message toH2MessageModel(GreetingIncomeMessage greetingIncomeMessage) {
        return toH2Message(greetingIncomeMessage);
    }

    @Mapping(target = "id", expression = "java(java.util.UUID.randomUUID().toString())")
    RedisMessage toRedisMessage(GreetingIncomeMessage greetingIncomeMessage);


    H2Message toH2Message(GreetingIncomeMessage greetingIncomeMessage);
}
