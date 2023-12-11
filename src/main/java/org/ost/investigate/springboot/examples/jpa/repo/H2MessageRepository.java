package org.ost.investigate.springboot.examples.jpa.repo;

import org.ost.investigate.springboot.examples.jpa.model.H2Message;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

//@Repository
public interface H2MessageRepository extends CrudRepository<H2Message, String> {
}
