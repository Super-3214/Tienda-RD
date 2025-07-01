# Configuración de JSONBin.io para Tienda RD

## 🔧 Configuración Requerida

Para que los productos se almacenen de forma centralizada en JSONBin.io, necesitas seguir estos pasos:

### 1. Crear cuenta en JSONBin.io

1. Ve a [https://jsonbin.io](https://jsonbin.io)
2. Haz clic en "Sign Up" y crea una cuenta gratuita
3. Confirma tu email si es necesario

### 2. Crear un nuevo Bin

1. Una vez logueado, haz clic en "Create Bin"
2. Pega el siguiente contenido JSON inicial:

```json
{
  "productos": [],
  "metadata": {
    "created": "2025-01-13T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

3. Dale un nombre descriptivo como "tienda-rd-productos"
4. Haz clic en "Create"
5. **GUARDA EL BIN ID** que aparece en la URL (ejemplo: `507f1f77bcf86cd799439011`)

### 3. Generar API Key

1. Ve a la sección "API Keys" en tu dashboard
2. Haz clic en "Generate Master Key"
3. Dale un nombre como "tienda-rd-key"
4. **GUARDA LA MASTER KEY** (ejemplo: `$2a$10$abcd1234efgh5678ijkl9012mnop3456`)

### 4. Configurar el proyecto

Abre el archivo `script/jsonbin-utils.js` y reemplaza:

```javascript
// ANTES (líneas 6-7):
this.API_KEY = "$2a$10$YOUR_SECRET_KEY_HERE";
this.BIN_ID = "YOUR_BIN_ID_HERE";

// DESPUÉS (con tus datos reales):
this.API_KEY = "$2a$10$abcd1234efgh5678ijkl9012mnop3456"; // Tu Master Key
this.BIN_ID = "507f1f77bcf86cd799439011"; // Tu Bin ID
```

### 5. Verificar funcionamiento

1. Abre la consola del navegador (F12)
2. Recarga la página
3. Si está configurado correctamente, NO verás el mensaje de instrucciones de configuración
4. Prueba agregando un producto desde el panel de administrador

## 🔍 Solución de Problemas

### Problema: Error de CORS

**Solución**: Asegúrate de usar HTTPS en producción o usar un servidor local

### Problema: "Error HTTP: 401"

**Solución**: Verifica que la Master Key sea correcta y esté bien copiada

### Problema: "Error HTTP: 404"

**Solución**: Verifica que el Bin ID sea correcto

### Problema: Los productos no se sincronizan

**Solución**:

1. Revisa la consola del navegador para errores
2. Verifica que tengas conexión a internet
3. El sistema funcionará con localStorage como fallback

### Problema: "Error 413 Content Too Large"

**Solución**: ✅ **YA RESUELTO AUTOMÁTICAMENTE**

- Las imágenes ahora se comprimen automáticamente (máximo 600x400px, calidad 70%)
- Se verifica el tamaño antes de enviar a JSONBin.io
- Se muestran mensajes específicos si la imagen sigue siendo muy grande
- **Recomendación**: Usa imágenes de menos de 1MB para mejores resultados

## 📊 Límites de la cuenta gratuita

- **Requests por mes**: 10,000
- **Bins**: Hasta 100
- **Tamaño por bin**: 100KB

Para una tienda pequeña, estos límites son más que suficientes.

## 🔐 Seguridad

- **NUNCA** compartas tu Master Key públicamente
- Si necesitas regenerar la key, hazlo desde el dashboard de JSONBin.io
- Considera usar variables de entorno para producción

## 🚀 Funcionalidades implementadas

✅ **Agregar productos**: Se guardan automáticamente en JSONBin.io
✅ **Eliminar productos**: Se actualizan en tiempo real
✅ **Mostrar productos**: Se cargan desde la nube
✅ **Fallback**: Si JSONBin.io no funciona, usa localStorage
✅ **Sincronización**: Los cambios son visibles desde cualquier dispositivo
✅ **Compresión automática**: Las imágenes se redimensionan y comprimen automáticamente
✅ **Verificación de tamaño**: Se verifica el límite de 100KB antes de enviar
✅ **Manejo de errores mejorado**: Mensajes específicos para diferentes tipos de error

## 📝 Notas adicionales

- Los productos se sincronizan automáticamente entre todos los dispositivos
- Si no configuras JSONBin.io, el sistema funcionará localmente con localStorage
- Puedes monitorear el uso de tu API desde el dashboard de JSONBin.io
