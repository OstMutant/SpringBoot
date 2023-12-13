package org.ost.investigate.springboot.examples.r2dbc.repo;

import org.ost.investigate.springboot.examples.r2dbc.model.Message;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

// https://www.baeldung.com/spring-boot-h2-database
// https://www.baeldung.com/the-persistence-layer-with-spring-and-jpa
// https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa
// http://localhost:8080/h2-console/login.do?jsessionid=da3cab232bd8c2de236e931a8d8eac53
// https://copyprogramming.com/howto/java-configure-h2-in-spring-boot-code-example
// https://www.bezkoder.com/spring-boot-r2dbc-h2/
@Repository
public interface MessageRepository extends R2dbcRepository<Message, Long> {
}
