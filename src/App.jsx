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

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Scroll to section
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

  // Submit contact form
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

  // Track active section on scroll
 useEffect(() => {
  // helper: list sections with ids
  const getSections = () => Array.from(document.querySelectorAll("section[id]"));

  let io = null;
  let raf = null;

  const createObserver = () => {
    const sections = getSections();
    if (!sections.length) return;

    io = new IntersectionObserver(
      (entries) => {
        // debug: uncomment to see intersection ratios in console
        // entries.forEach(e => console.log(e.target.id, e.intersectionRatio));

        // pick the entry with the largest visible ratio
        let maxRatio = 0;
        let mostVisibleId = null;

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleId = entry.target.id;
          }
        });

        // if we got a visible section, set it
        if (mostVisibleId && maxRatio > 0) {
          setActiveSection(mostVisibleId);
          return;
        }

        // fallback: if nothing has positive ratio (rare), pick nearest section by distance to top
        let nearestId = null;
        let nearestDist = Infinity;
        sections.forEach((s) => {
          const rect = s.getBoundingClientRect();
          // distance from viewport center (or top)
          const dist = Math.abs(rect.top + rect.height / 2 - (window.innerHeight / 2));
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestId = s.id;
          }
        });
        if (nearestId) setActiveSection(nearestId);
      },
      {
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1], // include 0 so tiny visibility still reported
        root: null,
        rootMargin: "-10% 0px -30% 0px", // tweak to your header size; this works well usually
      }
    );

    sections.forEach((s) => io.observe(s));
  };

  // Use requestAnimationFrame so we observe after the layout has (likely) stabilized
  raf = requestAnimationFrame(() => {
    createObserver();
  });

  // Also listen for window resize/reflow and rebuild observer (optional robustness)
  const onResize = () => {
    if (io) io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => createObserver());
  };
  window.addEventListener("resize", onResize);

  return () => {
    if (io) try { io.disconnect(); } catch (e) {}
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
  };
}, [services.length]); //

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
