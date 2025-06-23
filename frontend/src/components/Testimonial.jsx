import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

const chunkArray = (arr, n) =>
  Array.from({ length: n }, (_, i) =>
    arr.filter((_, index) => index % n === i)
  );

export default function Testimonial() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/feedback/admin");
        const data = await res.json();
        const processed = data.map((f) => ({
          name: f.username,
          username: `@${f.username.toLowerCase()}`,
          text: f.message,
          stars: f.stars || 0,
          avatar: `https://randomuser.me/api/portraits/men/${Math.floor(
            Math.random() * 10
          )}.jpg`,
        }));
        setTestimonials(processed);
      } catch (err) {
        console.error("Error loading feedback:", err);
      }
    };
    fetchTestimonials();
  }, []);

  const columns = chunkArray(testimonials, 3);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col, i) => (
          <div key={i} className="relative h-[600px] overflow-hidden">
            <div className="space-y-4 animate-scroll-up">
              {col.map((t, j) => (
                <div
                  key={j}
                  className="flex items-start gap-3 p-4 bg-[#111] rounded-lg shadow-lg w-full text-white hover:bg-[#222] transition-colors"
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-gray-400 text-sm">{t.username}</p>
                    <div className="flex items-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-sm ${
                            i < t.stars ? "text-yellow-400" : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm whitespace-pre-line mt-1">
                      {t.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}