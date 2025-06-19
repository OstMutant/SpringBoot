package org.ost.investigate.springboot.examples.repository;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.ost.investigate.springboot.examples.dto.UserFilter;
import org.ost.investigate.springboot.examples.entyties.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.relational.core.query.Criteria;
import org.springframework.data.relational.core.query.Query;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final R2dbcEntityTemplate template;

    /**
     * Builds the criteria for filtering users based on the UserFilter object.
     * This method is private as it's a helper for the repository methods.
     *
     * @param filter The filter criteria to apply.
     * @return The constructed Criteria object.
     */
    private Criteria buildCriteria(UserFilter filter) {
        List<Criteria> criteriaList = new ArrayList<>();

        // Filtering by nameFilter (partial match, case-insensitive)
        // UserFilter now uses 'nameFilter' instead of 'username'
        if (filter.getNameFilter() != null && !filter.getNameFilter().isBlank()) {
            // Using .like("%" + value + "%") for partial matching
            criteriaList.add(Criteria.where("name").like("%" + filter.getNameFilter() + "%").ignoreCase(true));
        }

        // Filtering by createdAt date range
        if (filter.getCreatedAtStart() != null) {
            // Greater than or equal to start date
            criteriaList.add(Criteria.where("created_at").greaterThanOrEquals(filter.getCreatedAtStart()));
        }
        if (filter.getCreatedAtEnd() != null) {
            // Less than or equal to end date
            // For LocalDate, this implies up to the end of that day.
            // If you need to include the full end day's time, you might need to adjust the LocalDate to LocalDateTime here.
            criteriaList.add(Criteria.where("created_at").lessThanOrEquals(filter.getCreatedAtEnd()));
        }

        // Filtering by updatedAt date range (New fields)
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

        // Combine all criteria with AND. If criteriaList is empty, Criteria.empty() is returned.
        return criteriaList.stream().reduce(Criteria.empty(), Criteria::and);
    }

    @Override
    public Flux<User> findByFilter(UserFilter filter, Pageable pageable) {
        // Build criteria using the helper method
        Criteria finalCriteria = buildCriteria(filter);
        // Create query with criteria and pagination
        Query query = Query.query(finalCriteria).with(pageable);

        // Execute the select query
        return template.select(query, User.class);
    }

    /**
     * Counts the number of users matching the given filter criteria.
     *
     * @param filter The filter criteria to apply.
     * @return A Mono emitting the total count of matching users.
     */
    @Override
    public Mono<Long> countByFilter(UserFilter filter) {
        // Build criteria using the helper method
        Criteria finalCriteria = buildCriteria(filter);
        // Create query with criteria (no pagination needed for count)
        Query query = Query.query(finalCriteria);

        // Execute the count query
        return template.count(query, User.class);
    }
}
