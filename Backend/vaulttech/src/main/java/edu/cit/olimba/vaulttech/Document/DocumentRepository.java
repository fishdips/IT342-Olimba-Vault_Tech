package edu.cit.olimba.vaulttech.Document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    @Query("SELECT d FROM DocumentEntity d WHERE d.vault.id = :vaultId")
    List<DocumentEntity> findByVaultId(@Param("vaultId") Long vaultId);
}