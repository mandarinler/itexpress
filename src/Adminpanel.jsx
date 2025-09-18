import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import "./Adminpanel.css";

function AdminPanel() {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeMenu, setActiveMenu] = useState("services");

  // Fetch services ordered by index (newest first)
  const fetchServices = async () => {
    const q = query(collection(db, "services"), orderBy("index", "desc"));
    const snapshot = await getDocs(q);
    const servicesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setServices(servicesData);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Add service
  const addService = async () => {
    if (!title || !description) return;

    try {
      // Determine the new index
      const maxIndex = services.length ? Math.max(...services.map(s => s.index || 0)) : 0;
      const newIndex = maxIndex + 1;

      // Add to Firestore
      await addDoc(collection(db, "services"), {
        title,
        description,
        index: newIndex,
      });

      // Update local state immediately
      setServices([{ title, description, index: newIndex, id: Date.now() }, ...services]);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error adding service:", err);
    }
  };

  // Delete service
  const deleteService = async (id) => {
    try {
      await deleteDoc(doc(db, "services", id));
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li
            className={activeMenu === "services" ? "active" : ""}
            onClick={() => setActiveMenu("services")}
          >
            Services
          </li>
          <li className="disabled">About (soon)</li>
          <li className="disabled">Team (soon)</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {activeMenu === "services" && (
          <div>
            <h2>Manage Services</h2>

            {/* Add Service Form */}
            <div className="form">
              <input
                type="text"
                placeholder="Service title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
              <textarea
                placeholder="Service description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              />
              <button onClick={addService}>Add Service</button>
            </div>

            {/* Services List */}
            <ul className="service-list">
              {services.map((service) => (
                <li key={service.id}>
                  <div>
                    <strong>{service.title}</strong>
                    <p>{service.description}</p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteService(service.id)}
                  >
                    ✖
                  </button>
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
