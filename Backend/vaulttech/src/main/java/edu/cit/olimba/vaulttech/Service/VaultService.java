package edu.cit.olimba.vaulttech.Service;


import edu.cit.olimba.vaulttech.Entity.VaultEntity;
import edu.cit.olimba.vaulttech.Repository.VaultRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VaultService {

    private final VaultRepository vaultRepository;

    public VaultService(VaultRepository vaultRepository) {
        this.vaultRepository = vaultRepository;
    }

    @Transactional(readOnly = true)
    public List<VaultEntity> getActiveVaults(String username) {
        return vaultRepository.findByOwnerUsernameAndIsActiveTrue(username);
    }

    @Transactional(readOnly = true)
    public Optional<VaultEntity> getVaultById(Long id, String username) {
        return vaultRepository.findByIdAndOwnerUsername(id, username);
    }


    public VaultEntity createVault(String name, LocalDate expiryDate,
                             String ownerUsername, String vaultType,
                             String thumbnailColor) {

        if (vaultRepository.existsByNameAndOwnerUsername(name, ownerUsername)) {
            throw new IllegalArgumentException(
                    "A vault named '" + name + "' already exists for this account.");
        }

        VaultEntity vault = new VaultEntity(name, LocalDate.now(), expiryDate,
                ownerUsername, vaultType, thumbnailColor);
        return vaultRepository.save(vault);
    }


    public VaultEntity updateVault(Long id, String username, String newName,
                             LocalDate newExpiryDate, String vaultType,
                             String thumbnailColor) {

        VaultEntity vault = vaultRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Vault not found or you do not have permission to edit it."));

        if (newName != null && !newName.isBlank()) vault.setName(newName);
        if (newExpiryDate != null) vault.setExpiryDate(newExpiryDate);
        if (vaultType != null) vault.setVaultType(vaultType);
        if (thumbnailColor != null) vault.setThumbnailColor(thumbnailColor);

        vault.computeDaysRemaining();
        return vaultRepository.save(vault);
    }



    public boolean deleteVault(Long id, String username) {
    int deletedCount = vaultRepository.deleteByIdAndOwnerUsername(id, username);
    return deletedCount > 0;
}


    @Scheduled(cron = "0 0 0 * * *") //This will refresh the date, runs every midnight
    public void refreshDaysRemaining() {
        List<VaultEntity> vaults = vaultRepository.findAllActiveWithExpiry();
        for (VaultEntity v : vaults) {
            v.computeDaysRemaining();
        }
        vaultRepository.saveAll(vaults);
    }
}
