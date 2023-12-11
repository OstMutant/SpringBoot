package org.ost.investigate.springboot.examples.jpa.configuration;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

// https://www.baeldung.com/spring-boot-h2-database
// https://www.baeldung.com/the-persistence-layer-with-spring-and-jpa
// https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa
@EnableJpaRepositories(basePackages = "org.ost.investigate.springboot.examples.jpa.repo")
public class PersistenceJPAConfig {
}
