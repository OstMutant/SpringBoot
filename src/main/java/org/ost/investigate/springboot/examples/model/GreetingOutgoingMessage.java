package org.ost.investigate.springboot.examples.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.jackson.Jacksonized;

@Builder
@Getter
@Jacksonized
@EqualsAndHashCode
@ToString
public class GreetingOutgoingMessage {
    private Long id;
    private String message;
}
