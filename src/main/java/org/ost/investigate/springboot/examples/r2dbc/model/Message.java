package org.ost.investigate.springboot.examples.r2dbc.model;


import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table(name = "MESSAGE")
@NoArgsConstructor
public class Message {
    @Id
    private Long id;

    private String message;
}
