// Constante para la clave de almacenamiento local
const STORAGE_KEY = 'listaComidasCompartida';
const NOTIFICATION_KEY = 'comidaSeleccionadaNotificacion';

// --- Funciones de Gestión de Datos ---

/**
 * Carga las comidas desde localStorage o devuelve un array vacío.
 * @returns {Array} Lista de objetos de comida.
 */
function obtenerComidas() {
    const comidasJson = localStorage.getItem(STORAGE_KEY);
    return comidasJson ? JSON.parse(comidasJson) : [];
}

/**
 * Guarda la lista de comidas en localStorage.
 * @param {Array} comidas - Lista de objetos de comida a guardar.
 */
function guardarComidas(comidas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comidas));
}

// --- Funciones de Interfaz (DOM) ---

/**
 * Actualiza el contador de comidas en el header.
 * @param {Array} comidas - La lista actual de comidas.
 */
function actualizarContador(comidas) {
    const total = comidas.length;
    const restantes = comidas.filter(c => !c.seleccionadoPor).length;
    
    document.getElementById('total-comidas').textContent = total;
    document.getElementById('restantes-comidas').textContent = restantes;
}

/**
 * Renderiza la lista completa de comidas en el DOM.
 */
function renderizarComidas() {
    const comidas = obtenerComidas();
    const contenedor = document.getElementById('lista-comidas');
    contenedor.innerHTML = ''; // Limpiar el contenedor antes de redibujar

    comidas.forEach(comida => {
        const item = document.createElement('div');
        item.className = `comida-item ${comida.seleccionadoPor ? 'seleccionada' : ''}`;
        
        let infoSeleccion = '';
        if (comida.seleccionadoPor) {
            infoSeleccion = `<p>Seleccionado por: <strong>${comida.seleccionadoPor}</strong></p>`;
        } else {
            infoSeleccion = `<p>Aún sin elegir...</p>`;
        }

        item.innerHTML = `
            <h3>${comida.nombre}</h3>
            ${infoSeleccion}
            <button 
                data-id="${comida.id}"
                ${comida.seleccionadoPor ? 'disabled' : ''}
            >
                ${comida.seleccionadoPor ? 'Ya Seleccionado' : '¡Yo lo Hago!'}
            </button>
        `;
        contenedor.appendChild(item);
    });

    actualizarContador(comidas);
    checkNotification(); // Verificar si hay una notificación pendiente para mostrar
}


// --- Lógica Principal de la Aplicación ---

/**
 * Añade una nueva comida a la lista.
 */
function agregarComida() {
    const input = document.getElementById('input-comida');
    const nombre = input.value.trim();

    if (nombre) {
        const comidas = obtenerComidas();
        const nuevaComida = {
            id: Date.now().toString(), 
            nombre: nombre,
            seleccionadoPor: null
        };
        comidas.push(nuevaComida);
        guardarComidas(comidas);
        input.value = ''; // Limpiar input
        renderizarComidas();
    }
}

/**
 * Marca una comida como seleccionada por el usuario.
 * @param {string} comidaId - El ID de la comida seleccionada.
 */
function seleccionarComida(comidaId) {
    let comidas = obtenerComidas();
    const comidaIndex = comidas.findIndex(c => c.id === comidaId);

    if (comidaIndex !== -1 && !comidas[comidaIndex].seleccionadoPor) {
        // Pide el nombre del usuario para registrar la selección
        const nombreUsuario = prompt("¿Cuál es tu nombre para registrar la selección?");
        
        if (nombreUsuario && nombreUsuario.trim() !== '') {
            const nombreLimpio = nombreUsuario.trim();
            comidas[comidaIndex].seleccionadoPor = nombreLimpio;
            guardarComidas(comidas);
            
            // 1. Guardar una bandera de notificación en localStorage
            const mensaje = `📢 ¡AVISO! ${nombreLimpio} ha seleccionado: ${comidas[comidaIndex].nombre}`;
            sessionStorage.setItem(NOTIFICATION_KEY, mensaje); 
            
            renderizarComidas(); // Renderiza localmente el cambio
        } else {
            alert("Debes ingresar un nombre para seleccionar la comida.");
        }
    } else {
         alert("Esta comida ya fue seleccionada.");
    }
}

/**
 * Verifica y muestra la notificación si un cambio ocurrió en otra pestaña.
 */
function checkNotification() {
    const mensaje = sessionStorage.getItem(NOTIFICATION_KEY);
    if (mensaje) {
        alert(mensaje);
        sessionStorage.removeItem(NOTIFICATION_KEY); // Eliminar después de mostrar
    }
}


// --- Manejo de Eventos ---

// 1. Inicialización
window.onload = () => {
    renderizarComidas();
    
    // 2. Escuchar el clic del botón Agregar
    document.getElementById('add-button').addEventListener('click', agregarComida);
    
    // 3. Escuchar el clic en la lista para seleccionar comidas (delegación de eventos)
    document.getElementById('lista-comidas').addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const comidaId = event.target.getAttribute('data-id');
            if (comidaId) {
                seleccionarComida(comidaId);
            }
        }
    });

    // 4. Sincronización entre Pestañas/Ventanas del mismo navegador
    // Cuando localStorage cambia en otra pestaña, este evento se dispara aquí.
    window.addEventListener('storage', () => {
        renderizarComidas();
        // Nota: La notificación se maneja dentro de renderizarComidas() usando sessionStorage
    });
};