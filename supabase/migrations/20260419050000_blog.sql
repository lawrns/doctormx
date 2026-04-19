-- ================================================
-- BLOG SYSTEM - SEO content marketing
-- SEO parity with Doctoralia Mexico
-- ================================================

-- Blog Categories
CREATE TABLE blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  category_id uuid REFERENCES blog_categories(id),
  featured_image text,
  author_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  meta_description text,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for blog performance
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status) WHERE status = 'published';
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_featured ON blog_posts(view_count DESC) WHERE status = 'published';

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog Categories RLS - public read
CREATE POLICY "Public can view blog categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blog categories"
  ON blog_categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Blog Posts RLS
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own drafts"
  ON blog_posts FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all posts"
  ON blog_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authors can create posts"
  ON blog_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authors can update their own posts"
  ON blog_posts FOR UPDATE
  USING (author_id = auth.uid());

-- ================================================
-- SEED DATA
-- ================================================

-- Insert blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Dermatologia', 'dermatologia', 'Articulos sobre cuidado de la piel, condiciones dermatologicas y tratamientos'),
  ('Examenes Medicos', 'examenes-medicos', 'Guias sobre estudios clinicos, laboratorios y diagnosticos'),
  ('Nutricion', 'nutricion', 'Consejos de alimentacion saludable, dietas y bienestar'),
  ('Salud Mental', 'salud-mental', 'Bienestar emocional, depresion, ansiedad y cuidado psicologico'),
  ('Cardiologia', 'cardiologia', 'Salud del corazon, prevencion cardiovascular y habitos cardiacos'),
  ('Prevencion', 'prevencion', 'Tips preventivos, vacunas, chequeos y estilo de vida saludable')
ON CONFLICT (name) DO NOTHING;

-- Insert sample blog posts in Spanish with full content
INSERT INTO blog_posts (title, slug, excerpt, content, category_id, featured_image, status, published_at, meta_description, view_count, created_at, updated_at) VALUES
  (
    '10 Habitos para una Piel Saludable en el Clima Mexicano',
    'habitos-piel-saludable-clima-mexicano',
    'Descubre los mejores habitos para cuidar tu piel en Mexico, desde la proteccion solar hasta la hidratacion adecuada para cada tipo de piel.',
    '# 10 Habitos para una Piel Saludable en el Clima Mexicano

El clima variado de Mexico, desde las zonas aridas del norte hasta las tropicales del sureste, presenta retos unicos para el cuidado de la piel. La exposicion solar intensa, la contaminacion en las ciudades grandes y los cambios de humedad pueden afectar significativamente la salud de tu piel.

## 1. Proteccion Solar Diario

El protector solar no es opcional, es obligatorio. Usa un protector de al menos SPF 30 cada dia, incluso cuando este nublado. Mexico recibe radiacion UV alta durante todo el ano. Aplicalo 20 minutos antes de salir y reaplica cada 2 horas si estas al aire libre.

## 2. Hidratacion Adecuada

La deshidratacuta la piel es uno de los problemas mas comunes. Bebe al menos 2 litros de agua al dia y usa una crema hidratante adecuada a tu tipo de piel. En climas secos, elige cremas mas ricas; en zonas humedas, opta por formulaciones ligeras.

## 3. Limpieza Suave

Lava tu rostro dos veces al dia con un limpiador suave. Evita el jabon comun que puede resecar la piel. Remover el maquillaje y los contaminantes antes de dormir es fundamental para prevenir acne y envejecimiento prematuro.

## 4. Alimentacion Rica en Antioxidantes

Incluye frutas y verduras ricas en antioxidantes: guayaba, naranja, tomate, zanahoria y verduras de hoja verde. Estos alimentos combaten los radicales libres que danan las celulas de la piel.

## 5. Evita Tocarte la Cara

Las manos transportan bacterias y suciedad. Tocarte la cara frecuentemente puede provocar brotes de acne e infecciones cutaneas. Si necesitas tocarte el rostro, lava tus manos primero.

## 6. Sueno Reparador

Durante el sueno, la piel se regenera. Duerme entre 7 y 8 horas y usa productos de tratamiento nocturno. La falta de sueno se refleja en ojeras, piel opaca y mayor susceptibilidad a irritaciones.

## 7. Exfoliacion Moderada

Exfolia tu piel una o dos veces por semana para remover celulas muertas. No exagere; la exfoliacion excesiva puede danar la barrera cutanea y causar irritacion.

## 8. No Olvides el Cuello y las Manos

La piel del cuello y las manos envejece mas rapido porque es mas delgada. Aplica tus productos de cuidado facial tambien en el cuello y usa crema de manos con SPF.

## 9. Consulta al Dermatologo Anualmente

Un chequeo anual con el dermatologo puede detectar problemas tempranos, desde cancer de piel hasta condiciones cronica. En Mexico, el melanoma se detecta cada vez mas frecuentemente.

## 10. Adapta tu Rutina al Clima

En temporada de secas, prioriza la hidratacion intensa. En epoca de lluvias, controla el exceso de grasa. Si vives en la Ciudad de Mexico, la altitud y la contaminacion requieren antioxidantes adicionales.

## Conclusion

Cuidar tu piel no requiere productos caros ni rutinas complicadas. La constancia en habitos basicos hace la diferencia. Si notas cambios en tu piel - manchas nuevas, lunares que cambian o irritacion persistente - consulta a un dermatologo de inmediato.',
    (SELECT id FROM blog_categories WHERE slug = 'dermatologia'),
    '/blog/skin-care-mexico.jpg',
    'published',
    now() - interval '20 days',
    'Descubre los 10 habitos esenciales para cuidar tu piel en el clima de Mexico. Proteccion solar, hidratacion y consejos de dermatologos expertos.',
    1247,
    now() - interval '20 days',
    now() - interval '20 days'
  ),
  (
    'Guia Completa: Examenes Medicos que Debes Realizar Cada Ano',
    'examenes-medicos-anuales-guia',
    'Conoce los estudios clinicos y chequeos preventivos que los medicos recomiendan realizar anualmente segun tu edad y genero.',
    '# Guia Completa: Examenes Medicos que Debes Realizar Cada Ano

Los examenes medicos preventivos son fundamentales para detectar enfermedades en etapas tempranas cuando son mas tratables. Sin embargo, muchas personas en Mexico solo acuden al medico cuando ya presentan sintomas.

## Por que son Importantes los Chequeos Preventivos

La prevencion es la herramienta mas poderosa en medicina. Detectar una condicion como diabetes, hipertension o cancer en su etapa inicial puede marcar la diferencia entre un tratamiento simple y uno complejo.

## Examenes Basicos para Todas las Edades

### Hemograma Completo
Evalua los globulos rojos, blancos y plaquetas. Detecta anemia, infecciones y problemas de coagulacion. Se recomienda una vez al ano.

### Quimica Sanguinea
Mide glucosa, funcion renal y hepatica, y electrolitos. Especialmente importante si tienes factores de riesgo para diabetes o enfermedades metabolicas.

### Perfil Lipidico
Mide colesterol total, HDL, LDL y trigliceridos. Fundamental para evaluar el riesgo cardiovascular. Se recomienda a partir de los 20 anos.

### Examen General de Orina
Detecta infecciones urinarias, problemas renales y signos de diabetes. Simple, economico y muy informativo.

## Examenes Especificos por Edad

### 20-30 anos
- Papanicolaou (mujeres anualmente)
- Autoexploracion de senos/testiculos
- Revision de la vista cada 2 anos
- Prueba de ETS si eres sexualmente activo

### 30-40 anos
- Todos los anteriores mas:
- Electrocardiograma basal
- Prueba de funcion tiroides
- Densitometria si hay factores de riesgo

### 40-50 anos
- Mastografia (mujeres cada 1-2 anos)
- Antigeno prostatico (hombres)
- Colonoscopia cada 10 anos
- Evaluacion de riesgo cardiovascular completo

### 50+ anos
- Todos los anteriores con mayor frecuencia
- Densitometria osea (mujeres postmenopausicas)
- Evaluacion geriátrica integral
- Revision de vacunacion (neumococo, herpes zoster)

## Cuanto Cuestan los Examenes en Mexico

En instituciones publicas como el IMSS o ISSSTE, muchos de estos estudios estan cubiertos. De forma privada, un paquete basico puede costar entre 1,500 y 4,000 pesos. Es una inversion en tu salud que puede ahorrarte miles de pesos en tratamientos posteriores.

## Conclusion

No esperes a sentirte mal para hacerte chequeos medicos. La deteccion temprana salva vidas. Agenda hoy tus estudios preventivos y consulta con tu medico los resultados.',
    (SELECT id FROM blog_categories WHERE slug = 'examenes-medicos'),
    '/blog/medical-checkup-guide.jpg',
    'published',
    now() - interval '15 days',
    'Guia completa de examenes medicos preventivos que debes realizarte cada ano segun tu edad. Invertir en prevencion salva vidas.',
    892,
    now() - interval '15 days',
    now() - interval '15 days'
  ),
  (
    'Diabetes Tipo 2 en Mexico: Prevencion y Control desde la Alimentacion',
    'diabetes-tipo2-mexico-prevencion-alimentacion',
    'Mexico es uno de los paises con mayor incidencia de diabetes tipo 2. Aprende como prevenir y controlar esta enfermedad con cambios en tu dieta.',
    '# Diabetes Tipo 2 en Mexico: Prevencion y Control desde la Alimentacion

Mexico ocupa uno de los primeros lugares mundiales en prevalencia de diabetes tipo 2. Segun la ENSANUT, aproximadamente el 10.3% de la poblacion adulta padece esta enfermedad, y muchos mas la tienen sin saberlo.

## La Realidad de la Diabetes en Mexico

La diabetes tipo 2 es la principal causa de muerte en Mexico. La combinacion de factores geneticos, dieta alta en carbohidratos refinados y sedentarismo crea el escenario perfecto para esta epidemia. Sin embargo, es prevenirle y en muchos casos reversible con cambios en el estilo de vida.

## Alimentos que Debes Limitar

### Refrescos y Bebidas Azucaradas
Son la fuente numero uno de azucar added en la dieta mexicana. Un solo refresco puede contener hasta 40 gramos de azucar. Cambialos por agua natural, agua de frutas sin azucar o te sin endulzar.

### Pan Blanco y Tortilla de Harina
Los carbohidratos refinados elevan rapidamente la glucosa en sangre. Prefiere pan integral y tortilla de maize. Limita las porciones: 2-3 tortillas por comida son suficientes.

### Jugos Procesados
Aunque parezcan saludables, los jugos procesados contienen tanta azucar como los refrescos. Come la fruta entera en su lugar - la fibra ayuda a regular la absorcion de azucar.

### Frituras y Botanas
Altas en grasas trans, sodio y calorias vacias. Su consumo regular contribuye a la resistencia a la insulina.

## Alimentos que Debes Incluir

### Verduras de Hoja Verde
Espinaca, acelga, lechuga y kale son bajas en carbohidratos y ricas en vitaminas y fibra. Deben cubrir la mitad de tu plato.

### Proteina Magra
Pollo sin piel, pescado, huevos, frijoles y lentajas. La proteina ayuda a mantener estables los niveles de glucosa.

### Grasas Saludables
Aguacate, nueces, aceite de oliva y salmon. Las grasas saludables mejoran la sensibilidad a la insulina.

### Granos Integrales
Avena, arroz integral, quinoa y amaranto. Aportan fibra que regula la digestion y los niveles de azucar.

## El Plato del Bienestar

La formula es simple: la mitad de tu plato debe ser verduras, un cuarto proteina magra y un cuarto carbohidratos complejos. Agrega una porcion de grasa saludable como aguacate o aceite de oliva.

## Actividad Fisica: El Companero Indispensable

La dieta sola no es suficiente. Al menos 150 minutos de actividad fisica moderada por semana (30 minutos, 5 dias a la semana) reducen significativamente el riesgo de diabetes tipo 2 y mejoran el control glucemico en quienes ya la padecen.

## Conclusion

La diabetes tipo 2 es una epidemia en Mexico, pero esta en tus manos prevenirla o controlarla. Pequenos cambios en tu alimentacion y actividad fisica pueden tener un impacto enorme en tu salud. Consulta a un nutricologo para un plan personalizado.',
    (SELECT id FROM blog_categories WHERE slug = 'nutricion'),
    '/blog/diabetes-prevention-mexico.jpg',
    'published',
    now() - interval '10 days',
    'Mexico lidera en diabetes tipo 2. Aprende a prevenir y controlar la diabetes con cambios alimenticios. Guia completa por nutricologos.',
    1563,
    now() - interval '10 days',
    now() - interval '10 days'
  ),
  (
    'Ansiedad y Estres: Cuando Buscar Ayuda Profesional',
    'ansiedad-estres-cuando-buscar-ayuda-profesional',
    'Aprende a identificar cuando la ansiedad y el estres superan lo normal y necesitan atencion de un profesional de salud mental.',
    '# Ansiedad y Estres: Cuando Buscar Ayuda Profesional

Todos experimentamos estres y ansiedad en algun momento. Son respuestas naturales del cuerpo ante situaciones desafiantes. Sin embargo, cuando estos sentimientos se vuelven constantes, desproporcionados o interfieren con tu vida diaria, es momento de buscar ayuda profesional.

## Diferencia entre Estres Normal y Ansiedad Patologica

### Estres Normal
Es una respuesta temporal a una situacion especifica: un examen, una entrevista de trabajo, problemas familiares. Una vez que la situacion se resuelve, el estres desaparece.

### Ansiedad Patologica
Es persistente, intensa y no siempre esta ligada a una causa clara. Puede durar semanas o meses y empeorar con el tiempo. Interfiere con el sueno, la concentracion, las relaciones y el rendimiento laboral.

## Senales de que Necesitas Ayuda Profesional

### 1. Insomnio Persistente
Si no puedes dormir, te despiertas frecuentemente o te despiertas muy temprano durante mas de dos semanas, es una senal de alerta.

### 2. Ataques de Panico
Episodios repentinos de miedo intenso con sintomas fisicos como taquicardia, dificultad para respirar, sudoracion, temblor y sensacion de muerte inminente.

### 3. Evitacion de Situaciones
Si evitas lugares, personas o actividades por miedo o ansiedad, tu mundo se esta haciendo mas pequeno. Esto es caracteristico de fobias y trastorno de ansiedad generalizada.

### 4. Sintomas Fisicos Inexplicables
Dolores de cabeza frecuentes, problemas digestivos, tension muscular cronica, fatiga constante que los medicos no pueden explicar con una causa fisica.

### 5. Uso de Sustancias para Enfrentar
Si bebes alcohol, usas drogas o comes en exceso para "calmar la ansiedad", es una senal de que necesitas estrategias mas saludables.

### 6. Pensamientos Negativos Constantes
Si tu mente no para de preocuparse, anticipar lo peor o repetir pensamientos negativos, es un patron que la terapia puede modificar.

## Tipos de Ayuda Disponible

### Psicoterapia
La terapia cognitivo-conductual (TCC) es el tratamiento mas efectivo para la ansiedad. Te ensena a identificar y cambiar patrones de pensamiento negativos. Entre 12 y 20 sesiones suelen ser suficientes para resultados significativos.

### Psiquiatria
En casos moderados a severos, un psiquiatra puede recetar medicamentos que ayuden a regular la quimica cerebral. Los farmacos modernos son seguros y efectivos.

### Telemedicina
Hoy puedes consultar con un psicologo o psiquiatra desde tu casa. Las sesiones en linea son igual de efectivas que las presenciales y eliminan barreras como el tiempo de traslado o la verguenza.

## La Salud Mental en Mexico

Segun la OMS, Mexico tiene una tasa alta de trastornos de ansiedad, pero solo una de cada cuatro personas con problemas de salud mental busca ayuda. El estigma sigue siendo la principal barrera.

Buscar ayuda no es debilidad. Es la decision mas valiente e inteligente que puedes tomar por tu bienestar.

## Conclusion

Si identificas alguna de estas senales en ti o en alguien cercano, no esperes. La salud mental es tan importante como la salud fisica. Un profesional puede ayudarte a recuperar tu calidad de vida.',
    (SELECT id FROM blog_categories WHERE slug = 'salud-mental'),
    '/blog/anxiety-help.jpg',
    'published',
    now() - interval '5 days',
    'Aprende a identificar cuando la ansiedad necesita ayuda profesional. Senales de alerta, tipos de tratamiento y como acceder a terapia en Mexico.',
    976,
    now() - interval '5 days',
    now() - interval '5 days'
  ),
  (
    'Hipertension: El Enemigo Silencioso que Afecta a 1 de Cada 4 Mexicanos',
    'hipertension-enemigo-silencioso-mexico',
    'La hipertension arterial es una de las principales causas de infarto y accidente cerebrovascular en Mexico. Aprende a prevenir y control.',
    '# Hipertension: El Enemigo Silencioso que Afecta a 1 de Cada 4 Mexicanos

La hipertension arterial, conocida como la "presion alta", es una condicion en la que la fuerza de la sangre contra las paredes de las arterias es consistentemente demasiado alta. Se le llama el "enemigo silencioso" porque la mayoria de las personas no presentan sintomas hasta que ocurre un danio grave.

## Las Cifras en Mexico

Segun la Encuesta Nacional de Salud y Nutricion (ENSANUT), aproximadamente el 25% de los adultos mexicanos tienen hipertension, y casi la mitad no lo saben. Es el principal factor de riesgo para:

- Enfermedades cardiacas
- Accidentes cerebrovasculares (embolias)
- Insuficiencia renal
- Danio en la vista
- Problemas de memoria y cognicion

## Como se Mide la Presion Arterial

La presion arterial se expresa con dos numeros:

- **Presion sistolica** (el numero mayor): presion cuando el corazon late
- **Presion diastolica** (el numero menor): presion entre latidos

### Valores Normales
- Normal: menos de 120/80 mmHg
- Elevada: 120-129/80 mmHg
- Hipertension etapa 1: 130-139/80-89 mmHg
- Hipertension etapa 2: 140+/90+ mmHg

## Factores de Riesgo

### No Modificables
- Edad (riesgo aumenta despues de 45 anos)
- Antecedentes familiares
- Etnia (mas frecuente en poblacion afrodescendiente)

### Modificables (puedes cambiarlos)
- **Sobrepeso y obesidad**: Cada kilo de mas aumenta tu riesgo
- **Consumo excesivo de sodio**: Mexico consume el doble de sodio recomendado
- **Sedentarismo**: La inactividad fisica debilita el corazon
- **Consumo de alcohol**: Mas de 2 tragos al dia para hombres, 1 para mujeres
- **Tabaquismo**: El tabaco dania directamente las arterias

## 5 Pasos para Prevenir la Hipertension

### 1. Reduce el Sodio
Limita a 2,300 mg al dia (idealmente 1,500 mg). Evita alimentos procesados, enlatados y comida rapida que son las principales fuentes de sodio. Usa hierbas y especias para sazonar en lugar de sal.

### 2. Ejercicio Regular
Al menos 150 minutos de actividad aerobica moderada por semana. Caminar, nadar, andar en bicicleta o bailar son excelentes opciones. El ejercicio fortalece el corazon y mejora la circulacion.

### 3. Dieta DASH
La dieta DASH (Dietary Approaches to Stop Hypertension) enfatiza frutas, verduras, granos integrales y proteinas magras mientras reduce grasas saturadas y azucares. Ha demostrado reducir la presion arterial en solo dos semanas.

### 4. Control del Peso
Perder incluso 5 kilos puede reducir significativamente tu presion arterial. El indice de cintura tambien importa: mayor de 90 cm en hombres y 80 cm en mujeres indica mayor riesgo.

### 5. Manejo del Estres
El estres cronico eleva la presion arterial. Practica tecnicas de relajacion como respiracion profunda, meditacion o yoga. Incluso 10 minutos al dia hacen la diferencia.

## Cuando Consultar al Medico

Si tienes mas de 30 anos, mide tu presion arterial al menos una vez al ano. Si tienes factores de riesgo, cada 6 meses. Farmacias y clinicas de salud ofrecen mediciones gratuitas.

## Conclusion

La hipertension es prevenible y controlable. Conocerte tu presion arterial es el primer paso. Si ya la tienes, seguir el tratamiento medico y hacer cambios en tu estilo de vida pueden evitar complicaciones graves.',
    (SELECT id FROM blog_categories WHERE slug = 'cardiologia'),
    '/blog/hypertension-mexico.jpg',
    'published',
    now() - interval '2 days',
    'La hipertension afecta a 1 de cada 4 mexicanos y es el principal factor de riesgo cardiovascular. Aprende a prevenirla y controlarla.',
    734,
    now() - interval '2 days',
    now() - interval '2 days'
  )
ON CONFLICT (slug) DO NOTHING;
