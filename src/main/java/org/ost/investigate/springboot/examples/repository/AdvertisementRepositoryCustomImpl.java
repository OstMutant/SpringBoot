package org.ost.investigate.springboot.examples.repository;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.ost.investigate.springboot.examples.dto.AdvertisementFilter;
import org.ost.investigate.springboot.examples.entyties.Advertisement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.relational.core.query.Criteria;
import org.springframework.data.relational.core.query.Query;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Objects;

@Repository
@RequiredArgsConstructor // Lombok annotation for constructor injection of final fields
public class AdvertisementRepositoryCustomImpl implements AdvertisementRepositoryCustom {

    private final R2dbcEntityTemplate template; // Inject R2dbcEntityTemplate

    /**
     * Builds the criteria for filtering advertisements based on the AdvertisementFilter object.
     * This method is private as it's a helper for the repository methods.
     *
     * @param filter The filter criteria to apply.
     * @return The constructed Criteria object.
     */
    private Criteria buildCriteria(AdvertisementFilter filter) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (filter != null) {
            // Filtering by titleFilter (partial match, case-insensitive)
            if (Objects.nonNull(filter.getTitleFilter()) && !filter.getTitleFilter().isBlank()) {
                criteriaList.add(Criteria.where("title").like("%" + filter.getTitleFilter() + "%").ignoreCase(true));
            }
            // Filtering by categoryFilter (exact match, case-insensitive)
            if (Objects.nonNull(filter.getCategoryFilter()) && !filter.getCategoryFilter().isBlank()) {
                criteriaList.add(Criteria.where("category").is(filter.getCategoryFilter()).ignoreCase(true));
            }
            // Filtering by locationFilter (partial match, case-insensitive)
            if (Objects.nonNull(filter.getLocationFilter()) && !filter.getLocationFilter().isBlank()) {
                criteriaList.add(Criteria.where("location").like("%" + filter.getLocationFilter() + "%").ignoreCase(true));
            }
            // Filtering by statusFilter (exact match, case-insensitive)
            if (Objects.nonNull(filter.getStatusFilter()) && !filter.getStatusFilter().isBlank()) {
                criteriaList.add(Criteria.where("status").is(filter.getStatusFilter()).ignoreCase(true));
            }

            // Filtering by createdAt date range
            if (filter.getCreatedAtStart() != null) {
                criteriaList.add(Criteria.where("created_at").greaterThanOrEquals(filter.getCreatedAtStart()));
            }
            if (filter.getCreatedAtEnd() != null) {
                criteriaList.add(Criteria.where("created_at").lessThanOrEquals(filter.getCreatedAtEnd()));
            }

            // Filtering by updatedAt date range
            if (filter.getUpdatedAtStart() != null) {
                criteriaList.add(Criteria.where("updated_at").greaterThanOrEquals(filter.getUpdatedAtStart()));
            }
            if (filter.getUpdatedAtEnd() != null) {
                criteriaList.add(Criteria.where("updated_at").lessThanOrEquals(filter.getUpdatedAtEnd()));
            }

            // Filtering by ID range
            if (filter.getStartId() != null && filter.getStartId() > 0) {
                criteriaList.add(Criteria.where("id").greaterThanOrEquals(filter.getStartId()));
            }
            if (filter.getEndId() != null && filter.getEndId() > 0) {
                criteriaList.add(Criteria.where("id").lessThanOrEquals(filter.getEndId()));
            }
        }
        // Combine all criteria with AND. If criteriaList is empty, Criteria.empty() is returned.
        return criteriaList.stream().reduce(Criteria.empty(), Criteria::and);
    }

    @Override
    public Flux<Advertisement> findByFilter(AdvertisementFilter filter, Pageable pageable) {
        // Build criteria using the helper method
        Criteria finalCriteria = buildCriteria(filter);
        // Create query with criteria and pagination
        Query query = Query.query(finalCriteria).with(pageable);

        // Execute the select query
        return template.select(query, Advertisement.class);
    }

    /**
     * Counts the number of advertisements matching the given filter criteria.
     *
     * @param filter The filter criteria to apply.
     * @return A Mono emitting the total count of matching advertisements.
     */
    @Override
    public Mono<Long> countByFilter(AdvertisementFilter filter) {
        // Build criteria using the helper method
        Criteria finalCriteria = buildCriteria(filter);
        // Create query with criteria (no pagination needed for count)
        Query query = Query.query(finalCriteria);

        // Execute the count query
        return template.count(query, Advertisement.class);
    }
}
