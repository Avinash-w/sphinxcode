import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Testimonials from "./Testimonials";
import CardsSection from "./CardsSection";

gsap.registerPlugin(ScrollTrigger);

export default function Sections() {
useEffect(() => {
  requestAnimationFrame(() => {
    const sections = document.querySelectorAll(".section");

    sections.forEach((sec) => {
      const elements = sec.querySelectorAll("h1, h2, p, img, button");

      // Entrance Animation
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 60,
          scale: 0.95,
          filter: "blur(6px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sec,
            start: "top 80%",
            end: "top 30%",
            scrub: false,
          },
        }
      );

      gsap.to(sec, {
        backgroundPositionY: "40%",
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          scrub: 1.5,
        },
      });
    });



   
  });
}, []);



  return (
    <>
    <div className="sections-wrapper">
      <section id="welcome" className="section">
        <h1 className="h1">
          WELCOME TO <span className="gold">SPHINX CODE</span>
        </h1>
        <p className="lead">
          The Sphinx Code is a new personality wisdom system with an algorithm
          that changes the game in self-development, personal empowerment, and
          self-understanding. Using your birth information, the Sphinx Code
          generates an Archetypal Blueprint of your personal subconscious
          archetypes that govern different aspects of your life.
        </p>
        <p className="lead">
          Through this map, you gain clearer understanding of your function,
          your behaviors, beliefs, and traits that swing from positive to
          negative attributes.
        </p>
      </section>
      

      <section id="video-intro" className="section">
        <h2 className="h1">VIDEO INTRODUCTION</h2>
        <p className="lead">
          Watch a cinematic introduction to the Sphinx Code — a crafted blend of
          volumetric fog, drifting particles, and slow-energy motion that helps
          orient you to your subconscious architecture.
        </p>
        <div
          style={{
            marginTop: "2rem",
            width: "80%",
            maxWidth: "800px",
          }}
        >
          <iframe
            src="https://vimeo.com/756387968?fl=pl&fe=sh"
            width="100%"
            height="450"
            style={{ border: "none" }}
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Sphinx Code Introduction Video"
          ></iframe>
        </div>
      </section>

      <section id="oracles" className="section">
        <h2 className="h1">THE SPHINX CODE ORACLES</h2>
        <p className="lead">
          Become a Wisdom Keeper. Learn how to read the Archetypal Blueprint and
          give readings to your clients.
        </p>
        <img
          src="/path/to/oracles-image.jpg"
          alt="Sphinx Oracles"
          style={{ maxWidth: "50%", marginTop: "2rem" }}
        />
        <p className="lead gold" style={{ marginTop: "1rem" }}>
          GET CERTIFIED
        </p>
      </section>

        <section id="archetypes" className="section" style={{ position: "relative", zIndex: 999 }}>
  <h2 className="h1 gold">THE ARCHETYPES</h2>

  <p className="lead">
    A map of 16 archetypal subconscious patterns that define your psyche.
  </p>

  <div className="card-grid">
    {[
      {
        title: "Archetypal Blueprint",
        paragraph: "Get your Free Blueprint and discover your Archetypal subconscious structure that is your psyche.",
        img: "/assets/img_1.png"
      },
      {
        title: "Global Transits",
        paragraph: "Follow each day’s archetypal flow, and align your special events with proper archetypal influence.",
        img: "/assets/img_2.png"
      },
      {
        title: "Get A Reading",
        paragraph: "A Wisdom Keeper reading provides greater depth to understand your Archetypal Blueprint, and master yourself.",
        img: "/assets/img_3.png"
      }
    ].map((card, index) => (
      <div className="card3d" key={index}>
        <div className="card-inner">
          <img src={card.img} alt={card.title} style={{height:"220px"}} />
          <h3 className="gold">{card.title}</h3>
          <p className="card-desc">{card.paragraph}</p>
        </div>
      </div>
    ))}
  </div>
</section>



      


      {/* <section id="testimonials" className="section"> */}
        <Testimonials/>
      {/* </section> */}

      <section id="readings" className="section">
        <h2 className="h1">GET SPHINX SCROLLS</h2>
        <p className="lead">
          Sign up for our free newsletter and unlock your archetypal blueprint.
        </p>

        <button
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            border: "2px solid var(--gold)",
            background: "transparent",
            color: "var(--gold)",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          JOIN NEWSLETTER
        </button>
      </section>
      </div>
    </>
  );
}
