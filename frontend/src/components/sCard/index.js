// src/components/ServiceCard.jsx
export default function ServiceCard({ title, description, icon }) {
  return (
    <div className="p-6 border border-border rounded-xl bg-card shadow-card hover:shadow-hover transition">
      <div className="text-4xl mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm">{description}</p>
    </div>
  );
}
