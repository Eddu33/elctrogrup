'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  X,
  Check,
  MessageCircle,
} from 'lucide-react';

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    cuitDni: '',
    phone: '',
    email: '',
    address: '',
    city: 'Córdoba',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clientes');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      company: '',
      cuitDni: '',
      phone: '',
      email: '',
      address: '',
      city: 'Córdoba',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      company: client.company || '',
      cuitDni: client.cuitDni || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      city: client.city || '',
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingClient) {
        const res = await fetch(`/api/clientes/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchClients();
          setShowModal(false);
        }
      } else {
        const res = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchClients();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('Error saving client:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(clients.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.cuitDni && c.cuitDni.includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef08a] flex items-center justify-center text-amber-800">
            <Users className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
              Clientes
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Agenda de contactos, obras y presupuestos asociados.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente por nombre, empresa, teléfono o CUIT..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 placeholder-neutral-400"
          />
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">Cargando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
            No se encontraron clientes.
            <div className="mt-3">
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center px-4 py-2 text-xs font-bold bg-[#eab308] text-black rounded-lg"
              >
                Agregar primer cliente
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 leading-tight">
                        {c.name}
                      </h3>
                      {c.company && (
                        <p className="text-xs font-medium text-amber-600 mt-0.5">
                          {c.company}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                      {c._count?.presupuestos || 0} presupuestos
                    </span>
                  </div>

                  {c.cuitDni && (
                    <p className="text-xs text-neutral-500 mt-1">
                      CUIT/DNI: <span className="font-mono">{c.cuitDni}</span>
                    </p>
                  )}

                  <div className="space-y-1.5 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                    {c.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{c.phone}</span>
                        </div>
                        <a
                          href={`https://wa.me/549${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}

                    {c.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}

                    {c.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate">
                          {c.address} {c.city ? `(${c.city})` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                  <Link
                    href={`/presupuestos/nuevo?clientId=${c.id}`}
                    className="px-3 py-1.5 bg-[#fef9c3] hover:bg-[#fef08a] text-neutral-900 font-bold rounded-md flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Presupuestar</span>
                  </Link>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded transition-colors"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add/Edit Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-neutral-800 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-neutral-900">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nombre completo o Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Leonardo Fenoglio"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Empresa / Fantasía
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Ej: Residencial Fenoglio"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    CUIT / DNI
                  </label>
                  <input
                    type="text"
                    value={formData.cuitDni}
                    onChange={(e) => setFormData({ ...formData, cuitDni: e.target.value })}
                    placeholder="Ej: 20-30405060-7"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej: 3512477860"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Dirección de obra / Domicilio
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Av. Rafael Núñez 4200"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Córdoba"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles sobre el cliente o requisitos..."
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 flex items-center space-x-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingClient ? 'Guardar Cambios' : 'Crear Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
