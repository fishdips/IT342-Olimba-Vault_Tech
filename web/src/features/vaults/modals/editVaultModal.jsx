import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../../auth";
import { supabase } from "../../../supabaseclient";

function EditVaultModal({ username, vault, onClose, onUpdated }) {
  const [name, setName] = useState(vault.name || "");
  const [expiryDate, setExpiryDate] = useState(vault.expiryDate || "");
  const [color, setColor] = useState(vault.thumbnailColor || "#0066b1");
  const [files, setFiles] = useState([]);
  const [successorEmails, setSuccessorEmails] = useState(vault.successorEmails || []);
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState("");
  const navigate = useNavigate();

  const colors = ["#0066b1", "#8b5c29", "#1a6b4a", "#7b3fa0", "#b84a2e"];

  const toggleInheritor = (email) => {
    if (successorEmails.includes(email)) {
      setSuccessorEmails(successorEmails.filter(e => e !== email));
    } else {
      setSuccessorEmails([...successorEmails, email]);
    }
  };

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
          username,
          name,
          vaultType: "Secure Vault",
          expiryDate: expiryDate || null,
          thumbnailColor: color,
          successorEmails,
          isDeadmanEnabled: false, 
          deadmanDays: null
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
          try {
            const filePath = `${vault.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('vault-documents') 
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('vault-documents') 
              .getPublicUrl(filePath);

            const docRes = await authFetch("/api/documents", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                fileName: file.name,
                fileUrl: publicUrl,
                vaultId: vault.id
              })
            });

            if (!docRes.ok) {
              const backendError = await docRes.text();
              console.error("Backend Metadata Error:", backendError);
              alert(`Failed to save ${file.name} metadata to database. Error: ${backendError}`);
            }
          } catch (err) {
            console.error("Supabase Upload Error:", err);
            alert(`Failed to upload ${file.name} to Supabase: ${err.message}`);
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
            <label>Inheritors (Trusted Contacts Only)</label>
            {loadingContacts ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading contacts...</p>
            ) : trustedContacts.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#ff4c4c', marginTop: '8px' }}>
                You have no trusted contacts. Add one from the dashboard first.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', maxHeight: '140px', overflowY: 'auto' }}>
                {trustedContacts.map((contact) => (
                  <label key={contact} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={successorEmails.includes(contact)}
                      onChange={() => toggleInheritor(contact)}
                      style={{ accentColor: 'var(--blue)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{contact}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Manual Override / Panic Button */}
          <div style={{ background: 'rgba(184, 74, 46, 0.05)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid rgba(184, 74, 46, 0.4)', marginTop: '24px' }}>
            <h3 style={{ fontSize: '13px', color: '#b84a2e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Manual Override
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Bypass all timers and instantly send all contents to your inheritor now. This cannot be undone.
            </p>
            {triggerSuccess ? (
              <p style={{ color: 'var(--yellow)', fontSize: '13px', fontWeight: '500' }}>{triggerSuccess}</p>
            ) : (
              <button
                type="button"
                onClick={handleTriggerNow}
                disabled={triggerLoading || !successorEmails.length}
                style={{
                  background: '#b84a2e', color: '#fff', border: 'none',
                  borderRadius: 'var(--radius)', padding: '10px 20px',
                  fontSize: '13px', fontWeight: '600',
                  cursor: successorEmails.length ? 'pointer' : 'not-allowed',
                  opacity: successorEmails.length ? 1 : 0.5,
                  width: '100%'
                }}
              >
                {triggerLoading ? "Releasing Vault…" : "⚠ Release Vault Now"}
              </button>
            )}
            {!successorEmails.length && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                You must assign an Inheritor above to enable the manual release.
              </p>
            )}
          </div>

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

export default EditVaultModal;