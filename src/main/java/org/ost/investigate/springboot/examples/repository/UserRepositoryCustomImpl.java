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

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final R2dbcEntityTemplate template;

    @Override
    public Flux<User> findByFilter(UserFilter filter, Pageable pageable) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (filter.getUsername() != null && !filter.getUsername().isBlank()) {
            criteriaList.add(Criteria.where("name").like("%" + filter.getUsername() + "%").ignoreCase(true));
        }

        if (filter.getCreatedAtStart() != null) {
            criteriaList.add(Criteria.where("created_at").greaterThanOrEquals(filter.getCreatedAtStart()));
        }
        if (filter.getCreatedAtEnd() != null) {
            criteriaList.add(Criteria.where("created_at").lessThanOrEquals(filter.getCreatedAtEnd()));
        }

        if (filter.getStartId() != null && filter.getStartId() > 0) {
            criteriaList.add(Criteria.where("id").greaterThanOrEquals(filter.getStartId()));
        }
        if (filter.getEndId() != null && filter.getEndId() > 0) {
            criteriaList.add(Criteria.where("id").lessThanOrEquals(filter.getEndId()));
        }

        Criteria finalCriteria = criteriaList.stream().reduce(Criteria.empty(), Criteria::and);
        Query query = Query.query(finalCriteria).with(pageable);

        return template.select(query, User.class);
    }
}
