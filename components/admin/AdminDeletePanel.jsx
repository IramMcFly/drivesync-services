"use client";

import React, { useEffect, useState } from "react";

// Agrega aquí todas las colecciones que tengan endpoint REST en /api/
const collections = [
  { label: "Usuarios", value: "users", api: "/api/users" },
  { label: "Talleres", value: "talleres", api: "/api/talleres" },
  { label: "Servicios", value: "servicios", api: "/api/servicios" },
  { label: "Solicitudes de Servicio", value: "service-requests", api: "/api/service-requests" },
  // Si agregas más endpoints, solo añade aquí:
  // { label: "Nombre", value: "nombre", api: "/api/nombre" },
];


export default function AdminDeletePanel() {
  const [collection, setCollection] = useState(collections[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!collection) return;
    setLoading(true);
    setError("");
    setSuccess("");
    fetch(collection.api)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => setError("Error al cargar registros"))
      .finally(() => setLoading(false));
  }, [collection]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const url = `${collection.api}?id=${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        setSuccess("Registro eliminado");
      } else {
        setError("No se pudo eliminar");
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditData(item);
  };

  const handleEditChange = (key, value) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(collection.api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setItems((prev) => prev.map((item) => item._id === editData._id ? editData : item));
        setSuccess("Registro actualizado");
        setEditItem(null);
      } else {
        setError("No se pudo actualizar");
      }
    } catch {
      setError("Error de red");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditItem(null);
    setEditData({});
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900 text-white rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Eliminar registros de la base de datos</h2>
      <div className="mb-4">
        <label className="mr-2">Colección:</label>
        <select
          value={collection.value}
          onChange={e => setCollection(collections.find(c => c.value === e.target.value))}
          className="bg-zinc-800 text-white px-3 py-2 rounded"
        >
          {collections.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      {loading && <div className="text-orange-400">Cargando...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <ul className="divide-y divide-zinc-700 mt-4">
        {items.map(item => (
          <li key={item._id} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-2">
            <div className="flex-1 text-xs md:text-sm">
              {Object.entries(item).map(([key, value]) => (
                <span key={key} className="inline-block mr-2">
                  <span className="font-bold text-zinc-400">{key}:</span> {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => handleEdit(item)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                disabled={loading}
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                disabled={loading}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && !loading && (
          <li className="text-zinc-400 py-4 text-center">No hay registros</li>
        )}
      </ul>

      {/* Modal de edición */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Editar registro</h3>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
              {Object.entries(editData).map(([key, value]) => (
                key === "_id" || key === "__v" ? null : (
                  <div key={key} className="mb-2">
                    <label className="block text-sm font-medium mb-1">{key}</label>
                    <input
                      className="w-full bg-zinc-800 text-white px-3 py-2 rounded"
                      value={typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                      onChange={e => handleEditChange(key, e.target.value)}
                      disabled={editLoading}
                    />
                  </div>
                )
              ))}
              <div className="flex gap-2 mt-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white" disabled={editLoading}>Guardar</button>
                <button type="button" className="bg-zinc-700 hover:bg-zinc-800 px-4 py-2 rounded text-white" onClick={handleEditCancel} disabled={editLoading}>Cancelar</button>
              </div>
              {editLoading && <div className="text-orange-400 mt-2">Guardando...</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
