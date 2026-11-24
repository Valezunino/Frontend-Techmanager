# Guía de Inicio y Proyecto Base: Angular 22 + Spring Boot (con JWT y PostgreSQL)

Paso a paso para levantar este proyecto base en **Angular 22** (o crear el tuyo desde cero), configurado para conectarse con un backend en **Spring Boot + Spring Security (JWT) + PostgreSQL** en `http://localhost:8000`, con toda la arquitectura separada en `core/` y `features/`.

> 📚 **Material teórico incluido:** Revisá el archivo [**`GUIA_CONCEPTOS.md`**](./GUIA_CONCEPTOS.md) en este mismo repositorio para ver la explicación detallada de cada concepto haciendo el paralelismo directo con Spring Boot.

---

## 1. Requerimientos

Antes de arrancar, tenés que tener instalado sí o sí:

- **Node.js**: Versión LTS (`v20.x`, `v22.x`, `v24.x` o superior).
  - Chequeá la versión:
    ```bash
    node -v
    ```
- **Gestor de paquetes (`pnpm` o `npm`)**:
  - Si usás **pnpm** (recomendado por velocidad):
    ```bash
    pnpm -v
    # Si no lo tenés: npm install -g pnpm@latest
    ```
  - O podés usar **npm** que ya viene instalado con Node.js (`npm -v`).
- **Git**: Para clonar y subir tus cambios.
  ```bash
  git --version
  ```
- **Backend Spring Boot**: Tu API de Spring Boot + PostgreSQL (configurada por defecto en este proyecto apuntando a `http://localhost:8000`).

---

## 2. Aclaración clave sobre SSR y Spring Boot

**Tener backend en Spring Boot NO te obliga a meter SSR (Server-Side Rendering).**

- **¿Qué es SSR?** Levanta un servidor intermedio en **Node.js** que renderiza el HTML antes de mandarlo al navegador. Sirve casi exclusivamente si necesitás **SEO** (que Google indexe tus páginas) o redes sociales (previews de links), como en un e-commerce o una landing pública.
- **¿Qué pasa con Spring Boot?** Tu backend en Java ya maneja la lógica de negocio, base de datos y expone endpoints REST (JSON).
  - Si tu proyecto es un panel, sistema de gestión, dashboard o app detrás de login: **Poné que NO a SSR**. Te ahorrás desplegar un server Node.js al cuete además del server de Spring Boot.
  - Si es una página pública que necesita SEO sí o sí: **Poné que SÍ a SSR**. En ese caso Angular te genera `server.ts` y `app.config.server.ts` para que Node.js haga el pre-renderizado.

---

## 3. Cómo Levantar este Proyecto por Primera Vez (con Live-Reload)

### Opción A: Si clonaste este repositorio base

1. **Entrá a la carpeta del proyecto:**
   ```bash
   cd angular
   ```
2. **Instalá las dependencias (solo la primera vez):**
   ```bash
   pnpm install
   # (o `npm install`)
   ```
3. **Levantá el servidor de desarrollo con Live-Reload:**
   ```bash
   pnpm start
   # (o `npm start`)
   ```
4. **Abrilo en el navegador:**
   👉 **`http://localhost:4200`**

> 🔄 **¿Cómo funciona el Live-Reload?**
> Mientras la terminal esté corriendo con `pnpm start` o `npm start`, **no necesitás apagar ni volver a prender el servidor**. Cada vez que guardes (`Ctrl + S`) un archivo `.ts`, `.html` o `.css`, Angular recompila en milisegundos y refresca el navegador automáticamente.

---

### Opción B: Si querés crear un proyecto nuevo desde cero con Angular CLI

Si en lugar de clonar este repo querés generar uno limpio por tu cuenta:

```bash
pnpm dlx @angular/cli@22 new mi-proyecto --package-manager=pnpm
```
Cuando el CLI te pregunte:
- **Formato de estilos**: Elegí `CSS` o `SCSS`.
- **SSR / Prerendering**: Poné **`N`** (No) para una SPA estándar conectada a Spring Boot.

---

## 4. Conexión con el Backend Spring Boot y Autenticación JWT

Este proyecto ya trae implementada y lista para reutilizar toda la conexión con Spring Boot y Spring Security (JWT).

### A. Configurar el Puerto y evitar bloqueos de CORS

Por defecto, en [`src/environments/environment.development.ts`](./src/environments/environment.development.ts) la URL base apunta a `http://localhost:8000`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000'
};
```
*(Si tu Spring Boot corre en el puerto `8080` o tus rutas empiezan con `/api/v1`, solo cambialo en esa línea).*

Para que el navegador no te bloquee por **CORS** al comunicarte entre `localhost:4200` (Angular) y `localhost:8000` (Spring Boot), tenés dos caminos:

#### Camino 1: Habilitar `@CrossOrigin` o `CorsConfigurationSource` en Spring Boot
En tus Controllers de Java agregás:
```java
@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductoController { ... }
```

#### Camino 2: Usar el Proxy de Desarrollo de Angular (`proxy.conf.json`)
En la raíz del proyecto tenés el archivo [`proxy.conf.json`](./proxy.conf.json):
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```
Si levantás Angular con `pnpm run start:proxy` (o `npm run start:proxy`) y ponés `apiUrl: '/api'`, Angular redirige las llamadas internamente al puerto 8000 sin que el navegador aplique bloqueo CORS.

---

### B. Habilitar `HttpClient` y el Interceptor JWT en [`src/app/app.config.ts`](./src/app/app.config.ts)

En Angular 22 (Standalone) registramos el cliente HTTP con `withFetch()` y le conectamos nuestro `jwtInterceptor`:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor]) // Inyecta el token en las peticiones a Spring Boot
    )
  ]
};
```

---

### C. Interceptor para Spring Security (JWT) en [`src/app/core/interceptors/jwt.interceptor.ts`](./src/app/core/interceptors/jwt.interceptor.ts)

Este interceptor funcional revisa antes de cada petición HTTP si hay un token guardado en `localStorage`. Si existe, clona la request y le inyecta el header `Authorization: Bearer <token>`:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
```

---

### D. Servicio de Autenticación y Pantalla de Login (`AuthService` + `LoginComponent`)

- **[`src/app/core/models/auth.model.ts`](./src/app/core/models/auth.model.ts)**: Define `LoginRequest` (`email`, `password`) y `LoginResponse` (`token`, `rol`). Si en tu backend de Spring Boot el DTO pide `dni` y `contrasena` o devuelve `accessToken`, solo adaptás esta interfaz.
- **[`src/app/core/services/auth.service.ts`](./src/app/core/services/auth.service.ts)**:
  - `login(credenciales)`: Hace `POST http://localhost:8000/auth/login` y guarda automáticamente el JWT recibido en `localStorage.setItem('token', respuesta.token)`.
  - `loginDePrueba()`: Genera un JWT simulado para que puedas probar en el navegador (F12 &rarr; pestaña *Network*) cómo el `jwtInterceptor` envía el header `Authorization: Bearer ...` aún cuando el backend no esté prendido.
  - `logout()`: Borra el token de `localStorage`.
- **[`src/app/core/guards/auth.guard.ts`](./src/app/core/guards/auth.guard.ts)**: Guard listo para agregar en `app.routes.ts` (`canActivate: [authGuard]`) si querés impedir que entren a una ruta sin haber iniciado sesión.

---

### E. Ejemplo Práctico Incluido: Productos y Categorías

El proyecto incluye un flujo completo adaptable a cualquier entidad de tu backend:
1. **Modelos**:
   - [`Producto`](./src/app/core/models/producto.model.ts): `id`, `nombre`, `descripcion`, `costo`, `precio`, `categoria` (ID de la tabla categoría) y `ultimaModificacion`.
   - [`Categoria`](./src/app/core/models/categoria.model.ts): `id` y `nombre`.
2. **Servicios**:
   - [`ProductoService`](./src/app/core/services/producto.service.ts): `obtenerProductos()` (`GET /productos`) y `crearProducto()` (`POST /productos`).
   - [`CategoriaService`](./src/app/core/services/categoria.service.ts): `obtenerCategorias()` (`GET /categorias`).
3. **Pantallas (Componentes)**:
   - [`ProductoListaComponent`](./src/app/features/productos/producto-lista/producto-lista.component.ts) (`/productos`): Muestra la tabla de productos cruzando el ID de categoría con su nombre, y permite previsualizar datos de prueba (Mock) si el backend está apagado.
   - [`ProductoFormularioComponent`](./src/app/features/productos/producto-formulario/producto-formulario.component.ts) (`/productos/nuevo`): Formulario con `[(ngModel)]` y `<select>` de categorías para dar de alta un producto vía `POST`.
   - [`LoginComponent`](./src/app/features/auth/login/login.component.ts) (`/login`): Pantalla para iniciar sesión contra Spring Security o generar un token JWT de prueba.

---

## 5. Estructura del Scaffolding (Dónde va cada cosa)

Con la integración de Spring Boot y Angular 22 (Standalone), la estructura ordenada del proyecto queda así:

```text
angular/
├── .vscode/                   # Ajustes recomendados para VS Code
├── public/                    # Archivos estáticos (favicon, imágenes)
├── src/                       # Todo el código fuente de la aplicación
│   ├── app/
│   │   ├── core/              # Código transversal de instancia única (Singleton)
│   │   │   ├── guards/        # Protección de rutas (auth.guard.ts)
│   │   │   ├── interceptors/  # Interceptor HTTP que inyecta el JWT (jwt.interceptor.ts)
│   │   │   ├── models/        # Interfaces de datos de Spring Boot (producto, categoria, auth)
│   │   │   └── services/      # Servicios HTTP (auth.service.ts, producto.service.ts, categoria.service.ts)
│   │   │
│   │   ├── features/          # Pantallas y vistas divididas por módulo funcional
│   │   │   ├── auth/
│   │   │   │   └── login/     # Pantalla de Login JWT (.ts, .html, .css)
│   │   │   └── productos/
│   │   │       ├── producto-lista/      # Tabla de productos (.ts, .html, .css)
│   │   │       └── producto-formulario/ # Formulario de alta POST (.ts, .html, .css)
│   │   │
│   │   ├── app.ts             # Componente raíz (Standalone)
│   │   ├── app.html           # Barra de navegación superior, <router-outlet /> y pie
│   │   ├── app.css            # Estilos del layout principal
│   │   ├── app.config.ts      # Providers globales (provideRouter, provideHttpClient + jwtInterceptor)
│   │   └── app.routes.ts      # Definición de rutas (/login, /productos, /productos/nuevo)
│   │
│   ├── environments/          # Variables de entorno (URL del backend en localhost:8000)
│   │   ├── environment.development.ts
│   │   └── environment.ts
│   ├── index.html             # HTML base donde se monta la app (<app-root>)
│   ├── main.ts                # Punto de entrada que levanta la app en el navegador
│   └── styles.css             # Estilos globales de la aplicación
├── angular.json               # Configuración central del CLI de Angular
├── GUIA_CONCEPTOS.md          # Explicación teórica para alumnos (paralelismo con Spring Boot)
├── package.json               # Dependencias y scripts
├── proxy.conf.json            # Configuración de proxy opcional para desarrollo local
└── README.md                  # Esta guía de inicio
```

---

## 6. Comandos que vas a usar en el día a día

| Comando (con `pnpm` o `npm`) | Para qué sirve |
| :--- | :--- |
| `pnpm start` / `npm start` | Levanta el servidor local en `http://localhost:4200` con Live-Reload. |
| `pnpm run start:proxy` / `npm run start:proxy` | Levanta el servidor local usando `proxy.conf.json`. |
| `pnpm run build` / `npm run build` | Compila todo para producción en la carpeta `dist/`. |
| `pnpm test` / `npm test` | Corre los tests unitarios. |
| `npx ng generate component features/<nombre>` | Crea un componente standalone nuevo. |
| `npx ng generate service core/services/<nombre>` | Crea un servicio nuevo para pegarle a la API. |
