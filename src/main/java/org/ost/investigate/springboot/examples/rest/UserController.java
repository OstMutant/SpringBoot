package org.ost.investigate.springboot.examples.rest;

import static org.springframework.http.MediaType.APPLICATION_NDJSON_VALUE;

import io.micrometer.core.annotation.Timed;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.aop.LogExecutionTime;
import org.ost.investigate.springboot.examples.dto.UserFilter;
import org.ost.investigate.springboot.examples.entyties.User;
import org.ost.investigate.springboot.examples.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@AllArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping(produces = APPLICATION_NDJSON_VALUE)
    public Flux<Wrap> getUsers(UserFilter filter, @PageableDefault Pageable pageable) {
        log.info("Fetching users");

        UserFilter actualFilter = (filter != null) ? filter : new UserFilter();

        return userRepository.findByFilter(actualFilter, pageable)
            .map(Object.class::cast)
            .map(v -> new Wrap("data", v))
            .concatWithValues(new Wrap("done", null))
            .doOnError(e -> log.error("Error fetching users", e));
    }

    @PostMapping
    public Mono<User> createUser(@RequestBody User user) {
        log.info("Creating new user: {}", user.getName());
        if (Objects.isNull(user.getCreatedAt())) {
            user.setCreatedAt(LocalDateTime.now());
        }
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user)
            .doOnSuccess(u -> log.info("User created: {}", u.getId()))
            .doOnError(e -> log.error("Error creating user", e));
    }

    @PutMapping("/{id}")
    public Mono<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        log.info("Updating user with ID: {}", id);
        return userRepository.findById(id)
            .flatMap(existingUser -> {
                existingUser.setName(user.getName());
                existingUser.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existingUser);
            })
            .doOnSuccess(u -> log.info("User updated: {}", u.getId()))
            .doOnError(e -> log.error("Error updating user", e));
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteUser(@PathVariable Long id) {
        log.info("Deleting user with ID: {}", id);
        return userRepository.deleteById(id)
            .doOnSuccess(unused -> log.info("User deleted: {}", id))
            .doOnError(e -> log.error("Error deleting user", e));
    }

    @GetMapping("/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        log.info("Get user with ID: {}", id);
        return userRepository.findById(id);
    }

    @PostMapping(value = "/filter", produces = APPLICATION_NDJSON_VALUE)
    @LogExecutionTime
    @Timed(value = "api.stream-json.timer", description = "Time taken to process 'stream' API endpoint")
    public Flux<Wrap> getUsersByFilter(@RequestBody Filter filter) {
        log.info("Server JSON Stream from Spring Boot!");

        Flux<User> filteredUsers = (filter.getStartId() == null && filter.getEndId() == null)
            ? userRepository.findAllByOrderByUpdatedAtDesc()
            : userRepository.findByIdBetweenOrderByUpdatedAtDesc(
                Objects.nonNull(filter.getStartId()) ? filter.getStartId() : Long.MIN_VALUE,
                Objects.nonNull(filter.getEndId()) ? filter.getEndId() : Long.MAX_VALUE);

        return filteredUsers
            .delayElements(Duration.ofMillis(500))
            .map(Object.class::cast)
            .map(v -> new Wrap("data", v))
            .concatWithValues(new Wrap("done", null));
    }

    public record Wrap(String type, Object value) {
    }

    @NoArgsConstructor
    @Getter
    @Setter
    public static class Filter {
        private Long startId;
        private Long endId;
    }
}

