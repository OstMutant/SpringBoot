package org.ost.investigate.springboot.examples.r2dbc.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

// https://www.baeldung.com/spring-boot-h2-database
// https://www.baeldung.com/the-persistence-layer-with-spring-and-jpa
// https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa
@EnableR2dbcRepositories(basePackages = "org.ost.investigate.springboot.examples.jpa.repo")
@Configuration
public class R2dbcConfig {
}
