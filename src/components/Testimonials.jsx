import React, { useState } from "react";
// import "./carousel.css"; // <-- create this

const testimonials = [
  {
    text: "The Sphinx Code gave me a brand-new perspective — it's like a map for my soul.",
    author: "Mary Elizabeth",
    date: "April 11, 2023",
  },
  {
    text: "A life-changing experience. Everything suddenly made sense.",
    author: "Daniel Carter",
    date: "Jan 3, 2024",
  },
  {
    text: "It helped me understand my inner patterns with stunning clarity.",
    author: "Sophia Turner",
    date: "March 12, 2024",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((index + 1) % testimonials.length);
  const prev = () =>
    setIndex((index - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="section">
      <h2 className="h1 gold-center">TESTIMONIALS</h2>

      <div className="carousel-wrapper">
        <button className="nav-btn left" onClick={prev}>‹</button>

        <div className="carousel">
          {testimonials.map((item, i) => {
            let position =
              i === index
                ? "active"
                : i === (index - 1 + testimonials.length) % testimonials.length
                ? "left"
                : "right";

            return (
              <div key={i} className={`card ${position}`}>
                <p className="text">“{item.text}”</p>
                <p className="author">— {item.author}, {item.date}</p>
              </div>
            );
          })}
        </div>

        <button className="nav-btn right" onClick={next}>›</button>
      </div>
    </section>
  );
}
