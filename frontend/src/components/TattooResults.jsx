const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function TattooResults({ tattoos }) {
  return (
    <div className="results">
      {tattoos.map((tattoo, idx) => (
        <div key={idx} className="tattoo-card">
          <h3>{tattoo.name}</h3>
          <p>{tattoo.description}</p>
          <img
            src={`${API_URL}${tattoo.image}`}
            alt={tattoo.name}
            width="200"
          />
        </div>
      ))}
    </div>
  );
}

export default TattooResults;
