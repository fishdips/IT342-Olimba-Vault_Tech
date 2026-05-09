package edu.cit.olimba.vaulttech.Vault;

import edu.cit.olimba.vaulttech.Email.EmailService;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class VaultService {

    private final VaultRepository vaultRepository;
    private final EmailService emailService;

    public VaultService(VaultRepository vaultRepository, EmailService emailService) {
        this.vaultRepository = vaultRepository;
        this.emailService = emailService;
    }

    public List<VaultEntity> getActiveVaults(String username) {
        return vaultRepository.findByOwnerUsernameAndIsActiveTrue(username);
    }

    public Optional<VaultEntity> getVaultById(Long id, String username) {
        return vaultRepository.findByIdAndOwnerUsername(id, username);
    }

    public VaultEntity createVault(String name, LocalDate expiryDate, String username,
                                   String type, String color, String password) {
        VaultEntity vault = new VaultEntity(name, LocalDate.now(), expiryDate, username, type, color, password);
        return vaultRepository.save(vault);
    }

    public VaultEntity updateVault(Long id, String username, String name, LocalDate expiryDate,
                                   String type, String color, List<String> successorEmails,
                                   Boolean isDeadman, Integer deadmanDays) {
        VaultEntity vault = vaultRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException("Vault not found."));

        vault.setName(name);
        vault.setExpiryDate(expiryDate);
        vault.setVaultType(type);
        vault.setThumbnailColor(color);
        vault.setSuccessorEmails(successorEmails);
        vault.setIsDeadmanEnabled(isDeadman);
        vault.setDeadmanDays(deadmanDays);
        vault.computeDaysRemaining();

        return vaultRepository.save(vault);
    }

    public boolean deleteVault(Long id, String username) {
        return vaultRepository.findByIdAndOwnerUsername(id, username)
                .map(v -> {
                    vaultRepository.delete(v);
                    return true;
                }).orElse(false);
    }

    public boolean verifyVaultPassword(Long id, String username, String password) {
        return vaultRepository.findByIdAndOwnerUsername(id, username)
                .map(v -> v.getVaultPassword().equals(password))
                .orElse(false);
    }

    public void manualTriggerVault(Long id, String username) {
        VaultEntity vault = vaultRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException("Vault not found."));

        if (vault.getSuccessorEmails() == null || vault.getSuccessorEmails().isEmpty()) {
            throw new IllegalArgumentException("No inheritors assigned to this vault.");
        }

        emailService.sendVaultContents(
                vault.getSuccessorEmails(),
                vault.getName(),
                vault.getOwnerUsername(),
                vault.getDocuments(),
                "Manual Override"
        );

        vault.setIsActive(false);
        vaultRepository.save(vault);
    }
}