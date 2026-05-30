<script setup>
import CurrencyConverter from './components/CurrencyConverter.vue'
</script>

<template>
  <div class="app-wrapper">
    <!-- Header -->
    <header class="app-header">
      <div class="container">
        <div class="d-flex align-items-center gap-3 py-3">
          <div class="header-icon">💱</div>
          <div>
            <h1 class="app-title mb-0">Tipo de Cambio</h1>
            <p class="app-subtitle mb-0">Conversor multi-moneda</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Converter -->
    <main>
      <CurrencyConverter />
    </main>

    <!-- Footer -->
    <footer class="text-center text-muted small py-4">
      Tipos de cambio proporcionados por
      <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener" class="text-muted">
        Open Exchange Rate API
      </a>
      · Actualización diaria
    </footer>
  </div>
</template>
