"use client";

import React, { useState } from "react";
import "./GlobalMapReviewPanel.css";

type ReviewSection = {
  title: string;
  eyebrow: string;
  content: React.ReactNode;
};

const sections: ReviewSection[] = [
  {
    eyebrow: "01 · Objective",
    title: "What are we building?",
    content: (
      <>
        <p className="review-lead">
          A single interactive global view that turns location-based data into
          an easy-to-understand visual map.
        </p>
        <ul>
          <li>Global geographic view of the data</li>
          <li>Location-based data points with visual indicators</li>
          <li>Interactive map & globe for exploration</li>
          <li>Tooltips and interactions for deeper information</li>
          <li>
            Self-contained architecture suitable for Sovereign UAE deployment
          </li>
        </ul>
      </>
    ),
  },
  {
    eyebrow: "02 · Approach",
    title: "Why this approach?",
    content: (
      <>
        <p className="review-lead">
          Our requirement is a data map rather than a street-level navigation
          map.
        </p>
        <p>
          We don't need roads, buildings or external map tiles. The geographic
          boundary data required to draw the map can be packaged with the
          application, so the map does not need to depend on an external map
          server at runtime.
        </p>
      </>
    ),
  },
  {
    eyebrow: "03 · Evaluation",
    title: "Options considered",
    content: (
      <div className="review-options">
        <div className="review-option selected">
          <div>
            <strong>React + D3-geo</strong>
            <span>Self-contained · Flexible · No map-service dependency</span>
          </div>
          <b>Selected</b>
        </div>
        <div className="review-option">
          <div>
            <strong>amCharts 5</strong>
            <span>Strong visual reference · Commercial licensing</span>
          </div>
          <b>Reference</b>
        </div>
        <div className="review-option">
          <div>
            <strong>react-simple-maps</strong>
            <span>Similar approach · Less custom control</span>
          </div>
          <b>Alternative</b>
        </div>
        <div className="review-option">
          <div>
            <strong>Apache ECharts</strong>
            <span>Technically capable · Deprioritised for this use case</span>
          </div>
          <b>Deprioritised</b>
        </div>
        <div className="review-option">
          <div>
            <strong>MapLibre GL</strong>
            <span>Useful if detailed base maps are required later</span>
          </div>
          <b>Future</b>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "04 · Validation",
    title: "What does the POC demonstrate?",
    content: (
      <div className="review-validation-grid">
        {[
          ["🌍", "Country-level visualisation"],
          ["📍", "Location markers"],
          ["🔢", "Marker sizing & numbering"],
          ["💬", "Tooltips"],
          ["🔄", "Marker collision handling"],
          ["🔍", "Zoom & pan"],
          ["🗺️", "Multiple projections"],
          ["🌐", "Interactive globe"],
          ["📦", "Bundled geographic data"],
          ["🚫", "No external map/tile dependency"],
        ].map(([icon, label]) => (
          <div className="review-validation-item" key={label}>
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "05 · Direction",
    title: "Recommendation & next steps",
    content: (
      <>
        <div className="review-recommendation">
          <span className="review-check">✓</span>
          <div>
            <strong>React + D3-geo</strong>
            <p>Suitable for the current Global Map Data requirement.</p>
          </div>
        </div>
        <div className="review-next">
          <div>
            <b>1</b>
            <span>Finalise visual and interaction design</span>
          </div>
          <div>
            <b>2</b>
            <span>Integrate real geographic data</span>
          </div>
          <div>
            <b>3</b>
            <span>Validate performance with production-scale data</span>
          </div>
          <div>
            <b>4</b>
            <span>Complete production hardening</span>
          </div>
        </div>
      </>
    ),
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GlobalMapReviewPanel({ open, onClose }: Props) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const current = sections[step];

  return (
    <div
      className="review-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Global Map Data POC review"
    >
      <div className="review-panel">
        <header className="review-header">
          <div>
            <div className="review-brand">GLOBAL MAP DATA</div>
            <h2>POC Review</h2>
          </div>
          <button
            className="review-close"
            onClick={onClose}
            aria-label="Close review"
          >
            ×
          </button>
        </header>

        <div className="review-progress">
          {sections.map((section, index) => (
            <button
              key={section.eyebrow}
              className={index === step ? "active" : index < step ? "done" : ""}
              onClick={() => setStep(index)}
              aria-label={`Open ${section.title}`}
            >
              <span>{index + 1}</span>
            </button>
          ))}
        </div>

        <main className="review-body">
          <div className="review-eyebrow">{current.eyebrow}</div>
          <h3>{current.title}</h3>
          <div className="review-content">{current.content}</div>
        </main>

        <footer className="review-footer">
          <span>
            {step + 1} of {sections.length}
          </span>
          <div>
            <button
              className="review-secondary"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              Back
            </button>
            {step < sections.length - 1 ? (
              <button
                className="review-primary"
                onClick={() => setStep((value) => value + 1)}
              >
                Next
              </button>
            ) : (
              <button className="review-primary" onClick={onClose}>
                Back to map
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
