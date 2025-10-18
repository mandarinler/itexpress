// AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./Adminpanel.css";

function AdminPanel() {
  const [user, setUser] = useState(null); // logged-in user
  const [email, setEmail] = useState(""); // login email
  const [password, setPassword] = useState(""); // login password
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeMenu, setActiveMenu] = useState("services");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Observe auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Fetch services
  useEffect(() => {
    if (!user) return; 
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.index || 0) - (a.index || 0)); 
      setServices(servicesData);
    };
    fetchServices();
  }, [user]);

  // Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Add service
  const addService = async () => {
    if (!title || !description) return;
    try {
      const maxIndex = services.length > 0 ? Math.max(...services.map(s => s.index || 0)) : 0;
      await addDoc(collection(db, "services"), {
        title,
        description,
        index: maxIndex + 1,
      });
      setTitle("");
      setDescription("");
      // Refresh services
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.index || 0) - (a.index || 0));
      setServices(servicesData);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete service
  const deleteService = async (id) => {
    await deleteDoc(doc(db, "services", id));
    setServices(services.filter((s) => s.id !== id));
  };

  // Start editing a service
  const startEditing = (service) => {
    setEditingId(service.id);
    setEditTitle(service.title);
    setEditDescription(service.description);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  // Update service
  const updateService = async () => {
    if (!editTitle || !editDescription) return;
    try {
      await updateDoc(doc(db, "services", editingId), {
        title: editTitle,
        description: editDescription,
      });
    
      setServices(services.map(service => 
        service.id === editingId 
          ? { ...service, title: editTitle, description: editDescription }
          : service
      ));
      
      cancelEditing();
    } catch (err) {
      console.error("Error updating service:", err);
    }
  };


  if (!user) {
    // Login form
    return (
      <div className="admin-login">
        <div className="login-card">
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <button onClick={() => navigate("/")}>🏠 Back to Home</button>
        <ul>
          <li
            className={activeMenu === "services" ? "active" : ""}
            onClick={() => setActiveMenu("services")}
          >
            Services
          </li>
          <li className="disabled">About (soon)</li>
          <li className="disabled">Team (soon)</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {activeMenu === "services" && (
          <div>
            <h2>Manage Services</h2>

            <div className="form">
              <input
                type="text"
                placeholder="Service title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Service description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button onClick={addService}>Add Service</button>
            </div>

            <ul className="service-list">
              {services.map((service) => (
                <li key={service.id}>
                  {editingId === service.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="edit-input"
                        placeholder="Service title"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="edit-textarea"
                        placeholder="Service description"
                      />
                      <div className="edit-buttons">
                        <button onClick={updateService} className="save-btn">
                          Save
                        </button>
                        <button onClick={cancelEditing} className="cancel-btn">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{service.title}</strong>
                        <p>{service.description}</p>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => startEditing(service)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteService(service.id)}
                        >
                          ✖
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
