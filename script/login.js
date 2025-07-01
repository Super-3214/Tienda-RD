document.addEventListener('DOMContentLoaded', () => {

    const USUARIO_ADMIN = 'admin';
    const PASS_ADMIN = '1234';

    // Función para verificar en qué página estamos
    const esPagina = (nombreArchivo) => window.location.pathname.toLowerCase().endsWith(nombreArchivo);

    // --- LÓGICA PARA LA PÁGINA DE LOGIN (login.html) ---
    if (esPagina('login.html')) {
        
        // Animación de entrada del formulario
        const loginContainer = document.querySelector('.login-form-container');
        if (loginContainer) {
            setTimeout(() => {
                loginContainer.classList.add('is-visible');
            }, 100);
        }

        // Lógica del formulario de login
        const formLogin = document.getElementById('login-form');
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const usuarioInput = document.getElementById('username').value;
                const passInput = document.getElementById('password').value;
                const errorMsg = document.getElementById('login-error');

                if (usuarioInput === USUARIO_ADMIN && passInput === PASS_ADMIN) {
                    sessionStorage.setItem('adminLogueado', 'true');
                    window.location.href = 'Admin.html';
                } else {
                    errorMsg.textContent = 'Usuario o contraseña incorrectos.';
                    errorMsg.style.display = 'block';
                }
            });
        }
    }

    // --- LÓGICA DEL PANEL DE ADMINISTRADOR (Admin.html) ---
    if (esPagina('admin.html')) {
        if (sessionStorage.getItem('adminLogueado') !== 'true') {
            window.location.href = 'login.html';
            return;
        }

        // Aquí va el código del panel que ya tenías y funcionaba
        const formAgregarProducto = document.getElementById('form-agregar-producto');
        const listaProductosAdmin = document.getElementById('lista-productos-admin');
        const btnLogout = document.getElementById('btn-logout');
        const inputFile = document.getElementById('imagen');
        // Asegúrate de que los demás elementos existan en tu Admin.html
        const selectCategoria = document.getElementById('categoria');
        const grupoSubcategoria = document.getElementById('grupo-subcategoria');
        const fileNameSpan = document.getElementById('file-name');

        const obtenerProductos = async () => {
            try {
                return await jsonBinService.obtenerProductos();
            } catch (error) {
                console.error('Error al obtener productos:', error);
                return JSON.parse(localStorage.getItem('productos')) || [];
            }
        };
        
        const guardarProductos = async (productos) => {
            try {
                await jsonBinService.guardarProductos(productos);
                console.log('Productos guardados exitosamente');
            } catch (error) {
                console.error('Error al guardar productos:', error);
                // Fallback a localStorage
                localStorage.setItem('productos', JSON.stringify(productos));
            }
        };
        const leerArchivoComoDataURL = (archivo) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(archivo);
        });

        const renderizarProductosAdmin = async () => {
            try {
                const productos = await obtenerProductos();
                listaProductosAdmin.innerHTML = '';
                productos.forEach(producto => {
                    const item = document.createElement('div');
                    item.classList.add('product-item');
                    item.innerHTML = `<span>${producto.nombre} ($${producto.precio})</span><button class="btn-delete" data-id="${producto.id}">Eliminar</button>`;
                    listaProductosAdmin.appendChild(item);
                });
            } catch (error) {
                console.error('Error al renderizar productos:', error);
                listaProductosAdmin.innerHTML = '<p>Error al cargar productos</p>';
            }
        };

        if(formAgregarProducto) {
            formAgregarProducto.addEventListener('submit', async (e) => {
                e.preventDefault();
                const file = inputFile.files[0];
                if (!file) return alert('Por favor, selecciona una imagen.');
                
                try {
                    // Comprimir imagen antes de convertir a DataURL
                    console.log('Comprimiendo imagen...');
                    const imagenComprimida = await jsonBinService.comprimirImagen(file, 600, 400, 0.7);
                    
                    const productos = await obtenerProductos();
                    productos.push({
                        id: Date.now(),
                        nombre: document.getElementById('nombre').value,
                        precio: document.getElementById('precio').value,
                        imagen: imagenComprimida,
                        categoria: selectCategoria.value,
                        subcategoria: document.getElementById('subcategoria').value,
                    });
                    
                    await guardarProductos(productos);
                    formAgregarProducto.reset();
                    if(fileNameSpan) fileNameSpan.textContent = 'Ningún archivo seleccionado';
                    await renderizarProductosAdmin();
                    if(selectCategoria.value === 'Hogar' && grupoSubcategoria) grupoSubcategoria.style.display = 'none';
                } catch (error) {
                    console.error('Error completo:', error);
                    if (error.message.includes('413') || error.message.includes('100KB')) {
                        alert("La imagen es demasiado grande. Intenta con una imagen más pequeña o de menor calidad.");
                    } else if (error.message.includes('comprim')) {
                        alert("Error al procesar la imagen. Asegúrate de que sea un archivo de imagen válido.");
                    } else {
                        alert("Hubo un problema al agregar el producto. Verifique la configuración de JSONBin.io.");
                    }
                }
            });
        }
        
        if(listaProductosAdmin) {
            listaProductosAdmin.addEventListener('click', async (e) => {
                if (e.target.classList.contains('btn-delete')) {
                    const id = parseInt(e.target.dataset.id);
                    try {
                        const productos = await obtenerProductos();
                        const productosActualizados = productos.filter(p => p.id !== id);
                        await guardarProductos(productosActualizados);
                        await renderizarProductosAdmin();
                    } catch (error) {
                        console.error('Error al eliminar producto:', error);
                        alert('Error al eliminar el producto. Intente nuevamente.');
                    }
                }
            });
        }

        if(btnLogout) btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('adminLogueado');
            window.location.href = 'index.html';
        });

        if(selectCategoria) selectCategoria.addEventListener('change', () => {
            if (grupoSubcategoria) grupoSubcategoria.style.display = selectCategoria.value === 'Hogar' ? 'none' : 'block';
        });

        if(inputFile && fileNameSpan) inputFile.addEventListener('change', () => {
            fileNameSpan.textContent = inputFile.files.length > 0 ? inputFile.files[0].name : 'Ningún archivo seleccionado';
        });

        // Cargar productos iniciales
        renderizarProductosAdmin().catch(error => {
            console.error('Error al cargar productos iniciales:', error);
        });
    }
});