package org.ost.investigate.springboot.examples.rest;

import static org.springframework.http.MediaType.APPLICATION_NDJSON_VALUE;

import io.micrometer.core.annotation.Timed;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.ost.investigate.springboot.examples.entyties.User;
import org.ost.investigate.springboot.examples.repository.UserRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/users")
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public Mono<User> createUser(@RequestBody User user) {
        if (Objects.isNull(user.getCreatedAt())){
            user.setCreatedAt(LocalDateTime.now());
        }
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @PutMapping("/{id}")
    public Mono<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userRepository.findById(id)
            .flatMap(existingUser -> {
                existingUser.setName(user.getName());
                existingUser.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existingUser);
            });
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteUser(@PathVariable Long id) {
        return userRepository.deleteById(id);
    }

    @PostMapping(value = "/filter", produces = APPLICATION_NDJSON_VALUE)
    @LogExecutionTime
    @Timed(value = "api.stream-json.timer", description = "Time taken to process 'stream' API endpoint")
    public Flux<Wrap> getUsersByFilter(@RequestBody Filter filter) {
        log.info("Server JSON Stream from Spring Boot!");

        return userRepository.findAll()
            .delayElements(Duration.ofMillis(500))
            .filter(user -> filter.getId() == null || Objects.equals(user.getId(), filter.getId()))
            .map(Object.class::cast)
            .map(v-> new Wrap("data", v))
            .concatWithValues(new Wrap("done", null));
    }

    public record Wrap(String type, Object value) {
    }

    @NoArgsConstructor
    @Getter
    @Setter
    public static class Filter {
        private Long id;
    }
}
