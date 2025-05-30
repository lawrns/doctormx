-- Extended Mexican Herb Database - Phase 1 Enhancement
-- Adds 25 more traditional Mexican medicinal plants

INSERT INTO herbs (latin_name, common_names, active_compounds, traditional_uses, evidence_grade, contraindications, preparation, sourcing) VALUES

-- Traditional Mexican Plants
('Heterotheca inuloides', '{"árnica mexicana", "falsa árnica"}', '{"flavonoids", "sesquiterpene lactones", "essential oils"}', '{"bruises", "inflammation", "muscle pain", "wounds"}', 'B', '{"open wounds", "allergy to asteraceae"}', '{"forms": ["topical oil", "tincture", "poultice"], "dosage": [{"form": "topical oil", "amount": "apply thin layer", "frequency": "2-3 times daily"}]}', '{"nativeRegion": ["Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Ruta chalepensis', '{"ruda", "rue"}', '{"rutin", "quercetin", "essential oils"}', '{"digestive issues", "menstrual irregularities", "anxiety", "parasites"}', 'C', '{"pregnancy", "breastfeeding", "kidney disease"}', '{"forms": ["tea", "tincture"], "dosage": [{"form": "tea", "amount": "1 tsp dried leaves", "frequency": "1-2 times daily", "notes": "use with caution"}]}', '{"nativeRegion": ["Mediterranean", "Mexico"], "availability": "common", "sustainabilityRating": "medium"}'),

('Hibiscus sabdariffa', '{"jamaica", "flor de jamaica", "hibisco"}', '{"anthocyanins", "vitamin C", "organic acids"}', '{"high blood pressure", "cholesterol", "antioxidant", "digestive health"}', 'A', '{"low blood pressure", "pregnancy first trimester"}', '{"forms": ["tea", "extract"], "dosage": [{"form": "tea", "amount": "2-3 flowers", "frequency": "2 times daily"}]}', '{"nativeRegion": ["Africa", "cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Psidium guajava', '{"guayaba", "guava leaves"}', '{"tannins", "flavonoids", "quercetin"}', '{"diarrhea", "wound healing", "diabetes", "oral health"}', 'B', '{"excessive use may cause constipation"}', '{"forms": ["tea", "mouthwash", "topical"], "dosage": [{"form": "tea", "amount": "3-5 leaves", "frequency": "3 times daily"}]}', '{"nativeRegion": ["Central America", "Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Artemisia ludoviciana', '{"estafiate", "ajenjo mexicano"}', '{"artemisinin", "sesquiterpene lactones", "essential oils"}', '{"digestive issues", "parasites", "fever", "menstrual problems"}', 'C', '{"pregnancy", "breastfeeding", "epilepsy"}', '{"forms": ["tea", "tincture"], "dosage": [{"form": "tea", "amount": "1 tsp", "frequency": "2 times daily", "duration": "maximum 2 weeks"}]}', '{"nativeRegion": ["North America", "Mexico"], "availability": "seasonal", "sustainabilityRating": "medium"}'),

('Buddleia cordata', '{"tepozán", "salvia santa"}', '{"iridoids", "flavonoids", "saponins"}', '{"cough", "respiratory issues", "wounds", "inflammation"}', 'C', '{"pregnancy", "liver disease"}', '{"forms": ["tea", "syrup", "poultice"], "dosage": [{"form": "tea", "amount": "1-2 tsp flowers", "frequency": "3 times daily"}]}', '{"nativeRegion": ["Mexico"], "availability": "seasonal", "sustainabilityRating": "medium"}'),

('Cnidoscolus aconitifolius', '{"chaya", "mayan spinach"}', '{"protein", "calcium", "iron", "vitamin A"}', '{"anemia", "diabetes", "kidney stones", "nutrition"}', 'B', '{"must be cooked before consumption", "raw leaves are toxic"}', '{"forms": ["cooked leaves", "tea from cooked leaves"], "dosage": [{"form": "cooked leaves", "amount": "100-200g", "frequency": "2-3 times weekly", "notes": "always cook for 20+ minutes"}]}', '{"nativeRegion": ["Yucatan", "Central America"], "availability": "regional", "sustainabilityRating": "high"}'),

('Montanoa tomentosa', '{"zoapatle", "cihuapatli"}', '{"sesquiterpene lactones", "flavonoids"}', '{"menstrual irregularities", "labor induction", "postpartum care"}', 'C', '{"pregnancy except under medical supervision", "children"}', '{"forms": ["tea", "tincture"], "dosage": [{"form": "tea", "amount": "1 tsp", "frequency": "only under medical guidance"}]}', '{"nativeRegion": ["Mexico"], "availability": "rare", "sustainabilityRating": "low"}'),

('Amphipterygium adstringens', '{"cuachalalate"}', '{"tannins", "masticadienoic acid", "anacardic acid"}', '{"gastric ulcers", "inflammation", "wound healing", "cancer support"}', 'B', '{"pregnancy", "breastfeeding"}', '{"forms": ["tea", "extract", "powder"], "dosage": [{"form": "tea", "amount": "1 tsp bark", "frequency": "2 times daily"}]}', '{"nativeRegion": ["Mexico"], "availability": "seasonal", "sustainabilityRating": "medium"}'),

('Casimiroa edulis', '{"zapote blanco", "white sapote"}', '{"casimirosin", "casimirolide", "histamine"}', '{"anxiety", "insomnia", "high blood pressure", "sedation"}', 'C', '{"heart conditions", "low blood pressure", "pregnancy"}', '{"forms": ["tea from leaves", "tincture"], "dosage": [{"form": "tea", "amount": "2-3 leaves", "frequency": "once daily in evening"}]}', '{"nativeRegion": ["Mexico", "Central America"], "availability": "seasonal", "sustainabilityRating": "medium"}'),

-- Additional Well-Known Mexican Herbs
('Tilia mexicana', '{"tila", "flor de tila", "lime blossom"}', '{"flavonoids", "essential oils", "mucilage"}', '{"anxiety", "insomnia", "mild sedation", "digestive issues"}', 'B', '{"pregnancy first trimester"}', '{"forms": ["tea", "tincture"], "dosage": [{"form": "tea", "amount": "1-2 tsp flowers", "frequency": "2-3 times daily"}]}', '{"nativeRegion": ["Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Lippia graveolens', '{"orégano mexicano", "Mexican oregano"}', '{"thymol", "carvacrol", "essential oils"}', '{"respiratory infections", "digestive issues", "antimicrobial", "antioxidant"}', 'B', '{"pregnancy in large amounts"}', '{"forms": ["tea", "essential oil", "culinary"], "dosage": [{"form": "tea", "amount": "1 tsp", "frequency": "2-3 times daily"}]}', '{"nativeRegion": ["Mexico", "Central America"], "availability": "common", "sustainabilityRating": "high"}'),

('Persea americana', '{"aguacate", "avocado leaves"}', '{"flavonoids", "saponins", "essential oils"}', '{"kidney stones", "high blood pressure", "digestive issues", "diabetes"}', 'C', '{"pregnancy", "breastfeeding", "people with latex allergy"}', '{"forms": ["tea", "extract"], "dosage": [{"form": "tea", "amount": "2-3 leaves", "frequency": "1-2 times daily"}]}', '{"nativeRegion": ["Mexico", "Central America"], "availability": "common", "sustainabilityRating": "high"}'),

('Bursera simaruba', '{"chacah", "palo mulato"}', '{"triterpenes", "essential oils", "resins"}', '{"respiratory infections", "skin conditions", "wounds", "inflammation"}', 'C', '{"pregnancy", "breastfeeding"}', '{"forms": ["tea from bark", "topical resin"], "dosage": [{"form": "tea", "amount": "1 tsp bark", "frequency": "2 times daily"}]}', '{"nativeRegion": ["Mexico", "Caribbean"], "availability": "regional", "sustainabilityRating": "medium"}'),

('Jatropha dioica', '{"sangre de grado", "dragon blood"}', '{"proanthocyanidins", "catechins", "lignans"}', '{"wound healing", "ulcers", "diarrhea", "inflammation"}', 'B', '{"pregnancy", "breastfeeding", "liver disease"}', '{"forms": ["topical resin", "tea"], "dosage": [{"form": "topical", "amount": "apply directly", "frequency": "as needed for wounds"}]}', '{"nativeRegion": ["Mexico", "Southwest US"], "availability": "regional", "sustainabilityRating": "medium"}'),

-- Modern Cultivated Herbs Common in Mexico
('Mentha piperita', '{"menta", "hierbabuena"}', '{"menthol", "menthone", "essential oils"}', '{"digestive issues", "nausea", "headaches", "respiratory congestion"}', 'A', '{"GERD", "gallstones", "pregnancy in large amounts"}', '{"forms": ["tea", "oil", "fresh leaves"], "dosage": [{"form": "tea", "amount": "1-2 tsp", "frequency": "2-3 times daily"}]}', '{"nativeRegion": ["Europe", "widely cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Rosmarinus officinalis', '{"romero", "rosemary"}', '{"rosmarinic acid", "carnosic acid", "essential oils"}', '{"memory enhancement", "circulation", "antioxidant", "hair growth"}', 'B', '{"pregnancy in large amounts", "epilepsy", "high blood pressure"}', '{"forms": ["tea", "oil", "tincture"], "dosage": [{"form": "tea", "amount": "1 tsp", "frequency": "1-2 times daily"}]}', '{"nativeRegion": ["Mediterranean", "cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Thymus vulgaris', '{"tomillo", "thyme"}', '{"thymol", "carvacrol", "flavonoids"}', '{"respiratory infections", "cough", "bronchitis", "antimicrobial"}', 'A', '{"pregnancy in large amounts", "bleeding disorders"}', '{"forms": ["tea", "essential oil", "syrup"], "dosage": [{"form": "tea", "amount": "1 tsp", "frequency": "2-3 times daily"}]}', '{"nativeRegion": ["Mediterranean", "cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Ocimum basilicum', '{"albahaca", "basil"}', '{"eugenol", "linalool", "essential oils"}', '{"digestive issues", "respiratory problems", "stress", "antimicrobial"}', 'B', '{"pregnancy in large amounts", "bleeding disorders"}', '{"forms": ["tea", "fresh leaves", "oil"], "dosage": [{"form": "tea", "amount": "1-2 tsp", "frequency": "2 times daily"}]}', '{"nativeRegion": ["India", "widely cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Sambucus canadensis', '{"saúco", "elderberry"}', '{"anthocyanins", "flavonoids", "vitamin C"}', '{"immune support", "cold", "flu", "respiratory infections"}', 'A', '{"raw bark and leaves are toxic", "autoimmune conditions"}', '{"forms": ["syrup", "tea from flowers", "extract"], "dosage": [{"form": "syrup", "amount": "1 tbsp", "frequency": "2-3 times daily during illness"}]}', '{"nativeRegion": ["North America", "cultivated in Mexico"], "availability": "seasonal", "sustainabilityRating": "high"}'),

('Urtica dioica', '{"ortiga", "nettle"}', '{"histamine", "formic acid", "vitamins", "minerals"}', '{"allergies", "arthritis", "prostate health", "anemia"}', 'B', '{"pregnancy", "diabetes medication interactions"}', '{"forms": ["tea", "capsules", "fresh cooked"], "dosage": [{"form": "tea", "amount": "1-2 tsp dried", "frequency": "2 times daily"}]}', '{"nativeRegion": ["Europe", "naturalized in Mexico"], "availability": "seasonal", "sustainabilityRating": "high"}'),

-- Endemic Mexican Species
('Dysphania ambrosioides', '{"epazote", "wormseed"}', '{"ascaridole", "essential oils", "saponins"}', '{"intestinal parasites", "digestive issues", "respiratory problems"}', 'C', '{"pregnancy", "breastfeeding", "liver disease", "large doses toxic"}', '{"forms": ["fresh leaves", "tea"], "dosage": [{"form": "fresh", "amount": "small amount in cooking", "frequency": "occasionally", "notes": "primarily culinary use"}]}', '{"nativeRegion": ["Mexico", "Central America"], "availability": "common", "sustainabilityRating": "high"}'),

('Turnera diffusa', '{"damiana"}', '{"flavonoids", "essential oils", "cyanogenic glycosides"}', '{"aphrodisiac", "mood enhancement", "urinary tract health", "anxiety"}', 'C', '{"pregnancy", "breastfeeding", "diabetes medication"}', '{"forms": ["tea", "tincture", "smoking blend"], "dosage": [{"form": "tea", "amount": "1 tsp", "frequency": "1-2 times daily"}]}', '{"nativeRegion": ["Mexico", "Southwest US"], "availability": "seasonal", "sustainabilityRating": "medium"}'),

('Salvia hispanica', '{"chía", "chia seeds"}', '{"omega-3 fatty acids", "fiber", "protein", "antioxidants"}', '{"digestive health", "heart health", "weight management", "diabetes"}', 'A', '{"blood thinning medications", "low blood pressure"}', '{"forms": ["seeds", "oil", "gel"], "dosage": [{"form": "seeds", "amount": "1-2 tbsp", "frequency": "daily", "notes": "soak before consuming"}]}', '{"nativeRegion": ["Mexico", "Central America"], "availability": "common", "sustainabilityRating": "high"}'),

('Capsicum annuum', '{"chile", "capsicum"}', '{"capsaicin", "vitamin C", "carotenoids"}', '{"pain relief", "circulation", "digestive health", "weight management"}', 'A', '{"stomach ulcers", "hemorrhoids", "skin sensitivity"}', '{"forms": ["topical cream", "fresh", "capsules"], "dosage": [{"form": "topical", "amount": "apply as needed", "frequency": "1-3 times daily"}]}', '{"nativeRegion": ["Mexico", "Central America"], "availability": "common", "sustainabilityRating": "high"}'),

('Agave americana', '{"maguey", "agave"}', '{"saponins", "inulin", "fructans"}', '{"digestive health", "wound healing", "liver support", "prebiotic"}', 'C', '{"pregnancy", "diabetes medication interactions"}', '{"forms": ["sap", "fiber", "cooked heart"], "dosage": [{"form": "sap", "amount": "small amounts", "frequency": "occasionally", "notes": "traditional use only"}]}', '{"nativeRegion": ["Mexico"], "availability": "common", "sustainabilityRating": "medium"}')

ON CONFLICT (latin_name) DO NOTHING;

-- Update feature flag for extended database
UPDATE feature_flags 
SET rollout_percentage = 75, description = 'Enable herb database with 50+ Mexican medicinal plants'
WHERE flag_name = 'herb_database';

-- Add usage statistics function
CREATE OR REPLACE FUNCTION get_herb_usage_stats()
RETURNS TABLE (
    total_herbs BIGINT,
    by_evidence_grade JSONB,
    by_availability JSONB,
    top_traditional_uses TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_herbs,
        
        jsonb_object_agg(
            evidence_grade, 
            grade_count
        ) as by_evidence_grade,
        
        jsonb_object_agg(
            availability,
            avail_count
        ) as by_availability,
        
        ARRAY(
            SELECT unnest(traditional_uses) as use_name
            FROM herbs 
            WHERE feature_enabled = true
            GROUP BY use_name
            ORDER BY COUNT(*) DESC
            LIMIT 10
        ) as top_traditional_uses
        
    FROM (
        SELECT 
            evidence_grade,
            COUNT(*) as grade_count
        FROM herbs 
        WHERE feature_enabled = true
        GROUP BY evidence_grade
    ) grades
    
    CROSS JOIN (
        SELECT 
            (sourcing->>'availability') as availability,
            COUNT(*) as avail_count
        FROM herbs 
        WHERE feature_enabled = true
        GROUP BY (sourcing->>'availability')
    ) availability_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;