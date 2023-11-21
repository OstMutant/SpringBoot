package org.ost.investigate.springboot.examples;

import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String... args) {
        SpringApplication.run(Application.class, args);
    }
}
