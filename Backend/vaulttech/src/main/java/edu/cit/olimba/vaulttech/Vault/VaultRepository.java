package edu.cit.olimba.vaulttech.Vault;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VaultRepository extends JpaRepository<VaultEntity, Long> {

    List<VaultEntity> findByOwnerUsernameAndIsActiveTrue(String ownerUsername);
    Optional<VaultEntity> findByIdAndOwnerUsername(Long id, String ownerUsername);

    @Query("SELECT v FROM VaultEntity v WHERE v.isActive = true AND v.expiryDate IS NOT NULL AND v.successorEmails IS NOT EMPTY")
    List<VaultEntity> findAllActiveWithExpiry();

    @Query("SELECT v FROM VaultEntity v WHERE v.isActive = true " +
            "AND v.expiryDate IS NOT NULL " +
            "AND v.expiryDate <= :today " +
            "AND v.successorEmails IS NOT EMPTY")
    List<VaultEntity> findExpiredVaultsWithSuccessor(@Param("today") LocalDate today);
}