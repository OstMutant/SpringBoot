package org.ost.investigate.springboot.examples.jpa.repo;

import org.ost.investigate.springboot.examples.jpa.model.H2Message;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

// https://www.baeldung.com/spring-boot-h2-database
// https://www.baeldung.com/the-persistence-layer-with-spring-and-jpa
// https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa
// http://localhost:8080/h2-console/login.do?jsessionid=da3cab232bd8c2de236e931a8d8eac53
@Repository
public interface H2MessageRepository extends CrudRepository<H2Message, String> {
}
