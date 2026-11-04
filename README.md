# Carta de amor interactiva · 8 meses

Una experiencia web íntima y romántica: una galaxia viva, un sobre que se abre
con delicadeza y una carta escrita para celebrar ocho meses juntos.

El proyecto está hecho **solo con HTML5, CSS3 y JavaScript vanilla**. No usa
frameworks, librerías, fuentes externas, imágenes externas ni backend. Funciona
abriendo `index.html` directamente y también en GitHub Pages.

---

## Estructura

```text
carta-de-amor/
├── index.html          → estructura de la experiencia
├── css/
│   └── styles.css      → galaxia, sobre, carta y responsive
├── js/
│   └── script.js       → estrellas, fugaces, corazones e interacción
└── README.md
```

Todas las rutas son relativas. `index.html` está en la raíz.

---

## Qué incluye

- **Galaxia animada** dibujada en `<canvas>`: tres capas de estrellas con
  parallax, polvo luminoso, destellos y estrellas fugaces ocasionales.
- **Nebulosas y banda galáctica** hechas con gradientes CSS animados.
- **Sobre de amor** construido con HTML y CSS, con sello de corazón, brillo y
  flotación suave.
- **Apertura en tres tiempos**: se abre la solapa, sale la carta, la escena se
  desvanece y comienza la lectura.
- **Carta de papel marfil** con tipografía serif, capitular, revelado gradual
  por estrofas y un saludo escrito letra a letra.
- **Poema original de doce estrofas** sobre los ocho meses, el futuro y las
  estrellas.
- **Detalles interactivos**: corazones al tocar la galaxia, contador
  «Tiempo contigo» con meses, días, horas, minutos y segundos desde el
  3 de marzo de 2026, botón para pausar o reanudar las estrellas, botones para
  volver al sobre y cierre con `Esc`.
- **Corazón final animado** y despedida romántica.
- **Accesibilidad**: navegación por teclado, textos alternativos, foco visible y
  respeto por `prefers-reduced-motion`.
- **Responsive**: pensado primero para celular, con áreas táctiles cómodas y
  desplazamiento vertical sin desbordes.

---

## Cómo verlo en tu computadora

1. Descarga o clona la carpeta completa.
2. Haz doble clic en `index.html`.

No hace falta servidor, conexión a Internet ni proceso de compilación. Todo
funciona sin conexión una vez que los archivos están en tu equipo.

> Si tu navegador bloquea alguna función por abrir el archivo con `file://`,
> puedes iniciar un servidor local opcional desde la carpeta del proyecto:
>
> ```bash
> python -m http.server 8000
> ```
>
> Y visitar `http://localhost:8000`. Esto es solo una alternativa; el proyecto
> no lo necesita para funcionar.

---

## Cómo personalizarlo

### Cambiar el poema

Abre `index.html` y busca el bloque:

```html
<div class="letter__body">
  <p class="stanza reveal">...</p>
</div>
```

Cada `<p class="stanza reveal">` es una estrofa. Conserva la clase `reveal` para
que aparezca con la animación de lectura. Usa `<br>` para separar versos.

### Cambiar nombres, fechas o la despedida

- El saludo se escribe en `js/script.js`, dentro de `typeSalutation()`, en la
  constante `text` (`"Mi amor,"`).
- El título y la fecha están en el `<header class="letter__header">` de
  `index.html`.
- La frase final y la despedida están en `.letter__quote`, `.letter__signoff` y
  `.letter__final`.

### Cambiar la fecha del contador

El contador «Tiempo contigo» toma como inicio el **3 de marzo de 2026**. Para
cambiar esa fecha, abre `js/script.js` y edita la constante `counterStart`:

```js
const counterStart = new Date(2026, 2, 3, 0, 0, 0, 0);
```

Los meses se cuentan por calendario y el resto se muestra en días, horas,
minutos y segundos. El contador se actualiza cada segundo.

### Cambiar colores y tipografía

En `css/styles.css`, dentro de `:root`, están todas las variables:

```css
--rose: #d98a9e;
--rose-deep: #a94f6c;
--gold: #c9a86a;
--ivory: #fdf8f0;
--ink: #362a3d;
```

La carta usa una pila de fuentes serif del sistema (`--serif`), por lo que no
depende de Google Fonts ni de archivos externos.

### Cambiar la velocidad del revelado

- El revelado por estrofas se controla en `js/script.js` (retardo de 85 ms por
  elemento visible) y en la transición `.reveal` de `css/styles.css`.
- La escritura del saludo usa un intervalo de 85 ms en `typeSalutation()`.

---

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en [GitHub](https://github.com/new).
2. Sube **todos** los archivos del proyecto conservando las carpetas `css/` y
   `js/`. Puedes hacerlo desde la web de GitHub o con Git:

   ```bash
   git init
   git add .
   git commit -m "Carta de amor de 8 meses"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   git push -u origin main
   ```

3. Entra al repositorio en GitHub y abre **Settings**.
4. En la barra lateral, abre **Pages**.
5. En **Build and deployment → Source**, elige **Deploy from a branch**.
6. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
7. Pulsa **Save**.
8. Espera uno o dos minutos. GitHub mostrará la URL publicada, con la forma:

   ```text
   https://TU-USUARIO.github.io/TU-REPOSITORIO/
   ```

No hay que configurar variables de entorno, compilación ni backend. El archivo
`index.html` ya está en la raíz y todas las rutas son relativas.

---

## Notas técnicas

- La galaxia se dibuja con `requestAnimationFrame` y se adapta al
  `devicePixelRatio` (limitado a 2 para cuidar el rendimiento móvil).
- Si el dispositivo prefiere movimiento reducido, la experiencia inicia en
  pausa; el botón «Reanudar estrellas» permite activarlo manualmente.
- El botón de movimiento pausa tanto el canvas como las animaciones ambientales
  de CSS.
- El sobre, el sello y el corazón están construidos con HTML/CSS/SVG en línea:
  no hay imágenes que cargar.
- El botón `Esc` también cierra la carta.

---

Hecho con amor, bajo las mismas estrellas.
