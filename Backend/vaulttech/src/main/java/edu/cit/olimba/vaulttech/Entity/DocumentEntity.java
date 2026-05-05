package edu.cit.olimba.vaulttech.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vault_id", nullable = false)
    private VaultEntity vault;

    public DocumentEntity() {}

    public DocumentEntity(String fileName, String fileUrl, VaultEntity vault) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.vault = vault;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    // We don't expose the full vault object in the getter to avoid infinite JSON recursion
    public Long getVaultId() { return vault != null ? vault.getId() : null; }
    public void setVault(VaultEntity vault) { this.vault = vault; }
}