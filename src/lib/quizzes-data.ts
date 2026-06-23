export interface QuizPregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number; // 0-indexed
  explicacion: string;
}

export interface EtapaQuiz {
  id: string;
  orden: number;
  titulo: string;
  descripcion: string;
  preguntas: QuizPregunta[];
}

export const QUIZ_ETAPAS: EtapaQuiz[] = [
  {
    id: "etapa-1",
    orden: 1,
    titulo: "Fundamentos Frontend & UI",
    descripcion: "Pon a prueba tus conocimientos sobre HTML5, CSS3, maquetación adaptiva y componentes básicos en React.",
    preguntas: [
      {
        id: "q1-1",
        pregunta: "¿Qué etiqueta HTML5 se utiliza para definir el contenido principal de un documento?",
        opciones: ["<section>", "<main>", "<content>", "<article>"],
        respuestaCorrecta: 1,
        explicacion: "La etiqueta <main> representa el contenido dominante y principal del body de un documento."
      },
      {
        id: "q1-2",
        pregunta: "¿Cuál propiedad CSS controla el espacio entre el borde de un elemento y su contenido interno?",
        opciones: ["margin", "border-spacing", "padding", "gap"],
        respuestaCorrecta: 2,
        explicacion: "La propiedad padding genera espacio dentro de los límites del elemento, mientras que margin genera espacio por fuera."
      },
      {
        id: "q1-3",
        pregunta: "En React, ¿para qué se utiliza principalmente el hook useEffect?",
        opciones: [
          "Manejar el estado del componente",
          "Referenciar directamente un elemento del DOM",
          "Ejecutar y gestionar efectos secundarios (APIs, timers, suscripciones)",
          "Memorizar valores complejos para optimizar rendimiento"
        ],
        respuestaCorrecta: 2,
        explicacion: "useEffect está diseñado para sincronizar tu componente con sistemas externos y ejecutar efectos secundarios."
      },
      {
        id: "q1-4",
        pregunta: "¿Qué clase de Tailwind se utiliza para centrar un elemento flex de forma horizontal y vertical?",
        opciones: [
          "content-center items-center",
          "justify-center items-center",
          "align-center justify-center",
          "text-center self-center"
        ],
        respuestaCorrecta: 1,
        explicacion: "En un contenedor con clase 'flex', 'justify-center' centra en el eje principal y 'items-center' en el eje transversal."
      },
      {
        id: "q1-5",
        pregunta: "En React, ¿los props de un componente son mutables?",
        opciones: [
          "Sí, el componente hijo puede cambiarlos libremente",
          "No, son de solo lectura para el componente hijo",
          "Sí, pero solo si se declaran con let",
          "Depende de si el componente es funcional o de clase"
        ],
        respuestaCorrecta: 1,
        explicacion: "En React el flujo de datos es unidireccional. Las props son de solo lectura y no deben ser modificadas por el componente que las recibe."
      },
      {
        id: "q1-6",
        pregunta: "¿Qué propiedad CSS se utiliza para cambiar el tipo de letra de un elemento?",
        opciones: ["font-style", "font-weight", "font-family", "font-type"],
        respuestaCorrecta: 2,
        explicacion: "La propiedad font-family permite especificar una lista priorizada de familias tipográficas."
      },
      {
        id: "q1-7",
        pregunta: "¿Cuál es el valor predeterminado de la propiedad position en CSS?",
        opciones: ["relative", "static", "absolute", "block"],
        respuestaCorrecta: 1,
        explicacion: "El valor por defecto es static. El elemento se posiciona de acuerdo al flujo normal del documento."
      },
      {
        id: "q1-8",
        pregunta: "En React, ¿cuál es el hook utilizado para almacenar y actualizar valores locales que causan re-renderizados?",
        opciones: ["useRef", "useMemo", "useState", "useReducer"],
        respuestaCorrecta: 2,
        explicacion: "useState nos permite añadir estado de React a componentes funcionales, provocando un re-renderizado al mutar."
      },
      {
        id: "q1-9",
        pregunta: "En HTML, ¿cuál es la diferencia principal entre id y class?",
        opciones: [
          "id debe ser único por página; class se puede repetir en múltiples elementos",
          "class debe ser único; id se puede repetir",
          "id se usa solo para estilos; class solo para JavaScript",
          "No hay diferencia, son sinónimos"
        ],
        respuestaCorrecta: 0,
        explicacion: "El atributo id identifica de manera exclusiva a un elemento dentro del DOM. Las clases agrupan elementos similares."
      },
      {
        id: "q1-10",
        pregunta: "¿Qué significa SEO en desarrollo web?",
        opciones: [
          "Secure Engine Optimization",
          "Search Engine Optimization",
          "Server External Operator",
          "Semantic Element Order"
        ],
        respuestaCorrecta: 1,
        explicacion: "SEO (optimización para motores de búsqueda) es el conjunto de técnicas para mejorar la visibilidad de una web en buscadores."
      },
      {
        id: "q1-11",
        pregunta: "¿Cuál es el orden del modelo de cajas (Box Model) de afuera hacia adentro?",
        opciones: [
          "content, padding, border, margin",
          "margin, padding, border, content",
          "margin, border, padding, content",
          "border, margin, padding, content"
        ],
        respuestaCorrecta: 2,
        explicacion: "El Box Model de CSS está compuesto por margin (exterior), border, padding (interior) y el content (contenido en el núcleo)."
      },
      {
        id: "q1-12",
        pregunta: "¿Qué hook de React permite acceder al contexto directamente?",
        opciones: ["useContext", "useReducer", "useCallback", "useContextState"],
        respuestaCorrecta: 0,
        explicacion: "useContext acepta un objeto de contexto y devuelve el valor actual provisto por el context provider correspondiente."
      },
      {
        id: "q1-13",
        pregunta: "¿Qué clase de Tailwind CSS equivale a display: grid?",
        opciones: ["display-grid", "grid-layout", "grid", "flex-grid"],
        respuestaCorrecta: 2,
        explicacion: "La clase de utilidad 'grid' en Tailwind establece el comportamiento del contenedor como cuadrícula."
      },
      {
        id: "q1-14",
        pregunta: "En React, ¿por qué es importante usar la prop key al renderizar listas?",
        opciones: [
          "Ayuda a aplicar los estilos de forma alternada",
          "Permite a React identificar qué ítems han cambiado, se han agregado o eliminado eficientemente",
          "Evita fugas de memoria en la base de datos",
          "Es un requisito estricto para poder compilar CSS"
        ],
        respuestaCorrecta: 1,
        explicacion: "Las keys ayudan a React a identificar qué elementos han cambiado, agilizando el proceso de reconciliación en el Virtual DOM."
      },
      {
        id: "q1-15",
        pregunta: "¿Qué hace flex-shrink-0 en un contenedor flexbox?",
        opciones: [
          "Evita que el elemento se encoja si el espacio del contenedor es reducido",
          "Evita que el elemento crezca más de su tamaño base",
          "Oculta el elemento en pantallas móviles",
          "Hace que el elemento tenga un ancho de cero"
        ],
        respuestaCorrecta: 0,
        explicacion: "La propiedad flex-shrink en 0 determina que el elemento mantendrá su tamaño flex base sin encogerse."
      },
      {
        id: "q1-16",
        pregunta: "¿Qué tipo de etiqueta es <a>?",
        opciones: [
          "Etiqueta de área",
          "Etiqueta de anclaje para hipervínculos",
          "Etiqueta de artículo",
          "Etiqueta para añadir imágenes"
        ],
        respuestaCorrecta: 1,
        explicacion: "El elemento <a> (anchor o anclaje) crea un enlace a otras páginas web, archivos o locaciones."
      },
      {
        id: "q1-17",
        pregunta: "En Tailwind, ¿qué clase define un padding superior e inferior de 16px (1rem)?",
        opciones: ["p-4", "px-4", "py-4", "pt-4"],
        respuestaCorrecta: 2,
        explicacion: "La clase 'py-4' aplica padding-top y padding-bottom con un valor de 1rem (16px si la base es 16px)."
      },
      {
        id: "q1-18",
        pregunta: "En React, ¿cómo evitas que un formulario recargue la página al enviarse?",
        opciones: [
          "Llamando a event.preventDefault() en el manejador onSubmit",
          "Llamando a event.stopPropagation()",
          "Retornando false al final de la función",
          "Usando una etiqueta div en lugar de form"
        ],
        respuestaCorrecta: 0,
        explicacion: "event.preventDefault() previene el comportamiento predeterminado del navegador, que sería recargar la página."
      },
      {
        id: "q1-19",
        pregunta: "¿Cuál es el propósito principal de Tailwind CSS?",
        opciones: [
          "Escribir estilos CSS dentro de archivos independientes",
          "Diseñar interfaces rápidas directamente en el HTML usando clases de utilidad atómicas",
          "Procesar variables del lado del servidor",
          "Crear animaciones complejas en 3D"
        ],
        respuestaCorrecta: 1,
        explicacion: "Tailwind es un framework orientado a utilidades para componer diseños sin salir del marcado HTML."
      },
      {
        id: "q1-20",
        pregunta: "¿Qué hace la propiedad CSS z-index?",
        opciones: [
          "Controla el nivel de zoom de un elemento",
          "Controla el orden de superposición vertical de elementos posicionados",
          "Controla el margen en el eje Z de transformaciones 3D",
          "Modifica la transparencia del color de fondo"
        ],
        respuestaCorrecta: 1,
        explicacion: "z-index define el orden del elemento en el eje Z (profundidad). Valores más altos se colocan frente a valores menores."
      }
    ]
  },
  {
    id: "etapa-2",
    orden: 2,
    titulo: "JavaScript Avanzado & Lógica",
    descripcion: "Resuelve problemas sobre contextos, arrays, asincronía, promesas, cierres (closures) y el event loop.",
    preguntas: [
      {
        id: "q2-1",
        pregunta: "¿Qué tipo de dato retorna typeof NaN?",
        opciones: ['"nan"', '"undefined"', '"number"', '"object"'],
        respuestaCorrecta: 2,
        explicacion: "NaN significa 'Not-a-Number', pero según la especificación de ECMAScript, su tipo sigue siendo numérico."
      },
      {
        id: "q2-2",
        pregunta: "¿Cuál método de array ejecuta una función por cada elemento sin retornar un nuevo array?",
        opciones: ["map()", "forEach()", "filter()", "every()"],
        respuestaCorrecta: 1,
        explicacion: "forEach() ejecuta la función indicada para cada elemento del array, pero retorna undefined."
      },
      {
        id: "q2-3",
        pregunta: "¿Cómo declaras una variable de bloque cuyo valor no se puede reasignar?",
        opciones: ["var", "let", "const", "static"],
        respuestaCorrecta: 2,
        explicacion: "const crea una referencia de solo lectura a un valor, limitando su ámbito al bloque de ejecución."
      },
      {
        id: "q2-4",
        pregunta: "¿Qué método convierte un string con formato JSON válido en un objeto JavaScript?",
        opciones: ["JSON.stringify()", "JSON.parse()", "JSON.objectify()", "JSON.toObject()"],
        respuestaCorrecta: 1,
        explicacion: "JSON.parse() analiza una cadena de texto como JSON y construye el objeto de JavaScript descrito."
      },
      {
        id: "q2-5",
        pregunta: "¿Qué estructura permite ejecutar código asíncrono como si fuera síncrono de forma más legible?",
        opciones: ["then / catch", "callbacks secuenciales", "async / await", "generators"],
        respuestaCorrecta: 2,
        explicacion: "async/await proporciona una sintaxis más limpia y legible sobre la base de las Promesas de JS."
      },
      {
        id: "q2-6",
        pregunta: "¿Qué operador se utiliza para comparar valor y tipo estrictamente?",
        opciones: ["==", "===", "=", "!="],
        respuestaCorrecta: 1,
        explicacion: "El comparador triple === no realiza coerción de tipos, validando la igualdad estricta de tipo y valor."
      },
      {
        id: "q2-7",
        pregunta: "¿Qué método de array crea un nuevo array con todos los elementos que cumplan una condición?",
        opciones: ["find()", "some()", "map()", "filter()"],
        respuestaCorrecta: 3,
        explicacion: "filter() crea un nuevo array con todos los elementos que devuelvan un valor verdadero para la prueba ejecutada."
      },
      {
        id: "q2-8",
        pregunta: "¿Qué es un closure (clausura) en JavaScript?",
        opciones: [
          "Un método para cerrar peticiones de red",
          "Una función que recuerda y accede a las variables de su ámbito externo original, incluso tras haberse ejecutado",
          "Una función autoinvocada sin variables locales",
          "Un bloque que finaliza la ejecución de un loop"
        ],
        respuestaCorrecta: 1,
        explicacion: "Los cierres se crean cada vez que una función es definida dentro de otra, capturando las variables circundantes."
      },
      {
        id: "q2-9",
        pregunta: "¿Cuál es el valor resultante de [] == ![] en JavaScript?",
        opciones: ["false", "true", "TypeError", "undefined"],
        respuestaCorrecta: 1,
        explicacion: "Debido a la coerción de tipos, ambos lados se convierten en números (0) al realizar la comparación ==."
      },
      {
        id: "q2-10",
        pregunta: "¿Qué método elimina el último elemento de un array y lo retorna?",
        opciones: ["shift()", "pop()", "unshift()", "splice()"],
        respuestaCorrecta: 1,
        explicacion: "pop() extrae el último elemento de una matriz e impacta directamente la longitud de la misma."
      },
      {
        id: "q2-11",
        pregunta: "¿Qué es el Event Loop en JavaScript?",
        opciones: [
          "El ciclo infinito que bloquea la ejecución de scripts",
          "El mecanismo que coordina la ejecución de tareas asíncronas y la cola de eventos en el hilo único de JS",
          "Una librería externa para el manejo de hilos",
          "Un comando que permite saltar errores lógicos"
        ],
        respuestaCorrecta: 1,
        explicacion: "El Event Loop vigila la pila de llamadas (Call Stack) y atiende las colas de callbacks cuando la pila está vacía."
      },
      {
        id: "q2-12",
        pregunta: "¿Qué retorna Array.isArray({})?",
        opciones: ["true", "false", "TypeError", "null"],
        respuestaCorrecta: 1,
        explicacion: "El argumento provisto es un objeto genérico {}, por ende devuelve false."
      },
      {
        id: "q2-13",
        pregunta: "¿Cuál es el propósito del operador de encadenamiento opcional ?.?",
        opciones: [
          "Hacer una consulta condicional a la DB",
          "Permitir leer el valor de una propiedad ubicada profundamente sin validar explícitamente cada nivel",
          "Realizar operaciones matemáticas avanzadas",
          "Evaluar expresiones ternarias rápidas"
        ],
        respuestaCorrecta: 1,
        explicacion: "El encadenamiento opcional detiene la evaluación y retorna undefined si una propiedad del flujo es null o undefined."
      },
      {
        id: "q2-14",
        pregunta: "¿Qué objeto permite realizar peticiones HTTP asíncronas de manera nativa en navegadores modernos?",
        opciones: ["axios", "fetch", "XMLHttpRequest", "HttpModule"],
        respuestaCorrecta: 1,
        explicacion: "La API Fetch proporciona una interfaz nativa global para acceder y manipular peticiones en la web."
      },
      {
        id: "q2-15",
        pregunta: "¿Cómo se detiene la propagación de un evento en el DOM?",
        opciones: [
          "event.preventDefault()",
          "event.stopPropagation()",
          "return false",
          "event.stopImmediatePropagation()"
        ],
        respuestaCorrecta: 1,
        explicacion: "stopPropagation() evita la propagación del evento actual a través de la fase de captura y burbujeo en el DOM."
      },
      {
        id: "q2-16",
        pregunta: "¿Qué método une todos los elementos de un array en un string separándolos por un caracter?",
        opciones: ["concat()", "split()", "join()", "merge()"],
        respuestaCorrecta: 2,
        explicacion: "join() une todos los ítems de un array en una sola cadena, usando el separador indicado por parámetro."
      },
      {
        id: "q2-17",
        pregunta: "¿Qué tipo de error se lanza cuando intentas acceder a una variable que no ha sido definida?",
        opciones: ["SyntaxError", "TypeError", "ReferenceError", "RangeError"],
        respuestaCorrecta: 2,
        explicacion: "ReferenceError indica que se ha hecho referencia a una variable inexistente en el contexto de ejecución actual."
      },
      {
        id: "q2-18",
        pregunta: "¿Qué hace el método map() en un array?",
        opciones: [
          "Filtra los elementos del array",
          "Crea una copia modificando los valores del array original sin retornar nada",
          "Retorna una nueva matriz con los resultados de la llamada a la función provista sobre cada elemento",
          "Ordena alfabéticamente la matriz"
        ],
        respuestaCorrecta: 2,
        explicacion: "map() transforma cada elemento mapeando la función recibida y genera un array nuevo con los resultados."
      },
      {
        id: "q2-19",
        pregunta: "¿Cuál es el valor de Promise.resolve(3).then(val => val * 2)?",
        opciones: ["6", "Una promesa que resuelve a 6", "undefined", "3"],
        respuestaCorrecta: 1,
        explicacion: "El encadenamiento de promesas mediante .then() siempre retorna una nueva promesa implícitamente."
      },
      {
        id: "q2-20",
        pregunta: "¿Qué método añade uno o más elementos al final de un array?",
        opciones: ["pop()", "push()", "unshift()", "shift()"],
        respuestaCorrecta: 1,
        explicacion: "push() agrega los elementos provistos al final del array y retorna su nueva longitud."
      }
    ]
  },
  {
    id: "etapa-3",
    orden: 3,
    titulo: "Backend & Base de Datos Full-Stack",
    descripcion: "Valida tu conocimiento sobre APIs REST, bases de datos relacionales, Prisma ORM, SQL, HTTP y Next.js Routing.",
    preguntas: [
      {
        id: "q3-1",
        pregunta: "¿Cuál es la diferencia principal entre los verbos HTTP GET y POST?",
        opciones: [
          "GET no puede pasar parámetros y POST sí",
          "GET solicita representación de datos del recurso; POST envía datos al servidor para crear o procesar un recurso",
          "GET es seguro y POST no lo es",
          "GET requiere autenticación y POST no"
        ],
        respuestaCorrecta: 1,
        explicacion: "GET es idempotente y seguro, sirve para consultar; POST envía datos y altera el estado del servidor."
      },
      {
        id: "q3-2",
        pregunta: "En Next.js 15, ¿cuál es el directorio utilizado para definir rutas basadas en el App Router?",
        opciones: ["pages", "src/pages", "src/app", "routes"],
        respuestaCorrecta: 2,
        explicacion: "Next.js 15 utiliza por defecto la carpeta src/app (o app) para estructurar layouts y rutas dinámicas."
      },
      {
        id: "q3-3",
        pregunta: "¿Qué es Prisma ORM?",
        opciones: [
          "Un manejador de base de datos de grafos",
          "Un mapeador objeto-relacional para interactuar con bases de datos relacionales y no-relacionales con tipado estático seguro",
          "Un middleware de autenticación por tokens",
          "Una librería para compilar estilos Tailwind"
        ],
        respuestaCorrecta: 1,
        explicacion: "Prisma permite definir esquemas declarativos en TypeScript y se comunica de forma transparente con PostgreSQL, MySQL, etc."
      },
      {
        id: "q3-4",
        pregunta: "En bases de datos relacionales, ¿qué es una Foreign Key (Clave Foránea)?",
        opciones: [
          "Una clave para encriptar la conexión",
          "Una columna o conjunto de columnas que establece un vínculo entre datos de dos tablas",
          "Una clave primaria importada de otra base de datos externa",
          "Una función que calcula índices de búsqueda"
        ],
        respuestaCorrecta: 1,
        explicacion: "La clave foránea referencia a la clave primaria (Primary Key) de otra tabla, garantizando integridad referencial."
      },
      {
        id: "q3-5",
        pregunta: "¿Qué código de estado HTTP representa que una petición se completó exitosamente y se creó un recurso?",
        opciones: ["200 OK", "201 Created", "202 Accepted", "204 No Content"],
        respuestaCorrecta: 1,
        explicacion: "El código 201 indica el éxito de la petición habiendo generado uno o más recursos nuevos."
      },
      {
        id: "q3-6",
        pregunta: "En Next.js, ¿para qué sirve el archivo middleware.ts?",
        opciones: [
          "Conectarse a la base de datos de forma directa",
          "Ejecutar lógica intermedia (autenticación, redirecciones, headers) antes de completar la petición",
          "Renderizar la UI del loader",
          "Ejecutar scripts durante el build de la app"
        ],
        respuestaCorrecta: 1,
        explicacion: "El middleware permite interceptar y modificar solicitudes y respuestas entrantes."
      },
      {
        id: "q3-7",
        pregunta: "¿Qué significa SQL?",
        opciones: [
          "Standard Query Language",
          "Structured Query Language",
          "Sequential Query Loop",
          "System Query Logic"
        ],
        respuestaCorrecta: 1,
        explicacion: "SQL (Structured Query Language) es el lenguaje estándar para administrar bases de datos relacionales."
      },
      {
        id: "q3-8",
        pregunta: "¿Cuál es el propósito de realizar hashing a las contraseñas antes de guardarlas?",
        opciones: [
          "Hacer que ocupen menos espacio en disco",
          "Proteger las contraseñas almacenándolas de forma irreversible para que no puedan ser expuestas directamente en texto plano",
          "Aumentar la velocidad de validación en el login",
          "Habilitar el autocompletado en el navegador"
        ],
        respuestaCorrecta: 1,
        explicacion: "El hashing es una función unidireccional y de un solo sentido (como bcrypt) que impide la recuperación directa del texto plano original."
      },
      {
        id: "q3-9",
        pregunta: "En PostgreSQL, ¿qué sentencia se utiliza para recuperar filas ordenadas?",
        opciones: ["SORT BY", "GROUP BY", "ORDER BY", "ARRANGE BY"],
        respuestaCorrecta: 2,
        explicacion: "ORDER BY permite ordenar los resultados en base a una o más columnas, de forma ascendente (ASC) o descendente (DESC)."
      },
      {
        id: "q3-10",
        pregunta: "¿Qué es un JWT (JSON Web Token)?",
        opciones: [
          "Un formato de base de datos no relacional",
          "Un estándar abierto utilizado para transmitir de manera segura información firmada criptográficamente en forma de objeto JSON",
          "Un protocolo de comunicación entre servidores web",
          "Un encriptador de contraseñas de un solo sentido"
        ],
        respuestaCorrecta: 1,
        explicacion: "Los JWTs se firman digitalmente para garantizar la autenticidad e integridad de la información que contienen."
      },
      {
        id: "q3-11",
        pregunta: "En Next.js, ¿cómo se define una ruta dinámica de API en el App Router?",
        opciones: [
          "Creando una carpeta [id] y colocando un archivo route.ts dentro de ella",
          "Pasando un query string ?id=valor a route.ts",
          "Colocando un archivo dynamic-route.ts",
          "Añadiéndola al array de next.config.js"
        ],
        respuestaCorrecta: 0,
        explicacion: "Carpetas entre corchetes denotan segmentos dinámicos de ruta en el sistema de enrutamiento basado en archivos de Next.js."
      },
      {
        id: "q3-12",
        pregunta: "¿Qué es CORS en desarrollo web?",
        opciones: [
          "Un enrutador dinámico de peticiones",
          "Un mecanismo de seguridad del navegador para controlar el intercambio de recursos entre distintos dominios u orígenes",
          "Una directiva de encriptación SSL",
          "Un sistema de compresión de peticiones HTTP"
        ],
        respuestaCorrecta: 1,
        explicacion: "CORS (Cross-Origin Resource Sharing) le indica al navegador si debe permitir que código JS acceda a un servidor fuera de su origen."
      },
      {
        id: "q3-13",
        pregunta: "En SQL, ¿qué cláusula se usa para filtrar registros en base a grupos creados por GROUP BY?",
        opciones: ["WHERE", "HAVING", "LIMIT", "FILTER"],
        respuestaCorrecta: 1,
        explicacion: "La cláusula HAVING se aplica después de la agrupación para filtrar los resultados de funciones agregadas."
      },
      {
        id: "q3-14",
        pregunta: "¿Cuál es el puerto predeterminado que utiliza PostgreSQL?",
        opciones: ["3306", "8080", "27017", "5432"],
        respuestaCorrecta: 3,
        explicacion: "PostgreSQL escucha tradicionalmente en el puerto TCP 5432."
      },
      {
        id: "q3-15",
        pregunta: "¿Qué significa el código HTTP 403 Forbidden?",
        opciones: [
          "El recurso solicitado no fue encontrado",
          "La sesión ha expirado temporalmente",
          "El cliente no tiene los privilegios o permisos de acceso necesarios para ver el recurso",
          "El servidor experimentó un error inesperado"
        ],
        respuestaCorrecta: 2,
        explicacion: "403 indica que el servidor entendió quién es el cliente, pero éste no cuenta con los derechos de acceso requeridos."
      },
      {
        id: "q3-16",
        pregunta: "En Prisma, ¿cómo ejecutas las migraciones para actualizar tu base de datos local en base al esquema?",
        opciones: [
          "npx prisma db push",
          "npx prisma generate",
          "npx prisma migrate dev",
          "npx prisma migrate deploy"
        ],
        respuestaCorrecta: 2,
        explicacion: "prisma migrate dev genera una migración SQL en base a los cambios de schema.prisma y la aplica en la DB de desarrollo."
      },
      {
        id: "q3-17",
        pregunta: "En REST APIs, ¿qué verbo HTTP se utiliza comúnmente para eliminar un recurso?",
        opciones: ["REMOVE", "DELETE", "POST", "DESTROY"],
        respuestaCorrecta: 1,
        explicacion: "El verbo estándar de HTTP para requerir la remoción de un recurso es DELETE."
      },
      {
        id: "q3-18",
        pregunta: "¿Qué es la inyección SQL?",
        opciones: [
          "Un comando para optimizar índices",
          "Una vulnerabilidad de seguridad que permite a atacantes insertar y ejecutar sentencias SQL maliciosas en la base de datos",
          "Un sistema de inserción rápida de registros masivos",
          "Una técnica de testing automático"
        ],
        respuestaCorrecta: 1,
        explicacion: "La inyección SQL ocurre cuando datos de entrada de usuario no saneados se concatenan directamente en sentencias SQL."
      },
      {
        id: "q3-19",
        pregunta: "En Next.js, ¿cuál es el propósito de 'use client' en la parte superior de un archivo?",
        opciones: [
          "Hacer la página pública",
          "Indicar que el componente y sus dependencias deben compilarse e interactuar exclusivamente del lado del cliente (navegador)",
          "Activar la geolocalización del usuario",
          "Indicar que la ruta es una API REST"
        ],
        respuestaCorrecta: 1,
        explicacion: "'use client' delimita la frontera del árbol de componentes que utilizará interactividad del cliente."
      },
      {
        id: "q3-20",
        pregunta: "¿Qué es una transacción de base de datos?",
        opciones: [
          "Un pago electrónico a través de APIs bancarias",
          "Una secuencia de operaciones de base de datos tratada de forma atómica (se completan todas o no se aplica ninguna)",
          "El log de auditoría del administrador",
          "Un backup automático de registros"
        ],
        respuestaCorrecta: 1,
        explicacion: "Las transacciones proveen ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad) para garantizar integridad en operaciones complejas."
      }
    ]
  }
];
