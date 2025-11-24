import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ArchetypeSection() {
  useEffect(() => {
    // 3D Tilt effect
    const cards = document.querySelectorAll(".card3d");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotY = (x / rect.width - 0.5) * 20;
        const rotX = (y / rect.height - 0.5) * -20;

        card.querySelector(".card-inner").style.transform =
          `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.08)`;
      });

      card.addEventListener("mouseleave", () => {
        card.querySelector(".card-inner").style.transform =
          "rotateY(0deg) rotateX(0deg) scale(1)";
      });
    });

    // GSAP Entrance Animation
    gsap.from(".card3d", {
      opacity: 0,
      y: 50,
      scale: 0.8,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: "#archetypes",
        start: "top 80%",
      },
    });
  }, []);

  return (
    <section id="archetypes" className="section" style={{ position: "relative", zIndex: 1000 }}>
      <h2 className="h1 gold">THE ARCHETYPES</h2>

      <p className="lead">
        A map of 16 archetypal subconscious patterns that define your psyche.
      </p>

      <div className="card-grid">
        {["Magician", "Sovereign", "Lover", "Warrior"].map((name) => (
          <div className="card3d" key={name}>
            <div className="card-inner">
              <img
                src={`https://via.placeholder.com/300x400?text=${name}`}
                alt={name}
              />
              <h3 className="gold">{name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
