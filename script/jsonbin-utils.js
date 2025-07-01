// JSONBin.io Configuration and Utilities
class JSONBinService {
    constructor() {
        // Configuración de JSONBin.io
        // NOTA: Debes reemplazar estos valores con tu propia información de JSONBin.io
        this.API_KEY = '$2a$10$Z633LKxy1iSFBFurw8h1Q.AKC0Mj4aD8j07lK0Q4m2PK2HO2er4x.'; // Reemplaza con tu Secret Key
        this.BIN_ID = '6863ebfe8a456b7966b97fcb'; // Reemplaza con tu Bin ID
        this.BASE_URL = 'https://api.jsonbin.io/v3';
        
        // Headers para las peticiones
        this.headers = {
            'Content-Type': 'application/json',
            'X-Master-Key': this.API_KEY
        };
    }

    // Crear un nuevo bin (solo necesario la primera vez)
    async crearBin() {
        try {
            const response = await fetch(`${this.BASE_URL}/b`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    productos: [],
                    metadata: {
                        created: new Date().toISOString(),
                        version: '1.0.0'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Bin creado exitosamente:', data);
            return data;
        } catch (error) {
            console.error('Error al crear bin:', error);
            throw error;
        }
    }

    // Obtener productos del bin
    async obtenerProductos() {
        try {
            // Intenta obtener desde JSONBin primero
            const response = await fetch(`${this.BASE_URL}/b/${this.BIN_ID}/latest`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                console.warn('Error al obtener productos de JSONBin, usando localStorage como fallback');
                return this.obtenerProductosLocalStorage();
            }

            const data = await response.json();
            const productos = data.record.productos || [];
            
            // Sincronizar con localStorage como backup
            localStorage.setItem('productos', JSON.stringify(productos));
            
            return productos;
        } catch (error) {
            console.error('Error al obtener productos de JSONBin:', error);
            // Fallback a localStorage
            return this.obtenerProductosLocalStorage();
        }
    }

    // Guardar productos en el bin
    async guardarProductos(productos) {
        try {
            const dataToSave = {
                productos: productos,
                metadata: {
                    lastUpdated: new Date().toISOString(),
                    version: '1.0.0',
                    totalProducts: productos.length
                }
            };

            // Verificar tamaño antes de enviar
            if (!this.verificarTamano(dataToSave)) {
                throw new Error('El contenido excede el límite de 100KB de JSONBin.io. Reduce el tamaño de las imágenes.');
            }

            const response = await fetch(`${this.BASE_URL}/b/${this.BIN_ID}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(dataToSave)
            });

            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('El contenido es demasiado grande (413). Reduce el tamaño o calidad de las imágenes.');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // También guardar en localStorage como backup
            localStorage.setItem('productos', JSON.stringify(productos));
            
            console.log('Productos guardados exitosamente en JSONBin');
            return data;
        } catch (error) {
            console.error('Error al guardar productos en JSONBin:', error);
            // Fallback a localStorage
            this.guardarProductosLocalStorage(productos);
            throw error;
        }
    }

    // Funciones de fallback para localStorage
    obtenerProductosLocalStorage() {
        return JSON.parse(localStorage.getItem('productos')) || [];
    }

    guardarProductosLocalStorage(productos) {
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    // Método para probar la conexión
    async probarConexion() {
        try {
            const response = await fetch(`${this.BASE_URL}/b/${this.BIN_ID}/latest`, {
                method: 'GET',
                headers: this.headers
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error de conexión con JSONBin:', error);
            return false;
        }
    }

    // Método para mostrar instrucciones de configuración
    mostrarInstruccionesConfiguracion() {
        console.log(`
🔧 CONFIGURACIÓN DE JSONBIN.IO REQUERIDA:

1. Ve a https://jsonbin.io y crea una cuenta gratuita
2. Crea un nuevo bin
3. Ve a "API Keys" y genera una nueva Master Key
4. Reemplaza los siguientes valores en script/jsonbin-utils.js:

   API_KEY: Reemplaza '$2a$10$YOUR_SECRET_KEY_HERE' con tu Master Key
   BIN_ID: Reemplaza 'YOUR_BIN_ID_HERE' con tu Bin ID

5. El sistema funcionará con localStorage hasta que configures JSONBin.io

📝 Ejemplo de configuración:
   this.API_KEY = '$2a$10$abcd1234efgh5678ijkl9012mnop3456';
   this.BIN_ID = '507f1f77bcf86cd799439011';
        `);
    }

    // Función para comprimir imágenes antes de guardarlas
    comprimirImagen(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calcular nuevas dimensiones manteniendo proporción
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Dibujar imagen redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a blob con compresión
                canvas.toBlob(
                    (blob) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    // Verificar tamaño del contenido antes de enviar
    verificarTamano(data) {
        const jsonString = JSON.stringify(data);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInKB = sizeInBytes / 1024;
        
        console.log(`Tamaño del contenido: ${sizeInKB.toFixed(2)} KB`);
        
        if (sizeInKB > 90) { // Límite conservador de 90KB
            console.warn('⚠️ El contenido está cerca del límite de 100KB de JSONBin.io');
        }
        
        return sizeInKB <= 100;
    }
}

// Crear instancia global del servicio
const jsonBinService = new JSONBinService();

// Mostrar instrucciones si no está configurado
if (jsonBinService.API_KEY === '$2a$10$YOUR_SECRET_KEY_HERE' || jsonBinService.BIN_ID === 'YOUR_BIN_ID_HERE') {
    jsonBinService.mostrarInstruccionesConfiguracion();
}

// Exportar para uso en otros archivos
window.jsonBinService = jsonBinService; 