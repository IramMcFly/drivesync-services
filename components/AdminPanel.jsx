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


export default function AdminPanel() {
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

  // --- NUEVO PANEL ADMIN ---
  const [createData, setCreateData] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  // Detectar campos dinámicamente del primer item o usar un esquema base
  const getFields = () => {
    if (items.length > 0) {
          return Object.keys(items[0]).filter(k => k !== "_id" && k !== "__v" && k !== "createdAt" && k !== "updatedAt");
    }
    // fallback para servicios
    if (collection.value === "servicios") return ["nombre", "descripcion", "precioMin", "precioMax", "imagen", "subtipos"];
    if (collection.value === "users") return ["email", "password", "nombre", "telefono", "role", "foto"];
    if (collection.value === "talleres") return ["nombre", "direccion", "telefono", "activo"];
    if (collection.value === "service-requests") return ["usuario", "servicio", "estado", "fecha"];
    return [];
  };

  // Manejo de inputs para crear
  const handleCreateChange = (key, value) => {
    setCreateData(prev => ({ ...prev, [key]: value }));
  };

  // Manejo de archivos para imagen/foto con validación de tipo
  const handleFileChange = (key, file) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPEG o WEBP");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      // Convertir a array para enviar como JSON
      const uint8Array = Array.from(new Uint8Array(arrayBuffer));
      setCreateData(prev => ({ ...prev, [key]: { data: uint8Array, type: file.type, name: file.name } }));
    };
    reader.readAsArrayBuffer(file);
  };

  // Crear registro
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(collection.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setItems(prev => [...prev, nuevo]);
        setSuccess("Registro creado");
        setCreateData({});
      } else {
        setError("No se pudo crear");
      }
    } catch {
      setError("Error de red");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900 text-white rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Panel administrativo</h2>
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
      {/* Formulario de creación */}
      <form onSubmit={handleCreate} className="mb-6 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Crear nuevo registro</h3>
        <div className="grid grid-cols-1 gap-3">
          {getFields().map(key => (
            key === "imagen" || key === "foto" ? (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{key}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-zinc-700 text-white px-3 py-2 rounded"
                  onChange={e => handleFileChange(key, e.target.files[0])}
                  disabled={createLoading}
                />
              </div>
            ) : key === "subtipos" ? (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">Subtipos de servicio</label>
                <SubtiposInput
                  value={createData.subtipos || []}
                  onChange={subs => handleCreateChange("subtipos", subs)}
                  disabled={createLoading}
                />
              </div>
            ) : (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{key}</label>
                <input
                  className="w-full bg-zinc-700 text-white px-3 py-2 rounded"
                  value={createData[key] || ""}
                  onChange={e => handleCreateChange(key, e.target.value)}
                  disabled={createLoading}
                />
              </div>
            )
          ))}
        </div>
        <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white" disabled={createLoading}>Crear</button>
        {createLoading && <span className="ml-2 text-orange-400">Guardando...</span>}
      </form>
      {loading && <div className="text-orange-400">Cargando...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <ul className="divide-y divide-zinc-700 mt-4">
        {items.map(item => (
          <li key={item._id} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-2">
            <div className="flex-1 text-xs md:text-sm flex flex-wrap items-center gap-2 max-w-full overflow-x-auto">
              {Object.entries(item).map(([key, value]) => {
                if (key === "imagen" || key === "foto") {
                  // Mostrar miniatura si es buffer
                  if (value && value.data && Array.isArray(value.data)) {
                    const base64 = typeof window !== 'undefined' && window.Buffer
                      ? window.Buffer.from(value.data).toString('base64')
                      : btoa(String.fromCharCode.apply(null, value.data));
                    const mimeType = value.type || 'image/jpeg';
                    return (
                      <span key={key} className="inline-block mr-2 align-middle">
                        <span className="font-bold text-zinc-400">{key}:</span>
                        <img
                          src={`data:${mimeType};base64,${base64}`}
                          alt={key}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, display: 'inline-block', marginLeft: 4, verticalAlign: 'middle' }}
                        />
                      </span>
                    );
                  }
                  return null;
                }
                if (key === "servicios" && Array.isArray(value)) {
                  return (
                    <span key={key} className="block mb-1">
                      <span className="font-bold text-zinc-400">Servicios:</span>
                      {value.length === 0 && <span className="ml-2">Ninguno</span>}
                      {value.map((s, idx) => (
                        <span key={idx} className="ml-2 inline-block bg-zinc-800 px-2 py-1 rounded">
                          {typeof s.servicio === 'object' && s.servicio.nombre ? s.servicio.nombre : s.servicio} (${s.precio})
                        </span>
                      ))}
                    </span>
                  );
                }
                if (key === "subtipos" && Array.isArray(value)) {
                  return (
                    <span key={key} className="block mb-1">
                      <span className="font-bold text-zinc-400">Subtipos:</span>
                      {value.length === 0 && <span className="ml-2">Ninguno</span>}
                      {value.map((sub, idx) => (
                        <span key={idx} className="ml-2 inline-block bg-zinc-800 px-2 py-1 rounded">
                          {sub.nombre} {typeof sub.precio !== 'undefined' && <span className="text-xs text-zinc-400">(${sub.precio})</span>}
                        </span>
                      ))}
                    </span>
                  );
                }
                // Limitar longitud de strings largos
                let displayValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
                if (displayValue.length > 40) {
                  displayValue = displayValue.slice(0, 37) + '...';
                }
                return (
                  <span key={key} className="inline-block mr-2 align-middle max-w-xs truncate">
                    <span className="font-bold text-zinc-400">{key}:</span> {displayValue}
                  </span>
                );
              })}
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
                  key === "subtipos" ? (
                    <div key={key} className="mb-2">
                      <label className="block text-sm font-medium mb-1">Subtipos de servicio</label>
                      <SubtiposInput
                        value={Array.isArray(value) ? value : []}
                        onChange={subs => handleEditChange("subtipos", subs)}
                        disabled={editLoading}
                      />
                    </div>
                  ) : (
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

// Componente para editar subtipos de servicio
function SubtiposInput({ value, onChange, disabled }) {
  const [subtipos, setSubtipos] = React.useState(value || []);

  React.useEffect(() => {
    setSubtipos(value || []);
  }, [value]);

  const handleSubtipoChange = (idx, key, val) => {
    const nuevos = subtipos.map((s, i) => i === idx ? { ...s, [key]: key === 'precio' ? Number(val) : val } : s);
    setSubtipos(nuevos);
    onChange(nuevos);
  };
  const handleAdd = () => {
    const nuevos = [...subtipos, { nombre: "", precio: 0 }];
    setSubtipos(nuevos);
    onChange(nuevos);
  };
  const handleRemove = (idx) => {
    const nuevos = subtipos.filter((_, i) => i !== idx);
    setSubtipos(nuevos);
    onChange(nuevos);
  };
  return (
    <div className="space-y-2">
      {subtipos.map((sub, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            className="bg-zinc-700 text-white px-2 py-1 rounded"
            placeholder="Nombre"
            value={sub.nombre}
            onChange={e => handleSubtipoChange(idx, "nombre", e.target.value)}
            disabled={disabled}
          />
          <input
            className="bg-zinc-700 text-white px-2 py-1 rounded"
            placeholder="Precio"
            type="number"
            min="0"
            value={typeof sub.precio === 'number' ? sub.precio : ''}
            onChange={e => handleSubtipoChange(idx, "precio", e.target.value)}
            disabled={disabled}
          />
          <button type="button" className="text-red-400 px-2" onClick={() => handleRemove(idx)} disabled={disabled}>Eliminar</button>
        </div>
      ))}
      <button type="button" className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded" onClick={handleAdd} disabled={disabled}>Agregar subtipo</button>
    </div>
  );
}
