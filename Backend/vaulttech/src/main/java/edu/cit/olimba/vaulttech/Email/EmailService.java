package edu.cit.olimba.vaulttech.Email;

import edu.cit.olimba.vaulttech.Document.DocumentEntity;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInheritorNotification(String toEmail, String vaultOwnerUsername) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Vault-Tech: You have been added as a Trusted Contact");
            helper.setText(
                    "Hello,\n\n" +
                            "User '" + vaultOwnerUsername + "' has added you as a trusted contact on Vault-Tech.\n\n" +
                            "If their secure vault expires or is triggered, you may be granted access to its contents.\n\n" +
                            "Stay Secure,\nThe Vault-Tech Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send trusted contact notification: " + e.getMessage(), e);
        }
    }

    public void sendVaultInheritorAssigned(List<String> toEmails, String ownerUsername, String vaultName) {
        if (toEmails == null || toEmails.isEmpty()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setSubject("Vault-Tech: You have been named as a vault inheritor");
            helper.setText(
                    "Hello,\n\n" +
                            "User '" + ownerUsername + "' has designated you as an inheritor of their vault '" + vaultName + "' on Vault-Tech.\n\n" +
                            "When this vault is released — either by expiry, inactivity, or manual trigger — " +
                            "its contents will be sent directly to this email address.\n\n" +
                            "Stay Secure,\nThe Vault-Tech Team"
            );

            for (String email : toEmails) {
                helper.setTo(email);
                mailSender.send(message);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to send vault inheritor assignment emails: " + e.getMessage(), e);
        }
    }

    public void sendVaultContents(List<String> toEmails, String vaultName,
                                  String ownerUsername, List<DocumentEntity> documents,
                                  String triggerReason) {
        if (toEmails == null || toEmails.isEmpty()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setSubject("Vault-Tech: Vault '" + vaultName + "' has been released to you");

            String reasonText = switch (triggerReason) {
                case "expiry"  -> "The vault's expiry date has been reached.";
                case "deadman" -> "The vault owner has been inactive beyond the configured threshold.";
                case "manual"  -> "The vault owner has manually triggered the release.";
                default        -> "The vault has been triggered.";
            };

            helper.setText(
                    "Hello,\n\n" +
                            "You have been designated as an inheritor of vault '" + vaultName + "' " +
                            "owned by '" + ownerUsername + "' on Vault-Tech.\n\n" +
                            "Reason for release: " + reasonText + "\n\n" +
                            (documents.isEmpty()
                                    ? "This vault contained no documents."
                                    : "The vault's documents (" + documents.size() + " file(s)) are attached to this email.") +
                            "\n\nStay Secure,\nThe Vault-Tech Team"
            );

            if (!documents.isEmpty()) {
                HttpClient httpClient = HttpClient.newHttpClient();
                for (DocumentEntity doc : documents) {
                    try {
                        HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(doc.getFileUrl()))
                                .GET()
                                .build();
                        HttpResponse<InputStream> response =
                                httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

                        if (response.statusCode() == 200) {
                            byte[] pdfBytes = response.body().readAllBytes();
                            ByteArrayDataSource dataSource =
                                    new ByteArrayDataSource(pdfBytes, "application/pdf");
                            helper.addAttachment(doc.getFileName(), dataSource);
                        }
                    } catch (Exception e) {
                        System.err.println("Error attaching " + doc.getFileName() + ": " + e.getMessage());
                    }
                }
            }

            for (String email : toEmails) {
                helper.setTo(email);
                mailSender.send(message);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to send vault contents: " + e.getMessage(), e);
        }
    }
}