import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch, getUsername } from "../auth";
import "../css/profile.css";

function Profile() {
  const navigate = useNavigate();
  const username = getUsername();

  const [userData, setUserData] = useState(null);
  const [newContact, setNewContact] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    fetchProfile();
  }, [username, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await authFetch(`/api/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      } else if (res.status === 401 || res.status === 403) {
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to load profile");
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/api/users/${username}/trusted-contacts/add`, {
        method: "POST",
        body: JSON.stringify({ contact: newContact }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setError(errText);
      } else {
        setNewContact("");
        setShowAddContact(false);
        fetchProfile();
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = async (contactToRemove) => {
    if (!window.confirm(`Remove ${contactToRemove} from trusted contacts?`)) return;

    try {
      const res = await authFetch(
        `/api/users/${username}/trusted-contacts/${contactToRemove}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error("Failed to remove contact");
    }
  };

  if (!userData) return <div style={{ padding: "50px", textAlign: "center" }}>Loading Profile...</div>;

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <div className="profile-brand">
          <div className="profile-logo-box" />
          <span>Vault-Tech</span>
        </div>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          &larr; Back to Dashboard
        </button>
      </nav>

      <main className="profile-main">
        <section className="profile-card">
          <button className="edit-icon">✎</button>
          <h2>User Profile</h2>
          <br />
          <div className="profile-form-grid">
            <div className="profile-field">
              <label>First Name</label>
              <input type="text" value={userData.firstName || ""} readOnly />
            </div>
            <div className="profile-field">
              <label>Last Name</label>
              <input type="text" value={userData.lastName || ""} readOnly />
            </div>
            <div className="profile-field">
              <label>Username</label>
              <input type="text" value={userData.username || ""} readOnly />
            </div>
            <div className="profile-field">
              <label>Email Address</label>
              <input type="email" value={userData.email || ""} readOnly />
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="contacts-header">
            <div>
              <h2>All Trusted Contacts</h2>
              <p className="subtitle">People who can receive your vault contents</p>
            </div>
            <button className="add-contact-btn" onClick={() => setShowAddContact(!showAddContact)}>
              ✎ Add Account
            </button>
          </div>

          {showAddContact && (
            <form onSubmit={handleAddContact} className="add-contact-form">
              <div className="profile-field">
                <label>Enter Username or Email</label>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="johndoe or john@example.com"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="add-contact-btn" disabled={loading} style={{ margin: 0 }}>
                    {loading ? "Adding..." : "Confirm"}
                  </button>
                </div>
              </div>
              {error && (
                <p style={{ color: "#ff4c4c", fontSize: "13px", marginTop: "12px", fontWeight: "500" }}>
                  {error}
                </p>
              )}
            </form>
          )}

          <div className="contact-list">
            {userData.trustedContacts && userData.trustedContacts.length > 0 ? (
              userData.trustedContacts.map((contact, idx) => (
                <div className="contact-row" key={idx}>
                  <div className="contact-info">
                    <span className="contact-id">{contact}</span>
                    <span className="contact-type">
                      {contact.includes("@") ? "External Email" : "Vault-Tech User"}
                    </span>
                  </div>
                  <button className="trash-btn" onClick={() => handleRemoveContact(contact)}>🗑</button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "14px" }}>No trusted contacts added yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;