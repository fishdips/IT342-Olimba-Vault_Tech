package edu.cit.olimba.vaulttech.Service;

import edu.cit.olimba.vaulttech.Entity.DocumentEntity;
import edu.cit.olimba.vaulttech.Entity.UserEntity;
import edu.cit.olimba.vaulttech.Entity.VaultEntity;
import edu.cit.olimba.vaulttech.Repository.DocumentRepository;
import edu.cit.olimba.vaulttech.Repository.UserRepository;
import edu.cit.olimba.vaulttech.Repository.VaultRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VaultService {

    private final VaultRepository vaultRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public VaultService(VaultRepository vaultRepository,
                        BCryptPasswordEncoder passwordEncoder,
                        EmailService emailService,
                        DocumentRepository documentRepository,
                        UserRepository userRepository) {
        this.vaultRepository = vaultRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
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
                                   String thumbnailColor, String vaultPassword) {

        if (vaultRepository.existsByNameAndOwnerUsername(name, ownerUsername)) {
            throw new IllegalArgumentException(
                    "A vault named '" + name + "' already exists for this account.");
        }

        String hashedPassword = passwordEncoder.encode(vaultPassword);
        VaultEntity vault = new VaultEntity(name, LocalDate.now(), expiryDate,
                ownerUsername, vaultType, thumbnailColor, hashedPassword);
        return vaultRepository.save(vault);
    }

    public VaultEntity updateVault(Long id, String username, String newName,
                                   LocalDate newExpiryDate, String vaultType,
                                   String thumbnailColor, String successorEmail,
                                   Boolean isDeadmanEnabled, Integer deadmanDays) {

        VaultEntity vault = vaultRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Vault not found or you do not have permission to edit it."));

        if (successorEmail != null && !successorEmail.isBlank()) {
            UserEntity owner = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Owner not found."));

            boolean isValidContact = owner.getTrustedContacts().contains(successorEmail);
            if (!isValidContact) {
                throw new IllegalArgumentException(
                        "'" + successorEmail + "' is not in your trusted contacts. " +
                                "Please add them as a trusted contact first.");
            }
        }

        String previousSuccessor = vault.getSuccessorEmail();
        boolean successorChanged = successorEmail != null
                && !successorEmail.isBlank()
                && !successorEmail.equals(previousSuccessor);

        if (newName != null && !newName.isBlank()) vault.setName(newName);
        if (newExpiryDate != null) vault.setExpiryDate(newExpiryDate);
        if (vaultType != null) vault.setVaultType(vaultType);
        if (thumbnailColor != null) vault.setThumbnailColor(thumbnailColor);
        vault.setSuccessorEmail(successorEmail);
        vault.setIsDeadmanEnabled(isDeadmanEnabled != null ? isDeadmanEnabled : false);
        vault.setDeadmanDays(deadmanDays);
        vault.computeDaysRemaining();

        VaultEntity saved = vaultRepository.save(vault);

        if (successorChanged) {
            try {
                emailService.sendVaultInheritorAssigned(successorEmail, username, vault.getName());
            } catch (Exception e) {
                // Don't fail the save if email fails — log and continue
                System.err.println("Failed to send inheritor assignment email: " + e.getMessage());
            }
        }

        return saved;
    }

    public boolean verifyVaultPassword(Long id, String username, String password) {
        VaultEntity vault = vaultRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException("Vault not found."));
        return passwordEncoder.matches(password, vault.getVaultPassword());
    }

    public boolean deleteVault(Long id, String username) {
        int deletedCount = vaultRepository.deleteByIdAndOwnerUsername(id, username);
        return deletedCount > 0;
    }

    public void manualTriggerVault(Long id, String username) {
        VaultEntity vault = vaultRepository.findByIdAndOwnerUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException("Vault not found."));

        if (vault.getSuccessorEmail() == null || vault.getSuccessorEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "Cannot trigger vault: no inheritor email set. Please add a successor first.");
        }

        List<DocumentEntity> documents = documentRepository.findByVaultId(id);

        emailService.sendVaultContents(
                vault.getSuccessorEmail(),
                vault.getName(),
                vault.getOwnerUsername(),
                documents,
                "manual"
        );

        vault.setIsActive(false);
        vaultRepository.save(vault);
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void runDailyVaultCheck() {
        LocalDate today = LocalDate.now();

        List<VaultEntity> activeVaults = vaultRepository.findAllActiveWithExpiry();
        for (VaultEntity v : activeVaults) {
            v.computeDaysRemaining();
        }
        vaultRepository.saveAll(activeVaults);

        List<VaultEntity> expiredVaults = vaultRepository.findExpiredVaultsWithSuccessor(today);
        for (VaultEntity vault : expiredVaults) {
            try {
                List<DocumentEntity> documents = documentRepository.findByVaultId(vault.getId());
                emailService.sendVaultContents(
                        vault.getSuccessorEmail(),
                        vault.getName(),
                        vault.getOwnerUsername(),
                        documents,
                        "expiry"
                );
                vault.setIsActive(false);
                vaultRepository.save(vault);
            } catch (Exception e) {
                System.err.println("Failed to process expired vault ID " + vault.getId()
                        + ": " + e.getMessage());
            }
        }

        List<VaultEntity> deadmanVaults = vaultRepository.findDeadmanEnabledVaultsWithSuccessor();
        for (VaultEntity vault : deadmanVaults) {
            try {
                UserEntity owner = userRepository.findByUsername(vault.getOwnerUsername())
                        .orElse(null);

                if (owner == null || owner.getLastActiveDate() == null) continue;

                LocalDate cutoff = today.minusDays(vault.getDeadmanDays());
                if (!owner.getLastActiveDate().isAfter(cutoff)) {
                    List<DocumentEntity> documents = documentRepository.findByVaultId(vault.getId());
                    emailService.sendVaultContents(
                            vault.getSuccessorEmail(),
                            vault.getName(),
                            vault.getOwnerUsername(),
                            documents,
                            "deadman"
                    );
                    vault.setIsActive(false);
                    vaultRepository.save(vault);
                }
            } catch (Exception e) {
                System.err.println("Failed to process deadman vault ID " + vault.getId()
                        + ": " + e.getMessage());
            }
        }
    }
}