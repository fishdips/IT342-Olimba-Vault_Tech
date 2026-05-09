package edu.cit.olimba.vaulttech.Vault;

import edu.cit.olimba.vaulttech.Document.DocumentEntity;
import edu.cit.olimba.vaulttech.Email.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VaultExpiryScheduler {

    private final VaultRepository vaultRepository;
    private final EmailService emailService;

    public VaultExpiryScheduler(VaultRepository vaultRepository, EmailService emailService) {
        this.vaultRepository = vaultRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void processExpiredVaults() {
        System.out.println("Running daily Vault-Tech expiry sweep...");

        LocalDate today = LocalDate.now();
        List<VaultEntity> expiredVaults = vaultRepository.findExpiredVaultsWithSuccessor(today);

        if (expiredVaults.isEmpty()) {
            System.out.println("No vaults expired today.");
            return;
        }

        for (VaultEntity vault : expiredVaults) {
            try {
                List<DocumentEntity> documents = vault.getDocuments();
                emailService.sendVaultContents(
                        vault.getSuccessorEmails(),
                        vault.getName(),
                        vault.getOwnerUsername(),
                        documents,
                        "expiry"
                );
                vaultRepository.delete(vault);

                System.out.println("Successfully released and deleted Vault ID: " + vault.getId());

            } catch (Exception e) {
                System.err.println("CRITICAL: Failed to process Vault ID " + vault.getId());
                e.printStackTrace();
            }
        }
    }
}