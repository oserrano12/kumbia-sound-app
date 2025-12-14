// main.js - Funciones principales del sitio Kumbia Sound
// Este archivo organiza comportamientos generales: menú móvil, scroll suave,
// búsqueda simulada, gestión de juegos, y utilidades de UI (notificaciones, año).
document.addEventListener('DOMContentLoaded', function() {
    console.log("Kumbia Sound - Sitio inicializado");
    
    // Inicializar funcionalidades
    initMobileMenu();
    initSmoothScroll();
    initDatabaseSearch();
    initGames();
    
    // Actualizar año en footer
    updateCurrentYear();
});

// Menú móvil
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileBtn && mainNav) {
        // Accesibilidad: indicar control y estado inicial
        mobileBtn.setAttribute('aria-controls', mainNav.id || 'main-nav');
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileBtn.innerHTML = mainNav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
            // Actualizamos estado ARIA y bloqueo de scroll cuando el menú está abierto
            const expanded = String(mainNav.classList.contains('active'));
            mobileBtn.setAttribute('aria-expanded', expanded);
            document.body.classList.toggle('nav-open', mainNav.classList.contains('active'));
        });
        
        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
                mobileBtn.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// Scroll suave
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Búsqueda en base de datos (simulada)
function initDatabaseSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                performSearch();
            });
        });
    }
    
    function performSearch() {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const activeFilter = document.querySelector('.filter-btn.active')?.textContent || 'Todos';
        
        console.log(`Buscando: "${query}" | Filtro: ${activeFilter}`);
        
        // Aquí iría la lógica real de búsqueda
        // Por ahora solo muestra un mensaje
        if (query) {
            alert(`Búsqueda simulada: "${query}"\nFiltro: ${activeFilter}\n\n(En una versión real, aquí se mostrarían resultados de la base de datos)`);
        }
    }
}

// Juegos (simulación)
function initGames() {
    // En el HTML actual los botones usan la clase `.btn-play`.
    const playButtons = document.querySelectorAll('.btn-play');
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.game-card');
            const gameTitle = card ? card.querySelector('h3').textContent : 'Juego';
            alert(`¡Iniciando ${gameTitle}!\n\n(En una versión real, aquí se cargaría el juego)`);
        });
    });
}

// Actualizar año actual
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.current-year');
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
    
    // Actualizar copyright en footer de forma robusta (reemplaza cualquier año de 4 dígitos)
    const copyright = document.querySelector('.footer-bottom p');
    if (copyright) {
        copyright.textContent = copyright.textContent.replace(/\d{4}/, String(currentYear));
    }
}

// Detectar conexión
function checkConnection() {
    if (!navigator.onLine) {
        showNotification('⚠️ Estás offline. Algunas funciones pueden no estar disponibles.');
    }
    
    window.addEventListener('online', () => {
        showNotification('✅ Conexión restablecida');
    });
    
    window.addEventListener('offline', () => {
        showNotification('⚠️ Conexión perdida');
    });
}

// Mostrar notificaciones
function showNotification(message) {
    // Crear notificación si no existe
    let notification = document.querySelector('.site-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'site-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--primary-color);
            color: var(--text-on-dark);
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    
    // Mostrar
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
    }, 4000);
}

// Inicializar verificación de conexión
checkConnection();

// Exportar funciones útiles
window.kumbiaUtils = {
    updateCurrentYear,
    showNotification,
    checkConnection
};