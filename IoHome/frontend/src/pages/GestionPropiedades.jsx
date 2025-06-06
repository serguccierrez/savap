import { useEffect, useState, useRef } from "react";
import RegistrarPropiedad from "../components/RegistrarPropiedad";
import ModificarPropiedad from "../components/ModificarPropiedad";
import { obtenerPropiedades, eliminarPropiedad, actualizarPropiedad } from "../services/propiedadService";
import "../styles/gestionPropiedades.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const GestionPropiedades = () => {
  const modifierRef = useRef(null);
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadEdit, setPropiedadEdit] = useState(null);
  const [cerraduras, setCerraduras] = useState({});
  const navigate = useNavigate();

  const scrollToModifyForm = () => {
    setTimeout(() => {
      if (modifierRef.current) {
        modifierRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const cargarPropiedades = async () => {
    const propietario = JSON.parse(localStorage.getItem("propietario"));
    if (propietario?.id) {
      try {
        const propiedades = await obtenerPropiedades(propietario.id);
        setPropiedades(propiedades);

        // Obtener las cerraduras de cada propiedad
        const cerradurasMap = {};
        for (const propiedad of propiedades) {
          try {
            const response = await fetch(
              `http://localhost:8080/seam/device/propiedad/${propiedad.id}`
            );
            if (response.ok) {
              const cerradura = await response.json();
              cerradurasMap[propiedad.id] = cerradura.nombre;
            } else {
              cerradurasMap[propiedad.id] = "Sin Cerradura Asignada";
            }
          } catch (err) {
            console.error("Error al obtener la cerradura:", err);
            cerradurasMap[propiedad.id] = "Sin Cerradura Asignada";
          }
        }
        setCerraduras(cerradurasMap);
      } catch (err) {
        console.error("Error al obtener propiedades", err);
      }
    }
  };

  useEffect(() => {
    cargarPropiedades();
  }, []);

  const handlePropertyCreated = async (newProperty) => {
    await cargarPropiedades(); // Recargar todas las propiedades
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarPropiedad(id);
      await cargarPropiedades(); // Recargar todas las propiedades
    } catch (err) {
      console.log("Error al eliminar la propiedad: " + err.message);
    }
  };

  const handleUpdate = async (propiedad) => {
    try {
      await actualizarPropiedad(propiedad.id, propiedad);
      await cargarPropiedades(); // Recargar todas las propiedades
      setPropiedadEdit(null);
    } catch (err) {
      console.log("Error al actualizar la propiedad: " + err.message);
    }
  };

  const handleLogout = () => {
    // Limpia el localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("propietario");
    localStorage.clear(); // Limpia todo el localStorage si es necesario

    // Redirige al usuario a la página principal
    navigate("/");
  };

  return (
    <div className="gestion-container">
      <div className="navbar">
        <img src={logo} alt="Logo" className="logo" onClick={() => navigate("/propietario")} />
        <h3 id="nombre" onClick={() => navigate("/propietario")}>IoHome</h3>
      </div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      <h2>Mis propiedades</h2>
      {propiedades.map((p, index) => (
        <div key={p.id} className="propiedad-card">
          <h3>{index + 1}. {p.direccion}</h3>
          <div className="detalles">
            <ul>
              <li>{p.habitaciones} habitaciones</li>
              <li>{p.banos} baños</li>
              {p.aireAcondicionado && <li>Aire acondicionado</li>}
              {p.cocinaEquipada && <li>Cocina equipada</li>}
              {p.secador && <li>Secador</li>}
              {p.plancha && <li>Plancha</li>}
              {p.cafetera && <li>Cafetera</li>}
              {p.toallasYSabanas && <li>Toallas y sábanas</li>}
              {p.piscina && <li>Piscina</li>}
              {p.garaje && <li>Garaje</li>}
              <li><strong>Cerradura:</strong> {cerraduras[p.id] || "Cargando..."}</li>
            </ul>
            <p><strong>Normas:</strong> {p.normas || "No especificadas"}</p>
            <button id="Modificar" onClick={() => handleEliminar(p.id)}>Eliminar</button>
            <button onClick={() => { setPropiedadEdit(p); scrollToModifyForm(); }}>Modificar</button>
          </div>
        </div>
      ))}

      {propiedadEdit && (
        <div ref={modifierRef} className="modificar-propiedad">
          <h2>Modificar Propiedad</h2>
          <ModificarPropiedad
            propiedad={propiedadEdit}
            onUpdate={handleUpdate}
            onCancel={() => setPropiedadEdit(null)}
          />
        </div>
      )}

      <RegistrarPropiedad onPropertyCreated={handlePropertyCreated} />
    </div>
  );
};

export default GestionPropiedades;
