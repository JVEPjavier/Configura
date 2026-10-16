# Configura — dirección visual

## Propósito

Esta guía traduce la referencia visual compartida a un sistema propio para Configura. Es una dirección de diseño, no una copia de marca, composición ni contenido de la referencia.

La interfaz debe sentirse como una herramienta creativa y confiable: **sobria, tecnológica, editorial y centrada en el producto**. El contraste oscuro hace que las fotografías, decisiones de compra y datos de precio sean protagonistas.

## Principios

1. **Oscuro por defecto:** fondos azul noche profundos, no negro puro; reducen fatiga visual y dejan respirar imágenes y acentos.
2. **Una jerarquía evidente:** cada pantalla tiene una acción primaria; la tipografía, el espacio y el contraste deben dirigir hacia ella.
3. **Superficies con profundidad sutil:** paneles oscuros, bordes tenues y halos azulados. Evitar sombras negras pesadas o gradientes decorativos excesivos.
4. **Datos legibles primero:** precios, estados y opciones deben leerse en un vistazo. El adorno nunca compite con el contenido.
5. **Movimiento contenido:** transiciones cortas que confirmen una acción; sin animación continua que distraiga del configurador.

## Paleta

Los valores son tokens semánticos iniciales y se pueden ajustar tras una revisión visual en navegador.

| Token | Color | Uso |
| --- | --- | --- |
| `--background` | `#080D1B` | Fondo general azul noche. |
| `--background-raised` | `#0D1426` | Secciones amplias y navegación. |
| `--surface` | `#111B30` | Tarjetas, formularios y paneles. |
| `--surface-hover` | `#17243D` | Hover de filas, enlaces y tarjetas. |
| `--surface-strong` | `#1B2944` | Controles activos o módulos con datos. |
| `--border` | `#253654` | Bordes normales. |
| `--border-subtle` | `#1A2740` | Separadores y límites discretos. |
| `--foreground` | `#F4F7FB` | Texto principal. |
| `--muted-foreground` | `#9AA9C1` | Texto auxiliar. |
| `--primary` | `#DDEBFF` | Acción primaria sobre fondos oscuros. |
| `--primary-foreground` | `#08101F` | Texto sobre acción primaria. |
| `--accent` | `#68B8FF` | Foco, enlaces, indicadores y visualización de datos. |
| `--accent-strong` | `#2D8CFF` | Hover o énfasis del acento. |
| `--success` | `#72D6A3` | Publicado, completado y confirmaciones. |
| `--warning` | `#F4C96B` | Avisos no bloqueantes. |
| `--destructive` | `#FF8994` | Errores y acciones irreversibles. |

### Gradientes y halo

- Usar un halo radial azul frío (`#4C9CFF` con opacidad entre 8 % y 18 %) detrás de un bloque hero, una vista previa o una visualización de producto.
- El gradiente debe morir antes de llegar a texto de baja jerarquía y nunca bajar el contraste del contenido.
- No usar más de un halo relevante por viewport.

## Tipografía

- Mantener una sans serif moderna y neutra, preferentemente Geist ya disponible en el proyecto.
- Títulos: peso `600–700`, tracking ligeramente compacto (`-0.02em`); color `--foreground`.
- Etiquetas de contexto y sobrelíneas: mayúsculas, `11–12 px`, tracking amplio (`0.16–0.24em`), color `--muted-foreground`.
- Cuerpo: `14–16 px`, line-height `1.5–1.65`.
- Números de precio y métricas: usar `font-variant-numeric: tabular-nums` y un peso de `600`.

## Composición

### Estructura global

- Barra superior oscura y compacta (56–64 px), con marca a la izquierda, navegación secundaria al centro y acción de cuenta a la derecha.
- Contenido dentro de un contenedor de `max-width: 1200–1280 px`; separación horizontal de 24 px en escritorio y 16 px en móvil.
- Fondos amplios oscuros. Evitar páginas blancas aisladas: la aplicación debe tener un lenguaje continuo.
- Usar una retícula de 12 columnas en escritorio; los paneles de edición usan 7–8 columnas y la vista previa/datos 4–5 columnas.

### Jerarquía por pantalla

1. Sobrelínea o breadcrumb discreto.
2. Título y una frase breve de contexto.
3. Acción primaria visible junto al encabezado o al final del formulario, nunca ambas salvo en flujos extensos.
4. Contenido agrupado en superficies, con 24–32 px de padding.

## Componentes

### Tarjetas y paneles

- Fondo `--surface`, borde de 1 px `--border`, radio de 16–20 px.
- Sombra muy difusa sólo cuando el panel se superpone a una imagen o un halo; el borde debe resolver la mayor parte de la separación.
- Las tarjetas interactivas cambian a `--surface-hover` y elevan el borde a `--accent` con baja opacidad.

### Botones

- Primario: fondo `--primary`, texto `--primary-foreground`; sólido, sin degradado; radio 8–10 px.
- Secundario: superficie transparente/oscura con borde `--border`.
- Ghost: sin contenedor hasta hover.
- Destructivo: contorno o fondo translúcido; reservar el rojo sólido para confirmaciones explícitas.
- Todos muestran foco visible azul y una transición de 150–200 ms.

### Formularios

- Etiqueta arriba del control y ayuda breve debajo cuando aporte contexto.
- Inputs: fondo `--background-raised`, borde `--border`, radio 8–10 px; al foco, anillo `--accent` semitransparente.
- Las cargas de archivo son tarjetas clickeables con icono, instrucción y estado del archivo; nunca un input de archivo sin tratar.
- Los errores usan texto descriptivo bajo el campo, icono sólo como apoyo y `aria-describedby`.

### Estados y datos

- Publicado: píldora verde translúcida; borrador: píldora azul/gris.
- Precio: texto claro y grande; ajustes positivos en azul, no en rojo.
- Vacíos: icono sencillo, una frase útil y una acción primaria. No usar ilustraciones genéricas si no orientan la siguiente acción.

### Imagen de producto

- Contenedor oscuro o azul muy profundo con radio de 20–24 px y overflow oculto.
- Usar `object-fit: cover`; reservar un fallback gráfico minimalista cuando no exista imagen.
- La vista previa del editor debe permanecer visible en escritorio sin ocupar más de un tercio del ancho.

## Interacción y accesibilidad

- Contraste mínimo AA: 4.5:1 para texto normal y 3:1 para texto grande/componentes de interfaz.
- Foco visible nunca depende sólo del cambio de color: usar anillo de 2–3 px.
- Objetivos táctiles de al menos 44 × 44 px.
- Transiciones: `150–200 ms`, `ease-out`; respetar `prefers-reduced-motion`.
- Los colores de estado siempre se acompañan de texto o icono.

## Aplicación por fases

1. **Fundaciones:** migrar tokens de color, tipografía, fondos y estilos base de botón/input.
2. **Marco de aplicación:** rehacer barra superior, contenedor, navegación y cabeceras de página.
3. **Dashboard y catálogo:** tarjetas de métricas, tabla/lista de productos y estados.
4. **Editor y storefront:** paneles de configuración, vista previa, configurador, carrito y checkout.
5. **Pulido:** responsive, estados vacíos/carga/error, foco de teclado y revisión de contraste.

## Evitar

- Fondos blancos como superficie principal.
- Más de un color de acento compitiendo en una misma sección.
- Bordes gruesos, sombras pesadas o glassmorphism opaco.
- Texto gris de bajo contraste sobre fondo azul noche.
- Botones primarios repetidos dentro del mismo bloque.
- Copiar nombres, logotipos, textos o patrones de interfaz de la referencia.
