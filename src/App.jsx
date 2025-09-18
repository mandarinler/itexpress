import React, { useState, useEffect } from "react";
import "./App.css";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const toggleMenu = () => setIsOpen(!isOpen);
  const [services, setServices] = useState([]);
  // Fetch services from Firestore

  useEffect(() => {
    const fetchServices = async () => {
      const q = query(
        collection(db, "services"),
        orderBy("createdAt", "desc") // 🔹 newest first
      );

      const querySnapshot = await getDocs(q);
      const servicesData = [];
      querySnapshot.forEach((doc) => {
        servicesData.push({ id: doc.id, ...doc.data() });
      });
      setServices(servicesData);
    };

    fetchServices();
  }, []);
  //Form States
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitStatus, setSubmitStatus] = useState("");
  const handleScroll = (id) => {
    const target = document.getElementById(id);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm({ ...contactForm, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://formspree.io/f/xblavayw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setSubmitStatus("Mesaj uğurla göndərildi!");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("Mesaj göndərmək alınmadı. Yenidən cəhd edin.");
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus("Mesaj göndərmək alınmadı. Yenidən cəhd edin.");
    }
  };

  useEffect(() => {
    const handleScrollEvent = () => {
      const sections = ["home", "why-choose-us", "services", "contact"];
      let current = "home";

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const offset = section.offsetTop - 80;
          if (window.scrollY >= offset) current = id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => handleScroll("home")}>
            <img src="/Logo.png" alt="ITExpress Logo" />
          </div>

          <div className="menu-toggle" onClick={toggleMenu}>
            ☰
          </div>

          {/* Links */}
          <div className={`nav-links ${isOpen ? "open" : ""}`}>
            <button
              className={activeSection === "home" ? "active" : ""}
              onClick={() => handleScroll("home")}
            >
              Ana Səhifə
            </button>
            <button
              className={activeSection === "why-choose-us" ? "active" : ""}
              onClick={() => handleScroll("why-choose-us")}
            >
              Niyə Bizi Seçməlisiniz
            </button>
            <button
              className={activeSection === "services" ? "active" : ""}
              onClick={() => handleScroll("services")}
            >
              Servislər
            </button>
            <button
              className={activeSection === "contact" ? "active" : ""}
              onClick={() => handleScroll("contact")}
            >
              Əlaqə Saxla
            </button>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div className="sections">
        <div id="home" className="home-section">
          <div className="home-overlay">
            <h1>İnkişaf və Dayanıqlılığı Təşviq Edən İT Həlləri</h1>
            <p>
              Şəbəkə Monitorinqindən tutmuş tam xidmət İT İdarəçiliyinə qədər
              genişlənən, təhlükəsiz həllər.
            </p>
          </div>
        </div>

        <div id="why-choose-us" className="section-why-choose-us">
          <div className="why-choose-us-container">
            <div className="intro-text">
              <h2>Niyə Bizi Seçməlisiniz?</h2>
              <p>
                Peşəkar komandamız, etibarlı və çevik İT həlləri ilə
                biznesinizin inkişafını dəstəkləyir.
              </p>
            </div>

            <div className="features">
              <div className="feature-card">
                <h3>Peşəkar Komanda</h3>
                <p>
                  İT mütəxəssislərimiz hər layihəyə yüksək keyfiyyət və diqqət
                  göstərir.
                </p>
              </div>
              <div className="feature-card">
                <h3>Təhlükəsizlik və Etibarlılıq</h3>
                <p>
                  Bizim həllərimiz təhlükəsiz və davamlıdır, məlumatlarınız
                  qorunur.
                </p>
              </div>
              <div className="feature-card">
                <h3>Çevik Həllər</h3>
                <p>
                  Biz biznes ehtiyaclarınıza uyğun miqyaslana bilən həllər
                  təqdim edirik.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Services Section */}
        <div id="services" className="section-services">
          <h2>Servislərimiz</h2>
          {services.map((service) => (
            <div key={service.id} className="service-section">
              <div className="service-image">
                <img
                  src="https://i.hizliresim.com/9sd41u1.png"
                  alt={service.title}
                />
              </div>
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Contact Section */}
        <div id="contact" className="section-contact">
          <h2>Əlaqə Saxla</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Adınız"
              value={contactForm.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Emailiniz"
              value={contactForm.email}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="message"
              placeholder="Mesajınız"
              value={contactForm.message}
              onChange={handleInputChange}
              required
              rows="5"
            />
            <button type="submit">Göndər</button>
            {submitStatus && <p>{submitStatus}</p>}
          </form>
        </div>
      </div>
      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© 2025 ITExpress. Bütün hüquqlar qorunur.</p>
          <p>office@itexpress.az</p>
          <p>+994 70 201 1392</p>
          <p>+994 77 733 2626</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
