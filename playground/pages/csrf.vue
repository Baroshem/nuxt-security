<template>
  <div class="container">
    <h1 class="title">
      CSRF Protection Test
    </h1>

    <div class="content">
      <!-- Test protected endpoint -->
      <div class="test-section">
        <h2 class="section-title">
          Protected Endpoint (CSRF enabled)
        </h2>

        <p class="description">
          This endpoint should require CSRF token and fail without it
        </p>
        <button
          class="btn btn-blue"
          :disabled="loading"
          @click="testProtectedEndpoint"
        >
          Test Protected POST
        </button>
        <div
          v-if="protectedResult"
          class="result"
          :class="{
            'result-success': protectedResult.success,
            'result-error': !protectedResult.success
          }"
        >
          {{ protectedResult.message }}
        </div>
      </div>

      <!-- Test excluded endpoint -->
      <div class="test-section">
        <h2 class="section-title">
          Excluded Endpoint (CSRF disabled)
        </h2>
        <p class="description">
          This endpoint should work without CSRF token (configured in
          routeRules)
        </p>
        <button
          class="btn btn-green"
          :disabled="loading"
          @click="testExcludedEndpoint"
        >
          Test Excluded POST
        </button>
        <div
          v-if="excludedResult"
          class="result"
          :class="{
            'result-success': excludedResult.success,
            'result-error': !excludedResult.success
          }"
        >
          {{ excludedResult.message }}
        </div>
      </div>

      <!-- Test with CSRF token -->
      <div class="test-section">
        <h2 class="section-title">
          Protected Endpoint with Token
        </h2>
        <p class="description">
          This should work with proper CSRF token using useCsrfFetch
        </p>
        <button
          class="btn btn-purple"
          :disabled="loading"
          @click="testWithToken"
        >
          Test with CSRF Token
        </button>
        <div
          v-if="tokenResult"
          class="result"
          :class="{
            'result-success': tokenResult.success,
            'result-error': !tokenResult.success
          }"
        >
          {{ tokenResult.message }}
        </div>
      </div>

      <!-- CSRF Token Info -->
      <div class="token-info">
        <h2 class="section-title">
          CSRF Token Info
        </h2>
        <p class="description">
          Current CSRF Token:
        </p>
        <code class="code">{{ csrf || 'Not available' }}</code>
      </div>

      <!-- Results Summary -->
      <div class="test-section">
        <h2 class="section-title">
          Test Results
        </h2>
        <ul class="status-list">
          <li class="status-item">
            <span
              class="status-indicator"
              :class="{
                'status-success': protectedResult?.success === false,
                'status-inactive': protectedResult?.success !== false
              }"
            />
            Protected endpoint should FAIL without token:
            {{ protectedResult?.success === false ? '✅ Passed' : '❌ Failed' }}
          </li>
          <li class="status-item">
            <span
              class="status-indicator"
              :class="{
                'status-success': excludedResult?.success === true,
                'status-inactive': excludedResult?.success !== true
              }"
            />
            Excluded endpoint should PASS without token:
            {{ excludedResult?.success === true ? '✅ Passed' : '❌ Failed' }}
          </li>
          <li class="status-item">
            <span
              class="status-indicator"
              :class="{
                'status-success': tokenResult?.success === true,
                'status-inactive': tokenResult?.success !== true
              }"
            />
            Protected endpoint should PASS with token:
            {{ tokenResult?.success === true ? '✅ Passed' : '❌ Failed' }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Result = {
  success: boolean
  message: string
}

const loading = ref(false)
const protectedResult = ref<Result | null>(null)
const excludedResult = ref<Result | null>(null)
const tokenResult = ref<Result | null>(null)

const { csrf } = useCsrf()

const testProtectedEndpoint = async () => {
  loading.value = true
  try {
    // Use regular fetch without CSRF token - should fail
    const response = await fetch('/api/test-csrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'protected' })
    })

    const data = await response.json()

    if (response.ok) {
      protectedResult.value = {
        success: true,
        message: `Unexpected success: ${
          data.message || 'Request succeeded without CSRF token'
        }`
      }
    } else {
      protectedResult.value = {
        success: false,
        message: `Expected failure: ${data.message || response.statusText}`
      }
    }
  } catch (error: any) {
    protectedResult.value = {
      success: false,
      message: `Expected error: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

const testExcludedEndpoint = async () => {
  loading.value = true
  try {
    // Use regular fetch without CSRF token - should succeed
    const response = await fetch('/api/test-no-csrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'excluded' })
    })

    const data = await response.json()

    if (response.ok) {
      excludedResult.value = {
        success: true,
        message: `Success: ${
          data.message || 'Request succeeded without CSRF token (as expected)'
        }`
      }
    } else {
      excludedResult.value = {
        success: false,
        message: `Unexpected failure: ${data.message || response.statusText}`
      }
    }
  } catch (error: any) {
    excludedResult.value = {
      success: false,
      message: `Unexpected error: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

const testWithToken = async () => {
  loading.value = true
  try {
    // Use useCsrfFetch which automatically includes CSRF token
    const { data, error } = await useCsrfFetch('/api/test-csrf', {
      method: 'POST',
      body: { test: 'with-token' }
    })

    if (error.value) {
      tokenResult.value = {
        success: false,
        message: `Error with token: ${
          error.value.message || 'Request failed even with CSRF token'
        }`
      }
    } else {
      tokenResult.value = {
        success: true,
        message: `Success with token: ${
          data.value?.message || 'Request succeeded with CSRF token'
        }`
      }
    }
  } catch (error: any) {
    tokenResult.value = {
      success: false,
      message: `Error with token: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.test-section {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.btn {
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-blue {
  background-color: #3b82f6;
}

.btn-blue:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-green {
  background-color: #22c55e;
}

.btn-green:hover:not(:disabled) {
  background-color: #16a34a;
}

.btn-purple {
  background-color: #a855f7;
}

.btn-purple:hover:not(:disabled) {
  background-color: #9333ea;
}

.result {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.result-success {
  background-color: #dcfce7;
  color: #166534;
}

.result-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.token-info {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9fafb;
}

.code {
  background-color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  word-break: break-all;
  display: block;
  font-family: monospace;
}

.status-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-item {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  display: inline-block;
}

.status-success {
  background-color: #22c55e;
}

.status-inactive {
  background-color: #d1d5db;
}
</style>
