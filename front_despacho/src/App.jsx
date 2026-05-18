import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  getVentas, createVenta, updateVenta, deleteVenta,
  getDespachos, createDespacho, updateDespacho, deleteDespacho
} from './api';

/* ══════════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════════ */
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VENTA FORM
   Campos: direccionCompra (req), valorCompra (int), fechaCompra (date req), despachoGenerado (bool)
══════════════════════════════════════════════════════════════ */
function VentaForm({ inicial, onSubmit, loading, error }) {
  const empty = { direccionCompra: '', valorCompra: '', fechaCompra: '', despachoGenerado: false };
  const [form, setForm] = useState(inicial ?? empty);

  useEffect(() => { setForm(inicial ?? empty); }, [inicial]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      direccionCompra:  form.direccionCompra,
      valorCompra:      parseInt(form.valorCompra, 10) || 0,
      fechaCompra:      form.fechaCompra,
      despachoGenerado: form.despachoGenerado === true || form.despachoGenerado === 'true'
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="field-group">
        <label>DIRECCIÓN DE ENTREGA</label>
        <input
          type="text"
          required
          placeholder="Ej: Av. Providencia 1234, Santiago"
          value={form.direccionCompra}
          onChange={e => f('direccionCompra', e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="field-group">
          <label>VALOR COMPRA ($)</label>
          <input
            type="number"
            required
            min="0"
            placeholder="Ej: 150000"
            value={form.valorCompra}
            onChange={e => f('valorCompra', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>FECHA DE COMPRA</label>
          <input
            type="date"
            required
            value={form.fechaCompra}
            onChange={e => f('fechaCompra', e.target.value)}
          />
        </div>
      </div>
      <div className="field-group">
        <label>ESTADO DESPACHO</label>
        <select
          value={form.despachoGenerado}
          onChange={e => f('despachoGenerado', e.target.value)}
        >
          <option value={false}>Sin despacho generado</option>
          <option value={true}>Despacho generado</option>
        </select>
      </div>
      {error && <div className="alert-error">⚠ {error}</div>}
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'GUARDANDO...' : inicial ? '✓ ACTUALIZAR VENTA' : '+ CREAR VENTA'}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════
   DESPACHO FORM
   Campos: fechaDespacho, patenteCamion, intento, idCompra, direccionCompra, valorCompra, despachado
══════════════════════════════════════════════════════════════ */
function DespachoForm({ inicial, onSubmit, loading, error }) {
  const empty = {
    fechaDespacho: '', patenteCamion: '', intento: 0,
    idCompra: '', direccionCompra: '', valorCompra: '', despachado: false
  };
  const [form, setForm] = useState(inicial ?? empty);

  useEffect(() => { setForm(inicial ?? empty); }, [inicial]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      fechaDespacho:   form.fechaDespacho || null,
      patenteCamion:   form.patenteCamion,
      intento:         parseInt(form.intento, 10) || 0,
      idCompra:        form.idCompra ? parseInt(form.idCompra, 10) : null,
      direccionCompra: form.direccionCompra,
      valorCompra:     form.valorCompra ? parseInt(form.valorCompra, 10) : null,
      despachado:      form.despachado === true || form.despachado === 'true'
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-row">
        <div className="field-group">
          <label>PATENTE CAMIÓN</label>
          <input
            type="text"
            placeholder="Ej: ABCD12"
            value={form.patenteCamion}
            onChange={e => f('patenteCamion', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>FECHA DESPACHO</label>
          <input
            type="date"
            value={form.fechaDespacho ?? ''}
            onChange={e => f('fechaDespacho', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="field-group">
          <label>ID ORDEN DE COMPRA</label>
          <input
            type="number"
            min="1"
            placeholder="Ej: 1"
            value={form.idCompra}
            onChange={e => f('idCompra', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>INTENTOS DE ENTREGA</label>
          <input
            type="number"
            min="0"
            value={form.intento}
            onChange={e => f('intento', e.target.value)}
          />
        </div>
      </div>
      <div className="field-group">
        <label>DIRECCIÓN DE ENTREGA</label>
        <input
          type="text"
          placeholder="Ej: Av. Libertad 567, Viña del Mar"
          value={form.direccionCompra}
          onChange={e => f('direccionCompra', e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="field-group">
          <label>VALOR COMPRA ($)</label>
          <input
            type="number"
            min="0"
            placeholder="Ej: 89000"
            value={form.valorCompra}
            onChange={e => f('valorCompra', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>ESTADO</label>
          <select value={form.despachado} onChange={e => f('despachado', e.target.value)}>
            <option value={false}>Pendiente</option>
            <option value={true}>Entregado</option>
          </select>
        </div>
      </div>
      {error && <div className="alert-error">⚠ {error}</div>}
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'GUARDANDO...' : inicial ? '✓ ACTUALIZAR DESPACHO' : '+ CREAR DESPACHO'}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECCIÓN VENTAS
══════════════════════════════════════════════════════════════ */
function VentasSection() {
  const [ventas, setVentas]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState(null); // 'crear' | 'editar'
  const [seleccionada, setSeleccionada] = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState('');

  const cargar = useCallback(async () => {
    setLoading(true); setError('');
    try { setVentas(await getVentas()); }
    catch { setError('No se pudo conectar con el backend de ventas.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => { setSeleccionada(null); setFormError(''); setModal('crear'); };
  const abrirEditar = (v) => { setSeleccionada(v); setFormError(''); setModal('editar'); };
  const cerrar = () => { setModal(null); setSeleccionada(null); };

  const handleCrear = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      await createVenta(data);
      cerrar();
      await cargar();
      Swal.fire({ icon: 'success', title: 'Venta creada', text: 'Se registró correctamente.', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#00d4aa' });
    } catch (e) {
      setFormError(e.response?.data?.message || e.message || 'Error al crear.');
    } finally { setFormLoading(false); }
  };

  const handleEditar = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      await updateVenta(seleccionada.idVenta, data);
      cerrar();
      await cargar();
      Swal.fire({ icon: 'success', title: 'Venta actualizada', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#00d4aa' });
    } catch (e) {
      setFormError(e.response?.data?.message || e.message || 'Error al actualizar.');
    } finally { setFormLoading(false); }
  };

  const handleEliminar = async (v) => {
    const result = await Swal.fire({
      title: '¿Eliminar venta?',
      text: `ID #${v.idVenta} — ${v.direccionCompra}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0d1b2d', color: '#c8d8e8',
      confirmButtonColor: '#ff4757', cancelButtonColor: '#1e3550'
    });
    if (!result.isConfirmed) return;
    try {
      await deleteVenta(v.idVenta);
      await cargar();
      Swal.fire({ icon: 'success', title: 'Eliminada', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#00d4aa' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#ff4757' });
    }
  };

  const despachadasCount = ventas.filter(v => v.despachoGenerado).length;

  return (
    <section className="content-section" key="ventas">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Gestión de Ventas</h2>
          <p className="section-desc">GET · POST · PUT · DELETE  /api/ventas/v1/ventas · backend-ventas:8080</p>
        </div>
        <div className="header-actions">
          <span className="badge badge-ventas">🛒 VENTAS</span>
          <button className="btn-refresh" onClick={cargar} disabled={loading}>
            {loading ? '...' : '↻ Actualizar'}
          </button>
          <button className="btn-primary" onClick={abrirCrear}>+ Nueva Venta</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{ventas.length}</span>
          <span className="stat-label">TOTAL VENTAS</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--teal)' }}>{despachadasCount}</span>
          <span className="stat-label">CON DESPACHO</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--gold)' }}>{ventas.length - despachadasCount}</span>
          <span className="stat-label">SIN DESPACHO</span>
        </div>
      </div>

      {/* Error */}
      {error && <div className="alert-error">{error}</div>}

      {/* Table */}
      {loading && <div className="loading-state">Consultando backend de ventas...</div>}
      {!loading && !error && ventas.length === 0 && (
        <div className="empty-state">Sin ventas registradas. Crea la primera con el botón <strong>+ Nueva Venta</strong>.</div>
      )}
      {!loading && ventas.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DIRECCIÓN</th>
                <th>VALOR ($)</th>
                <th>FECHA COMPRA</th>
                <th>DESPACHO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.idVenta}>
                  <td className="mono">#{v.idVenta}</td>
                  <td>{v.direccionCompra}</td>
                  <td className="mono">${v.valorCompra?.toLocaleString('es-CL')}</td>
                  <td className="mono">{v.fechaCompra}</td>
                  <td>
                    <span className={`status-tag ${v.despachoGenerado ? 'status-ok' : 'status-pending'}`}>
                      {v.despachoGenerado ? 'GENERADO' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-gold" onClick={() => abrirEditar(v)}>✎ Editar</button>
                      <button className="btn-danger" onClick={() => handleEliminar(v)}>✕ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === 'crear'} title="NUEVA VENTA" onClose={cerrar}>
        <VentaForm onSubmit={handleCrear} loading={formLoading} error={formError} />
      </Modal>
      <Modal open={modal === 'editar'} title="EDITAR VENTA" onClose={cerrar}>
        {seleccionada && (
          <VentaForm
            inicial={{
              direccionCompra:  seleccionada.direccionCompra,
              valorCompra:      seleccionada.valorCompra,
              fechaCompra:      seleccionada.fechaCompra,
              despachoGenerado: seleccionada.despachoGenerado
            }}
            onSubmit={handleEditar}
            loading={formLoading}
            error={formError}
          />
        )}
      </Modal>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECCIÓN DESPACHOS
══════════════════════════════════════════════════════════════ */
function DespachosSection() {
  const [despachos, setDespachos]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState('');

  const cargar = useCallback(async () => {
    setLoading(true); setError('');
    try { setDespachos(await getDespachos()); }
    catch { setError('No se pudo conectar con el backend de despachos.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => { setSeleccionado(null); setFormError(''); setModal('crear'); };
  const abrirEditar = (d) => { setSeleccionado(d); setFormError(''); setModal('editar'); };
  const cerrar = () => { setModal(null); setSeleccionado(null); };

  const handleCrear = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      await createDespacho(data);
      cerrar();
      await cargar();
      Swal.fire({ icon: 'success', title: '¡Despacho creado! 🚚', text: 'El despacho fue registrado exitosamente.', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#00d4aa' });
    } catch (e) {
      setFormError(e.response?.data?.message || e.message || 'Error al crear.');
    } finally { setFormLoading(false); }
  };

  const handleEditar = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      await updateDespacho(seleccionado.idDespacho, data);
      cerrar();
      await cargar();
      Swal.fire({ icon: 'success', title: 'Despacho actualizado', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#00d4aa' });
    } catch (e) {
      setFormError(e.response?.data?.message || e.message || 'Error al actualizar.');
    } finally { setFormLoading(false); }
  };

  const handleEliminar = async (d) => {
    const result = await Swal.fire({
      title: '¿Eliminar despacho?',
      text: `ID #${d.idDespacho}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0d1b2d', color: '#c8d8e8',
      confirmButtonColor: '#ff4757', cancelButtonColor: '#1e3550'
    });
    if (!result.isConfirmed) return;
    try {
      await deleteDespacho(d.idDespacho);
      await cargar();
      Swal.fire({ icon: 'success', title: 'Eliminado', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#00d4aa' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.', background: '#0d1b2d', color: '#c8d8e8', confirmButtonColor: '#ff4757' });
    }
  };

  const entregados = despachos.filter(d => d.despachado).length;

  return (
    <section className="content-section" key="despachos">
      <div className="section-header">
        <div>
          <h2>Gestión de Despachos</h2>
          <p className="section-desc">GET · POST · PUT · DELETE  /api/despachos/v1/despachos · backend-despachos:8081</p>
        </div>
        <div className="header-actions">
          <span className="badge badge-despachos">🚚 DESPACHOS</span>
          <button className="btn-refresh" onClick={cargar} disabled={loading}>
            {loading ? '...' : '↻ Actualizar'}
          </button>
          <button className="btn-primary" onClick={abrirCrear}>+ Nuevo Despacho</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{despachos.length}</span>
          <span className="stat-label">TOTAL</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--teal)' }}>{entregados}</span>
          <span className="stat-label">ENTREGADOS</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--gold)' }}>{despachos.length - entregados}</span>
          <span className="stat-label">PENDIENTES</span>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading && <div className="loading-state">Consultando backend de despachos...</div>}
      {!loading && !error && despachos.length === 0 && (
        <div className="empty-state">Sin despachos registrados. Crea el primero con <strong>+ Nuevo Despacho</strong>.</div>
      )}
      {!loading && despachos.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>FECHA DESPACHO</th>
                <th>PATENTE</th>
                <th>ID COMPRA</th>
                <th>DIRECCIÓN</th>
                <th>VALOR ($)</th>
                <th>INTENTOS</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {despachos.map(d => (
                <tr key={d.idDespacho}>
                  <td className="mono">#{d.idDespacho}</td>
                  <td className="mono">{d.fechaDespacho ?? '—'}</td>
                  <td className="mono">{d.patenteCamion ?? '—'}</td>
                  <td className="mono">{d.idCompra ?? '—'}</td>
                  <td>{d.direccionCompra ?? '—'}</td>
                  <td className="mono">{d.valorCompra != null ? `$${d.valorCompra.toLocaleString('es-CL')}` : '—'}</td>
                  <td className="mono" style={{ textAlign: 'center' }}>{d.intento}</td>
                  <td>
                    <span className={`status-tag ${d.despachado ? 'status-ok' : 'status-pending'}`}>
                      {d.despachado ? 'ENTREGADO' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-gold" onClick={() => abrirEditar(d)}>✎ Editar</button>
                      <button className="btn-danger" onClick={() => handleEliminar(d)}>✕ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal === 'crear'} title="NUEVO DESPACHO" onClose={cerrar}>
        <DespachoForm onSubmit={handleCrear} loading={formLoading} error={formError} />
      </Modal>
      <Modal open={modal === 'editar'} title="EDITAR DESPACHO" onClose={cerrar}>
        {seleccionado && (
          <DespachoForm
            inicial={{
              fechaDespacho:   seleccionado.fechaDespacho ?? '',
              patenteCamion:   seleccionado.patenteCamion ?? '',
              intento:         seleccionado.intento,
              idCompra:        seleccionado.idCompra ?? '',
              direccionCompra: seleccionado.direccionCompra ?? '',
              valorCompra:     seleccionado.valorCompra ?? '',
              despachado:      seleccionado.despachado
            }}
            onSubmit={handleEditar}
            loading={formLoading}
            error={formError}
          />
        )}
      </Modal>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   APP PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState('ventas');

  const navItems = [
    {
      section: 'VENTAS',
      items: [
        { id: 'ventas', icon: '🛒', label: 'Gestión Ventas', sub: 'GET · POST · PUT · DELETE' }
      ]
    },
    {
      section: 'DESPACHOS',
      items: [
        { id: 'despachos', icon: '🚚', label: 'Gestión Despachos', sub: 'GET · POST · PUT · DELETE' }
      ]
    }
  ];

  return (
    <div className="dash-root">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-symbol">◆</span>
          <div>
            <div className="logo-title">INNOVATECH</div>
            <div className="logo-sub">Chile · Panel de Gestión</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(group => (
            <div key={group.section}>
              <div className="nav-section-label">{group.section}</div>
              {group.items.map(n => (
                <button
                  key={n.id}
                  className={`nav-item ${tab === n.id ? 'active' : ''}`}
                  onClick={() => setTab(n.id)}
                >
                  <span className="nav-icon">{n.icon}</span>
                  <span>
                    <div className="nav-label">{n.label}</div>
                    <div className="nav-sub">{n.sub}</div>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="env-tag">🐳 DOCKER · COMPOSE</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dash-main">
        {tab === 'ventas'     && <VentasSection />}
        {tab === 'despachos'  && <DespachosSection />}
      </main>

    </div>
  );
}
