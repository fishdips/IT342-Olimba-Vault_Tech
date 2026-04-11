package edu.cit.olimba.vaulttech.Controller;

import edu.cit.olimba.vaulttech.Entity.VaultEntity;
import edu.cit.olimba.vaulttech.Service.VaultService;
import org.springframework.format.annotation.DateTimeFormat;
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


    @PostMapping
    public ResponseEntity<?> createVault(@RequestBody Map<String, String> body) {
        try {
            String name           = body.get("name");
            String ownerUsername  = body.get("ownerUsername");
            String vaultType      = body.getOrDefault("vaultType", "General");
            String thumbnailColor = body.getOrDefault("thumbnailColor", "#0066b1");
            String expiryStr      = body.get("expiryDate");

            if (name == null || name.isBlank())
                return ResponseEntity.badRequest().body("Vault name is required.");
            if (ownerUsername == null || ownerUsername.isBlank())
                return ResponseEntity.badRequest().body("Owner username is required.");

            LocalDate expiryDate = (expiryStr != null && !expiryStr.isBlank())
                    ? LocalDate.parse(expiryStr) : null;

            VaultEntity created = vaultService.createVault(
                    name, expiryDate, ownerUsername, vaultType, thumbnailColor);

            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateVault(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String username       = body.get("username");
            String name           = body.get("name");
            String vaultType      = body.get("vaultType");
            String thumbnailColor = body.get("thumbnailColor");
            String expiryStr      = body.get("expiryDate");

            if (username == null || username.isBlank())
                return ResponseEntity.badRequest().body("Username is required.");

            LocalDate expiryDate = (expiryStr != null && !expiryStr.isBlank())
                    ? LocalDate.parse(expiryStr) : null;

            VaultEntity updated = vaultService.updateVault(
                    id, username, name, expiryDate, vaultType, thumbnailColor);

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
}
