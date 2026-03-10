// src/components/ServiceCard.jsx
export default function ServiceCard({ title, description, icon }) {
  return (
    <div className="h-full rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-orange-400 to-black p-[1px] shadow-sm hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-2 duration-300 ease-out cursor-pointer group">
      <div className="p-6 rounded-[2.5rem] bg-background h-full flex flex-col">
        <div className="text-4xl mb-4 text-primary transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-sm flex-grow">{description}</p>
      </div>
    </div>
  );
}
