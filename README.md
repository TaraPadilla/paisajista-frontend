# Paisajista · Frontend

Aplicación React 19 con TypeScript, Vite, React Router y Axios. Consume la [API Laravel](../Backend/README.md) y usa sus sesiones de usuario.

## Desarrollo local

Requiere Node.js 20.19+ en la rama 20 o Node.js 22.12+ y npm. Levanta primero Laravel en `127.0.0.1:8000` siguiendo su README. Después, desde `Frontend`:

```bash
npm ci
npm run dev
```

Abre `http://localhost:5173/` o la URL que indique Vite. Pulsa **Ingresar** y usa una cuenta existente de Laravel. En desarrollo, el formulario muestra la cuenta de prueba `test@example.com` con contraseña `password`, que debe estar creada por el seeder del backend. Vite reenvía `/api` al backend local mediante `vite.config.ts`. Los servicios usan la ruta relativa `/api`. La variable anterior `VITE_BACKEND_URL` no controla esta conexión.

## Pantallas y flujos

| Ruta | Funcionalidad |
| --- | --- |
| `/login` | Ingreso con correo y contraseña. El encabezado de la aplicación muestra el usuario activo y permite cerrar sesión. |
| `/` | Landing pública con acceso al formulario de ingreso. |
| `/dashboard` | Inicio privado y resumen operativo. Es el destino después de ingresar. |
| `/plants` | Listado y búsqueda de plantas, ficha lateral y acceso a edición. |
| `/plants/new` y `/plants/:id/edit` | Identidad botánica, características, imágenes cenital y de corte, y proveedores con precio y observaciones por vínculo. |
| `/clients` y `/providers` | Directorios con alta, edición y eliminación de terceros filtrados por tipo. |
| `/settings`, `/catalogos` y `/caracteristicas` | Acceso a configuración, gestión de catálogos y gestión de campos botánicos con sus opciones. |

`/images` contiene una vista informativa fuera del menú. La gestión efectiva de imágenes está en el editor de planta. Los precios se editan por planta y proveedor desde ese mismo editor, mientras que el directorio de proveedores administra los contactos. Los módulos de proyectos, insumos, servicios o mano de obra, presupuestos y lienzo de diseño están pendientes.

La landing no consulta la sesión. Si abres una pantalla privada sin sesión, la aplicación te envía a `/login`. Si abres el login con una sesión activa, te lleva a `/dashboard`. El ícono de salida del encabezado se desactiva durante el cierre y, al confirmarse, la aplicación vuelve a `/login`.

La [landing comercial](../Landing/README.md) vive en la carpeta hermana `Landing/`. Vite compila sus componentes y recursos junto con el frontend. Conserva ambas carpetas en el checkout de compilación. GSAP y ScrollTrigger se instalan con las dependencias del frontend y se cargan al montar la landing.

El interruptor de tema está en el login y en el encabezado privado. La paleta se aplica a todo el documento, incluida la landing. Al principio sigue la preferencia del sistema. Después de elegir un tema, el navegador lo guarda en `localStorage` bajo la clave `paisajista-theme`.

## Organización e integración

- `src/App.tsx` define navegación y validación de sesión. `src/pages/` contiene pantallas y `src/components/` los componentes por módulo.
- `services/api/SessionService.ts` obtiene el token CSRF, abre y cierra sesión y consulta al usuario. Laravel conserva la sesión en una cookie. Al recargar, el frontend vuelve a consultar la sesión antes de renderizar el área de trabajo.
- `services/api/BaseApiService.ts` añade la cabecera CSRF a las peticiones de negocio, extrae los datos de la respuesta y gestiona errores. Una respuesta `401` de negocio redirige a `/login`.
- `services/api/PlantaService.ts` envía la ficha con imágenes y proveedores como multipart. Para editar usa `POST` con `_method=PUT`. La lista de proveedores enviada reemplaza la lista vigente.

## Compilación y publicación

```bash
npm run lint
npm run build
```

`npm run build` comprueba TypeScript y genera `dist/`. Sirve ese directorio por HTTPS y configura el fallback de la SPA a `index.html` para rutas como `/login` y `/plants/1/edit`. Antes del fallback, reenvía `/api/*` a Laravel bajo el mismo origen y preserva las cookies. Enruta también `/storage/*` si las URLs públicas de imágenes usan ese origen. El proxy de Vite solo configura el servidor de desarrollo.

Si falla el login en local, comprueba que el backend responde en el puerto 8000 y que `/api/csrf-token` devuelve JSON y establece la cookie de sesión. Un `419` apunta a un token desactualizado o a que la cookie no vuelve al servidor. Si las fichas cargan pero las imágenes no, revisa la URL generada por Laravel y su enlace `public/storage`.
