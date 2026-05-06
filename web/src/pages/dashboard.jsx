import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseclient";
import { authFetch, getUsername, logout } from "../auth";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import "../css/dashboard.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Gear({ teeth = 8, r = 38, stroke = "#0a6aa8", strokeWidth = 2 }) {
  const ri = r * 0.72;
  const toothH = r * 0.22;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2 + 0.12;
    const a2 = (i / teeth) * Math.PI * 2 + Math.PI / teeth - 0.12;
    const a3 = (i / teeth) * Math.PI * 2 + Math.PI / teeth + 0.12;
    const a4 = ((i + 1) / teeth) * Math.PI * 2 - 0.12;
    const c = Math.cos, s = Math.sin;
    if (!i) d += `M ${ri * c(a1)} ${ri * s(a1)} `;
    d += `L ${(r + toothH) * c(a1)} ${(r + toothH) * s(a1)} `;
    d += `L ${(r + toothH) * c(a2)} ${(r + toothH) * s(a2)} `;
    d += `L ${ri * c(a3)} ${ri * s(a3)} `;
    d += `L ${ri * c(a4)} ${ri * s(a4)} `;
  }
  d += "Z";
  const cx = r + toothH + 4;
  return (
    <svg viewBox={`${-cx} ${-cx} ${cx * 2} ${cx * 2}`} xmlns="http://www.w3.org/2000/svg">
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
      <circle cx="0" cy="0" r={ri * 0.35} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
}

/* ── Vault Card ── */
function VaultCard({ vault, onDelete, onEdit, onUnlockRequest }) {
  let pct = 0;
  if (vault.daysRemaining != null && vault.createdDate && vault.expiryDate) {
    const created = new Date(vault.createdDate).getTime();
    const expiry = new Date(vault.expiryDate).getTime();
    const totalDaysSpan = Math.round((expiry - created) / (1000 * 60 * 60 * 24));
    if (totalDaysSpan > 0) {
      pct = Math.max(0, Math.min((vault.daysRemaining / totalDaysSpan) * 100, 100));
    }
  }

  const urgencyClass =
    vault.daysRemaining <= 7  ? "bar-urgent"
    : vault.daysRemaining <= 30 ? "bar-warning"
    : "bar-ok";

  return (
    <div className="vault-card" style={{ "--accent": vault.thumbnailColor || "#0066b1" }}>
      <div className="vault-card-header">
        <span className="vault-type-badge">{vault.vaultType || "Vault"}</span>
        <div className="vault-card-actions">
          <button
            className="vault-edit-btn"
            title="Edit vault settings"
            onClick={(e) => { e.stopPropagation(); onEdit(vault); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '8px', fontSize: '14px' }}
          >
            ✎ Edit
          </button>
          <button
            className="vault-delete-btn"
            title="Delete vault"
            onClick={(e) => { e.stopPropagation(); onDelete(vault.id); }}
          >
            x
          </button>
        </div>
      </div>

      <div
        className="vault-card-body"
        onClick={() => onUnlockRequest(vault)}
        style={{ cursor: 'pointer' }}
        title="Click to unlock and view contents"
      >
        <h3 className="vault-name">{vault.name}</h3>
        <div className="vault-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1" fill="var(--accent)"/>
          </svg>
        </div>
      </div>

      <div className="vault-card-footer">
        <span className="vault-date">
          {vault.createdDate
            ? new Date(vault.createdDate).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              })
            : "—"}
        </span>
        <div className="vault-progress-row">
          <div className="vault-progress-track">
            <div className={`vault-progress-fill ${urgencyClass}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="vault-days">
            {vault.daysRemaining != null ? `${vault.daysRemaining} Days` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Unlock Vault Modal ── */
function UnlockVaultModal({ username, vault, onClose, onUnlocked }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(`/api/vaults/${vault.id}/verify`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        onUnlocked(vault);
      } else {
        try {
          const errorData = await res.json();
          setError(errorData.message || errorData.error || "Incorrect vault password.");
        } catch {
          const errorText = await res.text();
          setError(errorText || "Incorrect vault password.");
        }
      }
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Unlock Vault</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <p className="modal-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Enter the password for '{vault.name}'
        </p>
        <form onSubmit={handleUnlock} className="modal-form">
          <div className="field-group">
            <label>Vault Password</label>
            <input type="password" required autoFocus
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? "Unlocking…" : "Access Vault"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Create Vault Modal ── */
function CreateVaultModal({ username, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [vaultType, setVaultType] = useState("General");
  const [expiryDate, setExpiryDate] = useState("");
  const [color, setColor] = useState("#0066b1");
  const [vaultPassword, setVaultPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const colors = ["#0066b1", "#8b5c29", "#1a6b4a", "#7b3fa0", "#b84a2e"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vault name is required."); return; }
    if (!vaultPassword.trim()) { setError("Vault password is required."); return; }
    setLoading(true);
    try {
      const res = await authFetch("/api/vaults", {
        method: "POST",
        body: JSON.stringify({
          name, vaultType, expiryDate: expiryDate || null,
          ownerUsername: username, thumbnailColor: color, vaultPassword
        }),
      });

      if (!res.ok) {
        try {
          const errorData = await res.json();
          setError(errorData.message || errorData.error || "Failed to create vault.");
        } catch {
          const errorText = await res.text();
          setError(errorText || "Failed to create vault.");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      onCreated(data);
      onClose();
    } catch {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>New Vault</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <p className="modal-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-10px', marginBottom: '24px' }}>
          Set up a new secure vault with custom release triggers
        </p>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>Vault Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Will" />
          </div>
          <div className="field-group">
            <label>Vault Password</label>
            <input type="password" required value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Secure password" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Type</label>
              <select value={vaultType} onChange={(e) => setVaultType(e.target.value)}>
                {["General","Will","Documents","Photos","Letters","Financial"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label>Accent Color</label>
            <div className="color-row">
              {colors.map(c => (
                <button
                  key={c} type="button"
                  className={`color-dot ${color === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? "Creating…" : "Create Vault"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditVaultModal({ username, vault, onClose, onUpdated, onVaultTriggered }) {
  const [name, setName] = useState(vault.name || "");
  const [vaultType, setVaultType] = useState(vault.vaultType || "General");
  const [expiryDate, setExpiryDate] = useState(vault.expiryDate || "");
  const [color, setColor] = useState(vault.thumbnailColor || "#0066b1");
  const [files, setFiles] = useState([]);
  const [successorEmail, setSuccessorEmail] = useState(vault.successorEmail || "");
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [isDeadman, setIsDeadman] = useState(vault.isDeadmanEnabled || false);
  const [deadmanDays, setDeadmanDays] = useState(vault.deadmanDays || 30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState("");
  const navigate = useNavigate();

  const colors = ["#0066b1", "#8b5c29", "#1a6b4a", "#7b3fa0", "#b84a2e"];

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await authFetch(`/api/vaults/trusted-contacts?username=${username}`);
        if (res.ok) {
          const data = await res.json();
          setTrustedContacts(data);
        }
      } catch (err) {
        console.error("Failed to load trusted contacts", err);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [username]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleTriggerNow = async () => {
    if (!window.confirm(
      "Are you sure? This will immediately send all vault contents to your inheritor and deactivate this vault. This cannot be undone."
    )) return;

    setTriggerLoading(true);
    setError("");

    try {
      const res = await authFetch(`/api/vaults/${vault.id}/trigger`, {
        method: "POST",
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        setTriggerSuccess("Vault triggered. Contents sent to inheritor.");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        const errText = await res.text();
        setError(errText || "Failed to trigger vault.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vault name is required."); return; }
    setLoading(true);

    try {
      const res = await authFetch(`/api/vaults/${vault.id}`, {
        method: "PUT",
        body: JSON.stringify({
          username, name, vaultType, expiryDate: expiryDate || null, thumbnailColor: color,
          successorEmail: successorEmail || null,
          isDeadmanEnabled: isDeadman,
          deadmanDays: isDeadman ? deadmanDays : null
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setError(errText || "Failed to update vault.");
        setLoading(false);
        return;
      }

      const updatedVaultData = await res.json();

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const uniqueName = `${vault.id}_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('vault-documents')
            .upload(uniqueName, file);

          if (uploadError) {
            console.error("Supabase Storage Error:", uploadError);
            alert(`Supabase failed to upload ${file.name}. Error: ${uploadError.message}`);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from('vault-documents')
            .getPublicUrl(uniqueName);

          const docRes = await authFetch("/api/documents", {
            method: "POST",
            body: JSON.stringify({
              fileName: file.name,
              fileUrl: publicUrlData.publicUrl,
              vaultId: vault.id
            })
          });

          if (!docRes.ok) {
            const backendError = await docRes.text();
            console.error("Backend Database Error:", backendError);
            alert(`Failed to save to Database. Error: ${backendError}`);
          }
        }
      }

      onUpdated(updatedVaultData);
      onClose();
    } catch (err) {
      setError(err.message || "Server error.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>Manage Vault</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleUpdate} className="modal-form">
          <div className="field-group">
            <label>Vault Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Type</label>
              <select value={vaultType} onChange={(e) => setVaultType(e.target.value)}>
                {["General","Will","Documents","Photos","Letters","Financial"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div className="field-group">
            <label>Accent Color</label>
            <div className="color-row">
              {colors.map(c => (
                <button key={c} type="button"
                  className={`color-dot ${color === c ? "selected" : ""}`}
                  style={{ background: c }} onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
          <h3 style={{ fontSize: '12px', color: 'var(--text-label)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Legacy & Inheritance
          </h3>

          <div className="field-group">
            <label>Inheritor (Trusted Contacts Only)</label>
            {loadingContacts ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading contacts...</p>
            ) : trustedContacts.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#ff4c4c', marginTop: '8px' }}>
                You have no trusted contacts. Add one from the dashboard first.
              </p>
            ) : (
              <select
                value={successorEmail}
                onChange={(e) => setSuccessorEmail(e.target.value)}
                style={{ marginTop: '8px' }}
              >
                <option value="">— None —</option>
                {trustedContacts.map((contact) => (
                  <option key={contact} value={contact}>{contact}</option>
                ))}
              </select>
            )}
          </div>

          <div className="field-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', margin: '12px 0' }}>
              <input
                type="checkbox"
                checked={isDeadman}
                onChange={(e) => setIsDeadman(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--blue)' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--brown-light)', textTransform: 'none', letterSpacing: '0.5px' }}>
                Enable Deadman's Switch
              </span>
            </label>
          </div>

          {isDeadman && (
            <div style={{ background: 'var(--bg-input-focus)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div className="field-group">
                <label>Release vault after (days of inactivity)</label>
                <input
                  type="number" min="1" value={deadmanDays}
                  onChange={(e) => setDeadmanDays(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Trigger the vault immediately and send all contents to your inheritor now.
                </p>
                {triggerSuccess ? (
                  <p style={{ color: 'var(--yellow)', fontSize: '13px', fontWeight: '500' }}>{triggerSuccess}</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerNow}
                    disabled={triggerLoading || !successorEmail}
                    style={{
                      background: '#b84a2e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: successorEmail ? 'pointer' : 'not-allowed',
                      opacity: successorEmail ? 1 : 0.5,
                      width: '100%'
                    }}
                  >
                    {triggerLoading ? "Triggering…" : "⚠ Trigger Now"}
                  </button>
                )}
                {!successorEmail && (
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Set an inheritor above to enable manual trigger.
                  </p>
                )}
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          <div className="field-group">
            <label>Upload Documents (PDF)</label>
            <input
              type="file" accept="application/pdf" multiple onChange={handleFileChange}
              style={{ padding: '8px', border: '1px dashed var(--blue)', background: 'var(--bg-input)', color: 'var(--text-secondary)', borderRadius: 'var(--radius)' }}
            />
            {files.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {files.map((file, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span>📄 {file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', color: '#ff4c4c', cursor: 'pointer', fontWeight: 'bold' }}>x</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="modal-error" style={{ color: '#ff4c4c', marginTop: '12px' }}>{error}</p>}
          <button type="submit" className="modal-btn" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TrustedContactsModal({ username, onClose }) {
  const [newContact, setNewContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContact.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await authFetch(`/api/users/${username}/trusted-contacts/add`, {
        method: "POST",
        body: JSON.stringify({ contact: newContact }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(errorText || "Failed to add contact.");
      } else {
        setMessage("Contact added successfully!");
        setNewContact("");
        setTimeout(onClose, 1500);
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Trusted Contacts</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <p className="modal-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', marginTop: '-10px' }}>
          Add a Vault-Tech user or an external email.
        </p>
        <form onSubmit={handleAdd} className="modal-form">
          <div className="field-group">
            <label>Username or Email Address</label>
            <input
              type="text"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              placeholder="e.g. johndoe or john@example.com"
              required
              autoFocus
            />
          </div>
          {error && <p className="modal-error" style={{ color: '#ff4c4c', marginTop: '12px' }}>{error}</p>}
          {message && <p className="modal-success" style={{ color: 'var(--yellow)', fontSize: '13px', marginTop: '12px', fontWeight: '500' }}>{message}</p>}
          <button type="submit" className="modal-btn" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? "Adding..." : "Add Contact"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Vault Content View Modal ── */
function VaultContentModal({ vault, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // ✅ CHANGED: authFetch instead of fetch
        const res = await authFetch(`/api/documents/vault/${vault.id}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [vault.id]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2>{vault.name} - Contents</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Decrypting contents...</p>
        ) : documents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>This vault is empty.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '120px', height: '160px', overflow: 'hidden', background: '#fff', borderRadius: '4px', display: 'flex', justifyContent: 'center', border: '1px solid #ccc' }}>
                  <Document file={doc.fileUrl} loading={<span style={{ color: '#333', fontSize: '10px', marginTop: '70px' }}>Loading PDF...</span>}>
                    <Page pageNumber={1} width={120} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </div>
                <span style={{ marginTop: '12px', fontSize: '12px', color: 'var(--brown-light)', textAlign: 'center', wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.fileName}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Dashboard (main page) ── */
function Dashboard() {
  const navigate = useNavigate();
  const username = getUsername();

  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [unlockingVault, setUnlockingVault] = useState(null);
  const [viewingVault, setViewingVault] = useState(null);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    fetchVaults();
  }, [navigate, username]);

  const fetchVaults = async () => {
    setLoading(true);
    try {
      // ✅ CHANGED: authFetch instead of fetch
      const res = await authFetch(`/api/vaults?username=${username}`);
      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/");
        return;
      }
      const data = await res.json();
      setVaults(Array.isArray(data) ? data : []);
    } catch {
      setVaults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vault? This cannot be undone.")) return;
    try {
      // ✅ CHANGED: authFetch instead of fetch
      const res = await authFetch(`/api/vaults/${id}?username=${username}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVaults((prev) => prev.filter((v) => v.id !== id));
      } else {
        alert("Failed to delete vault.");
      }
    } catch {
      alert("Failed to delete vault.");
    }
  };

  const handleCreated = (newVault) => {
    setVaults((prev) => [...prev, newVault]);
  };

  const handleUpdated = (updatedVault) => {
    setVaults((prev) => prev.map(v => v.id === updatedVault.id ? updatedVault : v));
  };

  const handleVaultUnlocked = (vault) => {
    setUnlockingVault(null);
    setViewingVault(vault);
  };

  if (!username) return null;

  return (
    <div className="dashboard-page">
      <div className="gear-layer">
        <Gear teeth={12} r={56} strokeWidth={2.5} />
        <Gear teeth={7}  r={26} strokeWidth={2}   />
        <Gear teeth={16} r={72} strokeWidth={2.5} />
        <Gear teeth={9}  r={36} strokeWidth={2}   />
        <Gear teeth={14} r={62} strokeWidth={2.5} />
        <Gear teeth={6}  r={24} strokeWidth={2}   />
        <Gear teeth={10} r={48} strokeWidth={2.5} />
        <Gear teeth={5}  r={20} strokeWidth={2}   />
        <Gear teeth={8}  r={40} strokeWidth={2}   />
        <Gear teeth={6}  r={18} strokeWidth={1.8} />
      </div>

      <nav className="dash-nav">
        <div className="nav-brand">
          <div className="nav-logo-box" />
          <span className="nav-title">Vault-Tech</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/profile")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>
          <button className="nav-btn nav-btn-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-actions">
          <button className="action-btn" onClick={() => setShowCreateModal(true)}>
            <span className="action-plus">+</span> Create New Vault
          </button>
          <button className="action-btn action-btn-secondary" onClick={() => setShowContactsModal(true)}>
            <span className="action-plus">+</span> Add Trusted Contacts
          </button>
        </div>

        <section className="vaults-section">
          <h2 className="section-title">Active Vaults</h2>

          {loading ? (
            <div className="empty-state">Loading your vaults…</div>
          ) : vaults.length === 0 ? (
            <div className="empty-state">
              No vaults yet.{" "}
              <span className="empty-cta" onClick={() => setShowCreateModal(true)}>
                Create your first vault
              </span>
            </div>
          ) : (
            <div className="vault-grid">
              {vaults.map((v) => (
                <VaultCard
                  key={v.id}
                  vault={v}
                  onDelete={handleDelete}
                  onEdit={setEditingVault}
                  onUnlockRequest={setUnlockingVault}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showCreateModal && (
        <CreateVaultModal username={username} onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}

      {editingVault && (
        <EditVaultModal username={username} vault={editingVault} onClose={() => setEditingVault(null)} onUpdated={handleUpdated} />
      )}

      {unlockingVault && (
        <UnlockVaultModal username={username} vault={unlockingVault} onClose={() => setUnlockingVault(null)} onUnlocked={handleVaultUnlocked} />
      )}

      {viewingVault && (
        <VaultContentModal vault={viewingVault} onClose={() => setViewingVault(null)} />
      )}

      {showContactsModal && (
        <TrustedContactsModal username={username} onClose={() => setShowContactsModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;