package org.ost.investigate.springboot.examples.micrometer.configuration;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// https://bootcamptoprod.com/measure-api-response-time-spring-boot/#method-1-using-spring-boot-actuator-builtin-mechanism
@Configuration
public class Metrics {

    @Bean
    TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}
