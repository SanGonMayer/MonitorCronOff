import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar la base de datos
  initDatabase()

  // Cargar datos iniciales
  loadHosts()

  // Configurar pestañas
  setupTabs()

  // Configurar tema claro/oscuro
  setupThemeToggle()

  // Configurar eventos
  setupEventListeners()
})

// Función para inicializar la base de datos
async function initDatabase() {
  try {
    await fetch("/api/init")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    showToast("Error", "No se pudo inicializar la base de datos", "error")
  }
}

// Función para cargar hosts
async function loadHosts() {
  const tableBody = document.getElementById("hosts-table-body")
  const loadingElement = document.getElementById("hosts-loading")
  const emptyElement = document.getElementById("hosts-empty")

  try {
    loadingElement.classList.remove("hidden")
    emptyElement.classList.add("hidden")

    const response = await fetch("/api/hosts")
    const hosts = await response.json()

    loadingElement.classList.add("hidden")

    if (hosts.length === 0) {
      emptyElement.classList.remove("hidden")
      return
    }

    tableBody.innerHTML = ""

    hosts.forEach((host) => {
      const row = document.createElement("tr")

      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="font-medium">${host.hostname}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">${host.ip_address}</td>
        <td class="px-6 py-4 whitespace-nowrap">Filial ${host.branch}</td>
        <td class="px-6 py-4 whitespace-nowrap">${host.failure_count}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button 
            class="connect-btn bg-transparent hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 font-semibold py-1 px-3 border border-purple-600 dark:border-purple-500 rounded-xl flex items-center gap-1"
            data-hostname="${host.hostname}"
            data-ip="${host.ip_address}"
          >
            <i class="fas fa-terminal text-xs"></i>
            Conectar
          </button>
        </td>
      `

      tableBody.appendChild(row)
    })

    // Agregar eventos a los botones de conectar
    document.querySelectorAll(".connect-btn").forEach((button) => {
      button.addEventListener("click", handleConnect)
    })
  } catch (error) {
    console.error("Error al cargar hosts:", error)
    loadingElement.classList.add("hidden")
    showToast("Error", "No se pudieron cargar los hosts", "error")
  }
}

// Función para manejar la conexión a un host
async function handleConnect(event) {
  const button = event.currentTarget
  const hostname = button.dataset.hostname
  const ip = button.dataset.ip

  // Guardar el contenido original del botón
  const originalContent = button.innerHTML

  // Mostrar indicador de carga
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...'
  button.disabled = true

  try {
    const response = await fetch("/api/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip }),
    })

    const result = await response.json()

    showToast(
      result.success ? "Conexión Exitosa" : "Conexión Fallida",
      result.message,
      result.success ? "success" : "error",
    )
  } catch (error) {
    console.error("Error al conectar con el host:", error)
    showToast("Error", "Error al conectar con el host", "error")
  } finally {
    // Restaurar el contenido original del botón
    button.innerHTML = originalContent
    button.disabled = false
  }
}

// Función para agregar hosts
async function addHosts() {
  const branchNumberInput = document.getElementById("branch-number")
  const hostsInput = document.getElementById("hosts")
  const addButton = document.getElementById("add-hosts-btn")

  const branchNumber = branchNumberInput.value.trim()
  const hostsText = hostsInput.value.trim()

  if (!branchNumber) {
    showToast("Error", "Por favor ingrese un número de filial", "error")
    return
  }

  const branchNum = Number.parseInt(branchNumber)
  if (isNaN(branchNum) || branchNum < 1 || branchNum > 999) {
    showToast("Error", "El número de filial debe estar entre 1 y 999", "error")
    return
  }

  if (!hostsText) {
    showToast("Error", "Por favor ingrese al menos un host", "error")
    return
  }

  // Obtener lista de hosts
  const hostnames = hostsText
    .split(/[\n,]/)
    .map((h) => h.trim())
    .filter((h) => h.length > 0)

  // Guardar el contenido original del botón
  const originalContent = addButton.innerHTML

  // Mostrar indicador de carga
  addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...'
  addButton.disabled = true

  try {
    const response = await fetch("/api/hosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hostnames,
        branch: branchNumber,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      showToast("Éxito", `Se agregaron ${hostnames.length} host(s) a la filial ${branchNumber}`, "success")
      hostsInput.value = ""
      loadHosts()

      // Si estamos en la pestaña de estadísticas, recargar los gráficos
      if (document.getElementById("stats-tab").classList.contains("active")) {
        loadCharts()
      }
    } else {
      showToast("Error", result.error || "Error al agregar hosts", "error")
    }
  } catch (error) {
    console.error("Error al agregar hosts:", error)
    showToast("Error", "Error al agregar hosts", "error")
  } finally {
    // Restaurar el contenido original del botón
    addButton.innerHTML = originalContent
    addButton.disabled = false
  }
}

// Función para buscar hosts
function searchHosts() {
  const searchInput = document.getElementById("search-hosts")
  const searchTerm = searchInput.value.toLowerCase()
  const rows = document.querySelectorAll("#hosts-table-body tr")

  let visibleCount = 0

  rows.forEach((row) => {
    const hostname = row.querySelector("td:first-child").textContent.toLowerCase()
    const branch = row.querySelector("td:nth-child(3)").textContent.toLowerCase()

    if (hostname.includes(searchTerm) || branch.includes(searchTerm)) {
      row.classList.remove("hidden")
      visibleCount++
    } else {
      row.classList.add("hidden")
    }
  })

  // Mostrar mensaje si no hay resultados
  const emptyElement = document.getElementById("hosts-empty")
  if (visibleCount === 0) {
    emptyElement.textContent = "No se encontraron hosts que coincidan con la búsqueda."
    emptyElement.classList.remove("hidden")
  } else {
    emptyElement.classList.add("hidden")
  }
}

// Función para cargar los gráficos
async function loadCharts() {
  await Promise.all([loadBranchChart(), loadHostChart()])
}

// Función para cargar el gráfico de filiales
async function loadBranchChart() {
  const chartContainer = document.getElementById("branch-chart")
  const loadingElement = document.getElementById("branch-chart-loading")
  const emptyElement = document.getElementById("branch-chart-empty")

  try {
    loadingElement.classList.remove("hidden")
    emptyElement.classList.add("hidden")
    chartContainer.classList.add("hidden")

    const response = await fetch("/api/stats/branches")
    const data = await response.json()

    loadingElement.classList.add("hidden")

    if (data.length === 0) {
      emptyElement.classList.remove("hidden")
      return
    }

    chartContainer.classList.remove("hidden")

    // Ordenar datos de mayor a menor
    data.sort((a, b) => b.count - a.count)

    // Crear el gráfico
    const ctx = document.createElement("canvas")
    ctx.width = chartContainer.clientWidth
    ctx.height = chartContainer.clientHeight
    chartContainer.innerHTML = ""
    chartContainer.appendChild(ctx)

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => `Filial ${item.branch}`),
        datasets: [
          {
            label: "Cantidad de Fallos",
            data: data.map((item) => item.count),
            backgroundColor: "#8A2BE2",
            borderColor: "#4B0082",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    })
  } catch (error) {
    console.error("Error al cargar el gráfico de filiales:", error)
    loadingElement.classList.add("hidden")
    emptyElement.textContent = "Error al cargar datos"
    emptyElement.classList.remove("hidden")
  }
}

// Función para cargar el gráfico de hosts
async function loadHostChart() {
  const chartContainer = document.getElementById("host-chart")
  const loadingElement = document.getElementById("host-chart-loading")
  const emptyElement = document.getElementById("host-chart-empty")

  try {
    loadingElement.classList.remove("hidden")
    emptyElement.classList.add("hidden")
    chartContainer.classList.add("hidden")

    const response = await fetch("/api/stats/hosts")
    const data = await response.json()

    loadingElement.classList.add("hidden")

    if (data.length === 0) {
      emptyElement.classList.remove("hidden")
      return
    }

    chartContainer.classList.remove("hidden")

    // Ordenar datos de mayor a menor
    data.sort((a, b) => b.count - a.count)

    // Limitar a los 5 primeros
    const topData = data.slice(0, 5)

    // Colores para el gráfico
    const colors = ["#8A2BE2", "#9932CC", "#FF8C00", "#FF7F00", "#FF6347"]

    // Crear el gráfico
    const ctx = document.createElement("canvas")
    ctx.width = chartContainer.clientWidth
    ctx.height = chartContainer.clientHeight
    chartContainer.innerHTML = ""
    chartContainer.appendChild(ctx)

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: topData.map((item) => item.hostname),
        datasets: [
          {
            data: topData.map((item) => item.count),
            backgroundColor: colors,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} fallos`,
            },
          },
        },
      },
    })
  } catch (error) {
    console.error("Error al cargar el gráfico de hosts:", error)
    loadingElement.classList.add("hidden")
    emptyElement.textContent = "Error al cargar datos"
    emptyElement.classList.remove("hidden")
  }
}

// Función para configurar las pestañas
function setupTabs() {
  const tabTriggers = document.querySelectorAll(".tab-trigger")
  const tabContents = document.querySelectorAll(".tab-content")

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const tabName = trigger.dataset.tab

      // Activar/desactivar triggers
      tabTriggers.forEach((t) => t.classList.remove("active"))
      trigger.classList.add("active")

      // Mostrar/ocultar contenido
      tabContents.forEach((content) => {
        if (content.id === `${tabName}-tab`) {
          content.classList.remove("hidden")

          // Si es la pestaña de estadísticas, cargar los gráficos
          if (tabName === "stats") {
            loadCharts()
          }
        } else {
          content.classList.add("hidden")
        }
      })
    })
  })
}

// Función para configurar el toggle de tema
function setupThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle")
  const themeIcon = document.getElementById("theme-icon")

  // Verificar si hay un tema guardado en localStorage
  const savedTheme = localStorage.getItem("theme")

  // Establecer el tema predeterminado como claro si no hay uno guardado
  if (!savedTheme) {
    localStorage.setItem("theme", "light")
    document.documentElement.classList.remove("dark")
    themeIcon.classList.remove("fa-sun")
    themeIcon.classList.add("fa-moon")
  } else {
    // Aplicar el tema guardado
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
      themeIcon.classList.remove("fa-moon")
      themeIcon.classList.add("fa-sun")
    } else {
      document.documentElement.classList.remove("dark")
      themeIcon.classList.remove("fa-sun")
      themeIcon.classList.add("fa-moon")
    }
  }

  // Manejar el cambio de tema
  themeToggle.addEventListener("click", () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      themeIcon.classList.remove("fa-sun")
      themeIcon.classList.add("fa-moon")
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      themeIcon.classList.remove("fa-moon")
      themeIcon.classList.add("fa-sun")
    }
  })
}

// Función para configurar los event listeners
function setupEventListeners() {
  // Evento para agregar hosts
  document.getElementById("add-hosts-btn").addEventListener("click", addHosts)

  // Evento para buscar hosts
  document.getElementById("search-hosts").addEventListener("input", searchHosts)

  // Evento para cerrar el toast
  document.getElementById("toast-close").addEventListener("click", hideToast)
}

// Función para mostrar un toast
function showToast(title, message, type = "success") {
  const toast = document.getElementById("toast")
  const toastTitle = document.getElementById("toast-title")
  const toastMessage = document.getElementById("toast-message")
  const toastIcon = document.getElementById("toast-icon")

  // Establecer contenido
  toastTitle.textContent = title
  toastMessage.textContent = message

  // Establecer tipo
  toast.className = toast.className.replace(/toast-(success|error)/g, "")
  toast.classList.add(`toast-${type}`)

  // Cambiar icono según el tipo
  toastIcon.innerHTML =
    type === "success" ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'

  // Mostrar toast
  toast.classList.remove("hidden", "translate-y-10", "opacity-0")

  // Ocultar automáticamente después de 5 segundos
  setTimeout(hideToast, 5000)
}

// Función para ocultar el toast
function hideToast() {
  const toast = document.getElementById("toast")
  toast.classList.add("translate-y-10", "opacity-0")
  setTimeout(() => {
    toast.classList.add("hidden")
  }, 300)
}
