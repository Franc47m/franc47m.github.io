// ============================================
// FUNCIONALIDAD DEL PORTAFOLIO
// ============================================

// Configuración de Supabase
const SUPABASE_URL = 'https://jbuowbihhublndbrpmuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidW93YmloaHVibG5kYnJwbXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDEyNTMsImV4cCI6MjA3ODcxNzI1M30.3J3ZWpkCsAHpDjkYf53CP9i8GJO340rgHXDLWrIGic0';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
const formularioComentarios = document.getElementById('formulario-comentarios');
const comentariosLista = document.getElementById('comentarios-lista');

// ============================================
// FUNCIÓN: Mostrar área de habilidades
// ============================================

function mostrarArea(areaId) {
    // Ocultar todas las áreas de blog
    const todasLasAreas = document.querySelectorAll('.blog-area');
    todasLasAreas.forEach(area => {
        area.classList.remove('active');
    });

    // Mostrar el área seleccionada
    const areaSeleccionada = document.getElementById(areaId);
    if (areaSeleccionada) {
        areaSeleccionada.classList.add('active');
    }

    // Actualizar botones activos
    const todosLosBotones = document.querySelectorAll('.area-btn');
    todosLosBotones.forEach(boton => {
        boton.classList.remove('active');
    });

    // Encontrar y activar el botón correspondiente
    const botonesActivos = Array.from(todosLosBotones).filter(btn => {
        const contenido = btn.textContent;
        const areaTexto = {
            'software': 'Desarrollo de Software',
            'bases-datos': 'Bases de Datos',
            'apps': 'Apps Empresariales',
            'tecnico': 'Plus Técnico'
        };
        return contenido.includes(areaTexto[areaId]);
    });

    if (botonesActivos.length > 0) {
        botonesActivos[0].classList.add('active');
    }
}

// ============================================
// FUNCIÓN: Cargar comentarios de Supabase
// ============================================

async function cargarComentarios() {
    try {
        const { data: comentarios, error } = await supabase
            .from('comentarios')
            .select('*')
            .order('fecha', { ascending: false });

        if (error) throw error;
        
        renderizarComentarios(comentarios || []);
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        renderizarComentarios([]);
    }
}

// ============================================
// FUNCIÓN: Renderizar comentarios en la página
// ============================================

function renderizarComentarios(comentarios) {
    const contenedorLista = comentariosLista.querySelector('.comentarios-lista') || comentariosLista;
    
    // Limpiar comentarios previos
    const comentariosAntiguos = contenedorLista.querySelectorAll('.comentario-item');
    comentariosAntiguos.forEach(comentario => comentario.remove());

    if (comentarios.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'no-comentarios';
        mensaje.innerHTML = '<p>Aún no hay comentarios. ¡Sé el primero en dejar tu comentario! 💬</p>';
        contenedorLista.appendChild(mensaje);
        return;
    }

    // Mostrar comentarios en orden inverso (más recientes primero)
    comentarios.reverse().forEach(comentario => {
        const elementoComentario = crearElementoComentario(comentario);
        contenedorLista.appendChild(elementoComentario);
    });
}

// ============================================
// FUNCIÓN: Crear elemento de comentario
// ============================================

function crearElementoComentario(comentario) {
    const div = document.createElement('div');
    div.className = 'comentario-item';
    
    const fecha = new Date(comentario.fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="comentario-autor"><strong>Nombre:</strong> ${escaparHTML(comentario.nombre)}</div>
        <div class="comentario-asunto"><strong>Asunto:</strong> ${escaparHTML(comentario.asunto)}</div>
        <div class="comentario-texto">${escaparHTML(comentario.mensaje)}</div>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem;"><strong>Fecha:</strong> ${fecha}</div>
    `;

    return div;
}

// ============================================
// FUNCIÓN: Escapar caracteres HTML (seguridad)
// ============================================

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// EVENTO: Envío del formulario de comentarios
// ============================================

formularioComentarios.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    // Validación
    if (!nombre || !email || !asunto || !mensaje) {
        mostrarAlerta('Por favor completa todos los campos', 'error');
        return;
    }

    // Validar email
    if (!validarEmail(email)) {
        mostrarAlerta('Por favor ingresa un email válido', 'error');
        return;
    }

    try {
        // Insertar comentario en Supabase
        const { data, error } = await supabase
            .from('comentarios')
            .insert([
                {
                    nombre: nombre,
                    email: email,
                    asunto: asunto,
                    mensaje: mensaje
                }
            ]);

        if (error) throw error;

        // Limpiar formulario
        formularioComentarios.reset();

        // Mostrar mensaje de éxito
        mostrarAlerta('¡Gracias por tu comentario! Aparecerá en la página en unos segundos.', 'success');

        // Recargar comentarios
        setTimeout(() => {
            cargarComentarios();
        }, 500);

        // Scroll suave a la sección de comentarios
        setTimeout(() => {
            comentariosLista.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    } catch (error) {
        console.error('Error al guardar comentario:', error);
        mostrarAlerta('Error al guardar el comentario. Intenta de nuevo.', 'error');
    }
});

// ============================================
// FUNCIÓN: Validar email
// ============================================

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ============================================
// FUNCIÓN: Mostrar alertas personalizadas
// ============================================

function mostrarAlerta(mensaje, tipo = 'info') {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
        max-width: 400px;
    `;
    alerta.textContent = mensaje;

    document.body.appendChild(alerta);

    // Eliminar alerta después de 4 segundos
    setTimeout(() => {
        alerta.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            alerta.remove();
        }, 300);
    }, 4000);
}

// ============================================
// ANIMACIONES CSS PARA ALERTAS
// ============================================

const estilosAnimaciones = document.createElement('style');
estilosAnimaciones.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(30px);
        }
    }
`;
document.head.appendChild(estilosAnimaciones);

// ============================================
// FUNCIÓN: Desplazamiento suave para enlaces de navegación
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const elemento = document.querySelector(href);
            elemento.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// FUNCIÓN: Detectar scroll para efectos
// ============================================

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// ============================================
// FUNCIÓN: Efecto de contador de números
// ============================================

function animarNumeros(elemento, target, duracion = 2000) {
    let actual = 0;
    const incremento = target / (duracion / 16);
    
    const timer = setInterval(() => {
        actual += incremento;
        if (actual >= target) {
            elemento.textContent = target;
            clearInterval(timer);
        } else {
            elemento.textContent = Math.floor(actual);
        }
    }, 16);
}

// ============================================
// FUNCIÓN: Inicializar página
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✨ Portafolio de Francisco Domínguez cargado correctamente');
    
    // Cargar comentarios al iniciar
    cargarComentarios();

    // Mensaje de bienvenida en la consola
    console.log('%c👋 ¡Bienvenido al portafolio de Francisco Domínguez!', 
        'font-size: 16px; color: #6366f1; font-weight: bold;');
    console.log('%c🎯 Estudiante de Ingeniería en Informática - Universidad de Panamá', 
        'font-size: 14px; color: #ec4899;');
    console.log('%c💼 Especialista en Desarrollo de Software y Bases de Datos', 
        'font-size: 14px; color: #f59e0b;');
});

// ============================================
// FUNCIÓN: Agregar efecto hover a tarjetas
// ============================================

const tarjetas = document.querySelectorAll('.proyecto-card');
tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    tarjeta.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ============================================
// FUNCIÓN: Detectar tema oscuro del sistema
// ============================================

function detectarTemaOscuro() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('🌙 Modo oscuro detectado en el sistema');
        // Aquí podrías agregar lógica para aplicar tema oscuro si lo deseas
    }
}

// Ejecutar al cargar
detectarTemaOscuro();

// ============================================
// MANEJO DE COMPORTAMIENTO DE FORMULARIO
// ============================================

// Limitar longitud de mensaje
const textareaComentario = document.getElementById('mensaje');
const maxCaracteres = 1000;

textareaComentario.addEventListener('input', function() {
    if (this.value.length > maxCaracteres) {
        this.value = this.value.substring(0, maxCaracteres);
    }
});

// Mostrar contador de caracteres
const formGroup = textareaComentario.parentElement;
const contador = document.createElement('div');
contador.style.cssText = `
    font-size: 0.85rem;
    color: #94a3b8;
    margin-top: 0.5rem;
    text-align: right;
`;
formGroup.appendChild(contador);

textareaComentario.addEventListener('input', function() {
    contador.textContent = `${this.value.length}/${maxCaracteres} caracteres`;
});

// Inicializar contador
contador.textContent = `0/${maxCaracteres} caracteres`;

// ============================================
// EVENTO: Limpiar localStorage (opcional)
// ============================================

// Descomentar la siguiente línea para limpiar todos los comentarios guardados
// localStorage.removeItem(comentariosLS);

console.log('%c✅ Todos los scripts se han cargado correctamente', 
    'font-size: 12px; color: #10b981; font-weight: bold;');
