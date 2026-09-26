const DEPARTAMENTOS_COLOMBIA = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
  'Vaupés', 'Vichada',
]

export default function ShippingForm({ datos, onChange, errores = {} }) {
  const handleChange = (e) => {
    onChange({ ...datos, [e.target.name]: e.target.value })
  }

  const campo = (id, label, tipo = 'text', placeholder = '', autoComplete = '') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={tipo}
        name={id}
        value={datos[id] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
          errores[id] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errores[id] && (
        <p className="text-red-500 text-xs mt-1">{errores[id]}</p>
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3">
        📦 Información de envío
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre */}
        {campo('nombre', 'Nombre completo', 'text', 'Juan Pérez', 'name')}

        {/* Teléfono */}
        {campo('telefono', 'Teléfono / Celular', 'tel', '300 123 4567', 'tel')}

        {/* Dirección */}
        <div className="sm:col-span-2">
          {campo('direccion', 'Dirección', 'text', 'Calle 45 # 12-34', 'street-address')}
        </div>

        {/* Ciudad */}
        {campo('ciudad', 'Ciudad', 'text', 'Bogotá', 'address-level2')}

        {/* Departamento */}
        <div>
          <label htmlFor="departamento" className="block text-sm font-medium text-gray-600 mb-1">
            Departamento
          </label>
          <select
            id="departamento"
            name="departamento"
            value={datos.departamento || ''}
            onChange={handleChange}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white ${
              errores.departamento ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">Selecciona un departamento</option>
            {DEPARTAMENTOS_COLOMBIA.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          {errores.departamento && (
            <p className="text-red-500 text-xs mt-1">{errores.departamento}</p>
          )}
        </div>

        {/* Código postal */}
        {campo('codigoPostal', 'Código postal (opcional)', 'text', '110111', 'postal-code')}

        {/* Notas adicionales */}
        <div className="sm:col-span-2">
          <label htmlFor="notas" className="block text-sm font-medium text-gray-600 mb-1">
            Notas para el envío (opcional)
          </label>
          <textarea
            id="notas"
            name="notas"
            value={datos.notas || ''}
            onChange={handleChange}
            placeholder="Ej: Dejar con el portero, llamar al llegar..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
          />
        </div>
      </div>
    </div>
  )
}
