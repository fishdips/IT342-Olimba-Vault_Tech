package edu.cit.olimba.vaulttech.Repository;

import edu.cit.olimba.vaulttech.Entity.VaultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaultRepository extends JpaRepository<VaultEntity, Long> {

    List<VaultEntity> findByOwnerUsernameAndIsActiveTrue(String ownerUsername);

    List<VaultEntity> findByOwnerUsername(String ownerUsername);

    Optional<VaultEntity> findByIdAndOwnerUsername(Long id, String ownerUsername);

    boolean existsByNameAndOwnerUsername(String name, String ownerUsername);

    int deleteByIdAndOwnerUsername(Long id, String ownerUsername);

    // Refresh daysRemaining for all active vaults (call from a @Scheduled task)
    @Query("SELECT v FROM VaultEntity v WHERE v.isActive = true AND v.expiryDate IS NOT NULL")
    List<VaultEntity> findAllActiveWithExpiry();
}