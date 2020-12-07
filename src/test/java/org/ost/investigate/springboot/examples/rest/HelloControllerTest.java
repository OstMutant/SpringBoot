package org.ost.investigate.springboot.examples.rest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class HelloControllerTest {

    @Autowired
    private TestRestTemplate template;

    @Test
    public void testHello() throws Exception {
        ResponseEntity<String> response = template.getForEntity("http://localhost:8080/", String.class);
        assertThat(response.getBody()).isEqualTo("Hello world!");
    }

}
