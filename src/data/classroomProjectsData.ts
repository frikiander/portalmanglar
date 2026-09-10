import { ClassroomProject } from '../types';

/**
 * DATOS INICIALES DE PROYECTOS DE AULA (COLEGIO MANGLAR)
 * 1 Proyecto IPC y 1 Proyecto DIEV para cada grado de Primaria (1° a 6°).
 * - Proyectos DIEV: Color Oficial #FBDE18 (Amarillo Manglar)
 * - Proyectos IPC: Mantiene el color oficial de cada Grado:
 *    1er Grado: #37FE27 (Verde Neón)
 *    2do Grado: #D2E8F8 (Azul Cielo Pastel)
 *    3er Grado: #FE00FE (Magenta Eléctrico)
 *    4to Grado: #941D80 (Púrpura Ciruela)
 *    5to Grado: #5170FF (Azul Real)
 *    6to Grado: #5CE1E6 (Cian Turquesa)
 */

export const INITIAL_CLASSROOM_PROJECTS: ClassroomProject[] = [
  // =========================================================================
  // 1ER GRADO
  // =========================================================================
  {
    id: 'proj-1er-lapso1-ipc',
    type: 'IPC',
    grade: '1er Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XXIII',
    title: 'PEQUEÑOS EXPLORADORES DE LA NATURALEZA',
    purpose: 'Despertar el asombro y la curiosidad científica mediante la observación sensorial de seres vivos, plantas, insectos y fenómenos cotidianos del entorno escolar.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Presentación: ¿Qué descubrimos al observar?', content: 'Presentación lúdica del proyecto con lupas de juguete. Observación guiada en los jardines del colegio.', links: [] },
      { weekNumber: 2, title: 'Seres vivos e inertes', content: 'Diferenciación práctica entre lo que tiene vida (plantas, mascotas) y lo inerte (piedras, agua, arena).', links: [{ label: 'Guía: Seres vivos en el aula', url: 'https://manglar.edu.ve/recursos/1ro-seres-vivos' }] },
      { weekNumber: 3, title: 'Las partes de una planta', content: 'Germinación de caraotas en frascos con algodón. Registro gráfico del crecimiento de la raíz y el tallo.', links: [] },
      { weekNumber: 4, title: 'Animales de nuestro entorno', content: 'Clasificación de animales domésticos y silvestres. Características de aves, peces y mamíferos.', links: [] },
      { weekNumber: 5, title: 'Texturas, olores y sonidos naturales', content: 'Ruta sensorial con los ojos vendados para identificar hojas secas, corteza de árbol, flores y tierra húmeda.', links: [] },
      { weekNumber: 6, title: 'El agua y las burbujas mágicas', content: 'Experimento con mezclas jabonosas y tensión superficial. Observación de colores en las pompas de jabón.', links: [] },
      { weekNumber: 7, title: 'Insectos amigos: hormigas y abejas', content: 'Lectura compartida sobre el trabajo en equipo de las hormigas y el rol polinizador de las abejas.', links: [] },
      { weekNumber: 8, title: 'Bitácora del explorador: Cierre parcial', content: 'Revisión y dibujo consolidado de la planta germinada en el cuaderno de proyectos.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'El sol, el día y la noche', content: 'Cómo influye la luz solar en las plantas y en los hábitos de descanso de animales y personas.', links: [] },
      { weekNumber: 10, title: 'Cuidemos nuestro planeta', content: 'Clasificación de residuos en el patio de recreo y elaboración de juguetes con material reusable.', links: [] },
      { weekNumber: 11, title: 'Salida de campo: Jardín botánico escolar', content: 'Recorrido guiado de observación con recolección de muestras de hojas caídas.', milestone: 'Salida de Campo Pedagógica', links: [] },
      { weekNumber: 12, title: 'Evaluaciones y demostración práctica', content: 'Rúbrica formativa: exposición verbal individual sobre la planta cuidada en casa.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Elaboración de murales con pintura dactilar y plastilina representando un ecosistema.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje de la Galería del Explorador', content: 'Montaje de stands en el pasillo del colegio y ensayo de las explicaciones a los visitantes.', milestone: 'Montaje de Galería Infantil' },
      { weekNumber: 15, title: 'Clausura: Expo Pequeños Exploradores', content: 'Feria interactiva abierta a las familias con demostración de germinadores y fichas botánicas.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },
  {
    id: 'proj-1er-lapso1-diev',
    type: 'DIEV',
    grade: '1er Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XXIII',
    title: 'EL JARDÍN DE LA AMABILIDAD Y LAS EMOCIONES',
    purpose: 'Favorecer el reconocimiento emocional, cultivar la empatía, el cuidado del espacio personal y el uso diario de normas de cortesía en el aula.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Bienvenidos a nuestro nuevo salón', content: 'Dinámicas de integración para conocer los nombres, gustos y colores favoritos de cada compañero.', links: [] },
      { weekNumber: 2, title: 'El termómetro de las emociones', content: 'Identificar alegría, tristeza, rabia y miedo mediante caritas ilustradas y mímica.', links: [] },
      { weekNumber: 3, title: 'Las palabras mágicas', content: 'Construcción del mural de la cortesía: Por favor, Gracias, Disculpa, Buenos días y Con permiso.', links: [] },
      { weekNumber: 4, title: 'Compartir es divertido', content: 'Juegos de mesa en parejas con turnos compartidos sin competir, fomentando la paciencia.', links: [] },
      { weekNumber: 5, title: 'La respiración de la flor y la vela', content: 'Técnica sencilla de autorregulación emocional: oler la flor y soplar la velita para calmar la molestia.', links: [] },
      { weekNumber: 6, title: 'Taller de Emociones con especialista', content: 'Sesión vivencial guiada por orientación escolar para expresar sentimientos de manera segura.', milestone: 'Taller de Expresión Emocional' },
      { weekNumber: 7, title: 'Escuchamos con orejas gigantes', content: 'Actividad de escucha atenta: no interrumpir al compañero mientras cuenta su historia favorita.', links: [] },
      { weekNumber: 8, title: 'Círculo del espacio personal', content: 'Dinámica de aros hula-hula para comprender el respeto al cuerpo propio y al de los demás.', milestone: 'Círculo del Espacio Personal' },
      { weekNumber: 9, title: 'La caja de los elogios sinceros', content: 'Cada alumno deposita un dibujo reconociendo una cualidad positiva de un amigo del salón.', links: [] },
      { weekNumber: 10, title: 'Pequeñas responsabilidades', content: 'Roles del salón: líder de fila, encargado de la biblioteca y guardián del orden ecológico.', links: [] },
      { weekNumber: 11, title: 'Día de la Familia Invitada', content: 'Jornada de cuentacuentos con padres sobre el valor del respeto en el hogar.', milestone: 'Encuentro con Familias' },
      { weekNumber: 12, title: 'Evaluaciones y charla de valores', content: 'Autoevaluación guiada: ¿Cómo he ayudado a mis compañeros este mes?', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Confección del Árbol de la Amabilidad con hojas de papel que contienen compromisos grupales.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Ensayos del Canto de la Paz', content: 'Canción colectiva con mímica y lenguaje de señas básico sobre la amistad.', milestone: 'Ensayo General' },
      { weekNumber: 15, title: 'Clausura: Festival de los Valores', content: 'Presentación del canto, entrega de diplomas de amabilidad y merienda compartida.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },

  // =========================================================================
  // 2DO GRADO
  // =========================================================================
  {
    id: 'proj-2do-lapso1-ipc',
    type: 'IPC',
    grade: '2do Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XXII',
    title: 'EL ASOMBROSO VIAJE DEL AGUA Y LOS OCÉANOS',
    purpose: 'Comprender el ciclo hidrológico, los estados de la materia, la biodiversidad marina venezolana y la importancia vital de cuidar los ríos y mares.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Presentación: ¿De dónde viene la lluvia?', content: 'Lluvia de ideas y formulación de preguntas de indagación sobre el origen del agua.', links: [] },
      { weekNumber: 2, title: 'Los tres estados del agua', content: 'Experimentos sencillos en aula con cubos de hielo, agua tibia y vaporización visible.', links: [] },
      { weekNumber: 3, title: 'El ciclo del agua en una bolsa mágica', content: 'Construcción de un modelo de evaporación y condensación pegado a las ventanas del salón.', links: [{ label: 'Experimento del ciclo del agua', url: 'https://manglar.edu.ve/ciencias/ciclo-agua-2do' }] },
      { weekNumber: 4, title: 'Mares, ríos y lagos de Venezuela', content: 'Ubicación en el mapa del Mar Caribe, Río Orinoco y Lago de Maracaibo.', links: [] },
      { weekNumber: 5, title: 'Animales marinos y arrecifes de coral', content: 'Investigación sobre tortugas marinas, delfines y la importancia de los corales del Parque Nacional Morrocoy.', links: [] },
      { weekNumber: 6, title: '¿Por qué flota un barco?', content: 'Taller de flotabilidad y densidad: objetos pesados que flotan vs livianos que se hunden.', links: [] },
      { weekNumber: 7, title: 'El agua potable y el saneamiento', content: 'Cómo llega el agua limpia a nuestros grifos y por qué debemos cerrar la llave al cepillarnos.', links: [] },
      { weekNumber: 8, title: 'Revisión de bitácoras del agua', content: 'Evaluación intermedia del cuaderno de experimentos y dibujos de hábitats marinos.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'La contaminación por plástico', content: 'Impacto de las bolsas y pitillos plásticos en las especies marinas y alternativas biodegradables.', links: [] },
      { weekNumber: 10, title: 'Filtro de agua casero', content: 'Construcción en equipos de un mini filtro con arena, grava, carbón activado y algodón.', links: [] },
      { weekNumber: 11, title: 'Visita guiada: Acuario o Museo de Ciencias', content: 'Recorrido educativo de observación de especies acuáticas nativas.', milestone: 'Salida de Campo Marina' },
      { weekNumber: 12, title: 'Evaluaciones y rúbricas mensuales', content: 'Exposición oral con maquetas individuales sobre el ciclo del agua.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Diseño del mural gigante submarino con materiales reciclados.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje del Museo del Océano', content: 'Instalación de estaciones interactivas: El Río, El Mar, El Filtro y Las Especies Marinas.', milestone: 'Montaje de Museo' },
      { weekNumber: 15, title: 'Clausura: Feria Guardianes del Agua', content: 'Exposición interactiva de maquetas y entrega del decálogo del ahorro hídrico.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },
  {
    id: 'proj-2do-lapso1-diev',
    type: 'DIEV',
    grade: '2do Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XXII',
    title: 'CONVIVENCIA Y TRABAJO EN EQUIPO: CONSTRUYENDO PUENTES',
    purpose: 'Fomentar la comunicación respetuosa, la cooperación solidaria en proyectos grupales y la resolución pacífica y reflexiva de conflictos.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Nuestras normas del aula feliz', content: 'Construcción colectiva del pacto de convivencia y firma voluntaria con huella dactilar.', links: [] },
      { weekNumber: 2, title: 'El valor de la empatía', content: 'Ponerse en los zapatos del otro: dramatización de situaciones donde alguien necesita ayuda.', links: [] },
      { weekNumber: 3, title: 'Juntos llegamos más lejos', content: 'Dinámica de la torre de bloques: construir la estructura más alta coordinando tareas.', links: [] },
      { weekNumber: 4, title: 'Aprender a escuchar sin juzgar', content: 'La ronda de la palabra: solo habla quien sostiene el micrófono simbólico.', links: [] },
      { weekNumber: 5, title: 'La sinceridad y la verdad', content: 'Lectura comentada de cuentos sobre la honestidad y por qué no debemos ocultar faltas.', links: [] },
      { weekNumber: 6, title: 'Manejo del enojo y la frustración', content: 'Técnica del semáforo: Rojo (detente), Amarillo (respira y piensa), Verde (dialoga).', milestone: 'Taller de Autorregulación' },
      { weekNumber: 7, title: 'No al bullying, sí a la inclusión', content: 'Identificar burlas hirientes y defender de manera asertiva a quien se sienta solo.', links: [] },
      { weekNumber: 8, title: 'El frasco de los agradecimientos', content: 'Registro de gestos solidarios ocurridos durante la semana en el aula.', milestone: 'Jornada de la Gratitud' },
      { weekNumber: 9, title: 'Diversidad: todos somos únicos', content: 'Celebración de nuestras diferencias de talentos, gustos musicales y tradiciones familiares.', links: [] },
      { weekNumber: 10, title: 'El perdón y la reconciliación', content: 'Aprender a pedir disculpas con el corazón y reparar el daño causado.', links: [] },
      { weekNumber: 11, title: 'Actividad solidaria comunitaria', content: 'Campaña interna de donación de libros de cuentos para una escuela vecina.', milestone: 'Jornada Solidaria' },
      { weekNumber: 12, title: 'Evaluaciones y autoevaluación', content: 'Reflexión individual: mis fortalezas como compañero y mis compromisos de mejora.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Diseño del cancionero y afiches sobre la amistad y el trabajo en equipo.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Ensayo general de dramatizaciones', content: 'Práctica de pequeñas escenas teatrales sobre la resolución de desacuerdos.', milestone: 'Ensayo General' },
      { weekNumber: 15, title: 'Clausura: Festival de la Convivencia', content: 'Puesta en escena de los sociodramas y exposición del Mural de los Puentes Amistosos.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },

  // =========================================================================
  // 3ER GRADO
  // =========================================================================
  {
    id: 'proj-3ro-lapso1-ipc',
    type: 'IPC',
    grade: '3ro Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XXI',
    title: 'VIAJEROS EN EL TIEMPO: CIENCIA, CULTURA E INVENTOS',
    purpose: 'Investigar los grandes inventos de la humanidad, la evolución de los medios de comunicación y transporte, y aplicar el método científico experimental.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Presentación: ¿Cómo vivían antes sin electricidad?', content: 'Introducción histórica y formulación de hipótesis sobre la evolución tecnológica.', links: [] },
      { weekNumber: 2, title: 'La invención de la rueda y el transporte', content: 'Historia del transporte terrestre, marítimo y aéreo. Construcción de modelos con poleas.', links: [] },
      { weekNumber: 3, title: 'De las cavernas a la imprenta', content: 'Evolución de la escritura: jeroglíficos, pergaminos y la imprenta de Gutenberg.', links: [{ label: 'Línea de tiempo de la imprenta', url: 'https://manglar.edu.ve/historia/imprenta-3ro' }] },
      { weekNumber: 4, title: 'La electricidad y la bombilla de Edison', content: 'Concepto de circuito eléctrico simple con pila, cables de cobre y bombillo LED.', links: [] },
      { weekNumber: 5, title: 'Los medios de comunicación: del telégrafo a Internet', content: 'Código Morse en clase y comparación entre cartas postales y correo electrónico.', links: [] },
      { weekNumber: 6, title: 'Grandes inventores venezolanos', content: 'Vida y aportes de Jacinto Convit (vacuna lepra) y Humberto Fernández-Morán (bisturí de diamante).', links: [] },
      { weekNumber: 7, title: 'Máquinas simples en nuestra vida diaria', content: 'Palancas, planos inclinados, cuñas y tornillos. Identificación en herramientas caseras.', links: [] },
      { weekNumber: 8, title: 'Cierre Parcial: Feria de Máquinas Simples', content: 'Demostración práctica de catapultas y poleas construidas con paletas de madera.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'La fotografía y el cine', content: 'Construcción de una cámara oscura casera con caja de zapatos y papel vegetal.', links: [] },
      { weekNumber: 10, title: 'Energías que mueven al mundo', content: 'Energía eólica, solar e hidroeléctrica. Construcción de un mini molino de viento.', links: [] },
      { weekNumber: 11, title: 'Salida de campo: Museo de Transporte o Telecomunicaciones', content: 'Visita pedagógica para observar vehículos antiguos y centrales telefónicas.', milestone: 'Salida de Campo Histórica' },
      { weekNumber: 12, title: 'Evaluaciones y demostraciones', content: 'Rúbrica de exposición sobre un invento que cambió la historia humana.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Distribución de épocas históricas para los stands temáticos de la Expo Inventos.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje de la Máquina del Tiempo', content: 'Decoración de salas temáticas: Antigüedad, Revolución Industrial y Era Digital.', milestone: 'Montaje de Salas' },
      { weekNumber: 15, title: 'Clausura: Gran Exposición de Inventos', content: 'Presentación interactiva ante la comunidad con prototipos funcionales y disfraces de época.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },
  {
    id: 'proj-3ro-lapso1-diev',
    type: 'DIEV',
    grade: '3ro Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XXI',
    title: 'EL VALOR DE LA HONESTIDAD Y EL AUTOCONTROL',
    purpose: 'Desarrollar la responsabilidad ética sobre las propias acciones, la sinceridad en el ambiente escolar y estrategias efectivas de autorregulación.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: '¿Qué significa ser íntegro?', content: 'Debate grupal: hacer lo correcto incluso cuando nadie nos está mirando.', links: [] },
      { weekNumber: 2, title: 'Honestidad académica: el valor de crear lo propio', content: 'Por qué no debemos copiar tareas ni mentir sobre evaluaciones.', links: [] },
      { weekNumber: 3, title: 'El poder del autocontrol', content: 'Aprender a esperar turnos, no interrumpir y gestionar la ansiedad en el aula.', links: [] },
      { weekNumber: 4, title: 'Las consecuencias de nuestras decisiones', content: 'Árbol de causa y efecto: cómo cada acción produce una reacción positiva o negativa.', links: [] },
      { weekNumber: 5, title: 'Cuidado de las cosas ajenas', content: 'Regresar objetos prestados a tiempo y no tomar pertenencias sin permiso.', links: [] },
      { weekNumber: 6, title: 'Taller de Mediación entre Iguales', content: 'Técnicas de diálogo para calmar discusiones en los recreos.', milestone: 'Taller de Mediación' },
      { weekNumber: 7, title: 'La perseverancia: no rendirse ante el error', content: 'Ver el error como una oportunidad de aprendizaje y corregir con nobleza.', links: [] },
      { weekNumber: 8, title: 'Jornada de Reflexión y Bitácoras', content: 'Escritura introspectiva sobre situaciones donde elegimos la verdad.', milestone: 'Jornada de Ética Escolar' },
      { weekNumber: 9, title: 'El respeto al honor ajeno', content: 'Evitar chismes, rumores o burlas que dañen la reputación de otros.', links: [] },
      { weekNumber: 10, title: 'Generosidad silenciosa', content: 'Ayudar a un compañero en silencio sin esperar reconocimientos públicos.', links: [] },
      { weekNumber: 11, title: 'Conversatorio con invitados especiales', content: 'Charla con profesionales invitados sobre ética laboral y ciudadana.', milestone: 'Conversatorio Ético' },
      { weekNumber: 12, title: 'Evaluaciones y coevaluación', content: 'Evaluación grupal sobre el clima de confianza construido en el aula.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Redacción del Decálogo de la Honestidad y diseño de carteles informativos.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Ensayos del Foro Estudiantil', content: 'Preparación de ponencias cortas donde los estudiantes expresan sus reflexiones.', milestone: 'Ensayo de Ponencias' },
      { weekNumber: 15, title: 'Clausura: Foro de Ética y Valores', content: 'Presentación del Foro ante docentes y padres con entrega del Decálogo Institucional.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },

  // =========================================================================
  // 4TO GRADO
  // =========================================================================
  {
    id: 'proj-4to-lapso1-ipc',
    type: 'IPC',
    grade: '4to Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XX',
    title: 'BIODIVERSIDAD Y ECOSISTEMAS VENEZOLANOS',
    purpose: 'Investigar los biomas de Venezuela, cadenas tróficas, especies protegidas en peligro de extinción y promover la conservación ecológica activa.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Presentación: Venezuela megadiversa', content: 'Ubicación geográfica de Venezuela como uno de los países con mayor biodiversidad del planeta.', links: [] },
      { weekNumber: 2, title: 'Ecosistemas terrestres y acuáticos', content: 'Diferenciación entre bosque nublado, sabana llanera, tepuyes guayaneses y arrecifes marinos.', links: [{ label: 'Parques Nacionales de Venezuela', url: 'https://manglar.edu.ve/ciencias/parques-venezuela' }] },
      { weekNumber: 3, title: 'Cadenas y redes tróficas', content: 'Productores, consumidores primarios, secundarios y descomponedores en el bioma llanero.', links: [] },
      { weekNumber: 4, title: 'Adaptaciones sorprendentes de animales y plantas', content: 'Cómo sobreviven las especies en el desierto de los Médanos de Coro y en el páramo andino.', links: [] },
      { weekNumber: 5, title: 'Especies autóctonas amenazadas', content: 'El oso frontino, el cardenalito, la tortuga arrau y el manatí. Causas del peligro de extinción.', links: [] },
      { weekNumber: 6, title: 'El rol de los Parques Nacionales', content: 'Historia y reglamentación de El Ávila (Waraira Repano), Canaima y Morrocoy.', links: [] },
      { weekNumber: 7, title: 'Amenazas ambientales: deforestación y minería', content: 'Análisis de impacto ecológico y medidas de mitigación sostenibles.', links: [] },
      { weekNumber: 8, title: 'Cierre Parcial: Dioramas de Biomas', content: 'Presentación y coevaluación de maquetas tridimensionales elaboradas con material reciclado.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'Flora medicinal tradicional', content: 'Uso ancestral de plantas medicinales por comunidades indígenas venezolanas.', links: [] },
      { weekNumber: 10, title: 'Huella de carbono escolar', content: 'Cálculo del consumo eléctrico del colegio y propuestas para reducir el desperdicio de energía.', links: [] },
      { weekNumber: 11, title: 'Salida de campo: Parque Nacional o Reserva Forestal', content: 'Excursión pedagógica con guía biológico para identificación de aves y vegetación.', milestone: 'Salida de Campo Ecológica' },
      { weekNumber: 12, title: 'Evaluaciones y rúbricas mensuales', content: 'Prueba escrita y sustentación oral sobre ciclos biogeoquímicos y biomas.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Organización de la Eco-Feria: stands de regiones naturales (Guayana, Andes, Llanos, Costas).', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje de la Eco-Feria Verde', content: 'Instalación de gigantografías, muestras botánicas y ensayos de ponencias.', milestone: 'Montaje de Eco-Feria' },
      { weekNumber: 15, title: 'Clausura: Eco-Feria Biodiversidad Viva', content: 'Exposición interactiva abierta a toda la comunidad escolar con stands temáticos y debate ecológico.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },
  {
    id: 'proj-4to-lapso1-diev',
    type: 'DIEV',
    grade: '4to Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XX',
    title: 'RESOLUCIÓN PACÍFICA DE CONFLICTOS Y EMPATÍA',
    purpose: 'Promover el diálogo asertivo, la escucha activa, la mediación entre pares y la convivencia libre de discriminación en todos los espacios comunitarios.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: '¿Por qué surgen los desacuerdos?', content: 'Análisis de casos: cómo las diferencias de opinión pueden resolverse conversando.', links: [] },
      { weekNumber: 2, title: 'El poder de las palabras que unen', content: 'Sustituir acusaciones agresivas por comunicación en primera persona: "Yo siento que...".', links: [] },
      { weekNumber: 3, title: 'Escucha activa: comprender antes de responder', content: 'Dinámica del espejo en parejas: repetir lo que dijo el otro para validar su mensaje.', links: [] },
      { weekNumber: 4, title: 'Inclusión: cero prejuicios', content: 'Reflexión sobre estereotipos de género, apariencia o nacionalidad en juegos escolares.', links: [] },
      { weekNumber: 5, title: 'El rol del testigo valiente ante el acoso', content: 'Por qué no debemos callar ni aplaudir cuando alguien es excluido o molestado.', links: [] },
      { weekNumber: 6, title: 'Taller de Negociación Ganar-Ganar', content: 'Técnicas de mediación: cómo encontrar soluciones que beneficien a ambas partes en pugna.', milestone: 'Taller de Mediación Escolar' },
      { weekNumber: 7, title: 'Gestión emocional bajo presión', content: 'Técnicas de respiración diafragmática y pausas conscientes antes de reaccionar con ira.', links: [] },
      { weekNumber: 8, title: 'Jornada de Clima Escolar y Acuerdos', content: 'Revisión intermedia de las dinámicas del recreo y rediseño de zonas de juego cooperativo.', milestone: 'Jornada de Convivencia' },
      { weekNumber: 9, title: 'La gratitud y la generosidad comunitaria', content: 'Creación de tarjetas de agradecimiento personalizadas para el personal de apoyo y limpieza.', links: [] },
      { weekNumber: 10, title: 'Solidaridad con los más pequeños', content: 'Apadrinamiento de alumnos de 1er grado durante los recreos para enseñarles juegos compartidos.', links: [] },
      { weekNumber: 11, title: 'Cine-foro sobre tolerancia', content: 'Proyección y análisis de cortometrajes internacionales sobre empatía y amistad.', milestone: 'Cine-Foro de Valores' },
      { weekNumber: 12, title: 'Evaluaciones y rúbricas de conducta formativa', content: 'Evaluación cualitativa del progreso en resolución autónoma de conflictos.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Escritura colectiva del guion teatral: "El Puente del Entendimiento".', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Ensayos teatrales con escenografía', content: 'Ensayo general de la obra con música en vivo y diseño de vestuario simbólico.', milestone: 'Ensayo General Teatral' },
      { weekNumber: 15, title: 'Clausura: Obra Teatral y Festival de la Paz', content: 'Puesta en escena de la obra ante la escuela y entrega de credenciales a los nuevos Mediadores de Paz.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },

  // =========================================================================
  // 5TO GRADO
  // =========================================================================
  {
    id: 'proj-5to-lapso1-ipc',
    type: 'IPC',
    grade: '5to Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XIX',
    title: 'EL CUERPO HUMANO: UNA MÁQUINA SORPRENDENTE',
    purpose: 'Analizar la anatomía y fisiología humana, sistemas vitales interconectados, nutrición balanceada y hábitos preventivos de salud integral.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Presentación: La maravilla de la máquina humana', content: 'Presentación del proyecto, mapas conceptuales iniciales y formulación de preguntas médicas.', links: [] },
      { weekNumber: 2, title: 'Sistema óseo y muscular: soporte y movimiento', content: 'Estructura de los huesos, articulaciones y tipos de músculos. Modelo de brazo articulado con cartón.', links: [{ label: 'Atlas del cuerpo humano interactivo', url: 'https://manglar.edu.ve/anatomia/cuerpo-humano-5to' }] },
      { weekNumber: 3, title: 'Sistema circulatorio y el motor del corazón', content: 'Frecuencia cardíaca en reposo vs después de actividad física. Estructura de arterias, venas y capilares.', links: [] },
      { weekNumber: 4, title: 'Sistema respiratorio: el aliento de la vida', content: 'Mecanismo de inhalación y exhalación. Experimento de la botella con globos simulando los pulmones.', links: [] },
      { weekNumber: 5, title: 'Sistema digestivo y nutrición inteligente', content: 'Recorrido de los alimentos, absorción de nutrientes y la importancia del trompo de los alimentos.', links: [] },
      { weekNumber: 6, title: 'El sistema nervioso y los cinco sentidos', content: 'Transmisión de impulsos nerviosos por neuronas. Reflejos motores y percepción sensorial.', links: [] },
      { weekNumber: 7, title: 'El sistema inmunológico y las defensas', content: 'Glóbulos blancos, anticuerpos y la historia de las vacunas como escudo epidemiológico.', links: [] },
      { weekNumber: 8, title: 'Cierre Parcial: Modelos anatómicos en 3D', content: 'Exposición intermedia de maquetas funcionales de órganos vitales con materiales reciclados.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'Higiene del sueño y salud mental escolar', content: 'Impacto de las pantallas en el descanso nocturno y técnicas de relajación física.', links: [] },
      { weekNumber: 10, title: 'Primeros auxilios básicos', content: 'Qué hacer ante cortaduras, raspaduras, golpes o desmayos en el colegio.', links: [] },
      { weekNumber: 11, title: 'Visita guiada: Laboratorio biomédico o Universidad', content: 'Observación de células en microscopio óptico con apoyo de docentes especialistas.', milestone: 'Salida de Campo Biomédica' },
      { weekNumber: 12, title: 'Evaluaciones y sustentación científica', content: 'Examen de integración anatomofisiológica y sustentación por equipos.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Planificación de la Feria de Salud Escolar: estaciones de peso, talla, nutrición y signos vitales.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje del Hospital Didáctico', content: 'Instalación de consultorios simulados con instrumental didáctico y afiches educativos.', milestone: 'Montaje de Hospital Didáctico' },
      { weekNumber: 15, title: 'Clausura: Feria Integral de Salud y Nutrición', content: 'Jornada interactiva donde los estudiantes evalúan hábitos y brindan charlas de prevención a la comunidad.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },
  {
    id: 'proj-5to-lapso1-diev',
    type: 'DIEV',
    grade: '5to Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XIX',
    title: 'LIDERAZGO POSITIVO Y COMPROMISO CIUDADANO',
    purpose: 'Incentivar el pensamiento crítico, la toma ética de decisiones, la equidad comunitaria y la participación activa en el bienestar escolar.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: '¿Qué es un verdadero líder?', content: 'Diferencia entre mandar con autoritarismo y servir con el ejemplo inspirador.', links: [] },
      { weekNumber: 2, title: 'Pilares de la Democracia y la Ciudadanía', content: 'Derechos y deberes ciudadanos consagrados en la Constitución y convivencia escolar.', links: [] },
      { weekNumber: 3, title: 'Pensamiento crítico frente a la desinformación', content: 'Cómo verificar noticias falsas en redes sociales antes de compartirlas.', links: [] },
      { weekNumber: 4, title: 'Equidad, justicia y no discriminación', content: 'Análisis de la igualdad de oportunidades y eliminación de barreras para personas con discapacidad.', links: [] },
      { weekNumber: 5, title: 'Toma de decisiones en dilemas morales', content: 'Estudio de casos difíciles: ¿Qué harías si tu mejor amigo comete una falta grave?', links: [] },
      { weekNumber: 6, title: 'Taller de Oratoria y Debate Respetuoso', content: 'Técnicas de argumentación fundada, modulación de voz y respeto al turno del oponente.', milestone: 'Taller de Oratoria Ciudadana' },
      { weekNumber: 7, title: 'El bien común sobre el interés individual', content: 'Identificación de problemas del colegio que requieren la acción conjunta de todos.', links: [] },
      { weekNumber: 8, title: 'Jornada de Consulta y Diagnóstico Participativo', content: 'Encuesta aplicada por los alumnos sobre necesidades prioritarias del plantel.', milestone: 'Consulta Ciudadana Escolar' },
      { weekNumber: 9, title: 'Elaboración de proyectos de impacto social', content: 'Diseño de propuestas concretas: embellecimiento de áreas verdes o biblioteca viajera.', links: [] },
      { weekNumber: 10, title: 'Presupuesto y rendición de cuentas', content: 'Concepto de transparencia en el manejo de recursos compartidos en un equipo.', links: [] },
      { weekNumber: 11, title: 'Encuentro con líderes sociales de la comunidad', content: 'Conversatorio con representantes de organizaciones de voluntariado y defensa ambiental.', milestone: 'Encuentro con Líderes Sociales' },
      { weekNumber: 12, title: 'Evaluaciones y balance formativo', content: 'Rúbrica de autogestión, trabajo colaborativo y liderazgo distributivo.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Simulacro de Sesión Plenaria Infantil con redacción de acuerdos institucionales.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje del Parlamento Escolar', content: 'Organización del presídium, micrófonos y carteleras de propuestas ciudadanas.', milestone: 'Montaje de Plenaria' },
      { weekNumber: 15, title: 'Clausura: Cabildo Infantil y Compromiso Cívico', content: 'Sesión solemne de presentación de propuestas ante la Dirección del colegio y firma de compromisos.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },

  // =========================================================================
  // 6TO GRADO
  // =========================================================================
  {
    id: 'proj-6to-lapso1-ipc',
    type: 'IPC',
    grade: '6to Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XVIII',
    title: 'TECNOLOGÍA, INNOVACIÓN Y EL FUTURO DE LA MEDICINA',
    purpose: 'Investigar los avances de la biotecnología, inteligencia artificial, nanotecnología y robótica quirúrgica aplicadas al bienestar y salud humana.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'Presentación: La revolución tecnológica en la salud', content: 'Presentación del proyecto e indagación preliminar sobre el impacto de la tecnología médica.', links: [] },
      { weekNumber: 2, title: 'Línea de tiempo de los grandes hitos médicos', content: 'Desde el descubrimiento de los rayos X y los antibióticos hasta la secuenciación del genoma humano.', links: [{ label: 'Historia de la tecnología médica', url: 'https://manglar.edu.ve/ciencias/tecnologia-medicina-6to' }] },
      { weekNumber: 3, title: '¿Qué es ciencia y qué es tecnología?', content: 'Diferenciación epistemológica y cómo la ciencia se transforma en aplicaciones clínicas.', englishContent: 'Students compare scientific methods with technological inventions in modern diagnostics.', links: [] },
      { weekNumber: 4, title: 'Determinantes sociales de la salud', content: 'Factores socioambientales, acceso equitativo a medicamentos y políticas de prevención.', englishContent: 'Discussion about social determinants of health and global healthcare inequalities.', links: [] },
      { weekNumber: 5, title: 'Salud digital y dispositivos biomédicos', content: 'Sensores vestibles (wearables), monitores de glucosa continuos y telemetría.', englishContent: 'Introduction to digital health devices and remote patient monitoring.', links: [] },
      { weekNumber: 6, title: 'Telemedicina y expedientes clínicos digitales', content: 'Atención a distancia en comunidades rurales y confidencialidad de datos médicos.', links: [] },
      { weekNumber: 7, title: 'Robótica médica y cirugías asistidas', content: 'Funcionamiento del sistema quirúrgico Da Vinci y prótesis biónicas mioeléctricas.', links: [] },
      { weekNumber: 8, title: 'Revisión intermedia de bitácoras científicas', content: 'Consolidación de las fichas de investigación y autoevaluación metodológica.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'Inteligencia Artificial en el diagnóstico temprano', content: 'Algoritmos de aprendizaje profundo en radiología y detección temprana de anomalías.', links: [] },
      { weekNumber: 10, title: 'Nanotecnología y fármacos inteligentes', content: 'Nanopartículas para la liberación controlada de medicamentos en oncología.', links: [] },
      { weekNumber: 11, title: 'Salida de campo: Centro médico de alta tecnología', content: 'Visita guiada a una unidad de diagnóstico por imágenes y laboratorio automatizado.', milestone: 'Salida de Campo Médica' },
      { weekNumber: 12, title: 'Evaluaciones y defensa de monografías', content: 'Rúbrica de evaluación mensual con sustentación oral individual apoyada en diapositivas.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Diseño de prototipos interactivos y distribución de áreas temáticas para la Expo-Salud.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje del Centro de Innovación Médica', content: 'Instalación de maquetas de prótesis biónicas, pantallas interactivas y material de apoyo.', milestone: 'Montaje de Centro de Innovación' },
      { weekNumber: 15, title: 'Clausura: Congreso Escolar de Medicina del Futuro', content: 'Congreso estudiantil abierto a las familias con ponencias magistrales y demostración de prototipos.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  },
  {
    id: 'proj-6to-lapso1-diev',
    type: 'DIEV',
    grade: '6to Grado',
    lapso: '1er Lapso',
    promoCohort: 'Promo XVIII',
    title: 'IDENTIDAD, PROYECTO DE VIDA Y RESPONSABILIDAD ÉTICA',
    purpose: 'Fortalecer el autoconocimiento, la autoestima, la perseverancia, los valores de solidaridad y la preparación integral para la transición a la educación media.',
    updatedAt: '2026-09-06',
    weeks: [
      { weekNumber: 1, title: 'El camino recorrido: de 1er a 6to grado', content: 'Reflexión autobiográfica sobre los aprendizajes, amigos y metas alcanzadas en la primaria.', links: [] },
      { weekNumber: 2, title: 'Autoestima y autenticidad personal', content: 'Reconocer talentos propios, aceptar la vulnerabilidad y no ceder ante la presión de grupo.', links: [] },
      { weekNumber: 3, title: 'Manejo asertivo de las redes sociales', content: 'Huella digital responsable, prevención del ciberacoso y protección de la privacidad íntima.', links: [] },
      { weekNumber: 4, title: 'Ética y uso de la Inteligencia Artificial', content: 'Uso formativo de herramientas digitales evitando el plagio y respetando la autoría intelectual.', links: [] },
      { weekNumber: 5, title: 'Resiliencia ante el fracaso y la frustración', content: 'Historias de perseverancia: cómo los grandes deportistas y científicos superaron obstáculos.', links: [] },
      { weekNumber: 6, title: 'Taller Vocacional: Explorando pasiones', content: 'Test exploratorio de intereses y conversatorio sobre profesiones y oficios del siglo XXI.', milestone: 'Taller de Orientación Vocacional' },
      { weekNumber: 7, title: 'Relaciones afectivas sanas y respeto mutuo', content: 'Límites claros en la amistad, noviazgo temprano y comunicación libre de manipulación.', links: [] },
      { weekNumber: 8, title: 'Cápsula del tiempo de la Promo XVIII', content: 'Escritura de cartas personales dirigidas a su "yo" del futuro al graduarse de bachiller.', milestone: 'Cápsula del Tiempo' },
      { weekNumber: 9, title: 'Responsabilidad comunitaria y legado', content: 'Qué huella imborrable queremos dejar en el Colegio Manglar antes de pasar a secundaria.', links: [] },
      { weekNumber: 10, title: 'Autonomía y hábitos de estudio para bachillerato', content: 'Gestión del tiempo, técnicas de resumen y preparación para un mayor rigor académico.', links: [] },
      { weekNumber: 11, title: 'Encuentro intergeneracional con exalumnos', content: 'Panel de exalumnos del colegio compartiendo vivencias y consejos sobre la secundaria.', milestone: 'Panel con Egresados' },
      { weekNumber: 12, title: 'Evaluaciones y autoevaluación ética', content: 'Rúbrica formativa: exposición personal "Mi Proyecto de Vida en construcción".', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Diseño del anuario vivencial y recopilación de fotografías y reflexiones de la promoción.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Ensayos de la Gala de Clausura', content: 'Organización del protocolo, discursos de agradecimiento y montaje del Árbol del Legado.', milestone: 'Ensayo General de Clausura' },
      { weekNumber: 15, title: 'Clausura: Gala del Proyecto de Vida y Legado', content: 'Celebración formal con entrega de reconocimientos al esfuerzo formativo y presentación ante la comunidad.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ]
  }
];
