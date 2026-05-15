import { useState } from "react";
import { authFetch } from "../../../auth";

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

export default TrustedContactsModal;