package org.ost.investigate.springboot.examples.rest;

import static org.hamcrest.Matchers.equalTo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.reactive.server.WebTestClient;

@ExtendWith(SpringExtension.class)
@WebFluxTest(GreetingController.class)
class GreetingControllerTest {

    @Autowired
    WebTestClient webTestClient;

    @Test
    void testGreeting() {
        webTestClient.get()
            .uri("/greeting")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class)
            .value(equalTo("Greetings from Spring Boot!"));
    }

}

