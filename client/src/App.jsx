import { useState } from "react";
import axios from "axios";

function App() {
  const [places, setPlaces] = useState([]);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const res = await axios.get(
        `http://localhost:5000/api/places?lat=${latitude}&lng=${longitude}`
      );

      setPlaces(res.data);
    });
  };

  return (
    <div>
      <h1>CulturaAI</h1>
      <button onClick={getLocation}>Get Nearby Places</button>

      <ul>
        {places.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;