package org.ost.investigate.springboot.examples.entyties; // Note: 'entyties' as per your existing structure

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.List; // For imageUrls, we'll store as JSON string or array in DB for simplicity

@NoArgsConstructor
@Table("advertisement") // Renamed table name from "ad_listing" to "advertisement"
@Getter
@Setter
public class Advertisement {

    @Id
    private Long id;

    @Column("title")
    private String title;

    @Column("description")
    private String description;

    @Column("category")
    private String category; // Stored as a simple string for now

    @Column("location")
    private String location; // Stored as a simple string for now

    @Column("contact_info")
    private String contactInfo;

    // For simplicity, store image URLs as a comma-separated string or JSON string.
    // A more robust solution might involve a separate 'ad_images' table.
    @Column("image_urls")
    private String imageUrls; // e.g., "url1,url2,url3" or a JSON string

    @Column("status")
    private String status; // e.g., "ACTIVE", "EXPIRED", "DRAFT"

    @Column("created_at")
    private Instant createdAt;

    @Column("updated_at")
    private Instant updatedAt;

    @Column("user_id")
    private Long userId; // Foreign key to the User who created the ad
}
