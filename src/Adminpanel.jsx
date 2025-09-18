import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./Adminpanel.css";

function AdminPanel() {
  const [services, setServices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeMenu, setActiveMenu] = useState("services");

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const servicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    };
    fetchServices();
  }, []);

  // Add service
  const addService = async (title, description) => {
    if (!title || !description) return; // basic validation

    try {
      await addDoc(collection(db, "services"), {
        title,
        description,
        createdAt: serverTimestamp(), // ensures timestamp is saved
      });
      console.log("Service added successfully!");
    } catch (err) {
      console.error("Error adding service:", err);
    }
  };
  // Delete service
  const deleteService = async (id) => {
    await deleteDoc(doc(db, "services", id));
    const querySnapshot = await getDocs(collection(db, "services"));
    setServices(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
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
              ></textarea>
              <button onClick={addService}>Add Service</button>
            </div>

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
