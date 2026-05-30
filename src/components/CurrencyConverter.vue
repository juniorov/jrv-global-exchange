<script setup>
import { ref, computed } from 'vue'
import { useExchangeRate } from '../composables/useExchangeRate.js'
import { CURRENCIES, REGION_LABELS, REGION_COLORS } from '../data/currencies.js'

const { rates, lastUpdate, loading, error, isOnline, fetchRates, convert } = useExchangeRate()

const amount = ref(100)
const fromCurrency = ref('USD')
const targetCurrencies = ref(['EUR', 'BRL', 'CRC'])

// Currencies grouped by region, filtered by what the API actually has
const availableCurrencies = computed(() => {
  if (!rates.value) return CURRENCIES
  return CURRENCIES.filter(c => rates.value[c.code] !== undefined)
})

const groupedCurrencies = computed(() => {
  const groups = {}
  availableCurrencies.value.forEach(c => {
    if (!groups[c.region]) groups[c.region] = []
    groups[c.region].push(c)
  })
  return groups
})

const results = computed(() => {
  if (!rates.value || !amount.value) return []
  return targetCurrencies.value
    .filter(code => code !== fromCurrency.value)
    .map(code => {
      const currency = CURRENCIES.find(c => c.code === code)
      if (!currency) return null
      const converted = convert(amount.value, fromCurrency.value, code)
      return { ...currency, amount: converted }
    })
    .filter(r => r !== null && r.amount !== null)
})

const fromCurrencyInfo = computed(() =>
  CURRENCIES.find(c => c.code === fromCurrency.value)
)

const formattedLastUpdate = computed(() => {
  if (!lastUpdate.value) return null
  const diff = Date.now() - lastUpdate.value
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  if (hours < 24) return `hace ${hours}h`
  return new Date(lastUpdate.value).toLocaleDateString('es')
})

function formatAmount(value, code) {
  if (value === null || value === undefined) return '—'
  // Currencies with no decimals
  const noDecimals = ['JPY', 'KRW', 'PYG', 'CLP']
  const decimals = noDecimals.includes(code) ? 0 : 2
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatInputAmount(value) {
  if (!value) return ''
  const currency = fromCurrencyInfo.value
  const noDecimals = ['JPY', 'KRW', 'PYG', 'CLP']
  const decimals = noDecimals.includes(currency?.code) ? 0 : 2
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function toggleAll() {
  const all = availableCurrencies.value.map(c => c.code)
  if (targetCurrencies.value.length === all.length) {
    targetCurrencies.value = []
  } else {
    targetCurrencies.value = all
  }
}

function clearAll() {
  targetCurrencies.value = []
}

const allSelected = computed(() =>
  targetCurrencies.value.length === availableCurrencies.value.length
)

const regionColor = (region) => REGION_COLORS[region] || '#6c757d'
</script>

<template>
  <!-- Status Bar -->
  <div class="status-bar d-flex align-items-center gap-2 px-3 py-2">
    <span class="status-dot" :class="isOnline ? 'status-dot--online' : 'status-dot--offline'"></span>
    <span class="status-text">{{ isOnline ? 'En línea' : 'Sin conexión' }}</span>
    <span v-if="formattedLastUpdate" class="status-update ms-auto text-muted small">
      <i class="bi bi-clock me-1"></i>Actualizado {{ formattedLastUpdate }}
    </span>
    <span v-else-if="!rates" class="status-update ms-auto text-muted small">
      Sin datos guardados
    </span>
  </div>

  <div class="container py-4">
    <!-- Error -->
    <div v-if="error" class="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>{{ error }}</span>
    </div>

    <!-- Main Card -->
    <div class="card converter-card shadow-sm mb-4">
      <div class="card-body p-4">

        <!-- Amount -->
        <div class="mb-4">
          <label class="form-label fw-semibold text-muted small text-uppercase letter-spacing">
            Monto a convertir
          </label>
          <div class="input-group input-group-lg">
            <span class="input-group-text bg-white fw-bold text-primary">
              {{ fromCurrencyInfo?.flag || '💱' }}
            </span>
            <input
              v-model.number="amount"
              type="number"
              min="0"
              step="any"
              class="form-control amount-input"
              placeholder="100"
            />
            <span class="input-group-text bg-white text-muted fw-semibold">
              {{ fromCurrency }}
            </span>
          </div>
        </div>

        <!-- From Currency -->
        <div class="mb-4">
          <label class="form-label fw-semibold text-muted small text-uppercase letter-spacing">
            De
          </label>
          <select v-model="fromCurrency" class="form-select form-select-lg">
            <template v-for="(currencies, region) in groupedCurrencies" :key="region">
              <optgroup :label="REGION_LABELS[region]">
                <option v-for="c in currencies" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.code }} — {{ c.name }}
                </option>
              </optgroup>
            </template>
          </select>
        </div>

        <!-- Target Currencies -->
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label fw-semibold text-muted small text-uppercase letter-spacing mb-0">
              Convertir a
            </label>
            <div class="d-flex gap-2">
              <button @click="toggleAll" class="btn btn-sm btn-outline-primary">
                {{ allSelected ? 'Quitar todo' : 'Seleccionar todo' }}
              </button>
              <button @click="clearAll" class="btn btn-sm btn-outline-secondary">
                Limpiar
              </button>
            </div>
          </div>

          <div class="currency-checkboxes-wrapper">
            <template v-for="(currencies, region) in groupedCurrencies" :key="region">
              <div class="region-group mb-3">
                <div class="region-label small text-muted mb-2" :style="{ color: regionColor(region) + ' !important' }">
                  {{ REGION_LABELS[region] }}
                </div>
                <div class="currency-grid">
                  <div
                    v-for="c in currencies"
                    :key="c.code"
                    class="currency-check-item"
                    :class="{ 'is-selected': targetCurrencies.includes(c.code), 'is-from': c.code === fromCurrency }"
                    @click="c.code !== fromCurrency && (targetCurrencies.includes(c.code) ? targetCurrencies.splice(targetCurrencies.indexOf(c.code), 1) : targetCurrencies.push(c.code))"
                  >
                    <input
                      type="checkbox"
                      :value="c.code"
                      v-model="targetCurrencies"
                      :disabled="c.code === fromCurrency"
                      class="d-none"
                    />
                    <span class="currency-flag">{{ c.flag }}</span>
                    <span class="currency-code">{{ c.code }}</span>
                    <i v-if="targetCurrencies.includes(c.code)" class="bi bi-check2 check-icon"></i>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="d-flex align-items-center gap-3">
          <button
            @click="fetchRates(true)"
            :disabled="!isOnline || loading"
            class="btn btn-primary d-flex align-items-center gap-2"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
            <i v-else class="bi bi-arrow-clockwise"></i>
            {{ loading ? 'Actualizando...' : 'Actualizar tipos de cambio' }}
          </button>
          <span v-if="!isOnline" class="text-muted small">
            <i class="bi bi-wifi-off me-1"></i>Sin conexión
          </span>
        </div>

      </div>
    </div>

    <!-- No data state -->
    <div v-if="!rates && !loading" class="text-center py-5 text-muted">
      <i class="bi bi-cloud-slash display-4 mb-3 d-block"></i>
      <p>No hay tipos de cambio disponibles.<br>Conéctate a internet para obtenerlos.</p>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading && !rates" class="row g-3">
      <div v-for="i in 3" :key="i" class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100 placeholder-glow">
          <div class="card-body">
            <div class="placeholder col-4 mb-2"></div>
            <div class="placeholder col-8 mb-1"></div>
            <div class="placeholder col-6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="results.length > 0">
      <h6 class="text-muted text-uppercase small letter-spacing mb-3">
        <i class="bi bi-calculator me-2"></i>
        {{ formatInputAmount(amount) }} {{ fromCurrency }} equivale a:
      </h6>
      <div class="row g-3">
        <div
          v-for="result in results"
          :key="result.code"
          class="col-12 col-sm-6 col-lg-4"
        >
          <div class="card result-card h-100" :style="{ '--region-color': regionColor(result.region) }">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="result-flag">{{ result.flag }}</span>
                <div>
                  <div class="result-code fw-bold">{{ result.code }}</div>
                  <div class="result-name text-muted small">{{ result.name }}</div>
                </div>
              </div>
              <div class="result-amount mt-auto">
                {{ formatAmount(result.amount, result.code) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty selection -->
    <div v-else-if="rates && targetCurrencies.length === 0" class="text-center py-4 text-muted">
      <i class="bi bi-check2-square display-5 d-block mb-2"></i>
      <p class="mb-0">Selecciona al menos una moneda de destino</p>
    </div>
  </div>
</template>
