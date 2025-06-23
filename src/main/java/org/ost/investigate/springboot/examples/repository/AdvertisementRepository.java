package org.ost.investigate.springboot.examples.repository;

import org.ost.investigate.springboot.examples.entyties.Advertisement;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdvertisementRepository extends ReactiveCrudRepository<Advertisement, Long>, AdvertisementRepositoryCustom {
    // This interface will contain basic CRUD operations provided by ReactiveCrudRepository
    // and extend AdvertisementRepositoryCustom for custom query methods.
}
