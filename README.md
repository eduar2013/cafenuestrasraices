# CafeNuestrasRaices

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Seccion de historia

El componente `src/app/cafe-history/` aparece antes del carrusel. El texto de
historia es provisional y se puede reemplazar en `cafe-history.html`, donde
tambien se configuran el iframe del reel de Instagram y su enlace alternativo.
El video se muestra dentro de la pagina; requiere que la publicacion sea publica
y permita inserciones en Instagram. Si Instagram bloquea la carga, el enlace
alternativo permite abrirlo en otra pestana.
El logo se carga desde `public/images/cafe/image.png`.
El titulo ocupa un encabezado de ancho completo. El logo aparece centrado encima
del texto, con un ancho de 128 px en escritorio y 96 px en moviles.
En pantallas grandes el logo y texto sin tarjeta ocupan la columna izquierda y
el video la derecha, ambas del mismo ancho. La columna de historia tiene una
altura minima igual al reproductor.
El fondo completo usa un degradado miel y dorado con texto cafe
para contrastar con la seccion negra anterior. En moviles los contenidos se
apilan y el texto recupera su altura natural.

## Origenes del cafe

La seccion `src/app/coffee-origins/` aparece despues de Productos y permite
seleccionar un origen en el mapa o en la lista de botones. La ficha se actualiza
sin salir de la pagina; si hay varios cafes del mismo origen, se puede elegir
entre ellos. En moviles la ficha aparece debajo del mapa.

LabrAlma de Heliconia usa los datos proporcionados por el local: Bourbon Papayo,
proceso lavado, notas de chocolate y citricos, altura de 1740 m s. n. m. y
presentaciones de 250 y 340 g. Su tueste esta por confirmar y su punto representa
la ubicacion aproximada del municipio, no una finca especifica.
Los demas cafes tienen `isExample: true` y no representan inventario real.
Edita `origins` en `coffee-origins.ts` para actualizar el catalogo del local.
Cada origen contiene coordenadas aproximadas (latitud/longitud) y al menos un
cafe con identificador unico. La fotografia actual es ilustrativa.

Para configurar una imagen por cafe, guarda su foto en `public/images/cafe/`
y agrega `image` e `imageAlt` al objeto correspondiente, por ejemplo:

```ts
image: 'images/cafe/labralma.jpg',
imageAlt: 'Cafe LabrAlma Bourbon Papayo de Heliconia',
```

La ruta no incluye `public/` y debe coincidir con un archivo existente. La imagen
se actualiza al seleccionar un cafe. Si no se configura `image`, se muestra la
fotografia ilustrativa con su etiqueta; si se omite `imageAlt`, se usa el nombre
del cafe. LabrAlma conserva la ilustracion hasta que se agregue su foto real.

El mapa SVG continental simplificado usa datos de
[Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), de dominio
publico, obtenidos de `ne_10m_admin_1_states_provinces` (Colombia). Muestra las
divisiones de los 31 departamentos continentales y Bogota D.C., con limites
simplificados. No incluye el archipielago de San Andres, Providencia y Santa
Catalina. No necesita servicios externos ni claves.
Mapa y puntos comparten una proyeccion lineal en un lienzo de 400 x 520:
`x = (longitud + 80) * 26 + 20`, `y = (13.5 - latitud) * 26 + 20`.

## Menu lateral

El componente `src/app/side-nav/` permite navegar a Inicio, Historia, Productos,
Origenes y Ubicacion mediante enlaces a secciones de la misma pagina. Se mantiene fijo
a la derecha, flotando sobre el contenido sin reservar espacio ni desplazar las
secciones, que mantienen todo el ancho disponible. En moviles usa
iniciales con nombres accesibles. El desplazamiento suave respeta la preferencia
del sistema de reducir movimiento.
El menu comienza oculto y se abre o cierra con el boton flotante. Tambien se
cierra al seleccionar un enlace o pulsar Escape dentro del menu; Escape devuelve
el foco al boton.

## Nuestros productos

La seccion del carrusel usa un fondo azul grisaceo pastel de ancho completo
(`#dce8ee`), que contrasta con los tonos verdosos de Origenes. Conserva
titulos verdes y acentos cafe para mantener la legibilidad.
Sus estilos se encuentran en `src/app/carousel/carousel.css`.

## Footer

El componente `src/app/footer/` aparece al final de la pagina. Incluye enlaces
a secciones, Instagram, Facebook y Google Maps, junto con direccion, horarios
y el ano actual. Para agregar enlaces de interes, edita la lista de
`footer.html`. Usa destinos reales; los enlaces externos llevan
`target="_blank"` y `rel="noopener noreferrer"`. El diseno se adapta de cuatro
columnas a una en moviles.

## Building
To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Publicar en GitHub Pages

El workflow de GitHub Actions en `.github/workflows/deploy-pages.yml` compila y publica la aplicación automáticamente cada vez que se actualiza `main` o `master`.

1. Crea un repositorio en GitHub y sube este proyecto.
2. En el repositorio, abre **Settings > Pages** y selecciona **GitHub Actions** como fuente de publicación.
3. Abre **Actions** para comprobar el primer despliegue. Cuando termine, la URL pública aparecerá en el resultado del workflow.

El workflow establece automáticamente la base URL con el nombre del repositorio, por ejemplo, `https://usuario.github.io/cafe-nuestras-raices/`.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
