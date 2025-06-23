package org.ost.investigate.springboot.examples.repository;

import org.ost.investigate.springboot.examples.entyties.Advertisement;
import org.ost.investigate.springboot.examples.dto.AdvertisementFilter;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AdvertisementRepositoryCustom {
    /**
     * Finds advertisements based on a filter and pagination information.
     * @param filter The AdvertisementFilter object containing criteria for filtering.
     * @param pageable The Pageable object containing pagination and sorting information.
     * @return A Flux of Advertisement objects matching the criteria.
     */
    Flux<Advertisement> findByFilter(AdvertisementFilter filter, Pageable pageable);

    /**
     * Counts the total number of advertisements matching a given filter.
     * This is used for pagination metadata.
     * @param filter The AdvertisementFilter object containing criteria for filtering.
     * @return A Mono emitting the total count of matching advertisements.
     */
    Mono<Long> countByFilter(AdvertisementFilter filter);
}
