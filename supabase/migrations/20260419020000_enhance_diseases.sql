-- ================================================
-- ENHANCE DISEASES TABLE + SEED 30+ MEXICAN CONDITIONS
-- Public-facing content system for SEO parity with Doctoralia
-- ================================================

-- Add new columns to existing diseases table
ALTER TABLE diseases
  ADD COLUMN IF NOT EXISTS symptoms TEXT[],
  ADD COLUMN IF NOT EXISTS causes TEXT,
  ADD COLUMN IF NOT EXISTS treatments TEXT,
  ADD COLUMN IF NOT EXISTS prevention TEXT,
  ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0;

-- Create trigram index for search
CREATE INDEX IF NOT EXISTS idx_diseases_name_trgm ON diseases USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_diseases_popular ON diseases(popular) WHERE popular = true;
CREATE INDEX IF NOT EXISTS idx_diseases_search_count ON diseases(search_count DESC);

-- ================================================
-- SEED DATA: 38 common Mexican diseases/conditions
-- All content in Spanish for the Mexican market
-- ================================================

-- First update the 8 existing diseases with full content
UPDATE diseases SET
  description = 'La diabetes es una enfermedad metabólica crónica que se caracteriza por niveles elevados de glucosa en la sangre. En México, es una de las principales causas de morbimortalidad y afecta a millones de personas.',
  symptoms = ARRAY['Sed excesiva (polidipsia)', 'Aumento de la frecuencia urinaria', 'Hambre constante', 'Fatiga y debilidad', 'Visión borrosa', 'Pérdida de peso inexplicable', 'Heridas que tardan en sanar'],
  causes = 'La diabetes tipo 1 es causada por una reacción autoinmune que destruye las células productoras de insulina. La diabetes tipo 2 está asociada con obesidad, sedentarismo, genética y factores ambientales.',
  treatments = 'El tratamiento incluye cambios en el estilo de vida, medicación oral (metformina), insulina terapia, monitoreo regular de glucosa y control médico periódico.',
  prevention = 'Mantener un peso saludable, realizar actividad física regular, llevar una alimentación balanceada, evitar el consumo excesivo de azúcares y harinas refinadas.',
  popular = true,
  search_count = 15000
WHERE slug = 'diabetes';

UPDATE diseases SET
  description = 'La hipertensión arterial es una condición médica en la que la presión sanguínea en las arterias se mantiene elevada de forma persistente. Es un factor de riesgo importante para enfermedades cardiovasculares.',
  symptoms = ARRAY['Dolor de cabeza', 'Mareos', 'Visión borrosa', 'Zumbido en los oídos', 'Dolor en el pecho', 'Dificultad para respirar', 'Sangrado nasal'],
  causes = 'Factores de riesgo incluyen obesidad, consumo excesivo de sodio, sedentarismo, estrés, tabaquismo, consumo de alcohol y antecedentes familiares.',
  treatments = 'Modificaciones en el estilo de vida, medicamentos antihipertensivos (IECA, bloqueadores de receptores de angiotensina, diuréticos), control periódico de la presión arterial.',
  prevention = 'Reducir el consumo de sal, mantener peso saludable, ejercicio regular, limitar el consumo de alcohol, manejar el estrés y evitar el tabaco.',
  popular = true,
  search_count = 12000
WHERE slug = 'hipertension';

UPDATE diseases SET
  description = 'La migraña es un tipo de dolor de cabeza intenso y recurrente que puede causar un dolor pulsátil severo, generalmente en un lado de la cabeza. Es una condición neurológica que afecta significativamente la calidad de vida.',
  symptoms = ARRAY['Dolor de cabeza intenso y pulsátil', 'Sensibilidad a la luz y al sonido', 'Náuseas y vómitos', 'Visión borrosa o aura visual', 'Mareos', 'Fatiga extrema', 'Dificultad para concentrarse'],
  causes = 'Factores genéticos, cambios hormonales, estrés, ciertos alimentos, cambios en el patrón de sueño, estímulos sensoriales y factores ambientales.',
  treatments = 'Analgésicos y antiinflamatorios, triptanes, medicación preventiva, terapia cognitivo-conductual, cambios en el estilo de vida y identificación de desencadenantes.',
  prevention = 'Identificar y evitar desencadenantes, mantener horarios regulares de sueño, manejar el estrés, alimentación balanceada y ejercicio regular.',
  popular = true,
  search_count = 8500
WHERE slug = 'migrana';

UPDATE diseases SET
  description = 'La depresión es un trastorno del estado de ánimo que causa una sensación persistente de tristeza y pérdida de interés. Afecta cómo te sientes, piensas y manejas las actividades diarias.',
  symptoms = ARRAY['Tristeza persistente', 'Pérdida de interés en actividades', 'Cambios en el apetito', 'Insomnio o somnolencia excesiva', 'Fatiga y falta de energía', 'Sentimientos de culpa o inutilidad', 'Dificultad para concentrarse'],
  causes = 'Combinación de factores genéticos, biológicos, ambientales y psicológicos. Eventos traumáticos, estrés crónico, desequilibrios químicos cerebrales y antecedentes familiares.',
  treatments = 'Psicoterapia (terapia cognitivo-conductual), medicamentos antidepresivos, terapia interpersonal, cambios en el estilo de vida y apoyo social.',
  prevention = 'Mantener redes de apoyo social, ejercicio regular, técnicas de manejo del estrés, sueño adecuado y buscar ayuda profesional temprana.',
  popular = true,
  search_count = 10000
WHERE slug = 'depresion';

UPDATE diseases SET
  description = 'La ansiedad es una respuesta natural del cuerpo al estrés, pero cuando se vuelve excesiva y persistente puede interferir con las actividades diarias. Los trastornos de ansiedad son las enfermedades mentales más comunes.',
  symptoms = ARRAY['Nerviosismo e inquietud constante', 'Sensación de peligro inminente', 'Aumento del ritmo cardíaco', 'Respiración rápida', 'Sudoración', 'Temblores', 'Dificultad para dormir'],
  causes = 'Factores genéticos, estrés acumulado, traumas, desequilibrios químicos cerebrales, problemas de tiroides y consumo de sustancias.',
  treatments = 'Terapia cognitivo-conductual, medicamentos (ansiolíticos, ISRS), técnicas de relajación, mindfulness y cambios en el estilo de vida.',
  prevention = 'Actividad física regular, técnicas de relajación, sueño adecuado, limitar consumo de cafeína y alcohol, y manejo del estrés.',
  popular = true,
  search_count = 9000
WHERE slug = 'ansiedad';

UPDATE diseases SET
  description = 'El acné es una enfermedad cutánea inflamatoria que ocurre cuando los folículos pilosos se obstruyen con sebo y células muertas de la piel. Es muy común en adolescentes pero puede afectar a personas de todas las edades.',
  symptoms = ARRAY['Granos y espinillas', 'Puntos negros y blancos', 'Quistes y nódulos', 'Enrojecimiento de la piel', 'Piel grasa', 'Cicatrices', 'Inflamación localizada'],
  causes = 'Exceso de producción de sebo, obstrucción de folículos pilosos, bacterias Cutibacterium acnes, cambios hormonales, genética y factores ambientales.',
  treatments = 'Tratamientos tópicos (peróxido de benzoilo, retinoides), antibióticos orales, isotretinoína, procedimientos dermatológicos y skincare adecuado.',
  prevention = 'Limpieza facial diaria, evitar tocar el rostro, usar productos no comedogénicos, dieta balanceada y evitar el estrés excesivo.',
  popular = true,
  search_count = 7500
WHERE slug = 'acne';

UPDATE diseases SET
  description = 'El estrés es la respuesta del cuerpo a cualquier demanda o presión. El estrés crónico puede tener efectos negativos significativos en la salud física y mental si no se maneja adecuadamente.',
  symptoms = ARRAY['Irritabilidad y cambios de humor', 'Dificultad para concentrarse', 'Tensión muscular', 'Problemas digestivos', 'Insomnio', 'Fatiga crónica', 'Palpitaciones'],
  causes = 'Presión laboral, problemas financieros, conflictos personales, cambios importantes en la vida, sobrecarga de responsabilidades y falta de tiempo para el descanso.',
  treatments = 'Terapia psicológica, técnicas de relajación, mindfulness, ejercicio regular, medicación en casos severos y mejora del entorno laboral.',
  prevention = 'Gestión del tiempo, actividad física regular, técnicas de meditación, redes de apoyo social, hobbies y establecimiento de límites saludables.',
  popular = true,
  search_count = 7000
WHERE slug = 'estres';

UPDATE diseases SET
  description = 'El insomnio es un trastorno del sueño que se caracteriza por la dificultad para conciliar el sueño, mantenerlo o despertarse demasiado temprano. Afecta la calidad de vida y el rendimiento diario.',
  symptoms = ARRAY['Dificultad para conciliar el sueño', 'Despertarse durante la noche', 'Despertarse muy temprano', 'Fatiga diurna', 'Irritabilidad', 'Dificultad para concentrarse', 'Tensión muscular'],
  causes = 'Estrés, ansiedad, depresión, hábitos de sueño inadecuados, consumo de cafeína, medicamentos, condiciones médicas y cambios en el horario.',
  treatments = 'Terapia cognitivo-conductual para insomnio (TCC-I), higiene del sueño, medicación (zolpidem, melatonina), relajación muscular y restricción del sueño.',
  prevention = 'Mantener horario regular de sueño, ambiente oscuro y fresco, evitar pantallas antes de dormir, limitar cafeína y ejercicio regular.',
  popular = false,
  search_count = 6000
WHERE slug = 'insomnio';

-- ================================================
-- INSERT NEW DISEASES
-- ================================================

INSERT INTO diseases (name, slug, description, symptoms, causes, treatments, prevention, popular, search_count) VALUES
('Gripe', 'gripe',
 'La gripe o influenza es una infección viral aguda del sistema respiratorio que se transmite fácilmente de persona a persona. Es una de las enfermedades infecciosas más comunes en México.',
 ARRAY['Fiebre alta', 'Dolor de cabeza', 'Dolor muscular y articular', 'Congestión nasal', 'Tos seca', 'Fatiga extrema', 'Escalofríos'],
 'Virus de la influenza (tipos A, B y C). Se transmite por gotas respiratorias, contacto directo y superficies contaminadas.',
 'Reposo, hidratación, antivirales (oseltamivir), analgésicos, antipiréticos y vacunación anual.',
 'Vacunación anual, lavado frecuente de manos, evitar contacto con personas enfermas y mantener buena ventilación.',
 true, 8000),

('COVID-19', 'covid-19',
 'El COVID-19 es una enfermedad infecciosa causada por el coronavirus SARS-CoV-2. Desde 2020 ha representado un desafío importante de salud pública en México y el mundo.',
 ARRAY['Fiebre', 'Tos seca', 'Dificultad para respirar', 'Pérdida del gusto y olfato', 'Fatiga', 'Dolor de cabeza', 'Dolor de garganta'],
 'Virus SARS-CoV-2. Transmisión por gotas respiratorias, aerosoles y contacto con superficies contaminadas.',
 'Tratamiento de soporte, antivirales, oxigenoterapia en casos graves, vacunación y monitoreo de síntomas.',
 'Vacunación completa, uso de cubrebocas en espacios cerrados, lavado de manos, distanciamiento social y ventilación adecuada.',
 true, 11000),

('Asma', 'asma',
 'El asma es una enfermedad crónica de las vías respiratorias que causa inflamación y estrechamiento de los bronquios. Es muy prevalente en México, especialmente en zonas urbanas contaminadas.',
 ARRAY['Dificultad para respirar', 'Sibilancias (silbido al respirar)', 'Opresión en el pecho', 'Tos persistente', 'Fatiga al hacer ejercicio', 'Dificultad para dormir por tos', 'Respiración rápida'],
 'Factores genéticos, alergenos (ácaros, polen, moho), contaminación ambiental, infecciones respiratorias, ejercicio intenso y estrés.',
 'Inhaladores de rescate (salbutamol), inhaladores preventivos (corticosteroides), inmunoterapia, control de alergenos y plan de acción para el asma.',
 'Identificar y evitar desencadenantes, vacunación contra la gripe, controlar la exposición a alergenos, ejercicio moderado y seguimiento médico regular.',
 true, 6500),

('Gastritis', 'gastritis',
 'La gastritis es la inflamación del revestimiento del estómago que puede ser aguda o crónica. Es muy común en México debido a la dieta y al estrés.',
 ARRAY['Dolor o ardor en el estómago', 'Náuseas y vómitos', 'Sensación de plenitud', 'Pérdida de apetito', 'Eructos frecuentes', 'Dolor que empeora al comer', 'Hinchazón abdominal'],
 'Infección por Helicobacter pylori, uso excesivo de AINEs, estrés, consumo excesivo de alcohol, comida picante y tabaquismo.',
 'Inhibidores de la bomba de protones, antibióticos para H. pylori, antiácidos, cambios en la dieta y manejo del estrés.',
 'Dieta balanceada, evitar alimentos irritantes, limitar el consumo de alcohol y tabaco, manejar el estrés y no automedicarse con AINEs.',
 true, 7000),

('Anemia', 'anemia',
 'La anemia es una condición en la que el cuerpo no tiene suficientes glóbulos rojos sanos para transportar oxígeno adecuadamente a los tejidos. Es muy común en México, especialmente en mujeres y niños.',
 ARRAY['Fatiga y debilidad', 'Palidez en la piel', 'Dificultad para respirar', 'Mareos', 'Manos y pies fríos', 'Dolor de cabeza', 'Frecuencia cardíaca elevada'],
 'Deficiencia de hierro, vitamina B12 o ácido fólico, pérdida de sangre, enfermedades crónicas, embarazo y factores genéticos.',
 'Suplementos de hierro, vitamina B12 o ácido fólico según el tipo de anemia, cambios en la dieta y tratamiento de la causa subyacente.',
 'Dieta rica en hierro (carnes rojas, espinacas, leguminosas), vitamina C para absorción de hierro, evitar té y café con las comidas.',
 false, 4500),

('Obesidad', 'obesidad',
 'La obesidad es una enfermedad crónica caracterizada por una acumulación excesiva de grasa corporal. México tiene una de las tasas de obesidad más altas del mundo.',
 ARRAY['Aumento de peso significativo', 'Dificultad para realizar actividades físicas', 'Dolor articular', 'Fatiga', 'Dificultad para respirar al hacer ejercicio', 'Aumento de la circunferencia abdominal', 'Sudoración excesiva'],
 'Dieta alta en calorías y azúcares, sedentarismo, factores genéticos, problemas hormonales, medicamentos y factores psicológicos.',
 'Cambios en la alimentación, ejercicio regular, terapia conductual, medicamentos (orlistat) y cirugía bariátrica en casos severos.',
 'Alimentación balanceada, actividad física regular, limitar ultraprocesados, controlar porciones y mantener un peso saludable.',
 true, 7500),

('Dermatitis', 'dermatitis',
 'La dermatitis es una inflamación de la piel que causa enrojecimiento, picor y lesiones. Existen varios tipos como la dermatitis atópica, de contacto y seborreica.',
 ARRAY['Enrojecimiento de la piel', 'Picor intenso', 'Erupciones cutáneas', 'Piel seca y agrietada', 'Ampollas', 'Descamación', 'Hinchazón'],
 'Reacciones alérgicas, irritantes químicos, factores genéticos, estrés, clima extremo y sistema inmunológico alterado.',
 'Cremas con corticosteroides, antihistamínicos, emolientes, inmunomoduladores tópicos e identificación de desencadenantes.',
 'Hidratar la piel regularmente, evitar irritantes conocidos, usar ropa de algodón, manejar el estrés y evitar baños con agua muy caliente.',
 false, 4000),

('Infección urinaria', 'infeccion-urinaria',
 'La infección del tracto urinario es una infección bacteriana que afecta cualquier parte del sistema urinario. Es más común en mujeres y puede ser muy incómoda.',
 ARRAY['Dolor o ardor al orinar', 'Necesidad frecuente de orinar', 'Orina turbia o con sangre', 'Dolor en la parte baja del abdomen', 'Fiebre', 'Orina con mal olor', 'Sensación de no vaciar la vejiga'],
 'Bacterias (principalmente E. coli) que entran al tracto urinario, actividad sexual, uso de diafragmas, menopausia y anomalías urinarias.',
 'Antibióticos (nitrofurantoína, trimetoprima-sulfametoxazol), analgésicos urinarios, aumento de ingesta de líquidos y tratamiento de factores predisponentes.',
 'Beber suficiente agua, orinar después de relaciones sexuales, higiene adecuada, evitar retener la orina y usar ropa interior de algodón.',
 false, 5500),

('Alergias', 'alergias',
 'Las alergias son reacciones del sistema inmunológico a sustancias que normalmente son inofensivas. En México, las alergias a polen, ácaros y alimentos son muy comunes.',
 ARRAY['Estornudos frecuentes', 'Congestión nasal', 'Picor en ojos, nariz y garganta', 'Ojos llorosos y rojos', 'Erupciones cutáneas', 'Dificultad para respirar', 'Hinchazón de labios o cara'],
 'Sistema inmunológico hiperreactivo a alergenos como polen, ácaros, moho, alimentos, picaduras de insectos y medicamentos.',
 'Antihistamínicos, corticosteroides, descongestionantes, inmunoterapia (vacunas antialérgicas) y evitar alergenos.',
 'Identificar y evitar alergenos, mantener la casa limpia, usar purificadores de aire, inmunoterapia preventiva y lavar ropa de cama frecuentemente.',
 true, 5500),

('Artritis', 'artritis',
 'La artritis es la inflamación de una o más articulaciones que causa dolor y rigidez. Puede afectar personas de todas las edades y empeorar con el tiempo.',
 ARRAY['Dolor articular', 'Rigidez matutina', 'Hinchazón articular', 'Enrojecimiento alrededor de la articulación', 'Dificultad de movimiento', 'Calor en la articulación', 'Deformidad articular en casos avanzados'],
 'Enfermedades autoinmunes (artritis reumatoide), desgaste del cartílago (osteoartritis), infecciones, factores genéticos y edad avanzada.',
 'Antiinflamatorios, corticosteroides, medicamentos modificadores de la enfermedad, fisioterapia, ejercicio terapéutico y cirugía en casos avanzados.',
 'Mantener un peso saludable, ejercicio regular, proteger las articulaciones, evitar el tabaco y controles médicos periódicos.',
 false, 5000),

('Bronquitis', 'bronquitis',
 'La bronquitis es la inflamación del revestimiento de los bronquios que transportan aire a los pulmones. Puede ser aguda o crónica y es común durante la temporada de frío.',
 ARRAY['Tos con flema', 'Dificultad para respirar', 'Dolor en el pecho', 'Fatiga', 'Fiebre baja', 'Sibilancias', 'Congestión nasal'],
 'Infecciones virales o bacterianas, exposición a humo y contaminación, reflujo gastroesofágico y exposición a irritantes laborales.',
 'Descanso, hidratación, antibióticos si es bacteriana, broncodilatadores, antitusivos y terapia respiratoria.',
 'Evitar el humo del tabaco, lavado de manos, vacunación contra la gripe, evitar contaminación y mantener buena higiene respiratoria.',
 false, 3500),

('Conjuntivitis', 'conjuntivitis',
 'La conjuntivitis es la inflamación de la conjuntiva, la membrana transparente que recubre el ojo. Es muy contagiosa y común en México, especialmente en épocas de calor.',
 ARRAY['Ojo rojo o rosado', 'Picor o ardor en los ojos', 'Lagrimeo excesivo', 'Secreción ocular', 'Sensibilidad a la luz', 'Visión borrosa', 'Costras en los párpados'],
 'Infecciones bacterianas o virales, alergias, irritantes químicos, uso prolongado de lentes de contacto y higiene inadecuada.',
 'Gotas antibióticas o antivirales, antihistamínicos para conjuntivitis alérgica, compresas tibias y lavado ocular.',
 'Lavado frecuente de manos, no compartir toallas ni artículos personales, evitar tocarse los ojos y mantener buena higiene de lentes de contacto.',
 false, 3000),

('Dolor de espalda', 'dolor-de-espalda',
 'El dolor de espalda es una de las principales causas de consulta médica en México. Puede afectar la zona lumbar, dorsal o cervical y limitar significativamente la movilidad.',
 ARRAY['Dolor en la zona lumbar o dorsal', 'Rigidez muscular', 'Dificultad para agacharse', 'Dolor que irradia a las piernas', 'Espasmos musculares', 'Dolor al estar de pie mucho tiempo', 'Limitación de movimiento'],
 'Mala postura, levantamiento de peso incorrecto, hernias discales, estrés muscular, sedentarismo, obesidad y envejecimiento.',
 'Antiinflamatorios, fisioterapia, ejercicios de fortalecimiento, calor/frío local, relajantes musculares y cirugía en casos graves.',
 'Mantener buena postura, ejercicio regular, fortalecer el core, levantar peso correctamente, peso saludable y pausas activas en el trabajo.',
 true, 9000),

('Sinusitis', 'sinusitis',
 'La sinusitis es la inflamación de los senos paranasales, generalmente causada por una infección. Es muy común en México, especialmente durante los cambios de estación.',
 ARRAY['Congestión nasal', 'Dolor facial', 'Dolor de cabeza', 'Secreción nasal espesa', 'Fiebre', 'Tos', 'Pérdida del olfato'],
 'Infecciones virales o bacterianas, alergias, desviación del tabique nasal, pólipos nasales y factores ambientales.',
 'Antibióticos si es bacteriana, descongestionantes, lavados nasales con solución salina, corticosteroides nasales y cirugía en casos crónicos.',
 'Lavados nasales regulares, evitar alergenos, humidificar el ambiente, evitar el tabaco y tratar las alergias a tiempo.',
 false, 3500),

('Faringitis', 'faringitis',
 'La faringitis es la inflamación de la faringe que causa dolor de garganta. Es una de las infecciones más comunes, especialmente en niños y adolescentes.',
 ARRAY['Dolor de garganta intenso', 'Dificultad para tragar', 'Fiebre', 'Ganglios linfáticos inflamados', 'Enrojecimiento de la garganta', 'Dolor de cabeza', 'Voz ronca'],
 'Infecciones virales (más comunes), bacterianas (Streptococcus), irritantes ambientales, aire seco y reflujo gastroesofágico.',
 'Analgésicos, antibióticos si es bacteriana, gárgaras con agua salada, reposo, hidratación y antipiréticos.',
 'Lavado de manos frecuente, evitar compartir utensilios, mantener buena hidratación, evitar irritantes y ventilación adecuada.',
 false, 2500),

('Amigdalitis', 'amigdalitis',
 'La amigdalitis es la inflamación de las amígdalas, las masas de tejido linfático en la parte posterior de la garganta. Es muy común en niños y jóvenes.',
 ARRAY['Dolor de garganta severo', 'Dificultad para tragar', 'Amígdalas rojas e inflamadas', 'Fiebre alta', 'Mal aliento', 'Ganglios inflamados en el cuello', 'Voz ronca'],
 'Infecciones virales o bacterianas (Streptococcus pyogenes), sistema inmunológico debilitado y exposición a personas infectadas.',
 'Antibióticos si es bacteriana, analgésicos, gárgaras, reposo, hidratación y amigdalectomía en casos recurrentes.',
 'Higiene adecuada, evitar contacto con personas enfermas, no compartir alimentos o utensilios y fortalecer el sistema inmunológico.',
 false, 2500),

('Varicela', 'varicela',
 'La varicela es una enfermedad infecciosa muy contagiosa causada por el virus varicela-zoster. Aunque es más común en niños, puede ser grave en adultos.',
 ARRAY['Erupción cutánea con ampollas', 'Fiebre', 'Picor intenso', 'Fatiga', 'Dolor de cabeza', 'Pérdida de apetito', 'Ampollas que forman costras'],
 'Virus varicela-zoster (VZV). Se transmite por contacto directo con las ampollas o por gotas respiratorias.',
 'Antivirales en casos de riesgo, antihistamínicos para el picor, antipiréticos, lociones calmantes y reposo.',
 'Vacunación contra la varicela, evitar contacto con personas infectadas y buena higiene personal.',
 false, 2000),

('Dengue', 'dengue',
 'El dengue es una enfermedad viral transmitida por mosquitos que es endémica en muchas regiones de México. Puede causar fiebre alta y en casos graves, complicaciones potencialmente mortales.',
 ARRAY['Fiebre alta repentina', 'Dolor de cabeza intenso', 'Dolor detrás de los ojos', 'Dolor muscular y articular', 'Erupción cutánea', 'Náuseas y vómitos', 'Fatiga extrema'],
 'Virus del dengue transmitido por mosquitos Aedes aegypti. Clima tropical, acumulación de agua estancada y falta de control vectorial.',
 'Tratamiento de soporte, hidratación, analgésicos (evitar aspirina), monitoreo de plaquetas y hospitalización en casos graves.',
 'Eliminación de criaderos de mosquitos, uso de repelente, mosquiteros, ropa protectora y fumigación en zonas afectadas.',
 true, 6500),

('Zika', 'zika',
 'El Zika es una enfermedad viral transmitida por mosquitos que puede ser especialmente peligrosa para mujeres embarazadas debido al riesgo de microcefalia en el feto.',
 ARRAY['Fiebre leve', 'Erupción cutánea', 'Conjuntivitis', 'Dolor articular y muscular', 'Dolor de cabeza', 'Fatiga', 'Ojos rojos'],
 'Virus del Zika transmitido por mosquitos Aedes. También se puede transmitir sexualmente y de madre a feto.',
 'Tratamiento de soporte, reposo, hidratación, analgésicos (evitar aspirina) y monitoreo en embarazadas.',
 'Protección contra mosquitos, uso de repelente, ropa que cubra la piel, evitar viajes a zonas endémicas en embarazo y sexo seguro.',
 false, 1500),

('Chikungunya', 'chikungunya',
 'La chikungunya es una enfermedad viral transmitida por mosquitos que causa fiebre y dolor articular severo. Ha tenido brotes importantes en México.',
 ARRAY['Fiebre alta', 'Dolor articular severo', 'Dolor de cabeza', 'Dolor muscular', 'Erupción cutánea', 'Fatiga', 'Náuseas'],
 'Virus chikungunya transmitido por mosquitos Aedes aegypti y Aedes albopictus. Clima tropical y subtropical.',
 'Tratamiento de soporte, analgésicos, antiinflamatorios, fisioterapia para dolor articular persistente y reposo.',
 'Control de mosquitos, eliminación de agua estancada, uso de repelente, mosquiteros y ropa protectora.',
 false, 1200),

('Hepatitis', 'hepatitis',
 'La hepatitis es la inflamación del hígado que puede ser causada por virus, alcohol, toxinas o enfermedades autoinmunes. Es un problema importante de salud pública en México.',
 ARRAY['Fatiga', 'Dolor abdominal', 'Ictericia (piel y ojos amarillos)', 'Orina oscura', 'Heces pálidas', 'Náuseas y vómitos', 'Pérdida de apetito'],
 'Virus de hepatitis (A, B, C, D, E), consumo excesivo de alcohol, medicamentos tóxicos, enfermedades autoinmunes y exposición a toxinas.',
 'Antivirales para hepatitis B y C, tratamiento de soporte, cambios en la dieta, evitar alcohol y trasplante hepático en casos avanzados.',
 'Vacunación (hepatitis A y B), higiene adecuada, sexo seguro, no compartir agujas, evitar consumo excesivo de alcohol y alimentos contaminados.',
 false, 3500),

('VIH/SIDA', 'vih-sida',
 'El VIH es un virus que ataca el sistema inmunológico, específicamente los linfocitos T CD4. Sin tratamiento, puede progresar a SIDA. México tiene programas de prevención y tratamiento accesibles.',
 ARRAY['Fiebre recurrente', 'Pérdida de peso', 'Fatiga crónica', 'Infecciones oportunistas', 'Sudores nocturnos', 'Ganglios linfáticos inflamados', 'Diarrea persistente'],
 'Virus de la inmunodeficiencia humana (VIH). Transmisión sexual, sanguínea y de madre a hijo.',
 'Terapia antirretroviral (TAR), profilaxis post-exposición, tratamiento de infecciones oportunistas y seguimiento médico regular.',
 'Uso de preservativo, pruebas regulares, no compartir agujas, profilaxis pre-exposición (PrEP), educación sexual y atención prenatal.',
 false, 3000),

('Cancer de mama', 'cancer-de-mama',
 'El cancer de mama es el tipo de cancer mas frecuente en mujeres mexicanas. La deteccion temprana es fundamental para un tratamiento exitoso.',
 ARRAY['Bulto en la mama', 'Cambio en el tamano o forma de la mama', 'Dolor en la mama', 'Secrecion del peznon', 'Enrojecimiento o hundimiento de la piel', 'Cambios en el peznon', 'Ganglios inflamados en la axila'],
 'Factores geneticos (BRCA1, BRCA2), edad avanzada, obesidad, consumo de alcohol, terapia hormonal y antecedentes familiares.',
 'Cirugia, quimioterapia, radioterapia, terapia hormonal, terapia dirigida y seguimiento multidisciplinario.',
 'Autoexploracion mensual, mastografia a partir de los 40 anos, estilo de vida saludable, lactancia materna y asesoria genetica en casos de riesgo.',
 true, 5000),

('Cancer de prostata', 'cancer-de-prostata',
 'El cancer de prostata es el cancer mas comun en hombres mexicanos. Generalmente crece lentamente y tiene buen pronostico si se detecta a tiempo.',
 ARRAY['Dificultad para orinar', 'Flujo urinario debil', 'Urgencia urinaria frecuente', 'Dolor al orinar', 'Presencia de sangre en la orina', 'Disfuncion erectil', 'Dolor en la zona pelvica'],
 'Edad avanzada, factores geneticos, raza, obesidad, dieta alta en grasas y antecedentes familiares.',
 'Vigilancia activa, cirugia (prostatectomia), radioterapia, terapia hormonal, quimioterapia y crioterapia.',
 'Examen de prostata anual a partir de los 50 anos, dieta saludable, ejercicio regular, mantener peso adecuado y evitar el tabaco.',
 true, 4500),

('Enfisema pulmonar', 'enfisema-pulmonar',
 'El enfisema pulmonar es una enfermedad cronica que da los alveolos pulmonares, dificultando la respiracion. Esta incluido dentro de la EPOC.',
 ARRAY['Dificultad para respirar progresiva', 'Tos cronica', 'Sibilancias', 'Fatiga', 'Perdida de peso', 'Respiracion rapida', 'Coloracion azulada en labios'],
 'Tabaquismo prolongado (causa principal), exposicion a humo y contaminacion, deficiencia de alfa-1 antitripsina y factores geneticos.',
 'Dejar de fumar, broncodilatadores, corticosteroides inhalados, terapia de oxigeno, rehabilitacion pulmonar y cirugia en casos seleccionados.',
 'No fumar, evitar exposicion a humo y contaminacion, uso de equipo de proteccion en ambientes laborales y control medico regular.',
 false, 2000),

('Epilepsia', 'epilepsia',
 'La epilepsia es un trastorno neurologico que causa convulsiones recurrentes debidas a actividad electrica anormal en el cerebro. Afecta a personas de todas las edades.',
 ARRAY['Convulsiones', 'Perdida de conciencia', 'Espasmos musculares', 'Confusion temporal', 'Mirada fija', 'Movimientos involuntarios', 'Sensaciones anormales'],
 'Lesiones cerebrales, factores geneticos, tumores cerebrales, infecciones del SNC, accidentes cerebrovasculares y causas desconocidas.',
 'Medicamentos antiepilepticos, dieta cetogenica, estimulacion del nervio vago, cirugia de epilepsia y dispositivos neuroestimuladores.',
 'Tomar medicamentos segun indicacion, evitar desencadenantes, buena higiene del sueno, evitar alcohol y proteccion en deportes de riesgo.',
 false, 2000),

('Fibromialgia', 'fibromialgia',
 'La fibromialgia es una condicion cronica que causa dolor musculoesqueletico generalizado, acompanado de fatiga y problemas de sueno. Afecta mas a mujeres que a hombres.',
 ARRAY['Dolor generalizado', 'Fatiga cronica', 'Problemas de sueno', 'Dificultad para concentrarse', 'Dolor de cabeza', 'Sensibilidad al tacto', 'Depresion y ansiedad'],
 'Causas desconocidas, posiblemente relacionadas con procesamiento anormal del dolor, factores geneticos, estres fisico o emocional y traumatismos.',
 'Medicamentos para el dolor, antidepresivos, terapia cognitivo-conductual, ejercicio moderado, fisioterapia y manejo del estres.',
 'Mantener actividad fisica regular, buen sueno, manejo del estres, redes de apoyo y tratamiento multidisciplinario.',
 false, 2500),

('Gota', 'gota',
 'La gota es una forma de artritis inflamatoria que causa dolor articular repentino e intenso, generalmente en el dedo gordo del pie. Es causada por acumulacion de acido urico.',
 ARRAY['Dolor articular intenso y repentino', 'Hinchazon articular', 'Enrojecimiento y calor articular', 'Sensibilidad extrema al tacto', 'Limitacion del movimiento', 'Nodulos bajo la piel', 'Ataques recurrentes'],
 'Niveles elevados de acido urico, dieta rica en purinas, alcohol, obesidad, medicamentos y factores geneticos.',
 'Antiinflamatorios, colchicina, corticosteroides, medicamentos para reducir acido urico y cambios en la dieta.',
 'Dieta baja en purinas, limitar alcohol y fructosa, hidratacion adecuada, peso saludable y ejercicio regular.',
 false, 1800),

('Hemorroides', 'hemorroides',
 'Las hemorroides son venas inflamadas en la zona del recto y el ano que causan molestias y sangrado. Son muy comunes y afectan a personas de todas las edades.',
 ARRAY['Sangrado rectal', 'Dolor anal', 'Picor en la zona anal', 'Hinchazon alrededor del ano', 'Protuberancias cerca del ano', 'Molestias al defecar', 'Irritacion'],
 'Estrenimiento cronico, esfuerzo al defecar, embarazo, obesidad, sedentarismo, dieta baja en fibra y estar mucho tiempo sentado.',
 'Cremas y supositorios, banos de asiento, cambios en la dieta, medicamentos venotonicos, ligadura elastica y cirugia en casos graves.',
 'Dieta rica en fibra, hidratacion adecuada, no esforzarse al defecar, ejercicio regular y evitar estar sentado por periodos prolongados.',
 false, 4000),

('Lumbalgia', 'lumbalgia',
 'La lumbalgia es el dolor localizado en la parte baja de la espalda. Es una de las causas mas frecuentes de consulta medica y ausentismo laboral en Mexico.',
 ARRAY['Dolor en la zona lumbar', 'Rigidez muscular', 'Dolor que empeora al moverse', 'Espasmos musculares', 'Dificultad para agacharse', 'Dolor que irradia a gluteos', 'Limitacion para actividades diarias'],
 'Mala postura, sobreesfuerzo fisico, hernia discal, estres muscular, sedentarismo, obesidad y envejecimiento de la columna.',
 'Antiinflamatorios, fisioterapia, ejercicio terapeutico, calor local, masajes, acupuntura y cirugia en casos seleccionados.',
 'Ejercicio regular, fortalecimiento del core, buena postura, levantamiento correcto de pesos, peso saludable y pausas activas.',
 false, 3500),

('Osteoporosis', 'osteoporosis',
 'La osteoporosis es una enfermedad que debilita los huesos, haciendolos fragiles y mas propensos a fracturas. Es mas comun en mujeres posmenopausicas.',
 ARRAY['Dolor de espalda', 'Perdida de estatura', 'Postura encorvada', 'Fracturas frecuentes', 'Dolor oseo', 'Debilidad muscular', 'Fracturas por caidas leves'],
 'Deficiencia de calcio y vitamina D, menopausia, edad avanzada, sedentarismo, tabaquismo y factores geneticos.',
 'Suplementos de calcio y vitamina D, bifosfonatos, terapia hormonal, ejercicio de impacto moderado y prevencion de caidas.',
 'Dieta rica en calcio, ejercicio regular, exposicion solar adecuada, evitar tabaco y alcohol, y densitometria osea periodica.',
 false, 2500),

('Tiroides', 'tiroides',
 'Los trastornos de tiroides afectan la glandula tiroides que regula el metabolismo. Pueden causar hipotiroidismo (funcion baja) o hipertiroidismo (funcion excesiva). Ambos son comunes en Mexico.',
 ARRAY['Fatiga o nerviosismo', 'Cambios de peso', 'Sensibilidad al frio o calor', 'Cambios en la frecuencia cardíaca', 'Cambio en el patron del sueno', 'Sequedad de piel o sudor excesivo', 'Dificultad para concentrarse'],
 'Enfermedad autoinmune (Hashimoto, Graves), deficiencia de yodo, nodulos tiroideos, medicamentos y factores geneticos.',
 'Levotiroxina para hipotiroidismo, metimazol o propiltiouracilo para hipertiroidismo, cirugia y yodo radiactivo.',
 'Dieta con yodo adecuado, controles medicos regulares, revision de la funcion tiroidea y tratamiento oportuno de nódulos.',
 false, 3000)

ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  causes = EXCLUDED.causes,
  treatments = EXCLUDED.treatments,
  prevention = EXCLUDED.prevention,
  popular = EXCLUDED.popular,
  search_count = EXCLUDED.search_count;

-- ================================================
-- LINK DISEASES TO SPECIALTIES
-- ================================================

INSERT INTO specialty_diseases (specialty_id, disease_id)
SELECT s.id, d.id FROM specialties s
CROSS JOIN diseases d
WHERE
  (s.slug = 'medicina-general' AND d.slug IN ('gripe', 'covid-19', 'gastroenterologia', 'fiebre', 'infeccion-urinaria', 'dolor-de-espalda', 'lumbalgia', 'alergias'))
  OR (s.slug = 'cardiologia' AND d.slug IN ('hipertension', 'enfisema-pulmonar'))
  OR (s.slug = 'dermatologia' AND d.slug IN ('acne', 'dermatitis', 'varicela'))
  OR (s.slug = 'pediatria' AND d.slug IN ('varicela', 'dengue', 'gripe', 'amigdalitis', 'faringitis', 'asma', 'alergias'))
  OR (s.slug = 'ginecologia' AND d.slug IN ('cancer-de-mama', 'infeccion-urinaria', 'tiroides', 'anemia'))
  OR (s.slug = 'psiquiatria' AND d.slug IN ('depresion', 'ansiedad', 'estres', 'insomnio', 'fibromialgia'))
  OR (s.slug = 'traumatologia' AND d.slug IN ('dolor-de-espalda', 'lumbalgia', 'artritis', 'gota', 'osteoporosis'))
  OR (s.slug = 'oftalmologia' AND d.slug IN ('conjuntivitis'))
  OR (s.slug = 'nutricion' AND d.slug IN ('obesidad', 'diabetes', 'anemia', 'gastritis', 'gota'))
  OR (s.slug = 'neurologia' AND d.slug IN ('migrana', 'epilepsia'))
  OR (s.slug = 'gastroenterologo' AND d.slug IN ('gastritis', 'hemorroides', 'hepatitis'))
ON CONFLICT (specialty_id, disease_id) DO NOTHING;
