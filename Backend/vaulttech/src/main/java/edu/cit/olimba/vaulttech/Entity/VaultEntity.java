package edu.cit.olimba.vaulttech.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "vaults")
public class VaultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "days_remaining")
    private Integer daysRemaining;

    @Column(name = "owner_username", nullable = false)
    private String ownerUsername;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "vault_type")
    private String vaultType; // e.g. "Will", "Documents", "Photos", etc.

    @Column(name = "thumbnail_color")
    private String thumbnailColor; // hex color for card header accent

    // ── Constructors ──────────────────────────────────────────
    public VaultEntity() {}

    public VaultEntity(String name, LocalDate createdDate, LocalDate expiryDate,
                 String ownerUsername, String vaultType, String thumbnailColor) {
        this.name = name;
        this.createdDate = createdDate;
        this.expiryDate = expiryDate;
        this.ownerUsername = ownerUsername;
        this.vaultType = vaultType;
        this.thumbnailColor = thumbnailColor;
        this.isActive = true;
        computeDaysRemaining();
    }

    public void computeDaysRemaining() {
        if (expiryDate != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
            this.daysRemaining = (int) Math.max(days, 0);
        }
    }

    // ── Getters & Setters ─────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDate createdDate) { this.createdDate = createdDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }

    public String getOwnerUsername() { return ownerUsername; }
    public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getVaultType() { return vaultType; }
    public void setVaultType(String vaultType) { this.vaultType = vaultType; }

    public String getThumbnailColor() { return thumbnailColor; }
    public void setThumbnailColor(String thumbnailColor) { this.thumbnailColor = thumbnailColor; }
}