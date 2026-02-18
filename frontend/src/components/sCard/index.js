// src/components/ServiceCard.jsx
export default function ServiceCard({ title, description, icon }) {
  return (
    <div className="p-6 border border-border rounded-md bg-card shadow-card hover:shadow-hover transition h-full flex flex-col hover:scale-105 hover:-translate-y-2 duration-300 ease-out cursor-pointer">
      <div className="text-4xl mb-4 text-primary transition-transform duration-300 group-hover:scale-110">{icon}</div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm flex-grow">{description}</p>
    </div>
  );
}
