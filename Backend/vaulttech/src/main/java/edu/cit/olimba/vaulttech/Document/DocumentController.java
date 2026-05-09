package edu.cit.olimba.vaulttech.Document;

import edu.cit.olimba.vaulttech.Vault.VaultEntity;
import edu.cit.olimba.vaulttech.Vault.VaultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final VaultRepository vaultRepository;

    public DocumentController(DocumentRepository documentRepository, VaultRepository vaultRepository) {
        this.documentRepository = documentRepository;
        this.vaultRepository = vaultRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveDocumentUrl(@RequestBody Map<String, Object> body) {
        try {
            String fileName = (String) body.get("fileName");
            String fileUrl = (String) body.get("fileUrl");
            Long vaultId = Long.valueOf(body.get("vaultId").toString());

            VaultEntity vault = vaultRepository.findById(vaultId)
                    .orElseThrow(() -> new IllegalArgumentException("Vault not found"));

            DocumentEntity document = new DocumentEntity(fileName, fileUrl, vault);
            documentRepository.save(document);

            return ResponseEntity.status(HttpStatus.CREATED).body("Document metadata saved successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/vault/{vaultId}")
    public ResponseEntity<List<DocumentEntity>> getDocumentsByVault(@PathVariable Long vaultId) {
        return ResponseEntity.ok(documentRepository.findByVaultId(vaultId));
    }
}