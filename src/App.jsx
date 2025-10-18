import React, { useState, useEffect } from "react";
import "./App.css";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [services, setServices] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState("");

  // Toggling the mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Scrolling to the section
  const handleScroll = (id) => {
  const target = document.getElementById(id);
  if (!target) return;
  setIsOpen(false);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handle contact form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm({ ...contactForm, [name]: value });
  };

  // Submiting contact form
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

  // Fetch services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      const q = query(collection(db, "services"), orderBy("index", "desc"));
      const snapshot = await getDocs(q);
      const servicesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    };
    fetchServices();
  }, []);

  
  // Tracking of active section on scroll
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        threshold: 0, 
        rootMargin: "-20% 0px -80% 0px", // 20% from top, 80% from bottom creating a imaginary crosshair in the top of the viewport it works fine
      }
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => handleScroll("home")}>
            <img src="/Logo.png" alt="ITExpress Logo" />
          </div>

          <div className="menu-toggle" onClick={toggleMenu}>☰</div>

          <div className={`nav-links ${isOpen ? "open" : ""}`}>
            {["home", "why-choose-us", "services", "contact"].map((section) => (
              <button
                key={section}
                className={activeSection === section ? "active" : ""}
                onClick={() => handleScroll(section)}
              >
                {{
                  "home": "Ana Səhifə",
                  "why-choose-us": "Niyə Bizi Seçməlisiniz",
                  "services": "Servislər",
                  "contact": "Əlaqə Saxla"
                }[section]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div className="sections">
        <section id="home" className="home-section">
          <div className="home-overlay">
            <h1>İnkişaf və Dayanıqlılığı Təşviq Edən İT Həlləri</h1>
            <p>Şəbəkə Monitorinqindən tutmuş tam xidmət İT İdarəçiliyinə qədər genişlənən, təhlükəsiz həllər.</p>
          </div>
        </section>

        <section id="why-choose-us" className="section-why-choose-us">
          <div className="why-choose-us-container">
            <div className="intro-text">
              <h2>Niyə Bizi Seçməlisiniz?</h2>
              <p>Peşəkar komandamız, etibarlı və çevik İT həlləri ilə biznesinizin inkişafını dəstəkləyir.</p>
            </div>

            <div className="features">
              {[
                { title: "Peşəkar Komanda", desc: "İT mütəxəssislərimiz hər layihəyə yüksək keyfiyyət və diqqət göstərir." },
                { title: "Təhlükəsizlik və Etibarlılıq", desc: "Bizim həllərimiz təhlükəsiz və davamlıdır, məlumatlarınız qorunur." },
                { title: "Çevik Həllər", desc: "Biz biznes ehtiyaclarınıza uyğun miqyaslana bilən həllər təqdim edirik." }
              ].map((f, i) => (
                <div className="feature-card" key={i}>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="section-services">
          <h2>Servislərimiz</h2>
          {services.map((service) => (
            <div key={service.id} className="service-section">
              <div className="service-image">
                <img src="https://i.hizliresim.com/9sd41u1.png" alt={service.title} />
              </div>
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section id="contact" className="section-contact">
          <h2>Əlaqə Saxla</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Adınız" value={contactForm.name} onChange={handleInputChange} required />
            <input type="email" name="email" placeholder="Emailiniz" value={contactForm.email} onChange={handleInputChange} required />
            <textarea name="message" placeholder="Mesajınız" value={contactForm.message} onChange={handleInputChange} required rows="5" />
            <button type="submit">Göndər</button>
            {submitStatus && <p>{submitStatus}</p>}
          </form>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© 2025 ITExpress. Bütün hüquqlar qorunur.</p>
          <p>office@itexpress.az</p>
          <p>+994 77 733 2626</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
