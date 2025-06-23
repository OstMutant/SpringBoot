package org.ost.investigate.springboot.examples.rest;

import static org.springframework.http.MediaType.APPLICATION_NDJSON_VALUE;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ost.investigate.springboot.examples.dto.AdvertisementFilter;
import org.ost.investigate.springboot.examples.entyties.Advertisement;
import org.ost.investigate.springboot.examples.repository.AdvertisementRepository;
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
@RequestMapping("/advertisements") // Base path for advertisement API endpoints
@Slf4j
@AllArgsConstructor
public class AdvertisementController {

    private final AdvertisementRepository advertisementRepository;

    @GetMapping(produces = APPLICATION_NDJSON_VALUE)
    public Flux<Wrap> getAdvertisements(AdvertisementFilter filter, @PageableDefault Pageable pageable) {
        log.info("Fetching advertisements with filter: {} and pageable: {}", filter, pageable);

        AdvertisementFilter actualFilter = (filter != null) ? filter : new AdvertisementFilter();
        Mono<Long> totalItemsMono = advertisementRepository.countByFilter(actualFilter);
        Flux<Advertisement> filteredAdvertisementsFlux = advertisementRepository.findByFilter(actualFilter, pageable);

        Flux<Wrap> metadataFlux = totalItemsMono
            .map(totalItems -> new Wrap("pagination_metadata",
                new PaginationMetadata(totalItems, pageable.getPageSize(), pageable.getPageNumber())))
            .flux();

        Flux<Wrap> dataFlux = filteredAdvertisementsFlux
            .map(Object.class::cast)
            .map(v -> new Wrap("data", v));

        Flux<Wrap> doneFlux = Flux.just(new Wrap("done", null));

        return metadataFlux
            .concatWith(dataFlux)
            .concatWith(doneFlux)
            //            .delayElements(Duration.ofMillis(100)) // Optional: for testing streaming behavior
            .doOnError(e -> log.error("Error fetching advertisements", e));
    }

    @PostMapping
    public Mono<Advertisement> createAdvertisement(@RequestBody Advertisement advertisement) {
        log.info("Creating new advertisement: {}", advertisement.getTitle());
        // Set creation and update timestamps
        if (Objects.isNull(advertisement.getCreatedAt())) {
            advertisement.setCreatedAt(Instant.now());
        }
        advertisement.setUpdatedAt(Instant.now());
        // Default status if not provided (should be handled by DB default, but good for explicit control)
        if (Objects.isNull(advertisement.getStatus()) || advertisement.getStatus().isEmpty()) {
            advertisement.setStatus("ACTIVE");
        }
        return advertisementRepository.save(advertisement)
            .doOnSuccess(ad -> log.info("Advertisement created: {}", ad.getId()))
            .doOnError(e -> log.error("Error creating advertisement", e));
    }

    @PutMapping("/{id}")
    public Mono<Advertisement> updateAdvertisement(@PathVariable Long id, @RequestBody Advertisement advertisement) {
        log.info("Updating advertisement with ID: {}", id);
        return advertisementRepository.findById(id)
            .flatMap(existingAd -> {
                // Update fields from the provided advertisement object
                existingAd.setTitle(advertisement.getTitle());
                existingAd.setDescription(advertisement.getDescription());
                existingAd.setCategory(advertisement.getCategory());
                existingAd.setLocation(advertisement.getLocation());
                existingAd.setContactInfo(advertisement.getContactInfo());
                existingAd.setImageUrls(advertisement.getImageUrls());
                existingAd.setStatus(advertisement.getStatus());
                existingAd.setUserId(advertisement.getUserId()); // Keep or update userId if allowed

                existingAd.setUpdatedAt(Instant.now()); // Update timestamp

                return advertisementRepository.save(existingAd);
            })
            .doOnSuccess(ad -> log.info("Advertisement updated: {}", ad.getId()))
            .doOnError(e -> log.error("Error updating advertisement", e));
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteAdvertisement(@PathVariable Long id) {
        log.info("Deleting advertisement with ID: {}", id);
        return advertisementRepository.deleteById(id)
            .doOnSuccess(unused -> log.info("Advertisement deleted: {}", id))
            .doOnError(e -> log.error("Error deleting advertisement", e));
    }

    @GetMapping("/{id}")
    public Mono<Advertisement> getAdvertisement(@PathVariable Long id) {
        log.info("Get advertisement with ID: {}", id);
        return advertisementRepository.findById(id);
    }

    // Wrap record for NDJSON streaming
    public record Wrap(String type, Object value) {
    }

    // Pagination metadata record
    public record PaginationMetadata(long totalItems, int itemsPerPage, int currentPage) {
    }
}
