package org.ost.investigate.springboot.examples.mappers;

import org.mapstruct.Mapper;
import org.ost.investigate.springboot.examples.r2dbc.model.Message;
import org.ost.investigate.springboot.examples.model.GreetingIncomeMessage;

@Mapper(componentModel = "spring")
public interface GreetingMessageMapper {

    default Message toMessageModel(GreetingIncomeMessage greetingIncomeMessage) {
        return toMessage(greetingIncomeMessage);
    }

    Message toMessage(GreetingIncomeMessage greetingIncomeMessage);
}
