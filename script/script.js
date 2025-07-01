// --- SCRIPT.JS - SOLUCIÓN DEFINITIVA PARA ELEMENTOS QUE DESAPARECEN ---

document.addEventListener('DOMContentLoaded', () => {

    const numeroWhatsApp = '5211234567890'; // Puedes cambiar este número por tu WhatsApp
    
    const todosLosFiltros = document.querySelectorAll('.filtros button');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const header = document.querySelector('header');
    
    const obtenerProductos = async () => {
        try {
            return await jsonBinService.obtenerProductos();
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return JSON.parse(localStorage.getItem('productos')) || [];
        }
    };

    const mostrarProductos = (productos, container) => {
        if (!container) return; 
        container.innerHTML = '';

        if (productos.length === 0) {
            // AÑADIMOS la clase .reveal aquí para que el mensaje SÍ tenga animación
            container.innerHTML = '<p class="mensaje-vacio reveal">No hay productos disponibles en esta categoría.</p>';
        } else {
            productos.forEach(producto => {
                const mensajeWhatsApp = encodeURIComponent(`Hola, estoy interesado en el producto: ${producto.nombre}`);
                const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`;

                // AÑADIMOS la clase .reveal aquí para que los productos SÍ tengan animación
                const tarjetaProductoHTML = `
                    <div class="product-card reveal">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <div class="product-info">
                            <h3>${producto.nombre}</h3>
                            <p class="product-price">$${parseFloat(producto.precio).toFixed(2)}</p>
                            <a href="${enlaceWhatsApp}" class="btn-whatsapp" target="_blank">Contactar por WhatsApp</a>
                        </div>
                    </div>`;
                container.innerHTML += tarjetaProductoHTML;
            });
        }
        
        // Esta función se encarga de activar la animación de los elementos que acabamos de añadir
        actualizarElementosObservados();
    };

    todosLosFiltros.forEach(button => {
        button.addEventListener('click', async (e) => {
            const botonClicado = e.target;
            const categoria = botonClicado.dataset.categoria;
            const subcategoria = botonClicado.dataset.subcategoria;
            
            const gridContainerId = `grid-${categoria.toLowerCase()}`;
            const gridContainer = document.getElementById(gridContainerId);
            
            const grupoBotones = botonClicado.parentElement.querySelectorAll('button');
            grupoBotones.forEach(btn => btn.classList.remove('active'));
            botonClicado.classList.add('active');

            try {
                const todosLosProductos = await obtenerProductos();
                const productosDeCategoria = todosLosProductos.filter(p => p.categoria === categoria);
                const productosFiltrados = subcategoria === 'Todo'
                    ? productosDeCategoria
                    : productosDeCategoria.filter(p => p.subcategoria === subcategoria);
                
                if (gridContainer) {
                    mostrarProductos(productosFiltrados, gridContainer);
                }
            } catch (error) {
                console.error('Error al filtrar productos:', error);
                if (gridContainer) {
                    gridContainer.innerHTML = '<p class="mensaje-vacio">Error al cargar productos</p>';
                }
            }
        });
    });

    const cargarProductosIniciales = async () => {
        try {
            const todosLosProductos = await obtenerProductos();
            const categorias = ['Ropa', 'Calzado', 'Interiores', 'Accesorios', 'Hogar'];

            categorias.forEach(categoria => {
                const gridContainerId = `grid-${categoria.toLowerCase()}`;
                const gridContainer = document.getElementById(gridContainerId);
                if (gridContainer) {
                    const productosDeCategoria = todosLosProductos.filter(p => p.categoria === categoria);
                    mostrarProductos(productosDeCategoria, gridContainer);
                }
            });
        } catch (error) {
            console.error('Error al cargar productos iniciales:', error);
            const categorias = ['Ropa', 'Calzado', 'Interiores', 'Accesorios', 'Hogar'];
            categorias.forEach(categoria => {
                const gridContainerId = `grid-${categoria.toLowerCase()}`;
                const gridContainer = document.getElementById(gridContainerId);
                if (gridContainer) {
                    gridContainer.innerHTML = '<p class="mensaje-vacio">Error al cargar productos</p>';
                }
            });
        }
    };

    // --- LÓGICA DE SCROLL ---
    window.addEventListener('scroll', () => {
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
        
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // --- LÓGICA DE ANIMACIONES ---
    let observer;
    const setupObserver = () => {
        const options = { root: null, rootMargin: '0px', threshold: 0.1 };
        observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, options);
    };

    const actualizarElementosObservados = () => {
        const elementosParaRevelar = document.querySelectorAll('.reveal:not(.is-visible)');
        elementosParaRevelar.forEach(el => {
            if (observer) {
                observer.observe(el);
            }
        });
    };
    
    // --- ESTA FUNCIÓN ERA EL PROBLEMA Y LA HEMOS ELIMINADO ---
    // const anadirClaseRevealInicial = () => {
    //     document.querySelectorAll('.category-section h2, .filtros').forEach(el => el.classList.add('reveal'));
    // };

    // --- EJECUCIÓN INICIAL (YA SIN LA FUNCIÓN PROBLEMÁTICA) ---
    setupObserver();
    // anadirClaseRevealInicial(); // <-- La llamada también se elimina
    cargarProductosIniciales().catch(error => {
        console.error('Error al cargar productos iniciales:', error);
    });
});