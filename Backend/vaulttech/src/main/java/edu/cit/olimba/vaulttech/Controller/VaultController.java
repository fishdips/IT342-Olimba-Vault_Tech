package edu.cit.olimba.vaulttech.Controller;

import edu.cit.olimba.vaulttech.Entity.VaultEntity;
import edu.cit.olimba.vaulttech.Service.VaultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaults")
@CrossOrigin(origins = "*")
public class VaultController {

    private final VaultService vaultService;

    public VaultController(VaultService vaultService) {
        this.vaultService = vaultService;
    }

    @GetMapping
    public ResponseEntity<List<VaultEntity>> getActiveVaults(@RequestParam String username) {
        List<VaultEntity> vaults = vaultService.getActiveVaults(username);
        return ResponseEntity.ok(vaults);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVaultById(
            @PathVariable Long id,
            @RequestParam String username) {

        return vaultService.getVaultById(id, username)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vault not found."));
    }

    // UPDATED: Now requires and saves the vault password
    @PostMapping
    public ResponseEntity<?> createVault(@RequestBody Map<String, String> body) {
        try {
            String name           = body.get("name");
            String ownerUsername  = body.get("ownerUsername");
            String vaultType      = body.getOrDefault("vaultType", "General");
            String thumbnailColor = body.getOrDefault("thumbnailColor", "#0066b1");
            String expiryStr      = body.get("expiryDate");
            String vaultPassword  = body.get("vaultPassword"); // New Field

            if (name == null || name.isBlank())
                return ResponseEntity.badRequest().body("Vault name is required.");
            if (ownerUsername == null || ownerUsername.isBlank())
                return ResponseEntity.badRequest().body("Owner username is required.");
            if (vaultPassword == null || vaultPassword.isBlank())
                return ResponseEntity.badRequest().body("Vault password is required.");

            LocalDate expiryDate = (expiryStr != null && !expiryStr.isBlank())
                    ? LocalDate.parse(expiryStr) : null;

            VaultEntity created = vaultService.createVault(
                    name, expiryDate, ownerUsername, vaultType, thumbnailColor, vaultPassword);

            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVault(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) { // Changed to Object to handle booleans and integers safely
        try {
            String username       = (String) body.get("username");
            String name           = (String) body.get("name");
            String vaultType      = (String) body.get("vaultType");
            String thumbnailColor = (String) body.get("thumbnailColor");
            String expiryStr      = (String) body.get("expiryDate");
            String successorEmail = (String) body.get("successorEmail");
            Boolean isDeadman     = (Boolean) body.get("isDeadmanEnabled");
            Integer deadmanDays   = body.get("deadmanDays") != null ? Integer.parseInt(body.get("deadmanDays").toString()) : null;

            if (username == null || username.isBlank())
                return ResponseEntity.badRequest().body("Username is required.");

            LocalDate expiryDate = (expiryStr != null && !expiryStr.isBlank())
                    ? LocalDate.parse(expiryStr) : null;

            VaultEntity updated = vaultService.updateVault(
                    id, username, name, expiryDate, vaultType, thumbnailColor, successorEmail, isDeadman, deadmanDays);

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVault(
            @PathVariable Long id,
            @RequestParam String username) {

        boolean deleted = vaultService.deleteVault(id, username);
        if (deleted) {
            return ResponseEntity.ok("Vault deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Vault not found or you do not have permission to delete it.");
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");

            boolean isCorrect = vaultService.verifyVaultPassword(id, username, password);
            if (isCorrect) {
                return ResponseEntity.ok("Unlocked");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect vault password.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}