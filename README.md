
# OdontoApp - Sistema de Gestión de Agenda Médica en Tiempo Real

OdontoApp es una solución Full-Stack diseñada para profesionales de la salud que requieren una gestión dinámica, segura y eficiente de sus turnos. El sistema ofrece sincronización en tiempo real y una experiencia de usuario optimizada tanto para dispositivos móviles como para escritorio.


## 🚀 Características Principales

- **Autenticación Médica Personalizada:** Login basado en DNI y contraseña utilizando **Firebase Auth**.
- **Gestión de Turnos (CRUD Completo):** Creación, edición, visualización y eliminación de citas médicas con persistencia en **Cloud Firestore**.
- **Interfaz de Usuario High-End:** UI moderna construida con **Tailwind CSS**, animaciones fluidas mediante **Framer Motion** y navegación intuitiva.
- **Integración con WhatsApp:** Comunicación directa con el paciente, automatizando el formato de número internacional.
- **Sincronización Live:** Uso de `onSnapshot` de Firebase para reflejar cambios instantáneamente en todos los dispositivos conectados sin recargar la página.
- **Arquitectura de Datos Escalable:** Separación de colecciones entre Médicos (perfiles) y Turnos (operaciones).


## 🛠️ Stack Tecnológico

- **Frontend:** React.js (Vite)
- **Estilos:** Tailwind CSS & Lucide React (Icons)
- **Backend & DB:** Firebase (Firestore & Authentication)
- **Animaciones:** Framer Motion
- **Manejo de Fechas:** `date-fns` (Internacionalización y formateo)


## 📂 Estructura del Proyecto

El proyecto sigue una estructura modular para facilitar el mantenimiento:

```text
src/
 ├── components/
 │    ├── Auth/       # Lógica de Login (DNI-Email mapping)
 │    ├── calendar/   # Componente núcleo de la agenda y gestión de citas
 │    └── UI/         # Componentes visuales reutilizables
 ├── firebase/        # Configuración (config.js) y servicios de DB (operaciones.js)
 ├── context/         # AuthContext para manejo de estado global de sesión
 ├── hooks/           # Lógica personalizada (Custom Hooks)
 └── utils/           # Helpers de formato y validaciones
```


## ⚙️ Configuración del Entorno

Sigue estos pasos para levantar el proyecto en tu entorno local:

### Clonar el repositorio

```bash
git clone https://github.com/sebavaldivieso550/odonto-app.git
cd odonto-app
```

### Instalación de dependencias

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Firebase (obtenidas desde la consola de Firebase):

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Ejecución en modo desarrollo

```bash
npm run dev
```

---


---

## 🧩 Desafíos Técnicos Superados

- **Lógica de Calendario Dinámico:** Algoritmo personalizado para el cálculo de semanas y renderizado de celdas temporales, permitiendo una navegación fluida sin pérdida de rendimiento.
- **Seguridad y Privacidad (Firestore):** Arquitectura de datos donde el acceso está restringido por `uid`, asegurando que cada profesional acceda exclusivamente a su propia base de pacientes y turnos.
- **Optimización de UX:** Estados de carga (skeletons/spinners) y transiciones elásticas que eliminan la sensación de latencia durante las consultas a la base de datos en tiempo real.

---


---

## 👨‍💻 Desarrollado por

**Sebastian Valdivieso**