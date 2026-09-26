import { useState } from 'react'

const CATEGORIAS = ['Fútbol', 'Deportivas', 'Casual', 'Running']
const MARCAS = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour']
const TALLAS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

export default function ProductFilter({ filtros, onFiltrar }) {
  const [local, setLocal] = useState(filtros)
  const [abierto, setAbierto] = useState(false)

  const handleChange = (campo, valor) => {
    setLocal((prev) => ({ ...prev, [campo]: valor }))
  }

  const aplicar = () => {
    onFiltrar(local)
    setAbierto(false)
  }

  const limpiar = () => {
    const vacio = { categoria: '', marca: '', precioMin: '', precioMax: '', talla: '' }
    setLocal(vacio)
    onFiltrar(vacio)
  }

  return (
    <div className="w-full">
      {/* Botón toggle en mobile */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="md:hidden w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg mb-4 flex justify-between items-center"
      >
        <span>🔍 Filtros</span>
        <span>{abierto ? '▲' : '▼'}</span>
      </button>

      {/* Panel de filtros */}
      <div className={`${abierto ? 'block' : 'hidden'} md:block bg-white rounded-xl shadow p-5 space-y-5`}>
        <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Filtros</h3>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
          <select
            value={local.categoria || ''}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Marca</label>
          <select
            value={local.marca || ''}
            onChange={(e) => handleChange('marca', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todas</option>
            {MARCAS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Talla */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Talla</label>
          <div className="flex flex-wrap gap-2">
            {TALLAS.map((t) => (
              <button
                key={t}
                onClick={() => handleChange('talla', local.talla === t ? '' : t)}
                className={`text-sm px-3 py-1 rounded-lg border transition-colors ${
                  local.talla === t
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-200 text-gray-600 hover:border-green-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Precio (COP)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={local.precioMin || ''}
              onChange={(e) => handleChange('precioMin', e.target.value)}
              className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Máx"
              value={local.precioMax || ''}
              onChange={(e) => handleChange('precioMax', e.target.value)}
              className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={aplicar}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition-colors"
          >
            Aplicar
          </button>
          <button
            onClick={limpiar}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  )
}
