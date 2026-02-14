// AUTO-GENERATED from shared/anatomy/body_part_groups.json — do not edit by hand.
// Run: node scripts/convert_body_parts.js

export interface SharedAnatomyPart {
  objectId: string;
  name: string;
}

export interface SharedBodyPartGroup {
  id: string;
  name: string;
  zoomId: string;
  keywords: string[];
  selectIds: string[];
  deselectIds: string[];
  parts: SharedAnatomyPart[];
}

export const bodyPartGroups: Record<string, SharedBodyPartGroup> = {
  "neck": {
    "id": "neck",
    "name": "Neck",
    "zoomId": "muscular_system-muscles_of_head_and_neck_ID",
    "keywords": [
      "neck",
      "cervical",
      "throat",
      "laryn",
      "pharyn",
      "hyoid"
    ],
    "selectIds": [
      "muscular_system-muscles_of_head_and_neck_ID",
      "muscular_system-platysma_ID",
      "connective_tissue-ligamentum_nuchae_ID",
      "skeletal_system-bones_of_head_ID",
      "connective_tissue-connective_tissue_of_head_and_throat_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_head_and_neck_ID",
        "name": "Muscles of head and neck"
      },
      {
        "objectId": "muscular_system-muscles_of_head_ID",
        "name": "Muscles of head"
      },
      {
        "objectId": "muscular_system-muscles_of_facial_expression_ID",
        "name": "Muscles of facial expression"
      },
      {
        "objectId": "muscular_system-occipitofrontalis_ID",
        "name": "Occipitofrontalis"
      },
      {
        "objectId": "muscular_system-frontalis_ID",
        "name": "Frontalis"
      },
      {
        "objectId": "muscular_system-left_frontalis_ID",
        "name": "Left frontalis"
      },
      {
        "objectId": "muscular_system-right_frontalis_ID",
        "name": "Right frontalis"
      },
      {
        "objectId": "muscular_system-epicranial_aponeurosis_ID",
        "name": "Epicranial aponeurosis"
      },
      {
        "objectId": "muscular_system-occipitalis_ID",
        "name": "Occipitalis"
      },
      {
        "objectId": "muscular_system-left_occipitalis_ID",
        "name": "Left occipitalis"
      },
      {
        "objectId": "muscular_system-right_occipitalis_ID",
        "name": "Right occipitalis"
      },
      {
        "objectId": "muscular_system-temporoparietalis_ID",
        "name": "Temporoparietalis"
      },
      {
        "objectId": "muscular_system-right_temporoparietalis_ID",
        "name": "Right temporoparietalis"
      },
      {
        "objectId": "muscular_system-left_temporoparietalis_ID",
        "name": "Left temporoparietalis"
      },
      {
        "objectId": "muscular_system-orbicularis_oculi_muscles_ID",
        "name": "Orbicularis oculi muscles"
      },
      {
        "objectId": "muscular_system-right_orbicularis_oculi_muscles_ID",
        "name": "Right orbicularis oculi muscles"
      },
      {
        "objectId": "muscular_system-right_depressor_supercilii_ID",
        "name": "Right depressor supercilii"
      },
      {
        "objectId": "muscular_system-right_orbicularis_oculi_ID",
        "name": "Right orbicularis oculi"
      },
      {
        "objectId": "muscular_system-left_orbicularis_oculi_muscles_ID",
        "name": "Left orbicularis oculi muscles"
      },
      {
        "objectId": "muscular_system-left_depressor_supercilii_ID",
        "name": "Left depressor supercilii"
      },
      {
        "objectId": "muscular_system-left_orbicularis_oculi_ID",
        "name": "Left orbicularis oculi"
      },
      {
        "objectId": "muscular_system-corrugator_supercilii_ID",
        "name": "Corrugator supercilii"
      },
      {
        "objectId": "muscular_system-right_corrugator_supercilii_ID",
        "name": "Right corrugator supercilii"
      },
      {
        "objectId": "muscular_system-left_corrugator_supercilii_ID",
        "name": "Left corrugator supercilii"
      },
      {
        "objectId": "muscular_system-levator_labii_superioris_alaeque_nasi_ID",
        "name": "Levator labii superioris alaeque nasi"
      },
      {
        "objectId": "muscular_system-right_levator_labii_superioris_alaeque_nasi_ID",
        "name": "Right levator labii superioris alaeque nasi"
      },
      {
        "objectId": "muscular_system-left_levator_labii_superioris_alaeque_nasi_ID",
        "name": "Left levator labii superioris alaeque nasi"
      },
      {
        "objectId": "muscular_system-procerus_ID",
        "name": "Procerus"
      },
      {
        "objectId": "muscular_system-right_procerus_ID",
        "name": "Right procerus"
      },
      {
        "objectId": "muscular_system-left_procerus_ID",
        "name": "Left procerus"
      },
      {
        "objectId": "muscular_system-nasalis_ID",
        "name": "Nasalis"
      },
      {
        "objectId": "muscular_system-right_nasalis_ID",
        "name": "Right nasalis"
      },
      {
        "objectId": "muscular_system-left_nasalis_ID",
        "name": "Left nasalis"
      },
      {
        "objectId": "muscular_system-depressor_septi_nasi_ID",
        "name": "Depressor septi nasi"
      },
      {
        "objectId": "muscular_system-right_depressor_septi_nasi_ID",
        "name": "Right depressor septi nasi"
      },
      {
        "objectId": "muscular_system-left_depressor_septi_nasi_ID",
        "name": "Left depressor septi nasi"
      },
      {
        "objectId": "muscular_system-levator_labii_superioris_ID",
        "name": "Levator labii superioris"
      },
      {
        "objectId": "muscular_system-right_levator_labii_superioris_ID",
        "name": "Right levator labii superioris"
      },
      {
        "objectId": "muscular_system-left_levator_labii_superioris_ID",
        "name": "Left levator labii superioris"
      },
      {
        "objectId": "muscular_system-levator_anguli_oris_ID",
        "name": "Levator anguli oris"
      },
      {
        "objectId": "muscular_system-right_levator_anguli_oris_ID",
        "name": "Right levator anguli oris"
      },
      {
        "objectId": "muscular_system-left_levator_anguli_oris_ID",
        "name": "Left levator anguli oris"
      },
      {
        "objectId": "muscular_system-zygomaticus_muscles_ID",
        "name": "Zygomaticus muscles"
      },
      {
        "objectId": "muscular_system-zygomaticus_major_ID",
        "name": "Zygomaticus major"
      },
      {
        "objectId": "muscular_system-right_zygomaticus_major_ID",
        "name": "Right zygomaticus major"
      },
      {
        "objectId": "muscular_system-left_zygomaticus_major_ID",
        "name": "Left zygomaticus major"
      },
      {
        "objectId": "muscular_system-zygomaticus_minor_ID",
        "name": "Zygomaticus minor"
      },
      {
        "objectId": "muscular_system-right_zygomaticus_minor_ID",
        "name": "Right zygomaticus minor"
      },
      {
        "objectId": "muscular_system-left_zygomaticus_minor_ID",
        "name": "Left zygomaticus minor"
      },
      {
        "objectId": "muscular_system-orbicularis_oris_ID",
        "name": "Orbicularis oris"
      },
      {
        "objectId": "muscular_system-risorius_ID",
        "name": "Risorius"
      },
      {
        "objectId": "muscular_system-right_risorius_ID",
        "name": "Right risorius"
      },
      {
        "objectId": "muscular_system-left_risorius_ID",
        "name": "Left risorius"
      },
      {
        "objectId": "muscular_system-depressor_anguli_oris_ID",
        "name": "Depressor anguli oris"
      },
      {
        "objectId": "muscular_system-right_depressor_anguli_oris_ID",
        "name": "Right depressor anguli oris"
      },
      {
        "objectId": "muscular_system-left_depressor_anguli_oris_ID",
        "name": "Left depressor anguli oris"
      },
      {
        "objectId": "muscular_system-depressor_labii_inferioris_ID",
        "name": "Depressor labii inferioris"
      },
      {
        "objectId": "muscular_system-right_depressor_labii_inferioris_ID",
        "name": "Right depressor labii inferioris"
      },
      {
        "objectId": "muscular_system-left_depressor_labii_inferioris_ID",
        "name": "Left depressor labii inferioris"
      },
      {
        "objectId": "muscular_system-mentalis_ID",
        "name": "Mentalis"
      },
      {
        "objectId": "muscular_system-right_mentalis_ID",
        "name": "Right mentalis"
      },
      {
        "objectId": "muscular_system-left_mentalis_ID",
        "name": "Left mentalis"
      },
      {
        "objectId": "muscular_system-buccinator_ID",
        "name": "Buccinator"
      },
      {
        "objectId": "muscular_system-right_buccinator_ID",
        "name": "Right buccinator"
      },
      {
        "objectId": "muscular_system-left_buccinator_ID",
        "name": "Left buccinator"
      },
      {
        "objectId": "muscular_system-auricular_muscles_ID",
        "name": "Auricular muscles"
      },
      {
        "objectId": "muscular_system-auricularis_superior_ID",
        "name": "Auricularis superior"
      },
      {
        "objectId": "muscular_system-right_auricularis_superior_ID",
        "name": "Right auricularis superior"
      },
      {
        "objectId": "muscular_system-left_auricularis_superior_ID",
        "name": "Left auricularis superior"
      },
      {
        "objectId": "muscular_system-auricularis_anterior_ID",
        "name": "Auricularis anterior"
      },
      {
        "objectId": "muscular_system-right_auricularis_anterior_ID",
        "name": "Right auricularis anterior"
      },
      {
        "objectId": "muscular_system-left_auricularis_anterior_ID",
        "name": "Left auricularis anterior"
      },
      {
        "objectId": "muscular_system-oblique_muscle_of_auricle_ID",
        "name": "Oblique muscle of auricle"
      },
      {
        "objectId": "muscular_system-right_oblique_muscle_of_auricle_ID",
        "name": "Right oblique muscle of auricle"
      },
      {
        "objectId": "muscular_system-left_oblique_muscle_of_auricle_ID",
        "name": "Left oblique muscle of auricle"
      },
      {
        "objectId": "muscular_system-helicis_major_ID",
        "name": "Helicis major"
      },
      {
        "objectId": "muscular_system-right_helicis_major_ID",
        "name": "Right helicis major"
      },
      {
        "objectId": "muscular_system-left_helicis_major_ID",
        "name": "Left helicis major"
      },
      {
        "objectId": "muscular_system-helicis_minor_ID",
        "name": "Helicis minor"
      },
      {
        "objectId": "muscular_system-right_helicis_minor_ID",
        "name": "Right helicis minor"
      },
      {
        "objectId": "muscular_system-left_helicis_minor_ID",
        "name": "Left helicis minor"
      },
      {
        "objectId": "muscular_system-antitragicus_ID",
        "name": "Antitragicus"
      },
      {
        "objectId": "muscular_system-right_antitragicus_ID",
        "name": "Right antitragicus"
      },
      {
        "objectId": "muscular_system-left_antitragicus_ID",
        "name": "Left antitragicus"
      },
      {
        "objectId": "muscular_system-tragicus_ID",
        "name": "Tragicus"
      },
      {
        "objectId": "muscular_system-right_tragicus_ID",
        "name": "Right tragicus"
      },
      {
        "objectId": "muscular_system-left_tragicus_ID",
        "name": "Left tragicus"
      },
      {
        "objectId": "muscular_system-auricularis_posterior_ID",
        "name": "Auricularis posterior"
      },
      {
        "objectId": "muscular_system-right_auricularis_posterior_ID",
        "name": "Right auricularis posterior"
      },
      {
        "objectId": "muscular_system-left_auricularis_posterior_ID",
        "name": "Left auricularis posterior"
      },
      {
        "objectId": "muscular_system-transverse_muscle_of_auricle_ID",
        "name": "Transverse muscle of auricle"
      },
      {
        "objectId": "muscular_system-right_transverse_muscle_of_auricle_ID",
        "name": "Right transverse muscle of auricle"
      },
      {
        "objectId": "muscular_system-left_transverse_muscle_of_auricle_ID",
        "name": "Left transverse muscle of auricle"
      },
      {
        "objectId": "muscular_system-platysma_ID",
        "name": "Platysma"
      },
      {
        "objectId": "muscular_system-left_platysma_ID",
        "name": "Left platysma"
      },
      {
        "objectId": "muscular_system-right_platysma_ID",
        "name": "Right platysma"
      },
      {
        "objectId": "muscular_system-extraocular_muscles_of_eye_ID",
        "name": "Extraocular muscles of eye"
      },
      {
        "objectId": "muscular_system-extraocular_muscles_of_right_eye_ID",
        "name": "Extraocular muscles of right eye"
      },
      {
        "objectId": "muscular_system-right_levator_palpebrae_superioris_ID",
        "name": "Right levator palpebrae superioris"
      },
      {
        "objectId": "muscular_system-right_superior_oblique_ID",
        "name": "Right superior oblique"
      },
      {
        "objectId": "muscular_system-right_inferior_oblique_ID",
        "name": "Right inferior oblique"
      },
      {
        "objectId": "muscular_system-right_lateral_rectus_ID",
        "name": "Right lateral rectus"
      },
      {
        "objectId": "muscular_system-right_medial_rectus_ID",
        "name": "Right medial rectus"
      },
      {
        "objectId": "muscular_system-right_inferior_rectus_ID",
        "name": "Right inferior rectus"
      },
      {
        "objectId": "muscular_system-right_superior_rectus_ID",
        "name": "Right superior rectus"
      },
      {
        "objectId": "muscular_system-right_superior_tarsal_ID",
        "name": "Right superior tarsal"
      },
      {
        "objectId": "muscular_system-right_inferior_tarsal_ID",
        "name": "Right inferior tarsal"
      },
      {
        "objectId": "muscular_system-extraocular_muscles_of_left_eye_ID",
        "name": "Extraocular muscles of left eye"
      },
      {
        "objectId": "muscular_system-left_levator_palpebrae_superioris_ID",
        "name": "Left levator palpebrae superioris"
      },
      {
        "objectId": "muscular_system-left_superior_oblique_ID",
        "name": "Left superior oblique"
      },
      {
        "objectId": "muscular_system-left_inferior_oblique_ID",
        "name": "Left inferior oblique"
      },
      {
        "objectId": "muscular_system-left_lateral_rectus_ID",
        "name": "Left lateral rectus"
      },
      {
        "objectId": "muscular_system-left_medial_rectus_ID",
        "name": "Left medial rectus"
      },
      {
        "objectId": "muscular_system-left_inferior_rectus_ID",
        "name": "Left inferior rectus"
      },
      {
        "objectId": "muscular_system-left_superior_rectus_ID",
        "name": "Left superior rectus"
      },
      {
        "objectId": "muscular_system-left_superior_tarsal_ID",
        "name": "Left superior tarsal"
      },
      {
        "objectId": "muscular_system-left_inferior_tarsal_ID",
        "name": "Left inferior tarsal"
      },
      {
        "objectId": "muscular_system-tensor_tympani_ID",
        "name": "Tensor tympani"
      },
      {
        "objectId": "muscular_system-left_tensor_tympani_ID",
        "name": "Left tensor tympani"
      },
      {
        "objectId": "muscular_system-right_tensor_tympani_ID",
        "name": "Right tensor tympani"
      },
      {
        "objectId": "muscular_system-muscles_of_mastication_ID",
        "name": "Muscles of mastication"
      },
      {
        "objectId": "muscular_system-lateral_pterygoid_ID",
        "name": "Lateral pterygoid"
      },
      {
        "objectId": "muscular_system-right_lateral_pterygoid_ID",
        "name": "Right lateral pterygoid"
      },
      {
        "objectId": "muscular_system-right_inferior_lateral_pterygoid_ID",
        "name": "Right inferior lateral pterygoid"
      },
      {
        "objectId": "muscular_system-right_superior_lateral_pterygoid_ID",
        "name": "Right superior lateral pterygoid"
      },
      {
        "objectId": "muscular_system-left_lateral_pterygoid_ID",
        "name": "Left lateral pterygoid"
      },
      {
        "objectId": "muscular_system-left_inferior_lateral_pterygoid_ID",
        "name": "Left inferior lateral pterygoid"
      },
      {
        "objectId": "muscular_system-left_superior_lateral_pterygoid_ID",
        "name": "Left superior lateral pterygoid"
      },
      {
        "objectId": "muscular_system-medial_pterygoid_ID",
        "name": "Medial pterygoid"
      },
      {
        "objectId": "muscular_system-right_medial_pterygoid_ID",
        "name": "Right medial pterygoid"
      },
      {
        "objectId": "muscular_system-right_superficial_head_medial_pterygoid_ID",
        "name": "Right superficial head medial pterygoid"
      },
      {
        "objectId": "muscular_system-right_deep_head_medial_pterygoid_ID",
        "name": "Right deep head medial pterygoid"
      },
      {
        "objectId": "muscular_system-left_medial_pterygoid_ID",
        "name": "Left medial pterygoid"
      },
      {
        "objectId": "muscular_system-left_superficial_head_medial_pterygoid_ID",
        "name": "Left superficial head medial pterygoid"
      },
      {
        "objectId": "muscular_system-left_deep_head_medial_pterygoid_ID",
        "name": "Left deep head medial pterygoid"
      },
      {
        "objectId": "muscular_system-pterygomandibular_raphe_ID",
        "name": "Pterygomandibular raphe"
      },
      {
        "objectId": "muscular_system-right_pterygomandibular_raphe_ID",
        "name": "Right pterygomandibular raphe"
      },
      {
        "objectId": "muscular_system-left_pterygomandibular_raphe_ID",
        "name": "Left pterygomandibular raphe"
      },
      {
        "objectId": "muscular_system-temporalis_ID",
        "name": "Temporalis"
      },
      {
        "objectId": "muscular_system-right_temporalis_ID",
        "name": "Right temporalis"
      },
      {
        "objectId": "muscular_system-left_temporalis_ID",
        "name": "Left temporalis"
      },
      {
        "objectId": "muscular_system-masseter_ID",
        "name": "Masseter"
      },
      {
        "objectId": "muscular_system-right_masseter_ID",
        "name": "Right masseter"
      },
      {
        "objectId": "muscular_system-left_masseter_ID",
        "name": "Left masseter"
      },
      {
        "objectId": "muscular_system-extrinsic_muscles_of_tongue_ID",
        "name": "Extrinsic muscles of tongue"
      },
      {
        "objectId": "muscular_system-hyglossus_ID",
        "name": "Hyglossus"
      },
      {
        "objectId": "muscular_system-left_hyoglossus_ID",
        "name": "Left hyoglossus"
      },
      {
        "objectId": "muscular_system-right_hyoglossus_ID",
        "name": "Right hyoglossus"
      },
      {
        "objectId": "muscular_system-genioglossus_ID",
        "name": "Genioglossus"
      },
      {
        "objectId": "muscular_system-left_genioglossus_ID",
        "name": "Left genioglossus"
      },
      {
        "objectId": "muscular_system-right_genioglossus_ID",
        "name": "Right genioglossus"
      },
      {
        "objectId": "muscular_system-styloglossus_ID",
        "name": "Styloglossus"
      },
      {
        "objectId": "muscular_system-right_styloglossus_ID",
        "name": "Right styloglossus"
      },
      {
        "objectId": "muscular_system-left_styloglossus_ID",
        "name": "Left styloglossus"
      },
      {
        "objectId": "muscular_system-muscles_of_neck_ID",
        "name": "Muscles of neck"
      },
      {
        "objectId": "muscular_system-suboccipital_muscles_ID",
        "name": "Suboccipital muscles"
      },
      {
        "objectId": "muscular_system-rectus_capitis_posterior_minor_ID",
        "name": "Rectus capitis posterior minor"
      },
      {
        "objectId": "muscular_system-right_rectus_capitis_posterior_minor_ID",
        "name": "Right rectus capitis posterior minor"
      },
      {
        "objectId": "muscular_system-left_rectus_capitis_posterior_minor_ID",
        "name": "Left rectus capitis posterior minor"
      },
      {
        "objectId": "muscular_system-rectus_capitis_posterior_major_ID",
        "name": "Rectus capitis posterior major"
      },
      {
        "objectId": "muscular_system-right_rectus_capitis_posterior_major_ID",
        "name": "Right rectus capitis posterior major"
      },
      {
        "objectId": "muscular_system-left_rectus_capitis_posterior_major_ID",
        "name": "Left rectus capitis posterior major"
      },
      {
        "objectId": "muscular_system-rectus_capitis_anterior_ID",
        "name": "Rectus capitis anterior"
      },
      {
        "objectId": "muscular_system-right_rectus_capitis_anterior_ID",
        "name": "Right rectus capitis anterior"
      },
      {
        "objectId": "muscular_system-left_rectus_capitis_anterior_ID",
        "name": "Left rectus capitis anterior"
      },
      {
        "objectId": "muscular_system-rectus_capitis_lateralis_ID",
        "name": "Rectus capitis lateralis"
      },
      {
        "objectId": "muscular_system-right_rectus_capitis_lateralis_ID",
        "name": "Right rectus capitis lateralis"
      },
      {
        "objectId": "muscular_system-left_rectus_capitis_lateralis_ID",
        "name": "Left rectus capitis lateralis"
      },
      {
        "objectId": "muscular_system-obliquus_capitis_superior_ID",
        "name": "Obliquus capitis superior"
      },
      {
        "objectId": "muscular_system-left_obliquus_capitis_superior_ID",
        "name": "Left obliquus capitis superior"
      },
      {
        "objectId": "muscular_system-right_obliquus_capitis_superior_ID",
        "name": "Right obliquus capitis superior"
      },
      {
        "objectId": "muscular_system-obliquus_capitis_inferior_ID",
        "name": "Obliquus capitis inferior"
      },
      {
        "objectId": "muscular_system-left_obliquus_capitis_inferior_ID",
        "name": "Left obliquus capitis inferior"
      },
      {
        "objectId": "muscular_system-right_obliquus_capitis_inferior_ID",
        "name": "Right obliquus capitis inferior"
      },
      {
        "objectId": "muscular_system-suprahyoid_muscles_ID",
        "name": "Suprahyoid muscles"
      },
      {
        "objectId": "muscular_system-stylohyoid_ID",
        "name": "Stylohyoid"
      },
      {
        "objectId": "muscular_system-right_stylohyoid_ID",
        "name": "Right stylohyoid"
      },
      {
        "objectId": "muscular_system-left_stylohyoid_ID",
        "name": "Left stylohyoid"
      },
      {
        "objectId": "muscular_system-digastric_ID",
        "name": "Digastric"
      },
      {
        "objectId": "muscular_system-right_digastric_ID",
        "name": "Right digastric"
      },
      {
        "objectId": "muscular_system-right_fibrous_loop_for_intermediate_digastric_tendon_ID",
        "name": "Right fibrous loop for intermediate digastric tendon"
      },
      {
        "objectId": "muscular_system-right_anterior_belly_of_digastric_muscle_ID",
        "name": "Right anterior belly of digastric muscle"
      },
      {
        "objectId": "muscular_system-right_posterior_belly_of_digastric_muscle_ID",
        "name": "Right posterior belly of digastric muscle"
      },
      {
        "objectId": "muscular_system-left_digastric_ID",
        "name": "Left digastric"
      },
      {
        "objectId": "muscular_system-left_fibrous_loop_for_intermediate_digastric_tendon_ID",
        "name": "Left fibrous loop for intermediate digastric tendon"
      },
      {
        "objectId": "muscular_system-left_anterior_belly_of_digastric_muscle_ID",
        "name": "Left anterior belly of digastric muscle"
      },
      {
        "objectId": "muscular_system-left_posterior_belly_of_digastric_muscle_ID",
        "name": "Left posterior belly of digastric muscle"
      },
      {
        "objectId": "muscular_system-geniohyoid_ID",
        "name": "Geniohyoid"
      },
      {
        "objectId": "muscular_system-left_geniohyoid_ID",
        "name": "Left geniohyoid"
      },
      {
        "objectId": "muscular_system-right_geniohyoid_ID",
        "name": "Right geniohyoid"
      },
      {
        "objectId": "muscular_system-mylohyoid_ID",
        "name": "Mylohyoid"
      },
      {
        "objectId": "muscular_system-right_mylohyoid_ID",
        "name": "Right mylohyoid"
      },
      {
        "objectId": "muscular_system-left_mylohyoid_ID",
        "name": "Left mylohyoid"
      },
      {
        "objectId": "muscular_system-stylopharyngeus_muscle_ID",
        "name": "Stylopharyngeus muscle"
      },
      {
        "objectId": "muscular_system-right_stylopharyngeus_muscle_ID",
        "name": "Right stylopharyngeus muscle"
      },
      {
        "objectId": "muscular_system-left_stylopharyngeus_muscle_ID",
        "name": "Left stylopharyngeus muscle"
      },
      {
        "objectId": "muscular_system-infrahyoid_muscles_ID",
        "name": "Infrahyoid muscles"
      },
      {
        "objectId": "muscular_system-omohyoid_ID",
        "name": "Omohyoid"
      },
      {
        "objectId": "muscular_system-superior_belly_of_omohyoid_ID",
        "name": "Superior belly of omohyoid"
      },
      {
        "objectId": "muscular_system-right_superior_belly_of_omohyoid_ID",
        "name": "Right superior belly of omohyoid"
      },
      {
        "objectId": "muscular_system-left_superior_belly_of_omohyoid_ID",
        "name": "Left superior belly of omohyoid"
      },
      {
        "objectId": "muscular_system-inferior_belly_of_omohyoid_ID",
        "name": "Inferior belly of omohyoid"
      },
      {
        "objectId": "muscular_system-left_inferior_belly_of_omohyoid_ID",
        "name": "Left inferior belly of omohyoid"
      },
      {
        "objectId": "muscular_system-right_inferior_belly_of_omohyoid_ID",
        "name": "Right inferior belly of omohyoid"
      },
      {
        "objectId": "muscular_system-sternohyoid_ID",
        "name": "Sternohyoid"
      },
      {
        "objectId": "muscular_system-right_sternohyoid_ID",
        "name": "Right sternohyoid"
      },
      {
        "objectId": "muscular_system-left_sternohyoid_ID",
        "name": "Left sternohyoid"
      },
      {
        "objectId": "muscular_system-sternothyroid_ID",
        "name": "Sternothyroid"
      },
      {
        "objectId": "muscular_system-right_sternothyroid_ID",
        "name": "Right sternothyroid"
      },
      {
        "objectId": "muscular_system-left_sternothyroid_ID",
        "name": "Left sternothyroid"
      },
      {
        "objectId": "muscular_system-thyrohyoid_ID",
        "name": "Thyrohyoid"
      },
      {
        "objectId": "muscular_system-right_thyrohyoid_ID",
        "name": "Right thyrohyoid"
      },
      {
        "objectId": "muscular_system-left_thyrohyoid_ID",
        "name": "Left thyrohyoid"
      },
      {
        "objectId": "muscular_system-laryngeal_muscles_ID",
        "name": "Laryngeal muscles"
      },
      {
        "objectId": "muscular_system-cricothyroid_ID",
        "name": "Cricothyroid"
      },
      {
        "objectId": "muscular_system-left_cricothyroid_ID",
        "name": "Left cricothyroid"
      },
      {
        "objectId": "muscular_system-left_oblique_part_of_cricothyroid_ID",
        "name": "Left oblique part of cricothyroid"
      },
      {
        "objectId": "muscular_system-left_vertical_part_of_cricothyroid_ID",
        "name": "Left vertical part of cricothyroid"
      },
      {
        "objectId": "muscular_system-right_cricothyroid_ID",
        "name": "Right cricothyroid"
      },
      {
        "objectId": "muscular_system-right_oblique_part_of_cricothyroid_ID",
        "name": "Right oblique part of cricothyroid"
      },
      {
        "objectId": "muscular_system-right_vertical_part_of_cricothyroid_ID",
        "name": "Right vertical part of cricothyroid"
      },
      {
        "objectId": "muscular_system-transverse_arytenoid_ID",
        "name": "Transverse arytenoid"
      },
      {
        "objectId": "muscular_system-oblique_arytenoid_ID",
        "name": "Oblique arytenoid"
      },
      {
        "objectId": "muscular_system-left_oblique_arytenoid_ID",
        "name": "Left oblique arytenoid"
      },
      {
        "objectId": "muscular_system-right_oblique_arytenoid_ID",
        "name": "Right oblique arytenoid"
      },
      {
        "objectId": "muscular_system-aryepiglotticus_ID",
        "name": "Aryepiglotticus"
      },
      {
        "objectId": "muscular_system-right_aryepiglotticus_ID",
        "name": "Right aryepiglotticus"
      },
      {
        "objectId": "muscular_system-left_aryepiglotticus_ID",
        "name": "Left aryepiglotticus"
      },
      {
        "objectId": "muscular_system-posterior_cricoarytenoid_ID",
        "name": "Posterior cricoarytenoid"
      },
      {
        "objectId": "muscular_system-left_posterior_cricoarytenoid_ID",
        "name": "Left posterior cricoarytenoid"
      },
      {
        "objectId": "muscular_system-right_posterior_cricoarytenoid_ID",
        "name": "Right posterior cricoarytenoid"
      },
      {
        "objectId": "muscular_system-lateral_cricoarytenoid_ID",
        "name": "Lateral cricoarytenoid"
      },
      {
        "objectId": "muscular_system-right_lateral_cricoarytenoid_ID",
        "name": "Right lateral cricoarytenoid"
      },
      {
        "objectId": "muscular_system-left_lateral_cricoarytenoid_ID",
        "name": "Left lateral cricoarytenoid"
      },
      {
        "objectId": "muscular_system-vocalis_ID",
        "name": "Vocalis"
      },
      {
        "objectId": "muscular_system-right_vocalis_ID",
        "name": "Right vocalis"
      },
      {
        "objectId": "muscular_system-left_vocalis_ID",
        "name": "Left vocalis"
      },
      {
        "objectId": "muscular_system-thyroepiglotticus_ID",
        "name": "Thyroepiglotticus"
      },
      {
        "objectId": "muscular_system-right_thyroepiglotticus_ID",
        "name": "Right thyroepiglotticus"
      },
      {
        "objectId": "muscular_system-left_thyroepiglotticus_ID",
        "name": "Left thyroepiglotticus"
      },
      {
        "objectId": "muscular_system-thyroarytenoid_ID",
        "name": "Thyroarytenoid"
      },
      {
        "objectId": "muscular_system-right_thyroarytenoid_ID",
        "name": "Right thyroarytenoid"
      },
      {
        "objectId": "muscular_system-left_thyroarytenoid_ID",
        "name": "Left thyroarytenoid"
      },
      {
        "objectId": "muscular_system-muscles_of_soft_palate_and_fauces_ID",
        "name": "Muscles of soft palate and fauces"
      },
      {
        "objectId": "muscular_system-levator_veli_palatini_ID",
        "name": "Levator veli palatini"
      },
      {
        "objectId": "muscular_system-right_levator_veli_palatini_ID",
        "name": "Right levator veli palatini"
      },
      {
        "objectId": "muscular_system-left_levator_veli_palatini_ID",
        "name": "Left levator veli palatini"
      },
      {
        "objectId": "muscular_system-tensor_veli_palatini_ID",
        "name": "Tensor veli palatini"
      },
      {
        "objectId": "muscular_system-left_tensor_veli_palatini_ID",
        "name": "Left tensor veli palatini"
      },
      {
        "objectId": "muscular_system-right_tensor_veli_palatini_ID",
        "name": "Right tensor veli palatini"
      },
      {
        "objectId": "muscular_system-palatopharyngeus_ID",
        "name": "Palatopharyngeus"
      },
      {
        "objectId": "muscular_system-right_palatopharyngeus_ID",
        "name": "Right palatopharyngeus"
      },
      {
        "objectId": "muscular_system-left_palatopharyngeus_ID",
        "name": "Left palatopharyngeus"
      },
      {
        "objectId": "muscular_system-palatoglossus_ID",
        "name": "Palatoglossus"
      },
      {
        "objectId": "muscular_system-right_palatoglossus_ID",
        "name": "Right palatoglossus"
      },
      {
        "objectId": "muscular_system-left_palatoglossus_ID",
        "name": "Left palatoglossus"
      },
      {
        "objectId": "muscular_system-musculus_uvulae_ID",
        "name": "Musculus uvulae"
      },
      {
        "objectId": "muscular_system-right_musculus_uvulae_ID",
        "name": "Right musculus uvulae"
      },
      {
        "objectId": "muscular_system-left_musculus_uvulae_ID",
        "name": "Left musculus uvulae"
      },
      {
        "objectId": "muscular_system-pharyngeal_muscles_ID",
        "name": "Pharyngeal muscles"
      },
      {
        "objectId": "muscular_system-superior_pharyngeal_constrictors_ID",
        "name": "Superior pharyngeal constrictors"
      },
      {
        "objectId": "muscular_system-superior_pharyngeal_constrictor_ID",
        "name": "Superior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-left_superior_pharyngeal_constrictor_ID",
        "name": "Left superior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-right_superior_pharyngeal_constrictor_ID",
        "name": "Right superior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-glossopharyngeal_part_of_superior_pharyngeal_constrictor_ID",
        "name": "Glossopharyngeal part of superior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-left_glossopharyngeal_part_of_superior_pharyngeal_constrictor_ID",
        "name": "Left glossopharyngeal part of superior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-right_glossopharyngeal_part_of_superior_pharyngeal_constrictor_ID",
        "name": "Right glossopharyngeal part of superior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-middle_pharyngeal_constrictor_ID",
        "name": "Middle pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-right_middle_pharyngeal_constrictor_ID",
        "name": "Right middle pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-left_middle_pharyngeal_constrictor_ID",
        "name": "Left middle pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-inferior_pharyngeal_constrictor_ID",
        "name": "Inferior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-left_inferior_pharyngeal_constrictor_ID",
        "name": "Left inferior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-right_inferior_pharyngeal_constrictor_ID",
        "name": "Right inferior pharyngeal constrictor"
      },
      {
        "objectId": "muscular_system-lower_part_of_cricopharyngeus_ID",
        "name": "Lower part of cricopharyngeus"
      },
      {
        "objectId": "muscular_system-right_lower_part_of_cricopharyngeus_ID",
        "name": "Right lower part of cricopharyngeus"
      },
      {
        "objectId": "muscular_system-left_lower_part_of_cricopharyngeus_ID",
        "name": "Left lower part of cricopharyngeus"
      },
      {
        "objectId": "muscular_system-pharyngeal_raphe_ID",
        "name": "Pharyngeal raphe"
      },
      {
        "objectId": "muscular_system-left_pharyngeal_raphe_ID",
        "name": "Left pharyngeal raphe"
      },
      {
        "objectId": "muscular_system-right_pharyngeal_raphe_ID",
        "name": "Right pharyngeal raphe"
      },
      {
        "objectId": "muscular_system-salpingopharyngeus_ID",
        "name": "Salpingopharyngeus"
      },
      {
        "objectId": "muscular_system-right_salpingopharyngeus_ID",
        "name": "Right salpingopharyngeus"
      },
      {
        "objectId": "muscular_system-left_salpingopharyngeus_ID",
        "name": "Left salpingopharyngeus"
      },
      {
        "objectId": "muscular_system-proper_muscles_of_neck_ID",
        "name": "Proper muscles of neck"
      },
      {
        "objectId": "muscular_system-longus_capitis_ID",
        "name": "Longus capitis"
      },
      {
        "objectId": "muscular_system-right_longus_capitis_ID",
        "name": "Right longus capitis"
      },
      {
        "objectId": "muscular_system-left_longus_capitis_ID",
        "name": "Left longus capitis"
      },
      {
        "objectId": "muscular_system-longus_colli_ID",
        "name": "Longus colli"
      },
      {
        "objectId": "muscular_system-superior_oblique_part_of_longus_colli_ID",
        "name": "Superior oblique part of longus colli"
      },
      {
        "objectId": "muscular_system-superior_oblique_part_of_right_longus_colli_ID",
        "name": "Superior oblique part of right longus colli"
      },
      {
        "objectId": "muscular_system-superior_oblique_part_of_left_longus_colli_ID",
        "name": "Superior oblique part of left longus colli"
      },
      {
        "objectId": "muscular_system-vertical_intermediate_part_of_longus_colli_ID",
        "name": "Vertical intermediate part of longus colli"
      },
      {
        "objectId": "muscular_system-vertical_intermediate_part_of_right_longus_colli_ID",
        "name": "Vertical intermediate part of right longus colli"
      },
      {
        "objectId": "muscular_system-vertical_intermediate_part_of_left_longus_colli_ID",
        "name": "Vertical intermediate part of left longus colli"
      },
      {
        "objectId": "muscular_system-inferior_oblique_part_of_longus_colli_ID",
        "name": "Inferior oblique part of longus colli"
      },
      {
        "objectId": "muscular_system-inferior_oblique_part_of_right_longus_colli_ID",
        "name": "Inferior oblique part of right longus colli"
      },
      {
        "objectId": "muscular_system-inferior_oblique_part_of_left_longus_colli_ID",
        "name": "Inferior oblique part of left longus colli"
      },
      {
        "objectId": "muscular_system-anterior_scalene_ID",
        "name": "Anterior scalene"
      },
      {
        "objectId": "muscular_system-right_anterior_scalene_ID",
        "name": "Right anterior scalene"
      },
      {
        "objectId": "muscular_system-left_anterior_scalene_ID",
        "name": "Left anterior scalene"
      },
      {
        "objectId": "muscular_system-middle_scalene_ID",
        "name": "Middle scalene"
      },
      {
        "objectId": "muscular_system-right_middle_scalene_ID",
        "name": "Right middle scalene"
      },
      {
        "objectId": "muscular_system-left_middle_scalene_ID",
        "name": "Left middle scalene"
      },
      {
        "objectId": "muscular_system-posterior_scalene_ID",
        "name": "Posterior scalene"
      },
      {
        "objectId": "muscular_system-right_posterior_scalene_ID",
        "name": "Right posterior scalene"
      },
      {
        "objectId": "muscular_system-left_posterior_scalene_ID",
        "name": "Left posterior scalene"
      },
      {
        "objectId": "muscular_system-sternocleidomastoid_ID",
        "name": "Sternocleidomastoid"
      },
      {
        "objectId": "muscular_system-right_sternocleidomastoid_ID",
        "name": "Right sternocleidomastoid"
      },
      {
        "objectId": "muscular_system-left_sternocleidomastoid_ID",
        "name": "Left sternocleidomastoid"
      },
      {
        "objectId": "connective_tissue-ligamentum_nuchae_ID",
        "name": "Ligamentum nuchae"
      },
      {
        "objectId": "connective_tissue-lateral_thyrohyoid_ligament_ID",
        "name": "Lateral thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_thyrohyoid_ligament_ID",
        "name": "Left lateral thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_thyrohyoid_ligament_ID",
        "name": "Right lateral thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-median_thyrohyoid_ligament_ID",
        "name": "Median thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-thyrohyoid_membrane_ID",
        "name": "Thyrohyoid membrane"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_head_and_throat_ID",
        "name": "Connective tissue of head and throat"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_eye_ID",
        "name": "Connective tissue of eye"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_right_eye_ID",
        "name": "Connective tissue of right eye"
      },
      {
        "objectId": "connective_tissue-right_orbital_septum_ID",
        "name": "Right orbital septum"
      },
      {
        "objectId": "connective_tissue-right_capsulopalpebral_fascia_ID",
        "name": "Right capsulopalpebral fascia"
      },
      {
        "objectId": "connective_tissue-tarsal_plates_of_right_eye_ID",
        "name": "Tarsal plates of right eye"
      },
      {
        "objectId": "connective_tissue-right_superior_tarsal_plate_ID",
        "name": "Right superior tarsal plate"
      },
      {
        "objectId": "connective_tissue-right_inferior_tarsal_plate_ID",
        "name": "Right inferior tarsal plate"
      },
      {
        "objectId": "connective_tissue-right_tenons_capsule_ID",
        "name": "Right tenons capsule"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_eye_ID",
        "name": "Ligaments of right eye"
      },
      {
        "objectId": "connective_tissue-right_ligament_of_medial_rectus_ID",
        "name": "Right ligament of medial rectus"
      },
      {
        "objectId": "connective_tissue-right_ligament_of_lateral_rectus_ID",
        "name": "Right ligament of lateral rectus"
      },
      {
        "objectId": "connective_tissue-right_suspensory_ligament_of_eyeball_ID",
        "name": "Right suspensory ligament of eyeball"
      },
      {
        "objectId": "connective_tissue-right_superior_transverse_ligament_ID",
        "name": "Right superior transverse ligament"
      },
      {
        "objectId": "connective_tissue-right_trochlea_ID",
        "name": "Right trochlea"
      },
      {
        "objectId": "connective_tissue-right_palpebral_ligaments_ID",
        "name": "Right palpebral ligaments"
      },
      {
        "objectId": "connective_tissue-right_lateral_palpebral_ligament_ID",
        "name": "Right lateral palpebral ligament"
      },
      {
        "objectId": "connective_tissue-right_medial_palpebral_ligament_ID",
        "name": "Right medial palpebral ligament"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_left_eye_ID",
        "name": "Connective tissue of left eye"
      },
      {
        "objectId": "connective_tissue-left_orbital_septum_ID",
        "name": "Left orbital septum"
      },
      {
        "objectId": "connective_tissue-tarsal_plates_of_left_eye_ID",
        "name": "Tarsal plates of left eye"
      },
      {
        "objectId": "connective_tissue-left_superior_tarsal_plate_ID",
        "name": "Left superior tarsal plate"
      },
      {
        "objectId": "connective_tissue-left_inferior_tarsal_plate_ID",
        "name": "Left inferior tarsal plate"
      },
      {
        "objectId": "connective_tissue-left_capsulopalpebral_fascia_ID",
        "name": "Left capsulopalpebral fascia"
      },
      {
        "objectId": "connective_tissue-left_tenons_capsule_ID",
        "name": "Left tenons capsule"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_eye_ID",
        "name": "Ligaments of left eye"
      },
      {
        "objectId": "connective_tissue-left_ligament_of_medial_rectus_ID",
        "name": "Left ligament of medial rectus"
      },
      {
        "objectId": "connective_tissue-left_ligament_of_lateral_rectus_ID",
        "name": "Left ligament of lateral rectus"
      },
      {
        "objectId": "connective_tissue-left_suspensory_ligament_of_eyeball_ID",
        "name": "Left suspensory ligament of eyeball"
      },
      {
        "objectId": "connective_tissue-left_superior_transverse_ligament_ID",
        "name": "Left superior transverse ligament"
      },
      {
        "objectId": "connective_tissue-left_trochlea_ID",
        "name": "Left trochlea"
      },
      {
        "objectId": "connective_tissue-left_palpebral_ligaments_ID",
        "name": "Left palpebral ligaments"
      },
      {
        "objectId": "connective_tissue-left_lateral_palpebral_ligament_ID",
        "name": "Left lateral palpebral ligament"
      },
      {
        "objectId": "connective_tissue-left_medial_palpebral_ligament_ID",
        "name": "Left medial palpebral ligament"
      },
      {
        "objectId": "connective_tissue-nasal_cartilage_ID",
        "name": "Nasal cartilage"
      },
      {
        "objectId": "connective_tissue-major_alar_cartilage_ID",
        "name": "Major alar cartilage"
      },
      {
        "objectId": "connective_tissue-right_major_alar_cartilage_ID",
        "name": "Right major alar cartilage"
      },
      {
        "objectId": "connective_tissue-left_major_alar_cartilage_ID",
        "name": "Left major alar cartilage"
      },
      {
        "objectId": "connective_tissue-minor_alar_cartilage_ID",
        "name": "Minor alar cartilage"
      },
      {
        "objectId": "connective_tissue-right_minor_alar_cartilage_ID",
        "name": "Right minor alar cartilage"
      },
      {
        "objectId": "connective_tissue-left_minor_alar_cartilage_ID",
        "name": "Left minor alar cartilage"
      },
      {
        "objectId": "connective_tissue-lateral_nasal_cartilage_ID",
        "name": "Lateral nasal cartilage"
      },
      {
        "objectId": "connective_tissue-right_lateral_nasal_cartilage_ID",
        "name": "Right lateral nasal cartilage"
      },
      {
        "objectId": "connective_tissue-left_lateral_nasal_cartilage_ID",
        "name": "Left lateral nasal cartilage"
      },
      {
        "objectId": "connective_tissue-accessory_nasal_cartilage_ID",
        "name": "Accessory nasal cartilage"
      },
      {
        "objectId": "connective_tissue-right_accessory_nasal_cartilage_ID",
        "name": "Right accessory nasal cartilage"
      },
      {
        "objectId": "connective_tissue-left_accessory_nasal_cartilage_ID",
        "name": "Left accessory nasal cartilage"
      },
      {
        "objectId": "connective_tissue-nasal_septum_ID",
        "name": "Nasal septum"
      },
      {
        "objectId": "connective_tissue-auricular_cartilage_ID",
        "name": "Auricular cartilage"
      },
      {
        "objectId": "connective_tissue-right_auricular_cartilage_ID",
        "name": "Right auricular cartilage"
      },
      {
        "objectId": "connective_tissue-left_auricular_cartilage_ID",
        "name": "Left auricular cartilage"
      },
      {
        "objectId": "connective_tissue-eustachian_tube_cartilage_ID",
        "name": "Eustachian tube cartilage"
      },
      {
        "objectId": "connective_tissue-right_eustachian_tube_cartilage_ID",
        "name": "Right eustachian tube cartilage"
      },
      {
        "objectId": "connective_tissue-left_eustachian_tube_cartilage_ID",
        "name": "Left eustachian tube cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_skull_ID",
        "name": "Articular cartilage of skull"
      },
      {
        "objectId": "connective_tissue-foramen_lacerum_cartilage_ID",
        "name": "Foramen lacerum cartilage"
      },
      {
        "objectId": "connective_tissue-right_foramen_lacerum_cartilage_ID",
        "name": "Right foramen lacerum cartilage"
      },
      {
        "objectId": "connective_tissue-left_foramen_lacerum_cartilage_ID",
        "name": "Left foramen lacerum cartilage"
      },
      {
        "objectId": "connective_tissue-occipital_condyle_cartilage_ID",
        "name": "Occipital condyle cartilage"
      },
      {
        "objectId": "connective_tissue-right_occipital_condyle_cartilage_ID",
        "name": "Right occipital condyle cartilage"
      },
      {
        "objectId": "connective_tissue-left_occipital_condyle_cartilage_ID",
        "name": "Left occipital condyle cartilage"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_jaw_ID",
        "name": "Connective tissue of jaw"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_temporomandibular_joint_ID",
        "name": "Connective tissue of temporomandibular joint"
      },
      {
        "objectId": "connective_tissue-temporomandibular_joint_capsule_ID",
        "name": "Temporomandibular joint capsule"
      },
      {
        "objectId": "connective_tissue-right_temporomandibular_joint_capsule_ID",
        "name": "Right temporomandibular joint capsule"
      },
      {
        "objectId": "connective_tissue-left_temporomandibular_joint_capsule_ID",
        "name": "Left temporomandibular joint capsule"
      },
      {
        "objectId": "connective_tissue-temporomandibular_ligament_ID",
        "name": "Temporomandibular ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_temporomandibular_ligament_ID",
        "name": "Right lateral temporomandibular ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_temporomandibular_ligament_ID",
        "name": "Left lateral temporomandibular ligament"
      },
      {
        "objectId": "connective_tissue-temporomandibular_joint_articular_disc_ID",
        "name": "Temporomandibular joint articular disc"
      },
      {
        "objectId": "connective_tissue-right_temporomandibular_joint_articular_disc_ID",
        "name": "Right temporomandibular joint articular disc"
      },
      {
        "objectId": "connective_tissue-left_temporomandibular_joint_articular_disc_ID",
        "name": "Left temporomandibular joint articular disc"
      },
      {
        "objectId": "connective_tissue-mandibular_head_cartilage_ID",
        "name": "Mandibular head cartilage"
      },
      {
        "objectId": "connective_tissue-right_mandibular_head_cartilage_ID",
        "name": "Right mandibular head cartilage"
      },
      {
        "objectId": "connective_tissue-left_mandibular_head_cartilage_ID",
        "name": "Left mandibular head cartilage"
      },
      {
        "objectId": "connective_tissue-sphenomandubular_ligament_ID",
        "name": "Sphenomandubular ligament"
      },
      {
        "objectId": "connective_tissue-right_sphenomandibular_ligament_ID",
        "name": "Right sphenomandibular ligament"
      },
      {
        "objectId": "connective_tissue-left_sphenomandibular_ligament_ID",
        "name": "Left sphenomandibular ligament"
      },
      {
        "objectId": "connective_tissue-stylomandibular_ligament_ID",
        "name": "Stylomandibular ligament"
      },
      {
        "objectId": "connective_tissue-right_stylomandibular_ligament_ID",
        "name": "Right stylomandibular ligament"
      },
      {
        "objectId": "connective_tissue-left_stylomandibular_ligament_ID",
        "name": "Left stylomandibular ligament"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_throat_ID",
        "name": "Connective tissue of throat"
      },
      {
        "objectId": "connective_tissue-stylohyoid_ligament_ID",
        "name": "Stylohyoid ligament"
      },
      {
        "objectId": "connective_tissue-left_stylohyoid_ligament_ID",
        "name": "Left stylohyoid ligament"
      },
      {
        "objectId": "connective_tissue-right_stylohyoid_ligament_ID",
        "name": "Right stylohyoid ligament"
      },
      {
        "objectId": "connective_tissue-lateral_thyrohyoid_ligament_ID",
        "name": "Lateral thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_thyrohyoid_ligament_ID",
        "name": "Left lateral thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_thyrohyoid_ligament_ID",
        "name": "Right lateral thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-lateral_hyoepiglottic_ligament_ID",
        "name": "Lateral hyoepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_hyoepiglottic_ligament_ID",
        "name": "Right lateral hyoepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_hyoepiglottic_ligament_ID",
        "name": "Left lateral hyoepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-median_hyoepiglottic_ligament_ID",
        "name": "Median hyoepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-median_thyrohyoid_ligament_ID",
        "name": "Median thyrohyoid ligament"
      },
      {
        "objectId": "connective_tissue-thyroepiglottic_ligament_ID",
        "name": "Thyroepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-left_thyroepiglottic_ligament_ID",
        "name": "Left thyroepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-right_thyroepiglottic_ligament_ID",
        "name": "Right thyroepiglottic ligament"
      },
      {
        "objectId": "connective_tissue-cricopharyngeal_ligament_ID",
        "name": "Cricopharyngeal ligament"
      },
      {
        "objectId": "connective_tissue-quadrangular_membrane_ID",
        "name": "Quadrangular membrane"
      },
      {
        "objectId": "connective_tissue-left_quadrangular_membrane_ID",
        "name": "Left quadrangular membrane"
      },
      {
        "objectId": "connective_tissue-right_quadrangular_membrane_ID",
        "name": "Right quadrangular membrane"
      },
      {
        "objectId": "connective_tissue-vestibular_ligament_ID",
        "name": "Vestibular ligament"
      },
      {
        "objectId": "connective_tissue-right_vestibular_ligament_ID",
        "name": "Right vestibular ligament"
      },
      {
        "objectId": "connective_tissue-left_vestibular_ligament_ID",
        "name": "Left vestibular ligament"
      },
      {
        "objectId": "connective_tissue-vocal_ligament_ID",
        "name": "Vocal ligament"
      },
      {
        "objectId": "connective_tissue-right_vocal_ligament_ID",
        "name": "Right vocal ligament"
      },
      {
        "objectId": "connective_tissue-left_vocal_ligament_ID",
        "name": "Left vocal ligament"
      },
      {
        "objectId": "connective_tissue-cricothyroid_ligament_ID",
        "name": "Cricothyroid ligament"
      },
      {
        "objectId": "connective_tissue-conus_elasticus_ID",
        "name": "Conus elasticus"
      },
      {
        "objectId": "connective_tissue-left_conus_elasticus_ID",
        "name": "Left conus elasticus"
      },
      {
        "objectId": "connective_tissue-right_conus_elasticus_ID",
        "name": "Right conus elasticus"
      },
      {
        "objectId": "connective_tissue-ceratocricoid_ligaments_ID",
        "name": "Ceratocricoid ligaments"
      },
      {
        "objectId": "connective_tissue-right_ceratocricoid_ligaments_ID",
        "name": "Right ceratocricoid ligaments"
      },
      {
        "objectId": "connective_tissue-left_ceratocricoid_ligaments_ID",
        "name": "Left ceratocricoid ligaments"
      },
      {
        "objectId": "connective_tissue-cricoidthyroid_joint_ligament_ID",
        "name": "Cricoidthyroid joint ligament"
      },
      {
        "objectId": "connective_tissue-right_cricoidthyroid_joint_ligament_ID",
        "name": "Right cricoidthyroid joint ligament"
      },
      {
        "objectId": "connective_tissue-left_cricoidthyroid_joint_ligament_ID",
        "name": "Left cricoidthyroid joint ligament"
      },
      {
        "objectId": "connective_tissue-cricotracheal_ligament_ID",
        "name": "Cricotracheal ligament"
      },
      {
        "objectId": "connective_tissue-thyrohyoid_membrane_ID",
        "name": "Thyrohyoid membrane"
      },
      {
        "objectId": "connective_tissue-buccal_fat_pad_ID",
        "name": "Buccal fat pad"
      },
      {
        "objectId": "connective_tissue-right_buccal_fat_pad_ID",
        "name": "Right buccal fat pad"
      },
      {
        "objectId": "connective_tissue-left_buccal_fat_pad_ID",
        "name": "Left buccal fat pad"
      },
      {
        "objectId": "skeletal_system-bones_of_head_ID",
        "name": "Bones of head"
      },
      {
        "objectId": "skeletal_system-skull_ID",
        "name": "Skull"
      },
      {
        "objectId": "skeletal_system-skull|frontal_bone_ID",
        "name": "Frontal bone"
      },
      {
        "objectId": "skeletal_system-skull|frontal_bone|frontal_bone_ID",
        "name": "Frontal bone"
      },
      {
        "objectId": "skeletal_system-neurocranium_ID",
        "name": "Neurocranium"
      },
      {
        "objectId": "skeletal_system-parietal_bone_ID",
        "name": "Parietal bone"
      },
      {
        "objectId": "skeletal_system-left_parietal_bone_ID",
        "name": "Left parietal bone"
      },
      {
        "objectId": "skeletal_system-right_parietal_bone_ID",
        "name": "Right parietal bone"
      },
      {
        "objectId": "skeletal_system-temporal_bone_ID",
        "name": "Temporal bone"
      },
      {
        "objectId": "skeletal_system-left_temporal_bone_ID",
        "name": "Left temporal bone"
      },
      {
        "objectId": "skeletal_system-right_temporal_bone_ID",
        "name": "Right temporal bone"
      },
      {
        "objectId": "skeletal_system-sphenoid_bone_ID",
        "name": "Sphenoid bone"
      },
      {
        "objectId": "skeletal_system-occipital_bone_ID",
        "name": "Occipital bone"
      },
      {
        "objectId": "skeletal_system-ethmoid_bone_ID",
        "name": "Ethmoid bone"
      },
      {
        "objectId": "skeletal_system-ossicles_of_right_ear_ID",
        "name": "Ossicles of right ear"
      },
      {
        "objectId": "skeletal_system-right_stapes_ID",
        "name": "Right stapes"
      },
      {
        "objectId": "skeletal_system-right_incus_ID",
        "name": "Right incus"
      },
      {
        "objectId": "skeletal_system-right_malleus_ID",
        "name": "Right malleus"
      },
      {
        "objectId": "skeletal_system-ossicles_of_left_ear_ID",
        "name": "Ossicles of left ear"
      },
      {
        "objectId": "skeletal_system-left_stapes_ID",
        "name": "Left stapes"
      },
      {
        "objectId": "skeletal_system-left_incus_ID",
        "name": "Left incus"
      },
      {
        "objectId": "skeletal_system-left_malleus_ID",
        "name": "Left malleus"
      },
      {
        "objectId": "skeletal_system-viscerocranium_ID",
        "name": "Viscerocranium"
      },
      {
        "objectId": "skeletal_system-zygomatic_bone_ID",
        "name": "Zygomatic bone"
      },
      {
        "objectId": "skeletal_system-right_zygomatic_bone_ID",
        "name": "Right zygomatic bone"
      },
      {
        "objectId": "skeletal_system-left_zygomatic_bone_ID",
        "name": "Left zygomatic bone"
      },
      {
        "objectId": "skeletal_system-viscerocranium|nasal_bone_ID",
        "name": "Nasal bone"
      },
      {
        "objectId": "skeletal_system-viscerocranium|nasal_bone|nasal_bone_ID",
        "name": "Nasal bone"
      },
      {
        "objectId": "skeletal_system-right_nasal_bone_ID",
        "name": "Right nasal bone"
      },
      {
        "objectId": "skeletal_system-left_nasal_bone_ID",
        "name": "Left nasal bone"
      },
      {
        "objectId": "skeletal_system-lacrimal_bone_ID",
        "name": "Lacrimal bone"
      },
      {
        "objectId": "skeletal_system-right_lacrimal_bone_ID",
        "name": "Right lacrimal bone"
      },
      {
        "objectId": "skeletal_system-left_lacrimal_bone_ID",
        "name": "Left lacrimal bone"
      },
      {
        "objectId": "skeletal_system-vomer_ID",
        "name": "Vomer"
      },
      {
        "objectId": "skeletal_system-palatine_bone_ID",
        "name": "Palatine bone"
      },
      {
        "objectId": "skeletal_system-inferior_nasal_concha_ID",
        "name": "Inferior nasal concha"
      },
      {
        "objectId": "skeletal_system-right_inferior_nasal_concha_ID",
        "name": "Right inferior nasal concha"
      },
      {
        "objectId": "skeletal_system-left_inferior_nasal_concha_ID",
        "name": "Left inferior nasal concha"
      },
      {
        "objectId": "skeletal_system-upper_jaw_ID",
        "name": "Upper jaw"
      },
      {
        "objectId": "skeletal_system-maxilla_ID",
        "name": "Maxilla"
      },
      {
        "objectId": "skeletal_system-maxillary_teeth_ID",
        "name": "Maxillary teeth"
      },
      {
        "objectId": "skeletal_system-maxillary_central_incisor_ID",
        "name": "Maxillary central incisor"
      },
      {
        "objectId": "skeletal_system-right_maxillary_central_incisor_ID",
        "name": "Right maxillary central incisor"
      },
      {
        "objectId": "skeletal_system-left_maxillary_central_incisor_ID",
        "name": "Left maxillary central incisor"
      },
      {
        "objectId": "skeletal_system-maxillary_lateral_incisor_ID",
        "name": "Maxillary lateral incisor"
      },
      {
        "objectId": "skeletal_system-right_maxillary_lateral_incisor_ID",
        "name": "Right maxillary lateral incisor"
      },
      {
        "objectId": "skeletal_system-left_maxillary_lateral_incisor_ID",
        "name": "Left maxillary lateral incisor"
      },
      {
        "objectId": "skeletal_system-maxillary_canine_ID",
        "name": "Maxillary canine"
      },
      {
        "objectId": "skeletal_system-right_maxillary_canine_ID",
        "name": "Right maxillary canine"
      },
      {
        "objectId": "skeletal_system-left_maxillary_canine_ID",
        "name": "Left maxillary canine"
      },
      {
        "objectId": "skeletal_system-maxillary_first_premolar_ID",
        "name": "Maxillary first premolar"
      },
      {
        "objectId": "skeletal_system-right_maxillary_first_premolar_ID",
        "name": "Right maxillary first premolar"
      },
      {
        "objectId": "skeletal_system-left_maxillary_first_premolar_ID",
        "name": "Left maxillary first premolar"
      },
      {
        "objectId": "skeletal_system-maxillary_second_premolar_ID",
        "name": "Maxillary second premolar"
      },
      {
        "objectId": "skeletal_system-right_maxillary_second_premolar_ID",
        "name": "Right maxillary second premolar"
      },
      {
        "objectId": "skeletal_system-left_maxillary_second_premolar_ID",
        "name": "Left maxillary second premolar"
      },
      {
        "objectId": "skeletal_system-maxillary_first_molar_ID",
        "name": "Maxillary first molar"
      },
      {
        "objectId": "skeletal_system-right_maxillary_first_molar_ID",
        "name": "Right maxillary first molar"
      },
      {
        "objectId": "skeletal_system-left_maxillary_first_molar_ID",
        "name": "Left maxillary first molar"
      },
      {
        "objectId": "skeletal_system-maxillary_second_molar_ID",
        "name": "Maxillary second molar"
      },
      {
        "objectId": "skeletal_system-right_maxillary_second_molar_ID",
        "name": "Right maxillary second molar"
      },
      {
        "objectId": "skeletal_system-left_maxillary_second_molar_ID",
        "name": "Left maxillary second molar"
      },
      {
        "objectId": "skeletal_system-maxillary_third_molar_ID",
        "name": "Maxillary third molar"
      },
      {
        "objectId": "skeletal_system-right_maxillary_third_molar_ID",
        "name": "Right maxillary third molar"
      },
      {
        "objectId": "skeletal_system-left_maxillary_third_molar_ID",
        "name": "Left maxillary third molar"
      },
      {
        "objectId": "skeletal_system-lower_jaw_ID",
        "name": "Lower jaw"
      },
      {
        "objectId": "skeletal_system-mandible_ID",
        "name": "Mandible"
      },
      {
        "objectId": "skeletal_system-mandibular_teeth_ID",
        "name": "Mandibular teeth"
      },
      {
        "objectId": "skeletal_system-mandibular_central_incisor_ID",
        "name": "Mandibular central incisor"
      },
      {
        "objectId": "skeletal_system-right_mandibular_central_incisor_ID",
        "name": "Right mandibular central incisor"
      },
      {
        "objectId": "skeletal_system-left_mandibular_central_incisor_ID",
        "name": "Left mandibular central incisor"
      },
      {
        "objectId": "skeletal_system-mandibular_lateral_incisor_ID",
        "name": "Mandibular lateral incisor"
      },
      {
        "objectId": "skeletal_system-right_mandibular_lateral_incisor_ID",
        "name": "Right mandibular lateral incisor"
      },
      {
        "objectId": "skeletal_system-left_mandibular_lateral_incisor_ID",
        "name": "Left mandibular lateral incisor"
      },
      {
        "objectId": "skeletal_system-mandibular_canine_ID",
        "name": "Mandibular canine"
      },
      {
        "objectId": "skeletal_system-right_mandibular_canine_ID",
        "name": "Right mandibular canine"
      },
      {
        "objectId": "skeletal_system-left_mandibular_canine_ID",
        "name": "Left mandibular canine"
      },
      {
        "objectId": "skeletal_system-mandibular_first_premolar_ID",
        "name": "Mandibular first premolar"
      },
      {
        "objectId": "skeletal_system-right_mandibular_first_premolar_ID",
        "name": "Right mandibular first premolar"
      },
      {
        "objectId": "skeletal_system-left_mandibular_first_premolar_ID",
        "name": "Left mandibular first premolar"
      },
      {
        "objectId": "skeletal_system-mandibular_second_premolar_ID",
        "name": "Mandibular second premolar"
      },
      {
        "objectId": "skeletal_system-right_mandibular_second_premolar_ID",
        "name": "Right mandibular second premolar"
      },
      {
        "objectId": "skeletal_system-left_mandibular_second_premolar_ID",
        "name": "Left mandibular second premolar"
      },
      {
        "objectId": "skeletal_system-mandibular_first_molar_ID",
        "name": "Mandibular first molar"
      },
      {
        "objectId": "skeletal_system-right_mandibular_first_molar_ID",
        "name": "Right mandibular first molar"
      },
      {
        "objectId": "skeletal_system-left_mandibular_first_molar_ID",
        "name": "Left mandibular first molar"
      },
      {
        "objectId": "skeletal_system-mandibular_second_molar_ID",
        "name": "Mandibular second molar"
      },
      {
        "objectId": "skeletal_system-right_mandibular_second_molar_ID",
        "name": "Right mandibular second molar"
      },
      {
        "objectId": "skeletal_system-left_mandibular_second_molar_ID",
        "name": "Left mandibular second molar"
      },
      {
        "objectId": "skeletal_system-mandibular_third_molar_ID",
        "name": "Mandibular third molar"
      },
      {
        "objectId": "skeletal_system-right_mandibular_third_molar_ID",
        "name": "Right mandibular third molar"
      },
      {
        "objectId": "skeletal_system-left_mandibular_third_molar_ID",
        "name": "Left mandibular third molar"
      },
      {
        "objectId": "skeletal_system-hyoid_ID",
        "name": "Hyoid"
      }
    ]
  },
  "leftShoulder": {
    "id": "left_shoulder",
    "name": "Left Shoulder",
    "zoomId": "muscular_system-muscles_of_left_shoulder_ID",
    "keywords": [
      "left shoulder",
      "left deltoid",
      "left scapula",
      "left clavicle",
      "left acromial",
      "left coracoid",
      "left glenohumeral"
    ],
    "selectIds": [
      "muscular_system-left_deltoid_ID",
      "muscular_system-muscles_of_left_rotator_cuff_ID",
      "muscular_system-left_infraspinatus_ID",
      "muscular_system-left_teres_minor_ID",
      "muscular_system-left_supraspinatus_ID",
      "muscular_system-left_subscapularis_ID",
      "muscular_system-deep_muscles_of_left_shoulder_ID",
      "muscular_system-left_levator_scapulae_ID",
      "muscular_system-left_rhomboid_minor_ID",
      "muscular_system-left_rhomboid_major_ID",
      "muscular_system-left_serratus_anterior_ID",
      "muscular_system-left_teres_major_ID",
      "connective_tissue-connective_tissue_of_left_shoulder_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_left_shoulder_ID",
      "connective_tissue-left_subtendinous_bursa_of_subscapularis_ID",
      "connective_tissue-left_subdeltoid_bursa_ID",
      "connective_tissue-left_subacromial_bursa_ID",
      "connective_tissue-left_intertubercular_tendon_sheath_ID",
      "connective_tissue-ligaments_of_left_shoulder_ID",
      "connective_tissue-ligaments_of_left_acromioclavicular_joint_ID",
      "connective_tissue-left_inferior_acromioclavicular_ligament_ID",
      "connective_tissue-left_superior_acromioclavicular_ligament_ID",
      "connective_tissue-left_acromioclavicular_joint_capsule_ID",
      "connective_tissue-ligaments_of_left_scapula_ID",
      "connective_tissue-left_coracoclavicular_trapezoid_ligament_ID",
      "connective_tissue-left_coracoclavicular_conoid_ligament_ID",
      "connective_tissue-left_suprascapular_ligament_ID",
      "connective_tissue-left_spinoglenoid_scapular_ligament_ID",
      "connective_tissue-ligaments_of_left_glenohumeral_joint_ID",
      "connective_tissue-left_transverse_humeral_ligament_ID",
      "connective_tissue-left_glenohumeral_joint_capsule_ID",
      "connective_tissue-left_coracohumeral_ligament_ID",
      "connective_tissue-left_coracoacromial_ligament_ID",
      "connective_tissue-left_glenohumeral_ligament_ID",
      "connective_tissue-left_inferior_glenohumeral_ligament_ID",
      "connective_tissue-left_superior_glenohumeral_ligament_ID",
      "connective_tissue-left_middle_glenohumeral_ligament_ID",
      "connective_tissue-left_posterior_glenohumeral_ligament_ID",
      "connective_tissue-articular_cartilage_of_left_shoulder_ID",
      "connective_tissue-left_acromioclavicular_joint_cartilage_ID",
      "connective_tissue-articular_cartilage_of_acromial_end_of_left_clavicle_ID",
      "connective_tissue-left_glenohumeral_joint_cartilage_ID",
      "connective_tissue-articular_cartilage_of_left_glenoid_cavity_ID",
      "connective_tissue-left_glenoid_labrum_ID",
      "connective_tissue-articular_cartilage_of_left_humeral_head_ID",
      "connective_tissue-connective_tissue_of_left_sternoclavicular_joint_ID",
      "connective_tissue-left_sternoclavicular_joint_cartilage_ID",
      "connective_tissue-articular_disc_of_left_sternoclavicular_joint_ID",
      "connective_tissue-articular_cartilage_of_left_clavicular_facet_of_manubrium_ID",
      "connective_tissue-articular_cartilage_of_sternal_end_of_left_clavicle_ID",
      "connective_tissue-left_posterior_sternoclavicular_ligament_ID",
      "connective_tissue-left_anterior_sternoclavicular_ligament_ID",
      "connective_tissue-left_sternoclavicular_joint_capsule_ID",
      "skeletal_system-bones_of_left_pectoral_girdle_ID",
      "skeletal_system-left_clavicle_ID",
      "skeletal_system-left_scapula_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-left_deltoid_ID",
        "name": "Left deltoid"
      },
      {
        "objectId": "muscular_system-muscles_of_left_rotator_cuff_ID",
        "name": "Muscles of left rotator cuff"
      },
      {
        "objectId": "muscular_system-left_infraspinatus_ID",
        "name": "Left infraspinatus"
      },
      {
        "objectId": "muscular_system-left_teres_minor_ID",
        "name": "Left teres minor"
      },
      {
        "objectId": "muscular_system-left_supraspinatus_ID",
        "name": "Left supraspinatus"
      },
      {
        "objectId": "muscular_system-left_subscapularis_ID",
        "name": "Left subscapularis"
      },
      {
        "objectId": "muscular_system-deep_muscles_of_left_shoulder_ID",
        "name": "Deep muscles of left shoulder"
      },
      {
        "objectId": "muscular_system-left_levator_scapulae_ID",
        "name": "Left levator scapulae"
      },
      {
        "objectId": "muscular_system-left_rhomboid_minor_ID",
        "name": "Left rhomboid minor"
      },
      {
        "objectId": "muscular_system-left_rhomboid_major_ID",
        "name": "Left rhomboid major"
      },
      {
        "objectId": "muscular_system-left_serratus_anterior_ID",
        "name": "Left serratus anterior"
      },
      {
        "objectId": "muscular_system-left_teres_major_ID",
        "name": "Left teres major"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_left_shoulder_ID",
        "name": "Connective tissue of left shoulder"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_left_shoulder_ID",
        "name": "Tendon sheaths and bursae of left shoulder"
      },
      {
        "objectId": "connective_tissue-left_subtendinous_bursa_of_subscapularis_ID",
        "name": "Left subtendinous bursa of subscapularis"
      },
      {
        "objectId": "connective_tissue-left_subdeltoid_bursa_ID",
        "name": "Left subdeltoid bursa"
      },
      {
        "objectId": "connective_tissue-left_subacromial_bursa_ID",
        "name": "Left subacromial bursa"
      },
      {
        "objectId": "connective_tissue-left_intertubercular_tendon_sheath_ID",
        "name": "Left intertubercular tendon sheath"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_shoulder_ID",
        "name": "Ligaments of left shoulder"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_acromioclavicular_joint_ID",
        "name": "Ligaments of left acromioclavicular joint"
      },
      {
        "objectId": "connective_tissue-left_inferior_acromioclavicular_ligament_ID",
        "name": "Left inferior acromioclavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_superior_acromioclavicular_ligament_ID",
        "name": "Left superior acromioclavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_acromioclavicular_joint_capsule_ID",
        "name": "Left acromioclavicular joint capsule"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_scapula_ID",
        "name": "Ligaments of left scapula"
      },
      {
        "objectId": "connective_tissue-left_coracoclavicular_trapezoid_ligament_ID",
        "name": "Left coracoclavicular trapezoid ligament"
      },
      {
        "objectId": "connective_tissue-left_coracoclavicular_conoid_ligament_ID",
        "name": "Left coracoclavicular conoid ligament"
      },
      {
        "objectId": "connective_tissue-left_suprascapular_ligament_ID",
        "name": "Left suprascapular ligament"
      },
      {
        "objectId": "connective_tissue-left_spinoglenoid_scapular_ligament_ID",
        "name": "Left spinoglenoid scapular ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_glenohumeral_joint_ID",
        "name": "Ligaments of left glenohumeral joint"
      },
      {
        "objectId": "connective_tissue-left_transverse_humeral_ligament_ID",
        "name": "Left transverse humeral ligament"
      },
      {
        "objectId": "connective_tissue-left_glenohumeral_joint_capsule_ID",
        "name": "Left glenohumeral joint capsule"
      },
      {
        "objectId": "connective_tissue-left_coracohumeral_ligament_ID",
        "name": "Left coracohumeral ligament"
      },
      {
        "objectId": "connective_tissue-left_coracoacromial_ligament_ID",
        "name": "Left coracoacromial ligament"
      },
      {
        "objectId": "connective_tissue-left_glenohumeral_ligament_ID",
        "name": "Left glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-left_inferior_glenohumeral_ligament_ID",
        "name": "Left inferior glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-left_superior_glenohumeral_ligament_ID",
        "name": "Left superior glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-left_middle_glenohumeral_ligament_ID",
        "name": "Left middle glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-left_posterior_glenohumeral_ligament_ID",
        "name": "Left posterior glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_shoulder_ID",
        "name": "Articular cartilage of left shoulder"
      },
      {
        "objectId": "connective_tissue-left_acromioclavicular_joint_cartilage_ID",
        "name": "Left acromioclavicular joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_acromial_end_of_left_clavicle_ID",
        "name": "Articular cartilage of acromial end of left clavicle"
      },
      {
        "objectId": "connective_tissue-left_glenohumeral_joint_cartilage_ID",
        "name": "Left glenohumeral joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_glenoid_cavity_ID",
        "name": "Articular cartilage of left glenoid cavity"
      },
      {
        "objectId": "connective_tissue-left_glenoid_labrum_ID",
        "name": "Left glenoid labrum"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_humeral_head_ID",
        "name": "Articular cartilage of left humeral head"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_left_sternoclavicular_joint_ID",
        "name": "Connective tissue of left sternoclavicular joint"
      },
      {
        "objectId": "connective_tissue-left_sternoclavicular_joint_cartilage_ID",
        "name": "Left sternoclavicular joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_disc_of_left_sternoclavicular_joint_ID",
        "name": "Articular disc of left sternoclavicular joint"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_clavicular_facet_of_manubrium_ID",
        "name": "Articular cartilage of left clavicular facet of manubrium"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_sternal_end_of_left_clavicle_ID",
        "name": "Articular cartilage of sternal end of left clavicle"
      },
      {
        "objectId": "connective_tissue-left_posterior_sternoclavicular_ligament_ID",
        "name": "Left posterior sternoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_sternoclavicular_ligament_ID",
        "name": "Left anterior sternoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_sternoclavicular_joint_capsule_ID",
        "name": "Left sternoclavicular joint capsule"
      },
      {
        "objectId": "skeletal_system-bones_of_left_pectoral_girdle_ID",
        "name": "Bones of left pectoral girdle"
      },
      {
        "objectId": "skeletal_system-left_clavicle_ID",
        "name": "Left clavicle"
      },
      {
        "objectId": "skeletal_system-left_scapula_ID",
        "name": "Left scapula"
      }
    ]
  },
  "rightShoulder": {
    "id": "right_shoulder",
    "name": "Right Shoulder",
    "zoomId": "muscular_system-muscles_of_right_shoulder_ID",
    "keywords": [
      "right shoulder",
      "right deltoid",
      "right scapula",
      "right clavicle",
      "right acromial",
      "right coracoid",
      "right glenohumeral"
    ],
    "selectIds": [
      "muscular_system-right_deltoid_ID",
      "muscular_system-muscles_of_right_rotator_cuff_ID",
      "muscular_system-right_infraspinatus_ID",
      "muscular_system-right_teres_minor_ID",
      "muscular_system-right_supraspinatus_ID",
      "muscular_system-right_subscapularis_ID",
      "muscular_system-deep_muscles_of_right_shoulder_ID",
      "muscular_system-right_levator_scapulae_ID",
      "muscular_system-right_rhomboid_minor_ID",
      "muscular_system-right_rhomboid_major_ID",
      "muscular_system-right_serratus_anterior_ID",
      "muscular_system-right_teres_major_ID",
      "connective_tissue-connective_tissue_of_right_shoulder_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_right_shoulder_ID",
      "connective_tissue-right_subtendinous_bursa_of_subscapularis_ID",
      "connective_tissue-right_subdeltoid_bursa_ID",
      "connective_tissue-right_subacromial_bursa_ID",
      "connective_tissue-right_intertubercular_tendon_sheath_ID",
      "connective_tissue-ligaments_of_right_shoulder_ID",
      "connective_tissue-ligaments_of_right_acromioclavicular_joint_ID",
      "connective_tissue-right_inferior_acromioclavicular_ligament_ID",
      "connective_tissue-right_superior_acromioclavicular_ligament_ID",
      "connective_tissue-right_acromioclavicular_joint_capsule_ID",
      "connective_tissue-ligaments_of_right_scapula_ID",
      "connective_tissue-right_coracoclavicular_trapezoid_ligament_ID",
      "connective_tissue-right_coracoclavicular_conoid_ligament_ID",
      "connective_tissue-right_suprascapular_ligament_ID",
      "connective_tissue-right_spinoglenoid_scapular_ligament_ID",
      "connective_tissue-ligaments_of_right_glenohumeral_joint_ID",
      "connective_tissue-right_transverse_humeral_ligament_ID",
      "connective_tissue-right_glenohumeral_joint_capsule_ID",
      "connective_tissue-right_coracohumeral_ligament_ID",
      "connective_tissue-right_coracoacromial_ligament_ID",
      "connective_tissue-right_glenohumeral_ligament_ID",
      "connective_tissue-right_inferior_glenohumeral_ligament_ID",
      "connective_tissue-right_superior_glenohumeral_ligament_ID",
      "connective_tissue-right_middle_glenohumeral_ligament_ID",
      "connective_tissue-right_posterior_glenohumeral_ligament_ID",
      "connective_tissue-articular_cartilage_of_right_shoulder_ID",
      "connective_tissue-right_acromioclavicular_joint_cartilage_ID",
      "connective_tissue-articular_cartilage_of_acromial_end_of_right_clavicle_ID",
      "connective_tissue-right_glenohumeral_joint_cartilage_ID",
      "connective_tissue-articular_cartilage_of_right_glenoid_cavity_ID",
      "connective_tissue-right_glenoid_labrum_ID",
      "connective_tissue-articular_cartilage_of_right_humeral_head_ID",
      "connective_tissue-connective_tissue_of_right_sternoclavicular_joint_ID",
      "connective_tissue-right_sternoclavicular_joint_cartilage_ID",
      "connective_tissue-articular_disc_of_right_sternoclavicular_joint_ID",
      "connective_tissue-articular_cartilage_of_right_clavicular_facet_of_manubrium_ID",
      "connective_tissue-articular_cartilage_of_sternal_end_of_right_clavicle_ID",
      "connective_tissue-right_posterior_sternoclavicular_ligament_ID",
      "connective_tissue-right_anterior_sternoclavicular_ligament_ID",
      "connective_tissue-right_sternoclavicular_joint_capsule_ID",
      "skeletal_system-bones_of_right_pectoral_girdle_ID",
      "skeletal_system-right_clavicle_ID",
      "skeletal_system-right_scapula_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-right_deltoid_ID",
        "name": "Right deltoid"
      },
      {
        "objectId": "muscular_system-muscles_of_right_rotator_cuff_ID",
        "name": "Muscles of right rotator cuff"
      },
      {
        "objectId": "muscular_system-right_infraspinatus_ID",
        "name": "Right infraspinatus"
      },
      {
        "objectId": "muscular_system-right_teres_minor_ID",
        "name": "Right teres minor"
      },
      {
        "objectId": "muscular_system-right_supraspinatus_ID",
        "name": "Right supraspinatus"
      },
      {
        "objectId": "muscular_system-right_subscapularis_ID",
        "name": "Right subscapularis"
      },
      {
        "objectId": "muscular_system-deep_muscles_of_right_shoulder_ID",
        "name": "Deep muscles of right shoulder"
      },
      {
        "objectId": "muscular_system-right_levator_scapulae_ID",
        "name": "Right levator scapulae"
      },
      {
        "objectId": "muscular_system-right_rhomboid_minor_ID",
        "name": "Right rhomboid minor"
      },
      {
        "objectId": "muscular_system-right_rhomboid_major_ID",
        "name": "Right rhomboid major"
      },
      {
        "objectId": "muscular_system-right_serratus_anterior_ID",
        "name": "Right serratus anterior"
      },
      {
        "objectId": "muscular_system-right_teres_major_ID",
        "name": "Right teres major"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_right_shoulder_ID",
        "name": "Connective tissue of right shoulder"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_right_shoulder_ID",
        "name": "Tendon sheaths and bursae of right shoulder"
      },
      {
        "objectId": "connective_tissue-right_subtendinous_bursa_of_subscapularis_ID",
        "name": "Right subtendinous bursa of subscapularis"
      },
      {
        "objectId": "connective_tissue-right_subdeltoid_bursa_ID",
        "name": "Right subdeltoid bursa"
      },
      {
        "objectId": "connective_tissue-right_subacromial_bursa_ID",
        "name": "Right subacromial bursa"
      },
      {
        "objectId": "connective_tissue-right_intertubercular_tendon_sheath_ID",
        "name": "Right intertubercular tendon sheath"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_shoulder_ID",
        "name": "Ligaments of right shoulder"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_acromioclavicular_joint_ID",
        "name": "Ligaments of right acromioclavicular joint"
      },
      {
        "objectId": "connective_tissue-right_inferior_acromioclavicular_ligament_ID",
        "name": "Right inferior acromioclavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_superior_acromioclavicular_ligament_ID",
        "name": "Right superior acromioclavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_acromioclavicular_joint_capsule_ID",
        "name": "Right acromioclavicular joint capsule"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_scapula_ID",
        "name": "Ligaments of right scapula"
      },
      {
        "objectId": "connective_tissue-right_coracoclavicular_trapezoid_ligament_ID",
        "name": "Right coracoclavicular trapezoid ligament"
      },
      {
        "objectId": "connective_tissue-right_coracoclavicular_conoid_ligament_ID",
        "name": "Right coracoclavicular conoid ligament"
      },
      {
        "objectId": "connective_tissue-right_suprascapular_ligament_ID",
        "name": "Right suprascapular ligament"
      },
      {
        "objectId": "connective_tissue-right_spinoglenoid_scapular_ligament_ID",
        "name": "Right spinoglenoid scapular ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_glenohumeral_joint_ID",
        "name": "Ligaments of right glenohumeral joint"
      },
      {
        "objectId": "connective_tissue-right_transverse_humeral_ligament_ID",
        "name": "Right transverse humeral ligament"
      },
      {
        "objectId": "connective_tissue-right_glenohumeral_joint_capsule_ID",
        "name": "Right glenohumeral joint capsule"
      },
      {
        "objectId": "connective_tissue-right_coracohumeral_ligament_ID",
        "name": "Right coracohumeral ligament"
      },
      {
        "objectId": "connective_tissue-right_coracoacromial_ligament_ID",
        "name": "Right coracoacromial ligament"
      },
      {
        "objectId": "connective_tissue-right_glenohumeral_ligament_ID",
        "name": "Right glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-right_inferior_glenohumeral_ligament_ID",
        "name": "Right inferior glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-right_superior_glenohumeral_ligament_ID",
        "name": "Right superior glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-right_middle_glenohumeral_ligament_ID",
        "name": "Right middle glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-right_posterior_glenohumeral_ligament_ID",
        "name": "Right posterior glenohumeral ligament"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_shoulder_ID",
        "name": "Articular cartilage of right shoulder"
      },
      {
        "objectId": "connective_tissue-right_acromioclavicular_joint_cartilage_ID",
        "name": "Right acromioclavicular joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_acromial_end_of_right_clavicle_ID",
        "name": "Articular cartilage of acromial end of right clavicle"
      },
      {
        "objectId": "connective_tissue-right_glenohumeral_joint_cartilage_ID",
        "name": "Right glenohumeral joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_glenoid_cavity_ID",
        "name": "Articular cartilage of right glenoid cavity"
      },
      {
        "objectId": "connective_tissue-right_glenoid_labrum_ID",
        "name": "Right glenoid labrum"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_humeral_head_ID",
        "name": "Articular cartilage of right humeral head"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_right_sternoclavicular_joint_ID",
        "name": "Connective tissue of right sternoclavicular joint"
      },
      {
        "objectId": "connective_tissue-right_sternoclavicular_joint_cartilage_ID",
        "name": "Right sternoclavicular joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_disc_of_right_sternoclavicular_joint_ID",
        "name": "Articular disc of right sternoclavicular joint"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_clavicular_facet_of_manubrium_ID",
        "name": "Articular cartilage of right clavicular facet of manubrium"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_sternal_end_of_right_clavicle_ID",
        "name": "Articular cartilage of sternal end of right clavicle"
      },
      {
        "objectId": "connective_tissue-right_posterior_sternoclavicular_ligament_ID",
        "name": "Right posterior sternoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_sternoclavicular_ligament_ID",
        "name": "Right anterior sternoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_sternoclavicular_joint_capsule_ID",
        "name": "Right sternoclavicular joint capsule"
      },
      {
        "objectId": "skeletal_system-bones_of_right_pectoral_girdle_ID",
        "name": "Bones of right pectoral girdle"
      },
      {
        "objectId": "skeletal_system-right_clavicle_ID",
        "name": "Right clavicle"
      },
      {
        "objectId": "skeletal_system-right_scapula_ID",
        "name": "Right scapula"
      }
    ]
  },
  "leftUpperArm": {
    "id": "left_upper_arm",
    "name": "Left Upper Arm",
    "zoomId": "muscular_system-muscles_of_left_upper_arm_ID",
    "keywords": [
      "left biceps",
      "left triceps",
      "left brachii",
      "left humerus",
      "left brachial",
      "left upper arm"
    ],
    "selectIds": [
      "muscular_system-muscles_of_left_upper_arm_ID",
      "skeletal_system-bones_of_left_arm_and_forearm_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-left_bicipital_aponeurosis_ID",
        "name": "Left bicipital aponeurosis"
      },
      {
        "objectId": "muscular_system-left_brachialis_ID",
        "name": "Left brachialis"
      },
      {
        "objectId": "muscular_system-left_coracobrachialis_ID",
        "name": "Left coracobrachialis"
      },
      {
        "objectId": "muscular_system-left_biceps_brachii_ID",
        "name": "Left biceps brachii"
      },
      {
        "objectId": "muscular_system-left_triceps_brachii_ID",
        "name": "Left triceps brachii"
      },
      {
        "objectId": "skeletal_system-left_humerus_ID",
        "name": "Left humerus"
      },
      {
        "objectId": "skeletal_system-left_radius_ID",
        "name": "Left radius"
      }
    ]
  },
  "rightUpperArm": {
    "id": "right_upper_arm",
    "name": "Right Upper Arm",
    "zoomId": "muscular_system-muscles_of_right_upper_arm_ID",
    "keywords": [
      "right biceps",
      "right triceps",
      "right brachii",
      "right humerus",
      "right brachial",
      "right upper arm"
    ],
    "selectIds": [
      "muscular_system-muscles_of_right_upper_arm_ID",
      "skeletal_system-bones_of_right_arm_and_forearm_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-right_bicipital_aponeurosis_ID",
        "name": "Right bicipital aponeurosis"
      },
      {
        "objectId": "muscular_system-right_brachialis_ID",
        "name": "Right brachialis"
      },
      {
        "objectId": "muscular_system-right_coracobrachialis_ID",
        "name": "Right coracobrachialis"
      },
      {
        "objectId": "muscular_system-right_biceps_brachii_ID",
        "name": "Right biceps brachii"
      },
      {
        "objectId": "muscular_system-right_triceps_brachii_ID",
        "name": "Right triceps brachii"
      },
      {
        "objectId": "skeletal_system-right_humerus_ID",
        "name": "Right humerus"
      },
      {
        "objectId": "skeletal_system-right_radius_ID",
        "name": "Right radius"
      }
    ]
  },
  "leftElbow": {
    "id": "left_elbow",
    "name": "Left Elbow",
    "zoomId": "connective_tissue-connective_tissue_of_left_elbow_ID",
    "keywords": [
      "left elbow",
      "left olecranon",
      "left ulnar",
      "left radial",
      "left supinator"
    ],
    "selectIds": [
      "connective_tissue-connective_tissue_of_left_elbow_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_left_elbow_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_left_elbow_ID",
        "name": "Tendon sheaths and bursae of left elbow"
      },
      {
        "objectId": "connective_tissue-left_bicipitoradial_bursa_ID",
        "name": "Left bicipitoradial bursa"
      },
      {
        "objectId": "connective_tissue-left_sacciform_recess_of_synovial_membrane_ID",
        "name": "Left sacciform recess of synovial membrane"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_olecranon_bursa_ID",
        "name": "Left subcutaneous olecranon bursa"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_elbow_ID",
        "name": "Ligaments of left elbow"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_elbow_ulnar_collateral_ligament_ID",
        "name": "Ligaments of left elbow ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_part_of_ulnar_collateral_ligament_ID",
        "name": "Left anterior part of ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_transverse_part_of_ulnar_collateral_ligament_ID",
        "name": "Left transverse part of ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_posterior_part_of_ulnar_collateral_ligament_ID",
        "name": "Left posterior part of ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_elbow_joint_capsule_ID",
        "name": "Left elbow joint capsule"
      },
      {
        "objectId": "connective_tissue-left_annular_ligament_of_radius_ID",
        "name": "Left annular ligament of radius"
      },
      {
        "objectId": "connective_tissue-left_radial_collateral_ligament_ID",
        "name": "Left radial collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_ulnar_collateral_ligament_ID",
        "name": "Left lateral ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_elbow_ID",
        "name": "Cartilage of left elbow"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_humerus_ID",
        "name": "Articular cartilage of left humerus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_ulna_ID",
        "name": "Articular cartilage of left ulna"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_radial_head_ID",
        "name": "Articular cartilage of left radial head"
      }
    ]
  },
  "rightElbow": {
    "id": "right_elbow",
    "name": "Right Elbow",
    "zoomId": "connective_tissue-connective_tissue_of_right_elbow_ID",
    "keywords": [
      "right elbow",
      "right olecranon",
      "right ulnar",
      "right radial",
      "right supinator"
    ],
    "selectIds": [
      "connective_tissue-connective_tissue_of_right_elbow_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_right_elbow_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_right_elbow_ID",
        "name": "Tendon sheaths and bursae of right elbow"
      },
      {
        "objectId": "connective_tissue-right_bicipitoradial_bursa_ID",
        "name": "Right bicipitoradial bursa"
      },
      {
        "objectId": "connective_tissue-right_sacciform_recess_of_synovial_membrane_ID",
        "name": "Right sacciform recess of synovial membrane"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_olecranon_bursa_ID",
        "name": "Right subcutaneous olecranon bursa"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_elbow_ID",
        "name": "Ligaments of right elbow"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_elbow_ulnar_collateral_ligament_ID",
        "name": "Ligaments of right elbow ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_part_of_ulnar_collateral_ligament_ID",
        "name": "Right anterior part of ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_transverse_part_of_ulnar_collateral_ligament_ID",
        "name": "Right transverse part of ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_posterior_part_of_ulnar_collateral_ligament_ID",
        "name": "Right posterior part of ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_elbow_joint_capsule_ID",
        "name": "Right elbow joint capsule"
      },
      {
        "objectId": "connective_tissue-right_annular_ligament_of_radius_ID",
        "name": "Right annular ligament of radius"
      },
      {
        "objectId": "connective_tissue-right_radial_collateral_ligament_ID",
        "name": "Right radial collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_ulnar_collateral_ligament_ID",
        "name": "Right lateral ulnar collateral ligament"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_elbow_ID",
        "name": "Cartilage of right elbow"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_humerus_ID",
        "name": "Articular cartilage of right humerus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_ulna_ID",
        "name": "Articular cartilage of right ulna"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_radial_head_ID",
        "name": "Articular cartilage of right radial head"
      }
    ]
  },
  "leftForearm": {
    "id": "left_forearm",
    "name": "Left Forearm",
    "zoomId": "muscular_system-muscles_of_left_forearm_ID",
    "keywords": [
      "left forearm",
      "left hand",
      "left wrist",
      "left carpal",
      "left metacarpal",
      "left radius",
      "left ulna",
      "left palm",
      "left finger",
      "left thumb",
      "left digit",
      "left phalanx",
      "left digital"
    ],
    "selectIds": [
      "muscular_system-muscles_of_left_forearm_ID",
      "skeletal_system-left_ulna_ID",
      "connective_tissue-left_interosseous_membrane_ID",
      "connective_tissue-left_oblique_cord_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-flexor_muscles_of_left_forearm_ID",
        "name": "Flexor muscles of left forearm"
      },
      {
        "objectId": "muscular_system-left_palmaris_longus_ID",
        "name": "Left palmaris longus"
      },
      {
        "objectId": "muscular_system-left_flexor_digitorum_superficialis_ID",
        "name": "Left flexor digitorum superficialis"
      },
      {
        "objectId": "muscular_system-left_pronator_teres_ID",
        "name": "Left pronator teres"
      },
      {
        "objectId": "muscular_system-left_flexor_digitorum_profundus_ID",
        "name": "Left flexor digitorum profundus"
      },
      {
        "objectId": "muscular_system-left_flexor_carpi_ulnaris_ID",
        "name": "Left flexor carpi ulnaris"
      },
      {
        "objectId": "muscular_system-left_pronator_quadratus_ID",
        "name": "Left pronator quadratus"
      },
      {
        "objectId": "muscular_system-left_flexor_pollicis_longus_ID",
        "name": "Left flexor pollicis longus"
      },
      {
        "objectId": "muscular_system-left_flexor_carpi_radialis_ID",
        "name": "Left flexor carpi radialis"
      },
      {
        "objectId": "muscular_system-extensor_muscles_of_left_forearm_ID",
        "name": "Extensor muscles of left forearm"
      },
      {
        "objectId": "muscular_system-left_brachioradialis_ID",
        "name": "Left brachioradialis"
      },
      {
        "objectId": "muscular_system-left_extensor_carpi_radialis_longus_ID",
        "name": "Left extensor carpi radialis longus"
      },
      {
        "objectId": "muscular_system-left_extensor_carpi_radialis_brevis_ID",
        "name": "Left extensor carpi radialis brevis"
      },
      {
        "objectId": "muscular_system-left_extensor_carpi_ulnaris_ID",
        "name": "Left extensor carpi ulnaris"
      },
      {
        "objectId": "muscular_system-left_anconeus_ID",
        "name": "Left anconeus"
      },
      {
        "objectId": "muscular_system-left_abductor_pollicis_longus_ID",
        "name": "Left abductor pollicis longus"
      },
      {
        "objectId": "muscular_system-left_extensor_pollicis_longus_ID",
        "name": "Left extensor pollicis longus"
      },
      {
        "objectId": "muscular_system-left_extensor_pollicis_brevis_ID",
        "name": "Left extensor pollicis brevis"
      },
      {
        "objectId": "muscular_system-left_extensor_digiti_minimi_ID",
        "name": "Left extensor digiti minimi"
      },
      {
        "objectId": "muscular_system-left_extensor_digitorum_ID",
        "name": "Left extensor digitorum"
      },
      {
        "objectId": "muscular_system-left_supinator_ID",
        "name": "Left supinator"
      },
      {
        "objectId": "muscular_system-left_extensor_indicis_ID",
        "name": "Left extensor indicis"
      },
      {
        "objectId": "skeletal_system-left_ulna_ID",
        "name": "Left ulna"
      },
      {
        "objectId": "connective_tissue-left_interosseous_membrane_ID",
        "name": "Left interosseous membrane"
      },
      {
        "objectId": "connective_tissue-left_oblique_cord_ID",
        "name": "Left oblique cord"
      }
    ]
  },
  "rightForearm": {
    "id": "right_forearm",
    "name": "Right Forearm",
    "zoomId": "muscular_system-muscles_of_right_forearm_ID",
    "keywords": [
      "right forearm",
      "right hand",
      "right wrist",
      "right carpal",
      "right metacarpal",
      "right radius",
      "right ulna",
      "right palm",
      "right finger",
      "right thumb",
      "right digit",
      "right phalanx",
      "right digital"
    ],
    "selectIds": [
      "muscular_system-muscles_of_right_forearm_ID",
      "skeletal_system-right_ulna_ID",
      "connective_tissue-right_interosseous_membrane_ID",
      "connective_tissue-right_oblique_cord_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-flexor_muscles_of_right_forearm_ID",
        "name": "Flexor muscles of right forearm"
      },
      {
        "objectId": "muscular_system-right_palmaris_longus_ID",
        "name": "Right palmaris longus"
      },
      {
        "objectId": "muscular_system-right_flexor_digitorum_superficialis_ID",
        "name": "Right flexor digitorum superficialis"
      },
      {
        "objectId": "muscular_system-right_pronator_teres_ID",
        "name": "Right pronator teres"
      },
      {
        "objectId": "muscular_system-right_flexor_digitorum_profundus_ID",
        "name": "Right flexor digitorum profundus"
      },
      {
        "objectId": "muscular_system-right_flexor_carpi_ulnaris_ID",
        "name": "Right flexor carpi ulnaris"
      },
      {
        "objectId": "muscular_system-right_pronator_quadratus_ID",
        "name": "Right pronator quadratus"
      },
      {
        "objectId": "muscular_system-right_flexor_pollicis_longus_ID",
        "name": "Right flexor pollicis longus"
      },
      {
        "objectId": "muscular_system-right_flexor_carpi_radialis_ID",
        "name": "Right flexor carpi radialis"
      },
      {
        "objectId": "muscular_system-extensor_muscles_of_right_forearm_ID",
        "name": "Extensor muscles of right forearm"
      },
      {
        "objectId": "muscular_system-right_brachioradialis_ID",
        "name": "Right brachioradialis"
      },
      {
        "objectId": "muscular_system-right_extensor_carpi_radialis_longus_ID",
        "name": "Right extensor carpi radialis longus"
      },
      {
        "objectId": "muscular_system-right_extensor_carpi_radialis_brevis_ID",
        "name": "Right extensor carpi radialis brevis"
      },
      {
        "objectId": "muscular_system-right_extensor_carpi_ulnaris_ID",
        "name": "Right extensor carpi ulnaris"
      },
      {
        "objectId": "muscular_system-right_anconeus_ID",
        "name": "Right anconeus"
      },
      {
        "objectId": "muscular_system-right_abductor_pollicis_longus_ID",
        "name": "Right abductor pollicis longus"
      },
      {
        "objectId": "muscular_system-right_extensor_pollicis_longus_ID",
        "name": "Right extensor pollicis longus"
      },
      {
        "objectId": "muscular_system-right_extensor_pollicis_brevis_ID",
        "name": "Right extensor pollicis brevis"
      },
      {
        "objectId": "muscular_system-right_extensor_digiti_minimi_ID",
        "name": "Right extensor digiti minimi"
      },
      {
        "objectId": "muscular_system-right_extensor_digitorum_ID",
        "name": "Right extensor digitorum"
      },
      {
        "objectId": "muscular_system-right_supinator_ID",
        "name": "Right supinator"
      },
      {
        "objectId": "muscular_system-right_extensor_indicis_ID",
        "name": "Right extensor indicis"
      },
      {
        "objectId": "skeletal_system-right_ulna_ID",
        "name": "Right ulna"
      },
      {
        "objectId": "connective_tissue-right_interosseous_membrane_ID",
        "name": "Right interosseous membrane"
      },
      {
        "objectId": "connective_tissue-right_oblique_cord_ID",
        "name": "Right oblique cord"
      }
    ]
  },
  "leftHand": {
    "id": "left_hand",
    "name": "Left Hand",
    "zoomId": "skeletal_system-bones_of_left_hand_and_wrist_ID",
    "keywords": [
      "hand",
      "left hand",
      "left hand and wrist",
      "left hand and wrist bones",
      "left hand and wrist muscles",
      "left hand and wrist connective tissue"
    ],
    "selectIds": [
      "muscular_system-muscles_of_left_hand_ID",
      "connective_tissue-connective_tissue_of_left_hand_and_wrist_ID",
      "skeletal_system-bones_of_left_hand_and_wrist_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_left_hand_ID",
        "name": "Muscles of left hand"
      },
      {
        "objectId": "muscular_system-palmar_muscles_of_left_hand_ID",
        "name": "Palmar muscles of left hand"
      },
      {
        "objectId": "muscular_system-thenar_muscles_of_left_hand_ID",
        "name": "Thenar muscles of left hand"
      },
      {
        "objectId": "muscular_system-left_abductor_pollicis_brevis_ID",
        "name": "Left abductor pollicis brevis"
      },
      {
        "objectId": "muscular_system-left_flexor_pollicis_brevis_ID",
        "name": "Left flexor pollicis brevis"
      },
      {
        "objectId": "muscular_system-left_adductor_pollicis_ID",
        "name": "Left adductor pollicis"
      },
      {
        "objectId": "muscular_system-left_opponens_pollicis_ID",
        "name": "Left opponens pollicis"
      },
      {
        "objectId": "muscular_system-hypothenar_muscles_of_left_hand_ID",
        "name": "Hypothenar muscles of left hand"
      },
      {
        "objectId": "muscular_system-left_flexor_digiti_minimi_brevis_of_hand_ID",
        "name": "Left flexor digiti minimi brevis of hand"
      },
      {
        "objectId": "muscular_system-left_opponens_digiti_minimi_ID",
        "name": "Left opponens digiti minimi"
      },
      {
        "objectId": "muscular_system-left_abductor_digiti_minimi_ID",
        "name": "Left abductor digiti minimi"
      },
      {
        "objectId": "muscular_system-left_palmaris_brevis_ID",
        "name": "Left palmaris brevis"
      },
      {
        "objectId": "muscular_system-palmar_interosseous_muscles_of_left_hand_ID",
        "name": "Palmar interosseous muscles of left hand"
      },
      {
        "objectId": "muscular_system-first_palmar_interosseous_muscle_of_left_hand_ID",
        "name": "First palmar interosseous muscle of left hand"
      },
      {
        "objectId": "muscular_system-second_palmar_interosseous_muscle_of_left_hand_ID",
        "name": "Second palmar interosseous muscle of left hand"
      },
      {
        "objectId": "muscular_system-third_palmar_interosseous_muscle_of_left_hand_ID",
        "name": "Third palmar interosseous muscle of left hand"
      },
      {
        "objectId": "muscular_system-lumbrical_muscles_of_left_hand_ID",
        "name": "Lumbrical muscles of left hand"
      },
      {
        "objectId": "muscular_system-first_lumbrical_muscle_of_left_hand_ID",
        "name": "First lumbrical muscle of left hand"
      },
      {
        "objectId": "muscular_system-second_lumbrical_muscle_of_left_hand_ID",
        "name": "Second lumbrical muscle of left hand"
      },
      {
        "objectId": "muscular_system-fourth_lumbrical_muscle_of_left_hand_ID",
        "name": "Fourth lumbrical muscle of left hand"
      },
      {
        "objectId": "muscular_system-third_lumbrical_muscle_of_left_hand_ID",
        "name": "Third lumbrical muscle of left hand"
      },
      {
        "objectId": "muscular_system-dorsal_interosseous_muscles_of_left_hand_ID",
        "name": "Dorsal interosseous muscles of left hand"
      },
      {
        "objectId": "muscular_system-first_dorsal_interosseous_muscle_of_left_hand_ID",
        "name": "First dorsal interosseous muscle of left hand"
      },
      {
        "objectId": "muscular_system-second_dorsal_interosseous_muscle_of_left_hand_ID",
        "name": "Second dorsal interosseous muscle of left hand"
      },
      {
        "objectId": "muscular_system-third_dorsal_interosseous_muscle_of_left_hand_ID",
        "name": "Third dorsal interosseous muscle of left hand"
      },
      {
        "objectId": "muscular_system-fourth_dorsal_interosseous_muscle_of_left_hand_ID",
        "name": "Fourth dorsal interosseous muscle of left hand"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_left_hand_and_wrist_ID",
        "name": "Connective tissue of left hand and wrist"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_left_hand_and_wrist_ID",
        "name": "Tendon sheaths and bursae of left hand and wrist"
      },
      {
        "objectId": "connective_tissue-left_common_flexor_sheath_ID",
        "name": "Left common flexor sheath"
      },
      {
        "objectId": "connective_tissue-tendinous_sheath_of_left_flexor_carpi_radialis_ID",
        "name": "Tendinous sheath of left flexor carpi radialis"
      },
      {
        "objectId": "connective_tissue-tendinous_sheath_of_left_flexor_pollicis_longus_ID",
        "name": "Tendinous sheath of left flexor pollicis longus"
      },
      {
        "objectId": "connective_tissue-synovial_tendon_sheaths_of_left_fingers_ID",
        "name": "Synovial tendon sheaths of left fingers"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_wrist_ID",
        "name": "Ligaments of left wrist"
      },
      {
        "objectId": "connective_tissue-left_dorsal_radioulnar_ligament_ID",
        "name": "Left dorsal radioulnar ligament"
      },
      {
        "objectId": "connective_tissue-left_palmar_radioulnar_ligament_ID",
        "name": "Left palmar radioulnar ligament"
      },
      {
        "objectId": "connective_tissue-left_ulnocarpal_joint_ligaments_ID",
        "name": "Left ulnocarpal joint ligaments"
      },
      {
        "objectId": "connective_tissue-left_radiocarpal_joint_ligaments_ID",
        "name": "Left radiocarpal joint ligaments"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_wrist_ID",
        "name": "Cartilage of left wrist"
      },
      {
        "objectId": "connective_tissue-distal_radioulnar_articular_disc_of_left_wrist_ID",
        "name": "Distal radioulnar articular disc of left wrist"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_ulnar_head_ID",
        "name": "Articular cartilage of left ulnar head"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_triquetal_ID",
        "name": "Articular cartilage of left triquetal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_lunate_ID",
        "name": "Articular cartilage of left lunate"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_radius_ID",
        "name": "Articular cartilage of left radius"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_scaphoid_ID",
        "name": "Articular cartilage of left scaphoid"
      },
      {
        "objectId": "connective_tissue-left_intercarpal_joint_cartilage_ID",
        "name": "Left intercarpal joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_capitate_ID",
        "name": "Articular cartilage of left capitate"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_trapezoid_ID",
        "name": "Articular cartilage of left trapezoid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_trapezium_ID",
        "name": "Articular cartilage of left trapezium"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_pisiform_facet_of_left_triquetral_ID",
        "name": "Articular cartilage of pisiform facet of left triquetral"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_triquetral_facet_of_left_pisiform_ID",
        "name": "Articular cartilage of triquetral facet of left pisiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_hamate_ID",
        "name": "Articular cartilage of left hamate"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_hand_ID",
        "name": "Ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-left_flexor_retinaculum_of_hand_ID",
        "name": "Left flexor retinaculum of hand"
      },
      {
        "objectId": "connective_tissue-left_extensor_retinaculum_of_hand_ID",
        "name": "Left extensor retinaculum of hand"
      },
      {
        "objectId": "connective_tissue-left_palmar_carpal_ligament_ID",
        "name": "Left palmar carpal ligament"
      },
      {
        "objectId": "connective_tissue-left_palmar_aponeurosis_ID",
        "name": "Left palmar aponeurosis"
      },
      {
        "objectId": "connective_tissue-left_intercarpal_joint_ligaments_ID",
        "name": "Left intercarpal joint ligaments"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_left_hand_ID",
        "name": "Carpometacarpal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_left_thumb_ID",
        "name": "Carpometacarpal ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_joint_capsule_of_left_thumb_ID",
        "name": "Carpometacarpal joint capsule of left thumb"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligaments_of_left_thumb_ID",
        "name": "Palmar carpometacarpal ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-superficial_anterior_oblique_ligament_of_left_thumb_ID",
        "name": "Superficial anterior oblique ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-deep_anterior_oblique_ligament_of_left_thumb_ID",
        "name": "Deep anterior oblique ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligaments_of_left_thumb_ID",
        "name": "Dorsal carpometacarpal ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_trapeziometacarpal_ligament_of_left_thumb_ID",
        "name": "Dorsal trapeziometacarpal ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-posterior_oblique_ligament_of_left_thumb_ID",
        "name": "Posterior oblique ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_central_ligament_of_left_thumb_ID",
        "name": "Dorsal central ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_radial_ligament_of_left_thumb_ID",
        "name": "Dorsal radial ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_left_second_metacarpal_ID",
        "name": "Carpometacarpal ligaments of left second metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_left_second_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of left second metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_left_second_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of left second metacarpal"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_left_third_metacarpal_ID",
        "name": "Carpometacarpal ligaments of left third metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_left_third_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of left third metacarpal"
      },
      {
        "objectId": "connective_tissue-interosseous_carpometacarpal_ligament_of_left_third_metacarpal_ID",
        "name": "Interosseous carpometacarpal ligament of left third metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_left_third_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of left third metacarpal"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_left_fourth_metacarpal_ID",
        "name": "Carpometacarpal ligaments of left fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_left_fourth_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of left fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-interosseous_carpometacarpal_ligament_of_left_fourth_metacarpal_ID",
        "name": "Interosseous carpometacarpal ligament of left fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_left_fourth_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of left fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_left_fifth_metacarpal_ID",
        "name": "Carpometacarpal ligaments of left fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_left_fifth_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of left fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_left_fifth_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of left fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-intermetacarpal_ligaments_of_left_hand_ID",
        "name": "Intermetacarpal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-palmar_intermetacarpal_ligaments_of_left_hand_ID",
        "name": "Palmar intermetacarpal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-palmar_ligament_of_second_and_third_left_metacarpals_ID",
        "name": "Palmar ligament of second and third left metacarpals"
      },
      {
        "objectId": "connective_tissue-palmar_ligament_of_third_and_fourth_left_metacarpals_ID",
        "name": "Palmar ligament of third and fourth left metacarpals"
      },
      {
        "objectId": "connective_tissue-palmar_ligament_of_fourth_and_fifth_left_metacarpals_ID",
        "name": "Palmar ligament of fourth and fifth left metacarpals"
      },
      {
        "objectId": "connective_tissue-interosseous_intermetacarpal_ligaments_of_left_hand_ID",
        "name": "Interosseous intermetacarpal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_second_and_third_left_metacarpals_ID",
        "name": "Interosseous ligament of second and third left metacarpals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_third_and_fourth_left_metacarpals_ID",
        "name": "Interosseous ligament of third and fourth left metacarpals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_fourth_and_fifth_left_metacarpals_ID",
        "name": "Interosseous ligament of fourth and fifth left metacarpals"
      },
      {
        "objectId": "connective_tissue-dorsal_intermetacarpal_ligaments_of_left_hand_ID",
        "name": "Dorsal intermetacarpal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_second_and_third_left_metacarpals_ID",
        "name": "Dorsal ligament of second and third left metacarpals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_third_and_fourth_left_metacarpals_ID",
        "name": "Dorsal ligament of third and fourth left metacarpals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_fourth_and_fifth_left_metacarpals_ID",
        "name": "Dorsal ligament of fourth and fifth left metacarpals"
      },
      {
        "objectId": "connective_tissue-left_transverse_fasciculi_ID",
        "name": "Left transverse fasciculi"
      },
      {
        "objectId": "connective_tissue-left_deep_transverse_metacarpal_ligament_ID",
        "name": "Left deep transverse metacarpal ligament"
      },
      {
        "objectId": "connective_tissue-left_superficial_transverse_metacarpal_ligament_ID",
        "name": "Left superficial transverse metacarpal ligament"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_left_hand_ID",
        "name": "Metacarpophalangeal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_left_thumb_ID",
        "name": "Metacarpophalangeal ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_left_thumb_ID",
        "name": "Metacarpophalangeal joint capsule of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_left_thumb_ID",
        "name": "Metacarpophalangeal dorsal expansion of left thumb"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_left_thumb_ID",
        "name": "Palmar plate of metacarpophalangeal joint of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_left_thumb_ID",
        "name": "Metacarpophalangeal collateral ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_left_thumb_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligament_of_left_thumb_ID",
        "name": "Metacarpophalangeal radial collateral ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_left_thumb_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_left_thumb_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_left_thumb_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_left_thumb_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_left_index_finger_ID",
        "name": "Metacarpophalangeal ligaments of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_left_index_finger_ID",
        "name": "Metacarpophalangeal joint capsule of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_left_index_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of left index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_left_index_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_left_index_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_left_index_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_left_index_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_left_index_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_left_index_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_left_index_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_left_index_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal ligaments of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal joint capsule of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of left middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_left_middle_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal ligaments of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal joint capsule of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of left ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_left_ring_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_left_little_finger_ID",
        "name": "Metacarpophalangeal ligaments of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_left_little_finger_ID",
        "name": "Metacarpophalangeal joint capsule of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_left_little_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of left little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_left_little_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_left_little_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_left_little_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_left_little_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_left_little_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_left_little_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_left_little_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of left little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_left_little_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of left little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_hand_ID",
        "name": "Interphalangeal ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_thumb_ID",
        "name": "Interphalangeal ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsule_of_left_thumb_ID",
        "name": "Interphalangeal joint capsule of left thumb"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_interphalangeal_joint_of_left_thumb_ID",
        "name": "Palmar plate of interphalangeal joint of left thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_thumb_ID",
        "name": "Interphalangeal collateral ligaments of left thumb"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_left_thumb_ID",
        "name": "Flexor pulley system of left thumb"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_left_thumb_ID",
        "name": "Annular pulleys of left thumb"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_left_thumb_ID",
        "name": "Annular pulley A1 of left thumb"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_left_thumb_ID",
        "name": "Annular pulley A2 of left thumb"
      },
      {
        "objectId": "connective_tissue-oblique_pulley_of_left_thumb_ID",
        "name": "Oblique pulley of left thumb"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_left_thumb_ID",
        "name": "Cruciate pulleys of left thumb"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_left_thumb_ID",
        "name": "Cruciate pulley C1 of left thumb"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_left_thumb_ID",
        "name": "Cruciate pulley C2 of left thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_index_finger_ID",
        "name": "Interphalangeal ligaments of left index finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_left_index_finger_ID",
        "name": "Joint capsules of interphalangeal joints of left index finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_left_index_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_left_index_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_left_index_finger_ID",
        "name": "Palmar plates of interphalangeal joints of left index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_left_index_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_left_index_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_index_finger_ID",
        "name": "Interphalangeal collateral ligaments of left index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_left_index_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_left_index_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of left index finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_left_index_finger_ID",
        "name": "Triangular ligament of left index finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_left_index_finger_ID",
        "name": "Flexor pulley system of left index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_left_index_finger_ID",
        "name": "Annular pulleys of left index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_left_index_finger_ID",
        "name": "Annular pulley A1 of left index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_left_index_finger_ID",
        "name": "Annular pulley A2 of left index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_left_index_finger_ID",
        "name": "Annular pulley A3 of left index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_left_index_finger_ID",
        "name": "Annular pulley A4 of left index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_left_index_finger_ID",
        "name": "Annular pulley A5 of left index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_left_index_finger_ID",
        "name": "Cruciate pulleys of left index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_left_index_finger_ID",
        "name": "Cruciate pulley C1 of left index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_left_index_finger_ID",
        "name": "Cruciate pulley C2 of left index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_left_index_finger_ID",
        "name": "Cruciate pulley C3 of left index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_left_index_finger_ID",
        "name": "Cruciate pulley C4 of left index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_middle_finger_ID",
        "name": "Interphalangeal ligaments of left middle finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_left_middle_finger_ID",
        "name": "Joint capsules of interphalangeal joints of left middle finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_left_middle_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_left_middle_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_left_middle_finger_ID",
        "name": "Palmar plates of interphalangeal joints of left middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_left_middle_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_left_middle_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_middle_finger_ID",
        "name": "Interphalangeal collateral ligaments of left middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_left_middle_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_left_middle_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of left middle finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_left_middle_finger_ID",
        "name": "Triangular ligament of left middle finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_left_middle_finger_ID",
        "name": "Flexor pulley system of left middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_left_middle_finger_ID",
        "name": "Annular pulleys of left middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_left_middle_finger_ID",
        "name": "Annular pulley A1 of left middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_left_middle_finger_ID",
        "name": "Annular pulley A2 of left middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_left_middle_finger_ID",
        "name": "Annular pulley A3 of left middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_left_middle_finger_ID",
        "name": "Annular pulley A4 of left middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_left_middle_finger_ID",
        "name": "Annular pulley A5 of left middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_left_middle_finger_ID",
        "name": "Cruciate pulleys of left middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_left_middle_finger_ID",
        "name": "Cruciate pulley C1 of left middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_left_middle_finger_ID",
        "name": "Cruciate pulley C2 of left middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_left_middle_finger_ID",
        "name": "Cruciate pulley C3 of left middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_left_middle_finger_ID",
        "name": "Cruciate pulley C4 of left middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_ring_finger_ID",
        "name": "Interphalangeal ligaments of left ring finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_left_ring_finger_ID",
        "name": "Joint capsules of interphalangeal joints of left ring finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_left_ring_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_left_ring_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_left_ring_finger_ID",
        "name": "Palmar plates of interphalangeal joints of left ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_left_ring_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_left_ring_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_ring_finger_ID",
        "name": "Interphalangeal collateral ligaments of left ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_left_ring_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_left_ring_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of left ring finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_left_ring_finger_ID",
        "name": "Triangular ligament of left ring finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_left_ring_finger_ID",
        "name": "Flexor pulley system of left ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_left_ring_finger_ID",
        "name": "Annular pulleys of left ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_left_ring_finger_ID",
        "name": "Annular pulley A1 of left ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_left_ring_finger_ID",
        "name": "Annular pulley A2 of left ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_left_ring_finger_ID",
        "name": "Annular pulley A3 of left ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_left_ring_finger_ID",
        "name": "Annular pulley A4 of left ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_left_ring_finger_ID",
        "name": "Annular pulley A5 of left ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_left_ring_finger_ID",
        "name": "Cruciate pulleys of left ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_left_ring_finger_ID",
        "name": "Cruciate pulley C1 of left ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_left_ring_finger_ID",
        "name": "Cruciate pulley C2 of left ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_left_ring_finger_ID",
        "name": "Cruciate pulley C3 of left ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_left_ring_finger_ID",
        "name": "Cruciate pulley C4 of left ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_little_finger_ID",
        "name": "Interphalangeal ligaments of left little finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_left_little_finger_ID",
        "name": "Joint capsules of interphalangeal joints of left little finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_left_little_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_left_little_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_left_little_finger_ID",
        "name": "Palmar plates of interphalangeal joints of left little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_left_little_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_left_little_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_little_finger_ID",
        "name": "Interphalangeal collateral ligaments of left little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_left_little_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_left_little_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of left little finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_left_little_finger_ID",
        "name": "Triangular ligament of left little finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_left_little_finger_ID",
        "name": "Flexor pulley system of left little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_left_little_finger_ID",
        "name": "Annular pulleys of left little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_left_little_finger_ID",
        "name": "Annular pulley A1 of left little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_left_little_finger_ID",
        "name": "Annular pulley A2 of left little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_left_little_finger_ID",
        "name": "Annular pulley A3 of left little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_left_little_finger_ID",
        "name": "Annular pulley A4 of left little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_left_little_finger_ID",
        "name": "Annular pulley A5 of left little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_left_little_finger_ID",
        "name": "Cruciate pulleys of left little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_left_little_finger_ID",
        "name": "Cruciate pulley C1 of left little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_left_little_finger_ID",
        "name": "Cruciate pulley C2 of left little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_left_little_finger_ID",
        "name": "Cruciate pulley C3 of left little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_left_little_finger_ID",
        "name": "Cruciate pulley C4 of left little finger"
      },
      {
        "objectId": "connective_tissue-transverse_retinacular_ligaments_of_left_hand_ID",
        "name": "Transverse retinacular ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-oblique_retinacular_ligaments_of_left_hand_ID",
        "name": "Oblique retinacular ligaments of left hand"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_hand_ID",
        "name": "Articular cartilage of left hand"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_joint_cartilage_of_left_hand_ID",
        "name": "Carpometacarpal joint cartilage of left hand"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_left_first_metacarpal_ID",
        "name": "Articular cartilage of the left first metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_left_second_metacarpal_ID",
        "name": "Articular cartilage of the left second metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_left_third_metacarpal_ID",
        "name": "Articular cartilage of the left third metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_left_fourth_metacarpal_ID",
        "name": "Articular cartilage of the left fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_left_fifth_metacarpal_ID",
        "name": "Articular cartilage of the left fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_left_hand_ID",
        "name": "Metacarpophalangeal joint cartilage of left hand"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_left_thumb_ID",
        "name": "Metacarpophalangeal joint cartilage of left thumb"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_first_metacarpal_bone_ID",
        "name": "Articular cartilage of head of left first metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_thumb_ID",
        "name": "Articular cartilage of base of proximal phalanx of left thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_left_index_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of left index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_second_metacarpal_bone_ID",
        "name": "Articular cartilage of head of left second metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_index_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of left index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_left_middle_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of left middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_third_metacarpal_bone_ID",
        "name": "Articular cartilage of head of left third metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_middle_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of left middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_left_ring_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of left ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fourth_metacarpal_bone_ID",
        "name": "Articular cartilage of head of left fourth metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_ring_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of left ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_left_little_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of left little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fifth_metacarpal_bone_ID",
        "name": "Articular cartilage of head of left fifth metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_little_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of left little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_left_hand_ID",
        "name": "Interphalangeal joint cartilage of left hand"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_left_thumb_ID",
        "name": "Interphalangeal joint cartilage of left thumb"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_thumb_ID",
        "name": "Articular cartilage of head of proximal phalanx of left thumb"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_thumb_ID",
        "name": "Articular cartilage of base of distal phalanx of left thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_left_index_finger_ID",
        "name": "Interphalangeal joint cartilage of left index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_index_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of left index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_index_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of left index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_index_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of left index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_index_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of left index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_left_middle_finger_ID",
        "name": "Interphalangeal joint cartilage of left middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_middle_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of left middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_middle_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of left middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_middle_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of left middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_middle_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of left middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_left_ring_finger_ID",
        "name": "Interphalangeal joint cartilage of left ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_ring_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of left ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_ring_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of left ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_ring_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of left ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_ring_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of left ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_left_little_finger_ID",
        "name": "Interphalangeal joint cartilage of left little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_little_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of left little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_little_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of left little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_little_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of left little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_little_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of left little finger"
      },
      {
        "objectId": "skeletal_system-bones_of_left_hand_and_wrist_ID",
        "name": "Bones of left hand and wrist"
      },
      {
        "objectId": "skeletal_system-left_capitate_ID",
        "name": "Left capitate"
      },
      {
        "objectId": "skeletal_system-left_hamate_ID",
        "name": "Left hamate"
      },
      {
        "objectId": "skeletal_system-left_lunate_ID",
        "name": "Left lunate"
      },
      {
        "objectId": "skeletal_system-left_pisiform_ID",
        "name": "Left pisiform"
      },
      {
        "objectId": "skeletal_system-left_scaphoid_ID",
        "name": "Left scaphoid"
      },
      {
        "objectId": "skeletal_system-left_trapezium_ID",
        "name": "Left trapezium"
      },
      {
        "objectId": "skeletal_system-left_trapezoid_ID",
        "name": "Left trapezoid"
      },
      {
        "objectId": "skeletal_system-left_triquetrum_ID",
        "name": "Left triquetrum"
      },
      {
        "objectId": "skeletal_system-left_first_metacarpal_ID",
        "name": "Left first metacarpal"
      },
      {
        "objectId": "skeletal_system-left_second_metacarpal_ID",
        "name": "Left second metacarpal"
      },
      {
        "objectId": "skeletal_system-left_third_metacarpal_ID",
        "name": "Left third metacarpal"
      },
      {
        "objectId": "skeletal_system-left_fourth_metacarpal_ID",
        "name": "Left fourth metacarpal"
      },
      {
        "objectId": "skeletal_system-left_fifth_metacarpal_ID",
        "name": "Left fifth metacarpal"
      },
      {
        "objectId": "skeletal_system-sesamoid_bones_of_left_thumb_ID",
        "name": "Sesamoid bones of left thumb"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_hand_ID",
        "name": "Phalanges of left hand"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_thumb_ID",
        "name": "Phalanges of left thumb"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_thumb_ID",
        "name": "Proximal phalanx of left thumb"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_thumb_ID",
        "name": "Distal phalanx of left thumb"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_index_finger_ID",
        "name": "Phalanges of left index finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_index_finger_ID",
        "name": "Proximal phalanx of left index finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_index_finger_ID",
        "name": "Middle phalanx of left index finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_index_finger_ID",
        "name": "Distal phalanx of left index finger"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_middle_finger_ID",
        "name": "Phalanges of left middle finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_middle_finger_ID",
        "name": "Proximal phalanx of left middle finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_middle_finger_ID",
        "name": "Middle phalanx of left middle finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_middle_finger_ID",
        "name": "Distal phalanx of left middle finger"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_ring_finger_ID",
        "name": "Phalanges of left ring finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_ring_finger_ID",
        "name": "Proximal phalanx of left ring finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_ring_finger_ID",
        "name": "Middle phalanx of left ring finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_ring_finger_ID",
        "name": "Distal phalanx of left ring finger"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_little_finger_ID",
        "name": "Phalanges of left little finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_little_finger_ID",
        "name": "Proximal phalanx of left little finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_little_finger_ID",
        "name": "Middle phalanx of left little finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_little_finger_ID",
        "name": "Distal phalanx of left little finger"
      }
    ]
  },
  "rightHand": {
    "id": "right_hand",
    "name": "Right Hand",
    "zoomId": "skeletal_system-bones_of_right_hand_and_wrist_ID",
    "keywords": [
      "hand",
      "right hand",
      "right hand and wrist",
      "right hand and wrist bones",
      "right hand and wrist muscles",
      "right hand and wrist connective tissue"
    ],
    "selectIds": [
      "muscular_system-muscles_of_right_hand_ID",
      "connective_tissue-connective_tissue_of_right_hand_and_wrist_ID",
      "skeletal_system-bones_of_right_hand_and_wrist_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_right_hand_ID",
        "name": "Muscles of right hand"
      },
      {
        "objectId": "muscular_system-palmar_muscles_of_right_hand_ID",
        "name": "Palmar muscles of right hand"
      },
      {
        "objectId": "muscular_system-thenar_muscles_of_right_hand_ID",
        "name": "Thenar muscles of right hand"
      },
      {
        "objectId": "muscular_system-right_abductor_pollicis_brevis_ID",
        "name": "Right abductor pollicis brevis"
      },
      {
        "objectId": "muscular_system-right_flexor_pollicis_brevis_ID",
        "name": "Right flexor pollicis brevis"
      },
      {
        "objectId": "muscular_system-right_adductor_pollicis_ID",
        "name": "Right adductor pollicis"
      },
      {
        "objectId": "muscular_system-right_opponens_pollicis_ID",
        "name": "Right opponens pollicis"
      },
      {
        "objectId": "muscular_system-hypothenar_muscles_of_right_hand_ID",
        "name": "Hypothenar muscles of right hand"
      },
      {
        "objectId": "muscular_system-right_flexor_digiti_minimi_brevis_of_hand_ID",
        "name": "Right flexor digiti minimi brevis of hand"
      },
      {
        "objectId": "muscular_system-right_opponens_digiti_minimi_ID",
        "name": "Right opponens digiti minimi"
      },
      {
        "objectId": "muscular_system-right_abductor_digiti_minimi_ID",
        "name": "Right abductor digiti minimi"
      },
      {
        "objectId": "muscular_system-right_palmaris_brevis_ID",
        "name": "Right palmaris brevis"
      },
      {
        "objectId": "muscular_system-palmar_interosseous_muscles_of_right_hand_ID",
        "name": "Palmar interosseous muscles of right hand"
      },
      {
        "objectId": "muscular_system-first_palmar_interosseous_muscle_of_right_hand_ID",
        "name": "First palmar interosseous muscle of right hand"
      },
      {
        "objectId": "muscular_system-second_palmar_interosseous_muscle_of_right_hand_ID",
        "name": "Second palmar interosseous muscle of right hand"
      },
      {
        "objectId": "muscular_system-third_palmar_interosseous_muscle_of_right_hand_ID",
        "name": "Third palmar interosseous muscle of right hand"
      },
      {
        "objectId": "muscular_system-lumbrical_muscles_of_right_hand_ID",
        "name": "Lumbrical muscles of right hand"
      },
      {
        "objectId": "muscular_system-first_lumbrical_muscle_of_right_hand_ID",
        "name": "First lumbrical muscle of right hand"
      },
      {
        "objectId": "muscular_system-second_lumbrical_muscle_of_right_hand_ID",
        "name": "Second lumbrical muscle of right hand"
      },
      {
        "objectId": "muscular_system-fourth_lumbrical_muscle_of_right_hand_ID",
        "name": "Fourth lumbrical muscle of right hand"
      },
      {
        "objectId": "muscular_system-third_lumbrical_muscle_of_right_hand_ID",
        "name": "Third lumbrical muscle of right hand"
      },
      {
        "objectId": "muscular_system-dorsal_interosseous_muscles_of_right_hand_ID",
        "name": "Dorsal interosseous muscles of right hand"
      },
      {
        "objectId": "muscular_system-first_dorsal_interosseous_muscle_of_right_hand_ID",
        "name": "First dorsal interosseous muscle of right hand"
      },
      {
        "objectId": "muscular_system-second_dorsal_interosseous_muscle_of_right_hand_ID",
        "name": "Second dorsal interosseous muscle of right hand"
      },
      {
        "objectId": "muscular_system-third_dorsal_interosseous_muscle_of_right_hand_ID",
        "name": "Third dorsal interosseous muscle of right hand"
      },
      {
        "objectId": "muscular_system-fourth_dorsal_interosseous_muscle_of_right_hand_ID",
        "name": "Fourth dorsal interosseous muscle of right hand"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_right_hand_and_wrist_ID",
        "name": "Connective tissue of right hand and wrist"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_right_hand_and_wrist_ID",
        "name": "Tendon sheaths and bursae of right hand and wrist"
      },
      {
        "objectId": "connective_tissue-right_common_flexor_sheath_ID",
        "name": "Right common flexor sheath"
      },
      {
        "objectId": "connective_tissue-tendinous_sheath_of_right_flexor_carpi_radialis_ID",
        "name": "Tendinous sheath of right flexor carpi radialis"
      },
      {
        "objectId": "connective_tissue-tendinous_sheath_of_right_flexor_pollicis_longus_ID",
        "name": "Tendinous sheath of right flexor pollicis longus"
      },
      {
        "objectId": "connective_tissue-synovial_tendon_sheaths_of_right_fingers_ID",
        "name": "Synovial tendon sheaths of right fingers"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_wrist_ID",
        "name": "Ligaments of right wrist"
      },
      {
        "objectId": "connective_tissue-right_dorsal_radioulnar_ligament_ID",
        "name": "Right dorsal radioulnar ligament"
      },
      {
        "objectId": "connective_tissue-right_palmar_radioulnar_ligament_ID",
        "name": "Right palmar radioulnar ligament"
      },
      {
        "objectId": "connective_tissue-right_ulnocarpal_joint_ligaments_ID",
        "name": "Right ulnocarpal joint ligaments"
      },
      {
        "objectId": "connective_tissue-right_radiocarpal_joint_ligaments_ID",
        "name": "Right radiocarpal joint ligaments"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_wrist_ID",
        "name": "Cartilage of right wrist"
      },
      {
        "objectId": "connective_tissue-distal_radioulnar_articular_disc_of_right_wrist_ID",
        "name": "Distal radioulnar articular disc of right wrist"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_ulnar_head_ID",
        "name": "Articular cartilage of right ulnar head"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_triquetal_ID",
        "name": "Articular cartilage of right triquetal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_lunate_ID",
        "name": "Articular cartilage of right lunate"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_radius_ID",
        "name": "Articular cartilage of right radius"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_scaphoid_ID",
        "name": "Articular cartilage of right scaphoid"
      },
      {
        "objectId": "connective_tissue-right_intercarpal_joint_cartilage_ID",
        "name": "Right intercarpal joint cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_capitate_ID",
        "name": "Articular cartilage of right capitate"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_trapezoid_ID",
        "name": "Articular cartilage of right trapezoid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_trapezium_ID",
        "name": "Articular cartilage of right trapezium"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_pisiform_facet_of_right_triquetral_ID",
        "name": "Articular cartilage of pisiform facet of right triquetral"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_triquetral_facet_of_right_pisiform_ID",
        "name": "Articular cartilage of triquetral facet of right pisiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_hamate_ID",
        "name": "Articular cartilage of right hamate"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_hand_ID",
        "name": "Ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-right_flexor_retinaculum_of_hand_ID",
        "name": "Right flexor retinaculum of hand"
      },
      {
        "objectId": "connective_tissue-right_extensor_retinaculum_of_hand_ID",
        "name": "Right extensor retinaculum of hand"
      },
      {
        "objectId": "connective_tissue-right_palmar_carpal_ligament_ID",
        "name": "Right palmar carpal ligament"
      },
      {
        "objectId": "connective_tissue-right_palmar_aponeurosis_ID",
        "name": "Right palmar aponeurosis"
      },
      {
        "objectId": "connective_tissue-right_intercarpal_joint_ligaments_ID",
        "name": "Right intercarpal joint ligaments"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_right_hand_ID",
        "name": "Carpometacarpal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_right_thumb_ID",
        "name": "Carpometacarpal ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_joint_capsule_of_right_thumb_ID",
        "name": "Carpometacarpal joint capsule of right thumb"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligaments_of_right_thumb_ID",
        "name": "Palmar carpometacarpal ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-superficial_anterior_oblique_ligament_of_right_thumb_ID",
        "name": "Superficial anterior oblique ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-deep_anterior_oblique_ligament_of_right_thumb_ID",
        "name": "Deep anterior oblique ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligaments_of_right_thumb_ID",
        "name": "Dorsal carpometacarpal ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_trapeziometacarpal_ligament_of_right_thumb_ID",
        "name": "Dorsal trapeziometacarpal ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-posterior_oblique_ligament_of_right_thumb_ID",
        "name": "Posterior oblique ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_central_ligament_of_right_thumb_ID",
        "name": "Dorsal central ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-dorsal_radial_ligament_of_right_thumb_ID",
        "name": "Dorsal radial ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_right_second_metacarpal_ID",
        "name": "Carpometacarpal ligaments of right second metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_right_second_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of right second metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_right_second_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of right second metacarpal"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_right_third_metacarpal_ID",
        "name": "Carpometacarpal ligaments of right third metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_right_third_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of right third metacarpal"
      },
      {
        "objectId": "connective_tissue-interosseous_carpometacarpal_ligament_of_right_third_metacarpal_ID",
        "name": "Interosseous carpometacarpal ligament of right third metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_right_third_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of right third metacarpal"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_right_fourth_metacarpal_ID",
        "name": "Carpometacarpal ligaments of right fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_right_fourth_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of right fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-interosseous_carpometacarpal_ligament_of_right_fourth_metacarpal_ID",
        "name": "Interosseous carpometacarpal ligament of right fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_right_fourth_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of right fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_ligaments_of_right_fifth_metacarpal_ID",
        "name": "Carpometacarpal ligaments of right fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-palmar_carpometacarpal_ligament_of_right_fifth_metacarpal_ID",
        "name": "Palmar carpometacarpal ligament of right fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-dorsal_carpometacarpal_ligament_of_right_fifth_metacarpal_ID",
        "name": "Dorsal carpometacarpal ligament of right fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-intermetacarpal_ligaments_of_right_hand_ID",
        "name": "Intermetacarpal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-palmar_intermetacarpal_ligaments_of_right_hand_ID",
        "name": "Palmar intermetacarpal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-palmar_ligament_of_second_and_third_right_metacarpals_ID",
        "name": "Palmar ligament of second and third right metacarpals"
      },
      {
        "objectId": "connective_tissue-palmar_ligament_of_third_and_fourth_right_metacarpals_ID",
        "name": "Palmar ligament of third and fourth right metacarpals"
      },
      {
        "objectId": "connective_tissue-palmar_ligament_of_fourth_and_fifth_right_metacarpals_ID",
        "name": "Palmar ligament of fourth and fifth right metacarpals"
      },
      {
        "objectId": "connective_tissue-interosseous_intermetacarpal_ligaments_of_right_hand_ID",
        "name": "Interosseous intermetacarpal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_second_and_third_right_metacarpals_ID",
        "name": "Interosseous ligament of second and third right metacarpals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_third_and_fourth_right_metacarpals_ID",
        "name": "Interosseous ligament of third and fourth right metacarpals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_fourth_and_fifth_right_metacarpals_ID",
        "name": "Interosseous ligament of fourth and fifth right metacarpals"
      },
      {
        "objectId": "connective_tissue-dorsal_intermetacarpal_ligaments_of_right_hand_ID",
        "name": "Dorsal intermetacarpal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_second_and_third_right_metacarpals_ID",
        "name": "Dorsal ligament of second and third right metacarpals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_third_and_fourth_right_metacarpals_ID",
        "name": "Dorsal ligament of third and fourth right metacarpals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_fourth_and_fifth_right_metacarpals_ID",
        "name": "Dorsal ligament of fourth and fifth right metacarpals"
      },
      {
        "objectId": "connective_tissue-right_transverse_fasciculi_ID",
        "name": "Right transverse fasciculi"
      },
      {
        "objectId": "connective_tissue-right_deep_transverse_metacarpal_ligament_ID",
        "name": "Right deep transverse metacarpal ligament"
      },
      {
        "objectId": "connective_tissue-right_superficial_transverse_metacarpal_ligament_ID",
        "name": "Right superficial transverse metacarpal ligament"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_right_hand_ID",
        "name": "Metacarpophalangeal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_right_thumb_ID",
        "name": "Metacarpophalangeal ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_right_thumb_ID",
        "name": "Metacarpophalangeal joint capsule of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_right_thumb_ID",
        "name": "Metacarpophalangeal dorsal expansion of right thumb"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_right_thumb_ID",
        "name": "Palmar plate of metacarpophalangeal joint of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_right_thumb_ID",
        "name": "Metacarpophalangeal collateral ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_right_thumb_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligament_of_right_thumb_ID",
        "name": "Metacarpophalangeal radial collateral ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_right_thumb_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_right_thumb_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_right_thumb_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_right_thumb_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_right_index_finger_ID",
        "name": "Metacarpophalangeal ligaments of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_right_index_finger_ID",
        "name": "Metacarpophalangeal joint capsule of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_right_index_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of right index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_right_index_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_right_index_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_right_index_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_right_index_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_right_index_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_right_index_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_right_index_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_right_index_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal ligaments of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal joint capsule of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of right middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_right_middle_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal ligaments of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal joint capsule of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of right ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_right_ring_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ligaments_of_right_little_finger_ID",
        "name": "Metacarpophalangeal ligaments of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_capsule_of_right_little_finger_ID",
        "name": "Metacarpophalangeal joint capsule of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_dorsal_expansion_of_right_little_finger_ID",
        "name": "Metacarpophalangeal dorsal expansion of right little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_metacarpophalangeal_joint_of_right_little_finger_ID",
        "name": "Palmar plate of metacarpophalangeal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_collateral_ligaments_of_right_little_finger_ID",
        "name": "Metacarpophalangeal collateral ligaments of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_radial_collateral_ligaments_of_right_little_finger_ID",
        "name": "Metacarpophalangeal radial collateral ligaments of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_radial_collateral_ligament_of_right_little_finger_ID",
        "name": "Metacarpophalangeal proper radial collateral ligament of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_radial_collateral_ligament_of_right_little_finger_ID",
        "name": "Metacarpophalangeal accessory radial collateral ligament of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_ulnar_collateral_ligaments_of_right_little_finger_ID",
        "name": "Metacarpophalangeal ulnar collateral ligaments of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_proper_ulnar_collateral_ligament_of_right_little_finger_ID",
        "name": "Metacarpophalangeal proper ulnar collateral ligament of right little finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_accessory_ulnar_collateral_ligament_of_right_little_finger_ID",
        "name": "Metacarpophalangeal accessory ulnar collateral ligament of right little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_hand_ID",
        "name": "Interphalangeal ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_thumb_ID",
        "name": "Interphalangeal ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsule_of_right_thumb_ID",
        "name": "Interphalangeal joint capsule of right thumb"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_interphalangeal_joint_of_right_thumb_ID",
        "name": "Palmar plate of interphalangeal joint of right thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_thumb_ID",
        "name": "Interphalangeal collateral ligaments of right thumb"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_right_thumb_ID",
        "name": "Flexor pulley system of right thumb"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_right_thumb_ID",
        "name": "Annular pulleys of right thumb"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_right_thumb_ID",
        "name": "Annular pulley A1 of right thumb"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_right_thumb_ID",
        "name": "Annular pulley A2 of right thumb"
      },
      {
        "objectId": "connective_tissue-oblique_pulley_of_right_thumb_ID",
        "name": "Oblique pulley of right thumb"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_right_thumb_ID",
        "name": "Cruciate pulleys of right thumb"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_right_thumb_ID",
        "name": "Cruciate pulley C1 of right thumb"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_right_thumb_ID",
        "name": "Cruciate pulley C2 of right thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_index_finger_ID",
        "name": "Interphalangeal ligaments of right index finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_right_index_finger_ID",
        "name": "Joint capsules of interphalangeal joints of right index finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_right_index_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_right_index_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_right_index_finger_ID",
        "name": "Palmar plates of interphalangeal joints of right index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_right_index_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_right_index_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_index_finger_ID",
        "name": "Interphalangeal collateral ligaments of right index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_right_index_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_right_index_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of right index finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_right_index_finger_ID",
        "name": "Triangular ligament of right index finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_right_index_finger_ID",
        "name": "Flexor pulley system of right index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_right_index_finger_ID",
        "name": "Annular pulleys of right index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_right_index_finger_ID",
        "name": "Annular pulley A1 of right index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_right_index_finger_ID",
        "name": "Annular pulley A2 of right index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_right_index_finger_ID",
        "name": "Annular pulley A3 of right index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_right_index_finger_ID",
        "name": "Annular pulley A4 of right index finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_right_index_finger_ID",
        "name": "Annular pulley A5 of right index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_right_index_finger_ID",
        "name": "Cruciate pulleys of right index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_right_index_finger_ID",
        "name": "Cruciate pulley C1 of right index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_right_index_finger_ID",
        "name": "Cruciate pulley C2 of right index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_right_index_finger_ID",
        "name": "Cruciate pulley C3 of right index finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_right_index_finger_ID",
        "name": "Cruciate pulley C4 of right index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_middle_finger_ID",
        "name": "Interphalangeal ligaments of right middle finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_right_middle_finger_ID",
        "name": "Joint capsules of interphalangeal joints of right middle finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_right_middle_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_right_middle_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_right_middle_finger_ID",
        "name": "Palmar plates of interphalangeal joints of right middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_right_middle_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_right_middle_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_middle_finger_ID",
        "name": "Interphalangeal collateral ligaments of right middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_right_middle_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_right_middle_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of right middle finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_right_middle_finger_ID",
        "name": "Triangular ligament of right middle finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_right_middle_finger_ID",
        "name": "Flexor pulley system of right middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_right_middle_finger_ID",
        "name": "Annular pulleys of right middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_right_middle_finger_ID",
        "name": "Annular pulley A1 of right middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_right_middle_finger_ID",
        "name": "Annular pulley A2 of right middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_right_middle_finger_ID",
        "name": "Annular pulley A3 of right middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_right_middle_finger_ID",
        "name": "Annular pulley A4 of right middle finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_right_middle_finger_ID",
        "name": "Annular pulley A5 of right middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_right_middle_finger_ID",
        "name": "Cruciate pulleys of right middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_right_middle_finger_ID",
        "name": "Cruciate pulley C1 of right middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_right_middle_finger_ID",
        "name": "Cruciate pulley C2 of right middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_right_middle_finger_ID",
        "name": "Cruciate pulley C3 of right middle finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_right_middle_finger_ID",
        "name": "Cruciate pulley C4 of right middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_ring_finger_ID",
        "name": "Interphalangeal ligaments of right ring finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_right_ring_finger_ID",
        "name": "Joint capsules of interphalangeal joints of right ring finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_right_ring_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_right_ring_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_right_ring_finger_ID",
        "name": "Palmar plates of interphalangeal joints of right ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_right_ring_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_right_ring_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_ring_finger_ID",
        "name": "Interphalangeal collateral ligaments of right ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_right_ring_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_right_ring_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of right ring finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_right_ring_finger_ID",
        "name": "Triangular ligament of right ring finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_right_ring_finger_ID",
        "name": "Flexor pulley system of right ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_right_ring_finger_ID",
        "name": "Annular pulleys of right ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_right_ring_finger_ID",
        "name": "Annular pulley A1 of right ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_right_ring_finger_ID",
        "name": "Annular pulley A2 of right ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_right_ring_finger_ID",
        "name": "Annular pulley A3 of right ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_right_ring_finger_ID",
        "name": "Annular pulley A4 of right ring finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_right_ring_finger_ID",
        "name": "Annular pulley A5 of right ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_right_ring_finger_ID",
        "name": "Cruciate pulleys of right ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_right_ring_finger_ID",
        "name": "Cruciate pulley C1 of right ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_right_ring_finger_ID",
        "name": "Cruciate pulley C2 of right ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_right_ring_finger_ID",
        "name": "Cruciate pulley C3 of right ring finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_right_ring_finger_ID",
        "name": "Cruciate pulley C4 of right ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_little_finger_ID",
        "name": "Interphalangeal ligaments of right little finger"
      },
      {
        "objectId": "connective_tissue-joint_capsules_of_interphalangeal_joints_of_right_little_finger_ID",
        "name": "Joint capsules of interphalangeal joints of right little finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_proximal_interphalangeal_joint_of_right_little_finger_ID",
        "name": "Joint capsule of proximal interphalangeal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-joint_capsule_of_distal_interphalangeal_joint_of_right_little_finger_ID",
        "name": "Joint capsule of distal interphalangeal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plates_of_interphalangeal_joints_of_right_little_finger_ID",
        "name": "Palmar plates of interphalangeal joints of right little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_proximal_interphalangeal_joint_of_right_little_finger_ID",
        "name": "Palmar plate of proximal interphalangeal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-palmar_plate_of_distal_interphalangeal_joint_of_right_little_finger_ID",
        "name": "Palmar plate of distal interphalangeal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_little_finger_ID",
        "name": "Interphalangeal collateral ligaments of right little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_proximal_joint_of_right_little_finger_ID",
        "name": "Interphalangeal collateral ligaments of proximal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_distal_joint_of_right_little_finger_ID",
        "name": "Interphalangeal collateral ligaments of distal joint of right little finger"
      },
      {
        "objectId": "connective_tissue-triangular_ligament_of_right_little_finger_ID",
        "name": "Triangular ligament of right little finger"
      },
      {
        "objectId": "connective_tissue-flexor_pulley_system_of_right_little_finger_ID",
        "name": "Flexor pulley system of right little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulleys_of_right_little_finger_ID",
        "name": "Annular pulleys of right little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A1_of_right_little_finger_ID",
        "name": "Annular pulley A1 of right little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A2_of_right_little_finger_ID",
        "name": "Annular pulley A2 of right little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A3_of_right_little_finger_ID",
        "name": "Annular pulley A3 of right little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A4_of_right_little_finger_ID",
        "name": "Annular pulley A4 of right little finger"
      },
      {
        "objectId": "connective_tissue-annular_pulley_A5_of_right_little_finger_ID",
        "name": "Annular pulley A5 of right little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulleys_of_right_little_finger_ID",
        "name": "Cruciate pulleys of right little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C1_of_right_little_finger_ID",
        "name": "Cruciate pulley C1 of right little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C2_of_right_little_finger_ID",
        "name": "Cruciate pulley C2 of right little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C3_of_right_little_finger_ID",
        "name": "Cruciate pulley C3 of right little finger"
      },
      {
        "objectId": "connective_tissue-cruciate_pulley_C4_of_right_little_finger_ID",
        "name": "Cruciate pulley C4 of right little finger"
      },
      {
        "objectId": "connective_tissue-transverse_retinacular_ligaments_of_right_hand_ID",
        "name": "Transverse retinacular ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-oblique_retinacular_ligaments_of_right_hand_ID",
        "name": "Oblique retinacular ligaments of right hand"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_hand_ID",
        "name": "Articular cartilage of right hand"
      },
      {
        "objectId": "connective_tissue-carpometacarpal_joint_cartilage_of_right_hand_ID",
        "name": "Carpometacarpal joint cartilage of right hand"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_right_first_metacarpal_ID",
        "name": "Articular cartilage of the right first metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_right_second_metacarpal_ID",
        "name": "Articular cartilage of the right second metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_right_third_metacarpal_ID",
        "name": "Articular cartilage of the right third metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_right_fourth_metacarpal_ID",
        "name": "Articular cartilage of the right fourth metacarpal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_the_right_fifth_metacarpal_ID",
        "name": "Articular cartilage of the right fifth metacarpal"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_right_hand_ID",
        "name": "Metacarpophalangeal joint cartilage of right hand"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_right_thumb_ID",
        "name": "Metacarpophalangeal joint cartilage of right thumb"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_first_metacarpal_bone_ID",
        "name": "Articular cartilage of head of right first metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_thumb_ID",
        "name": "Articular cartilage of base of proximal phalanx of right thumb"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_right_index_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of right index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_second_metacarpal_bone_ID",
        "name": "Articular cartilage of head of right second metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_index_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of right index finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_right_middle_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of right middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_third_metacarpal_bone_ID",
        "name": "Articular cartilage of head of right third metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_middle_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of right middle finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_right_ring_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of right ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fourth_metacarpal_bone_ID",
        "name": "Articular cartilage of head of right fourth metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_ring_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of right ring finger"
      },
      {
        "objectId": "connective_tissue-metacarpophalangeal_joint_cartilage_of_right_little_finger_ID",
        "name": "Metacarpophalangeal joint cartilage of right little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fifth_metacarpal_bone_ID",
        "name": "Articular cartilage of head of right fifth metacarpal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_little_finger_ID",
        "name": "Articular cartilage of base of proximal phalanx of right little finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_right_hand_ID",
        "name": "Interphalangeal joint cartilage of right hand"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_right_thumb_ID",
        "name": "Interphalangeal joint cartilage of right thumb"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_thumb_ID",
        "name": "Articular cartilage of head of proximal phalanx of right thumb"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_thumb_ID",
        "name": "Articular cartilage of base of distal phalanx of right thumb"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_right_index_finger_ID",
        "name": "Interphalangeal joint cartilage of right index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_index_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of right index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_index_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of right index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_index_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of right index finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_index_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of right index finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_right_middle_finger_ID",
        "name": "Interphalangeal joint cartilage of right middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_middle_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of right middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_middle_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of right middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_middle_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of right middle finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_middle_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of right middle finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_right_ring_finger_ID",
        "name": "Interphalangeal joint cartilage of right ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_ring_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of right ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_ring_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of right ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_ring_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of right ring finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_ring_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of right ring finger"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_cartilage_of_right_little_finger_ID",
        "name": "Interphalangeal joint cartilage of right little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_little_finger_ID",
        "name": "Articular cartilage of base of distal phalanx of right little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_little_finger_ID",
        "name": "Articular cartilage of head of middle phalanx of right little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_little_finger_ID",
        "name": "Articular cartilage of head of proximal phalanx of right little finger"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_little_finger_ID",
        "name": "Articular cartilage of base of middle phalanx of right little finger"
      },
      {
        "objectId": "skeletal_system-bones_of_right_hand_and_wrist_ID",
        "name": "Bones of right hand and wrist"
      },
      {
        "objectId": "skeletal_system-carpal_bones_of_right_hand_and_wrist_ID",
        "name": "Carpal bones of right hand and wrist"
      },
      {
        "objectId": "skeletal_system-right_capitate_ID",
        "name": "Right capitate"
      },
      {
        "objectId": "skeletal_system-right_hamate_ID",
        "name": "Right hamate"
      },
      {
        "objectId": "skeletal_system-right_lunate_ID",
        "name": "Right lunate"
      },
      {
        "objectId": "skeletal_system-right_pisiform_ID",
        "name": "Right pisiform"
      },
      {
        "objectId": "skeletal_system-right_scaphoid_ID",
        "name": "Right scaphoid"
      },
      {
        "objectId": "skeletal_system-right_trapezium_ID",
        "name": "Right trapezium"
      },
      {
        "objectId": "skeletal_system-right_trapezoid_ID",
        "name": "Right trapezoid"
      },
      {
        "objectId": "skeletal_system-right_triquetrum_ID",
        "name": "Right triquetrum"
      },
      {
        "objectId": "skeletal_system-metacarpal_bones_of_right_hand_and_wrist_ID",
        "name": "Metacarpal bones of right hand and wrist"
      },
      {
        "objectId": "skeletal_system-right_first_metacarpal_ID",
        "name": "Right first metacarpal"
      },
      {
        "objectId": "skeletal_system-right_second_metacarpal_ID",
        "name": "Right second metacarpal"
      },
      {
        "objectId": "skeletal_system-right_third_metacarpal_ID",
        "name": "Right third metacarpal"
      },
      {
        "objectId": "skeletal_system-right_fourth_metacarpal_ID",
        "name": "Right fourth metacarpal"
      },
      {
        "objectId": "skeletal_system-right_fifth_metacarpal_ID",
        "name": "Right fifth metacarpal"
      },
      {
        "objectId": "skeletal_system-sesamoid_bones_of_right_thumb_ID",
        "name": "Sesamoid bones of right thumb"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_hand_ID",
        "name": "Phalanges of right hand"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_thumb_ID",
        "name": "Phalanges of right thumb"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_thumb_ID",
        "name": "Proximal phalanx of right thumb"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_thumb_ID",
        "name": "Distal phalanx of right thumb"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_index_finger_ID",
        "name": "Phalanges of right index finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_index_finger_ID",
        "name": "Proximal phalanx of right index finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_index_finger_ID",
        "name": "Middle phalanx of right index finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_index_finger_ID",
        "name": "Distal phalanx of right index finger"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_middle_finger_ID",
        "name": "Phalanges of right middle finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_middle_finger_ID",
        "name": "Proximal phalanx of right middle finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_middle_finger_ID",
        "name": "Middle phalanx of right middle finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_middle_finger_ID",
        "name": "Distal phalanx of right middle finger"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_ring_finger_ID",
        "name": "Phalanges of right ring finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_ring_finger_ID",
        "name": "Proximal phalanx of right ring finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_ring_finger_ID",
        "name": "Middle phalanx of right ring finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_ring_finger_ID",
        "name": "Distal phalanx of right ring finger"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_little_finger_ID",
        "name": "Phalanges of right little finger"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_little_finger_ID",
        "name": "Proximal phalanx of right little finger"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_little_finger_ID",
        "name": "Middle phalanx of right little finger"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_little_finger_ID",
        "name": "Distal phalanx of right little finger"
      }
    ]
  },
  "chest": {
    "id": "chest",
    "name": "Chest",
    "zoomId": "muscular_system-muscles_of_upper_limb_ID",
    "keywords": [
      "pectoral",
      "chest",
      "thoracic",
      "sternum",
      "rib",
      "costal",
      "intercostal",
      "sternal",
      "thorax"
    ],
    "selectIds": [
      "skeletal_system-rib_cage_ID",
      "skeletal_system-sternum_ID",
      "muscular_system-muscles_of_left_pectoral_girdle_ID",
      "muscular_system-muscles_of_right_pectoral_girdle_ID",
      "connective_tissue-connective_tissue_of_rib_cage_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-left_subclavius_ID",
        "name": "Left subclavius"
      },
      {
        "objectId": "muscular_system-left_pectoralis_major_ID",
        "name": "Left pectoralis major"
      },
      {
        "objectId": "muscular_system-left_pectoralis_minor_ID",
        "name": "Left pectoralis minor"
      },
      {
        "objectId": "muscular_system-right_pectoralis_major_ID",
        "name": "Right pectoralis major"
      },
      {
        "objectId": "muscular_system-right_subclavius_ID",
        "name": "Right subclavius"
      },
      {
        "objectId": "muscular_system-right_pectoralis_minor_ID",
        "name": "Right pectoralis minor"
      },
      {
        "objectId": "skeletal_system-bones_of_right_pectoral_girdle_ID",
        "name": "Bones of right pectoral girdle"
      },
      {
        "objectId": "skeletal_system-right_clavicle_ID",
        "name": "Right clavicle"
      },
      {
        "objectId": "skeletal_system-right_scapula_ID",
        "name": "Right scapula"
      },
      {
        "objectId": "skeletal_system-rib_cage_ID",
        "name": "Rib cage"
      },
      {
        "objectId": "skeletal_system-sternum_ID",
        "name": "Sternum"
      },
      {
        "objectId": "skeletal_system-manubrium_of_sternum_ID",
        "name": "Manubrium of sternum"
      },
      {
        "objectId": "skeletal_system-xiphoid_process_ID",
        "name": "Xiphoid process"
      },
      {
        "objectId": "skeletal_system-body_of_sternum_ID",
        "name": "Body of sternum"
      },
      {
        "objectId": "skeletal_system-ribs_ID",
        "name": "Ribs"
      },
      {
        "objectId": "skeletal_system-true_ribs_ID",
        "name": "True ribs"
      },
      {
        "objectId": "skeletal_system-first_rib_ID",
        "name": "First rib"
      },
      {
        "objectId": "skeletal_system-right_first_rib_ID",
        "name": "Right first rib"
      },
      {
        "objectId": "skeletal_system-left_first_rib_ID",
        "name": "Left first rib"
      },
      {
        "objectId": "skeletal_system-second_rib_ID",
        "name": "Second rib"
      },
      {
        "objectId": "skeletal_system-left_second_rib_ID",
        "name": "Left second rib"
      },
      {
        "objectId": "skeletal_system-right_second_rib_ID",
        "name": "Right second rib"
      },
      {
        "objectId": "skeletal_system-third_rib_ID",
        "name": "Third rib"
      },
      {
        "objectId": "skeletal_system-left_third_rib_ID",
        "name": "Left third rib"
      },
      {
        "objectId": "skeletal_system-right_third_rib_ID",
        "name": "Right third rib"
      },
      {
        "objectId": "skeletal_system-fourth_rib_ID",
        "name": "Fourth rib"
      },
      {
        "objectId": "skeletal_system-left_fourth_rib_ID",
        "name": "Left fourth rib"
      },
      {
        "objectId": "skeletal_system-right_fourth_rib_ID",
        "name": "Right fourth rib"
      },
      {
        "objectId": "skeletal_system-fifth_rib_ID",
        "name": "Fifth rib"
      },
      {
        "objectId": "skeletal_system-left_fifth_rib_ID",
        "name": "Left fifth rib"
      },
      {
        "objectId": "skeletal_system-right_fifth_rib_ID",
        "name": "Right fifth rib"
      },
      {
        "objectId": "skeletal_system-sixth_rib_ID",
        "name": "Sixth rib"
      },
      {
        "objectId": "skeletal_system-left_sixth_rib_ID",
        "name": "Left sixth rib"
      },
      {
        "objectId": "skeletal_system-right_sixth_rib_ID",
        "name": "Right sixth rib"
      },
      {
        "objectId": "skeletal_system-seventh_rib_ID",
        "name": "Seventh rib"
      },
      {
        "objectId": "skeletal_system-left_seventh_rib_ID",
        "name": "Left seventh rib"
      },
      {
        "objectId": "skeletal_system-right_seventh_rib_ID",
        "name": "Right seventh rib"
      },
      {
        "objectId": "skeletal_system-false_ribs_ID",
        "name": "False ribs"
      },
      {
        "objectId": "skeletal_system-eighth_rib_ID",
        "name": "Eighth rib"
      },
      {
        "objectId": "skeletal_system-left_eighth_rib_ID",
        "name": "Left eighth rib"
      },
      {
        "objectId": "skeletal_system-right_eighth_rib_ID",
        "name": "Right eighth rib"
      },
      {
        "objectId": "skeletal_system-ninth_rib_ID",
        "name": "Ninth rib"
      },
      {
        "objectId": "skeletal_system-left_ninth_rib_ID",
        "name": "Left ninth rib"
      },
      {
        "objectId": "skeletal_system-right_ninth_rib_ID",
        "name": "Right ninth rib"
      },
      {
        "objectId": "skeletal_system-tenth_rib_ID",
        "name": "Tenth rib"
      },
      {
        "objectId": "skeletal_system-left_tenth_rib_ID",
        "name": "Left tenth rib"
      },
      {
        "objectId": "skeletal_system-right_tenth_rib_ID",
        "name": "Right tenth rib"
      },
      {
        "objectId": "skeletal_system-floating_ribs_ID",
        "name": "Floating ribs"
      },
      {
        "objectId": "skeletal_system-eleventh_rib_ID",
        "name": "Eleventh rib"
      },
      {
        "objectId": "skeletal_system-left_eleventh_rib_ID",
        "name": "Left eleventh rib"
      },
      {
        "objectId": "skeletal_system-right_eleventh_rib_ID",
        "name": "Right eleventh rib"
      },
      {
        "objectId": "skeletal_system-twelfth_fib_ID",
        "name": "Twelfth fib"
      },
      {
        "objectId": "skeletal_system-left_twelfth_rib_ID",
        "name": "Left twelfth rib"
      },
      {
        "objectId": "skeletal_system-right_twelfth_rib_ID",
        "name": "Right twelfth rib"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_rib_cage_ID",
        "name": "Connective tissue of rib cage"
      },
      {
        "objectId": "connective_tissue-costal_cartilage_ID",
        "name": "Costal cartilage"
      },
      {
        "objectId": "connective_tissue-first_costal_cartilage_ID",
        "name": "First costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_first_costal_cartilage_ID",
        "name": "Left first costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_first_costal_cartilage_ID",
        "name": "Right first costal cartilage"
      },
      {
        "objectId": "connective_tissue-second_costal_cartilage_ID",
        "name": "Second costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_second_costal_cartilage_ID",
        "name": "Left second costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_second_costal_cartilage_ID",
        "name": "Right second costal cartilage"
      },
      {
        "objectId": "connective_tissue-third_costal_cartilage_ID",
        "name": "Third costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_third_costal_cartilage_ID",
        "name": "Left third costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_third_costal_cartilage_ID",
        "name": "Right third costal cartilage"
      },
      {
        "objectId": "connective_tissue-fourth_costal_cartilage_ID",
        "name": "Fourth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_fourth_costal_cartilage_ID",
        "name": "Left fourth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_fourth_costal_cartilage_ID",
        "name": "Right fourth costal cartilage"
      },
      {
        "objectId": "connective_tissue-fifth_costal_cartilage_ID",
        "name": "Fifth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_fifth_costal_cartilage_ID",
        "name": "Left fifth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_fifth_costal_cartilage_ID",
        "name": "Right fifth costal cartilage"
      },
      {
        "objectId": "connective_tissue-sixth_costal_cartilage_ID",
        "name": "Sixth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_sixth_costal_cartilage_ID",
        "name": "Left sixth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_sixth_costal_cartilage_ID",
        "name": "Right sixth costal cartilage"
      },
      {
        "objectId": "connective_tissue-tenth_costal_cartilage_ID",
        "name": "Tenth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_tenth_costal_cartilage_ID",
        "name": "Left tenth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_tenth_costal_cartilage_ID",
        "name": "Right tenth costal cartilage"
      },
      {
        "objectId": "connective_tissue-ninth_costal_cartilage_ID",
        "name": "Ninth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_ninth_costal_cartilage_ID",
        "name": "Left ninth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_ninth_costal_cartilage_ID",
        "name": "Right ninth costal cartilage"
      },
      {
        "objectId": "connective_tissue-eighth_costal_cartilage_ID",
        "name": "Eighth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_eighth_costal_cartilage_ID",
        "name": "Left eighth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_eighth_costal_cartilage_ID",
        "name": "Right eighth costal cartilage"
      },
      {
        "objectId": "connective_tissue-seventh_costal_cartilage_ID",
        "name": "Seventh costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_seventh_costal_cartilage_ID",
        "name": "Left seventh costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_seventh_costal_cartilage_ID",
        "name": "Right seventh costal cartilage"
      },
      {
        "objectId": "connective_tissue-eleventh_costal_cartilage_ID",
        "name": "Eleventh costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_eleventh_costal_cartilage_ID",
        "name": "Left eleventh costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_eleventh_costal_cartilage_ID",
        "name": "Right eleventh costal cartilage"
      },
      {
        "objectId": "connective_tissue-twelfth_costal_cartilage_ID",
        "name": "Twelfth costal cartilage"
      },
      {
        "objectId": "connective_tissue-left_twelfth_costal_cartilage_ID",
        "name": "Left twelfth costal cartilage"
      },
      {
        "objectId": "connective_tissue-right_twelfth_costal_cartilage_ID",
        "name": "Right twelfth costal cartilage"
      },
      {
        "objectId": "connective_tissue-interclavicular_ligament_ID",
        "name": "Interclavicular ligament"
      },
      {
        "objectId": "connective_tissue-costoclavicular_ligament_ID",
        "name": "Costoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_costoclavicular_ligament_ID",
        "name": "Left costoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_costoclavicular_ligament_ID",
        "name": "Right costoclavicular ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_sternocostal_joints_ID",
        "name": "Ligaments of sternocostal joints"
      },
      {
        "objectId": "connective_tissue-intraarticular_sternochondral_ligament_ID",
        "name": "Intraarticular sternochondral ligament"
      },
      {
        "objectId": "connective_tissue-right_intraarticular_sternochondral_ligament_ID",
        "name": "Right intraarticular sternochondral ligament"
      },
      {
        "objectId": "connective_tissue-left_intraarticular_sternochondral_ligament_ID",
        "name": "Left intraarticular sternochondral ligament"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligaments_ID",
        "name": "Radiate sternochondral ligaments"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_first_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of first sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_first_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right first sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_first_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left first sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_second_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of second sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_second_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right second sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_second_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left second sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_third_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of third sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_third_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right third sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_third_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left third sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_fourth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of fourth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_fourth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right fourth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_fourth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left fourth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_fifth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of fifth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_fifth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right fifth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_fifth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left fifth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_sixth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of sixth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_sixth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right sixth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_sixth_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left sixth sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_seventh_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of seventh sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_right_seventh_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of right seventh sternochondral joint"
      },
      {
        "objectId": "connective_tissue-radiate_sternochondral_ligament_of_left_seventh_sternochondral_joint_ID",
        "name": "Radiate sternochondral ligament of left seventh sternochondral joint"
      },
      {
        "objectId": "connective_tissue-xiphichondral_ligament_ID",
        "name": "Xiphichondral ligament"
      },
      {
        "objectId": "connective_tissue-right_xiphichondral_ligament_ID",
        "name": "Right xiphichondral ligament"
      },
      {
        "objectId": "connective_tissue-left_xiphichondral_ligament_ID",
        "name": "Left xiphichondral ligament"
      },
      {
        "objectId": "connective_tissue-sternal_cartilage_ID",
        "name": "Sternal cartilage"
      },
      {
        "objectId": "connective_tissue-manubriosternal_synchondrosis_ID",
        "name": "Manubriosternal synchondrosis"
      },
      {
        "objectId": "connective_tissue-xiphisternal_synostosis_ID",
        "name": "Xiphisternal synostosis"
      },
      {
        "objectId": "connective_tissue-ligaments_of_interchondral_joints_ID",
        "name": "Ligaments of interchondral joints"
      },
      {
        "objectId": "connective_tissue-interchondral_ligaments_ID",
        "name": "Interchondral ligaments"
      },
      {
        "objectId": "connective_tissue-interchondral_ligament_of_fifth_and_sixth_ribs_ID",
        "name": "Interchondral ligament of fifth and sixth ribs"
      },
      {
        "objectId": "connective_tissue-interchondral_ligament_of_right_fifth_and_sixth_ribs_ID",
        "name": "Interchondral ligament of right fifth and sixth ribs"
      },
      {
        "objectId": "connective_tissue-interchondral_ligament_of_left_fifth_and_sixth_ribs_ID",
        "name": "Interchondral ligament of left fifth and sixth ribs"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_second_rib_ID",
        "name": "Articular cartilage of head of right second rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_third_rib_ID",
        "name": "Articular cartilage of head of right third rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fourth_rib_ID",
        "name": "Articular cartilage of head of right fourth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fifth_rib_ID",
        "name": "Articular cartilage of head of right fifth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_sixth_rib_ID",
        "name": "Articular cartilage of head of right sixth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_seventh_rib_ID",
        "name": "Articular cartilage of head of right seventh rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_eighth_rib_ID",
        "name": "Articular cartilage of head of right eighth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_ninth_rib_ID",
        "name": "Articular cartilage of head of right ninth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_tenth_rib_ID",
        "name": "Articular cartilage of head of right tenth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_eleventh_rib_ID",
        "name": "Articular cartilage of head of right eleventh rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_twelfth_rib_ID",
        "name": "Articular cartilage of head of right twelfth rib"
      },
      {
        "objectId": "connective_tissue-left_articular_cartilage_of_heads_of_ribs_ID",
        "name": "Left articular cartilage of heads of ribs"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_first_rib_ID",
        "name": "Articular cartilage of head of left first rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_second_rib_ID",
        "name": "Articular cartilage of head of left second rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_third_rib_ID",
        "name": "Articular cartilage of head of left third rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fourth_rib_ID",
        "name": "Articular cartilage of head of left fourth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fifth_rib_ID",
        "name": "Articular cartilage of head of left fifth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_sixth_rib_ID",
        "name": "Articular cartilage of head of left sixth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_seventh_rib_ID",
        "name": "Articular cartilage of head of left seventh rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_eighth_rib_ID",
        "name": "Articular cartilage of head of left eighth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_ninth_rib_ID",
        "name": "Articular cartilage of head of left ninth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_tenth_rib_ID",
        "name": "Articular cartilage of head of left tenth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_eleventh_rib_ID",
        "name": "Articular cartilage of head of left eleventh rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_twelfth_rib_ID",
        "name": "Articular cartilage of head of left twelfth rib"
      },
      {
        "objectId": "connective_tissue-left_articular_cartilage_of_tubercles_of_ribs_ID",
        "name": "Left articular cartilage of tubercles of ribs"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_first_rib_ID",
        "name": "Articular cartilage of tubercle of left first rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_second_rib_ID",
        "name": "Articular cartilage of tubercle of left second rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_third_rib_ID",
        "name": "Articular cartilage of tubercle of left third rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_fourth_rib_ID",
        "name": "Articular cartilage of tubercle of left fourth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_fifth_rib_ID",
        "name": "Articular cartilage of tubercle of left fifth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_sixth_rib_ID",
        "name": "Articular cartilage of tubercle of left sixth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_seventh_rib_ID",
        "name": "Articular cartilage of tubercle of left seventh rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_eighth_rib_ID",
        "name": "Articular cartilage of tubercle of left eighth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_ninth_rib_ID",
        "name": "Articular cartilage of tubercle of left ninth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_left_tenth_rib_ID",
        "name": "Articular cartilage of tubercle of left tenth rib"
      },
      {
        "objectId": "connective_tissue-right_articular_cartilage_of_tubercles_of_ribs_ID",
        "name": "Right articular cartilage of tubercles of ribs"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_first_rib_ID",
        "name": "Articular cartilage of tubercle of right first rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_second_rib_ID",
        "name": "Articular cartilage of tubercle of right second rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_third_rib_ID",
        "name": "Articular cartilage of tubercle of right third rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_fourth_rib_ID",
        "name": "Articular cartilage of tubercle of right fourth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_fifth_rib_ID",
        "name": "Articular cartilage of tubercle of right fifth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_sixth_rib_ID",
        "name": "Articular cartilage of tubercle of right sixth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_seventh_rib_ID",
        "name": "Articular cartilage of tubercle of right seventh rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_eighth_rib_ID",
        "name": "Articular cartilage of tubercle of right eighth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_ninth_rib_ID",
        "name": "Articular cartilage of tubercle of right ninth rib"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_tubercle_of_right_tenth_rib_ID",
        "name": "Articular cartilage of tubercle of right tenth rib"
      }
    ]
  },
  "abdomen": {
    "id": "abdomen",
    "name": "Abdomen",
    "zoomId": "muscular_system-muscles_of_abdomen_ID",
    "keywords": [
      "abdominal",
      "abdomen",
      "trunk",
      "belly",
      "abdomen",
      "flank",
      "oblique",
      "rectus",
      "transversus",
      "lumbar"
    ],
    "selectIds": [
      "muscular_system-muscles_of_abdomen_ID",
      "muscular_system-muscles_of_thorax_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-levatores_costarum_ID",
        "name": "Levatores costarum"
      },
      {
        "objectId": "muscular_system-right_levatores_costarum_ID",
        "name": "Right levatores costarum"
      },
      {
        "objectId": "muscular_system-left_levatores_costarum_ID",
        "name": "Left levatores costarum"
      },
      {
        "objectId": "muscular_system-subcostales_ID",
        "name": "Subcostales"
      },
      {
        "objectId": "muscular_system-right_subcostales_ID",
        "name": "Right subcostales"
      },
      {
        "objectId": "muscular_system-left_subcostales_ID",
        "name": "Left subcostales"
      },
      {
        "objectId": "muscular_system-intercostals_ID",
        "name": "Intercostals"
      },
      {
        "objectId": "muscular_system-external_intercostals_ID",
        "name": "External intercostals"
      },
      {
        "objectId": "muscular_system-right_external_intercostals_ID",
        "name": "Right external intercostals"
      },
      {
        "objectId": "muscular_system-left_external_intercostals_ID",
        "name": "Left external intercostals"
      },
      {
        "objectId": "muscular_system-internal_intercostals_ID",
        "name": "Internal intercostals"
      },
      {
        "objectId": "muscular_system-right_internal_intercostals_ID",
        "name": "Right internal intercostals"
      },
      {
        "objectId": "muscular_system-left_internal_intercostals_ID",
        "name": "Left internal intercostals"
      },
      {
        "objectId": "muscular_system-innermost_intercostals_ID",
        "name": "Innermost intercostals"
      },
      {
        "objectId": "muscular_system-right_innermost_intercostals_ID",
        "name": "Right innermost intercostals"
      },
      {
        "objectId": "muscular_system-left_innermost_intercostals_ID",
        "name": "Left innermost intercostals"
      },
      {
        "objectId": "muscular_system-diaphragm_ID",
        "name": "Diaphragm"
      },
      {
        "objectId": "muscular_system-transversus_thoracis_ID",
        "name": "Transversus thoracis"
      },
      {
        "objectId": "muscular_system-left_transversus_thoracis_ID",
        "name": "Left transversus thoracis"
      },
      {
        "objectId": "muscular_system-right_transversus_thoracis_ID",
        "name": "Right transversus thoracis"
      },
      {
        "objectId": "muscular_system-external_oblique_ID",
        "name": "External oblique"
      },
      {
        "objectId": "muscular_system-left_external_oblique_ID",
        "name": "Left external oblique"
      },
      {
        "objectId": "muscular_system-right_external_oblique_ID",
        "name": "Right external oblique"
      },
      {
        "objectId": "muscular_system-internal_oblique_ID",
        "name": "Internal oblique"
      },
      {
        "objectId": "muscular_system-left_internal_oblique_ID",
        "name": "Left internal oblique"
      },
      {
        "objectId": "muscular_system-right_internal_oblique_ID",
        "name": "Right internal oblique"
      },
      {
        "objectId": "muscular_system-transverse_abdominis_ID",
        "name": "Transverse abdominis"
      },
      {
        "objectId": "muscular_system-left_transverse_abdominis_ID",
        "name": "Left transverse abdominis"
      },
      {
        "objectId": "muscular_system-right_transverse_abdominis_ID",
        "name": "Right transverse abdominis"
      },
      {
        "objectId": "muscular_system-inguinal_falx_ID",
        "name": "Inguinal falx"
      },
      {
        "objectId": "muscular_system-right_inguinal_falx_ID",
        "name": "Right inguinal falx"
      },
      {
        "objectId": "muscular_system-left_inguinal_falx_ID",
        "name": "Left inguinal falx"
      },
      {
        "objectId": "muscular_system-rectus_abdominis_ID",
        "name": "Rectus abdominis"
      },
      {
        "objectId": "muscular_system-right_rectus_abdominis_ID",
        "name": "Right rectus abdominis"
      },
      {
        "objectId": "muscular_system-left_rectus_abdominis_ID",
        "name": "Left rectus abdominis"
      },
      {
        "objectId": "muscular_system-pyramidalis_ID",
        "name": "Pyramidalis"
      },
      {
        "objectId": "muscular_system-right_pyramidalis_ID",
        "name": "Right pyramidalis"
      },
      {
        "objectId": "muscular_system-left_pyramidalis_ID",
        "name": "Left pyramidalis"
      },
      {
        "objectId": "muscular_system-quadratus_lumborum_ID",
        "name": "Quadratus lumborum"
      },
      {
        "objectId": "muscular_system-right_quadratus_lumborum_ID",
        "name": "Right quadratus lumborum"
      },
      {
        "objectId": "muscular_system-left_quadratus_lumborum_ID",
        "name": "Left quadratus lumborum"
      }
    ]
  },
  "back": {
    "id": "back",
    "name": "Upper & Middle Back",
    "zoomId": "muscular_system-muscles_of_back_ID",
    "keywords": [
      "upper back",
      "trapezius",
      "rhomboid",
      "levator scapulae",
      "nuchae"
    ],
    "selectIds": [
      "muscular_system-muscles_of_back_ID",
      "muscular_system-extrinsic_muscles_of_back_ID"
    ],
    "deselectIds": [
      "muscular_system-right_deltoid_ID",
      "muscular_system-left_deltoid_ID"
    ],
    "parts": [
      {
        "objectId": "muscular_system-right_trapezius_ID",
        "name": "Right trapezius"
      },
      {
        "objectId": "muscular_system-left_trapezius_ID",
        "name": "Left trapezius"
      },
      {
        "objectId": "muscular_system-right_latissimus_dorsi_ID",
        "name": "Right latissimus dorsi"
      },
      {
        "objectId": "muscular_system-left_latissimus_dorsi_ID",
        "name": "Left latissimus dorsi"
      },
      {
        "objectId": "muscular_system-serratus_posterior_superior_ID",
        "name": "Serratus posterior superior"
      },
      {
        "objectId": "muscular_system-right_serratus_posterior_superior_ID",
        "name": "Right serratus posterior superior"
      },
      {
        "objectId": "muscular_system-left_serratus_posterior_superior_ID",
        "name": "Left serratus posterior superior"
      },
      {
        "objectId": "muscular_system-serratus_posterior_inferior_ID",
        "name": "Serratus posterior inferior"
      },
      {
        "objectId": "muscular_system-right_serratus_posterior_inferior_ID",
        "name": "Right serratus posterior inferior"
      },
      {
        "objectId": "muscular_system-left_serratus_posterior_inferior_ID",
        "name": "Left serratus posterior inferior"
      },
      {
        "objectId": "muscular_system-transversus_nuchae_ID",
        "name": "Transversus nuchae"
      },
      {
        "objectId": "muscular_system-right_transversus_nuchae_ID",
        "name": "Right transversus nuchae"
      },
      {
        "objectId": "muscular_system-left_transversus_nuchae_ID",
        "name": "Left transversus nuchae"
      },
      {
        "objectId": "muscular_system-intrinsic_muscles_of_back_ID",
        "name": "Intrinsic muscles of back"
      },
      {
        "objectId": "muscular_system-erector_spinae_ID",
        "name": "Erector spinae"
      },
      {
        "objectId": "muscular_system-iliocostalis_ID",
        "name": "Iliocostalis"
      },
      {
        "objectId": "muscular_system-right_iliocostalis_ID",
        "name": "Right iliocostalis"
      },
      {
        "objectId": "muscular_system-right_iliocostalis_cervicis_ID",
        "name": "Right iliocostalis cervicis"
      },
      {
        "objectId": "muscular_system-right_iliocostalis_thoracis_ID",
        "name": "Right iliocostalis thoracis"
      },
      {
        "objectId": "muscular_system-right_iliocostalis_lumborum_ID",
        "name": "Right iliocostalis lumborum"
      },
      {
        "objectId": "muscular_system-left_iliocostalis_ID",
        "name": "Left iliocostalis"
      },
      {
        "objectId": "muscular_system-left_iliocostalis_cervicis_ID",
        "name": "Left iliocostalis cervicis"
      },
      {
        "objectId": "muscular_system-left_iliocostalis_thoracis_ID",
        "name": "Left iliocostalis thoracis"
      },
      {
        "objectId": "muscular_system-left_iliocostalis_lumborum_ID",
        "name": "Left iliocostalis lumborum"
      },
      {
        "objectId": "muscular_system-longissimus_ID",
        "name": "Longissimus"
      },
      {
        "objectId": "muscular_system-right_longissimus_ID",
        "name": "Right longissimus"
      },
      {
        "objectId": "muscular_system-right_longissimus_capitis_ID",
        "name": "Right longissimus capitis"
      },
      {
        "objectId": "muscular_system-right_longissimus_thoracis_ID",
        "name": "Right longissimus thoracis"
      },
      {
        "objectId": "muscular_system-right_longissimus_cervicis_ID",
        "name": "Right longissimus cervicis"
      },
      {
        "objectId": "muscular_system-left_longissimus_ID",
        "name": "Left longissimus"
      },
      {
        "objectId": "muscular_system-left_longissimus_capitis_ID",
        "name": "Left longissimus capitis"
      },
      {
        "objectId": "muscular_system-left_longissimus_cervicis_ID",
        "name": "Left longissimus cervicis"
      },
      {
        "objectId": "muscular_system-left_longissimus_thoracis_ID",
        "name": "Left longissimus thoracis"
      },
      {
        "objectId": "muscular_system-spinalis_ID",
        "name": "Spinalis"
      },
      {
        "objectId": "muscular_system-right_spinalis_ID",
        "name": "Right spinalis"
      },
      {
        "objectId": "muscular_system-right_spinalis_cervicis_ID",
        "name": "Right spinalis cervicis"
      },
      {
        "objectId": "muscular_system-right_spinalis_thoracis_ID",
        "name": "Right spinalis thoracis"
      },
      {
        "objectId": "muscular_system-left_spinalis_ID",
        "name": "Left spinalis"
      },
      {
        "objectId": "muscular_system-left_spinalis_cervicis_ID",
        "name": "Left spinalis cervicis"
      },
      {
        "objectId": "muscular_system-left_spinalis_thoracis_ID",
        "name": "Left spinalis thoracis"
      },
      {
        "objectId": "muscular_system-splenius_ID",
        "name": "Splenius"
      },
      {
        "objectId": "muscular_system-splenius_capitis_ID",
        "name": "Splenius capitis"
      },
      {
        "objectId": "muscular_system-right_splenius_capitis_ID",
        "name": "Right splenius capitis"
      },
      {
        "objectId": "muscular_system-left_splenius_capitis_ID",
        "name": "Left splenius capitis"
      },
      {
        "objectId": "muscular_system-splenius_cervicis_ID",
        "name": "Splenius cervicis"
      },
      {
        "objectId": "muscular_system-right_splenius_cervicis_ID",
        "name": "Right splenius cervicis"
      },
      {
        "objectId": "muscular_system-left_splenius_cervicis_ID",
        "name": "Left splenius cervicis"
      },
      {
        "objectId": "muscular_system-transversospinales_ID",
        "name": "Transversospinales"
      },
      {
        "objectId": "muscular_system-semispinalis_ID",
        "name": "Semispinalis"
      },
      {
        "objectId": "muscular_system-right_semispinalis_ID",
        "name": "Right semispinalis"
      },
      {
        "objectId": "muscular_system-right_semispinalis_capitis_ID",
        "name": "Right semispinalis capitis"
      },
      {
        "objectId": "muscular_system-right_semispinalis_cervicis_ID",
        "name": "Right semispinalis cervicis"
      },
      {
        "objectId": "muscular_system-right_semispinalis_thoracis_ID",
        "name": "Right semispinalis thoracis"
      },
      {
        "objectId": "muscular_system-left_semispinalis_ID",
        "name": "Left semispinalis"
      },
      {
        "objectId": "muscular_system-left_semispinalis_capitis_ID",
        "name": "Left semispinalis capitis"
      },
      {
        "objectId": "muscular_system-left_semispinalis_cervicis_ID",
        "name": "Left semispinalis cervicis"
      },
      {
        "objectId": "muscular_system-left_semispinalis_thoracis_ID",
        "name": "Left semispinalis thoracis"
      },
      {
        "objectId": "muscular_system-multifidus_ID",
        "name": "Multifidus"
      },
      {
        "objectId": "muscular_system-right_multifidus_ID",
        "name": "Right multifidus"
      },
      {
        "objectId": "muscular_system-left_multifidus_ID",
        "name": "Left multifidus"
      },
      {
        "objectId": "muscular_system-rotatores_ID",
        "name": "Rotatores"
      },
      {
        "objectId": "muscular_system-right_rotatores_ID",
        "name": "Right rotatores"
      },
      {
        "objectId": "muscular_system-right_rotatores_cervicis_ID",
        "name": "Right rotatores cervicis"
      },
      {
        "objectId": "muscular_system-right_rotatores_thoracis_ID",
        "name": "Right rotatores thoracis"
      },
      {
        "objectId": "muscular_system-left_rotatores_ID",
        "name": "Left rotatores"
      },
      {
        "objectId": "muscular_system-left_rotatores_cervicis_ID",
        "name": "Left rotatores cervicis"
      },
      {
        "objectId": "muscular_system-left_rotatores_thoracis_ID",
        "name": "Left rotatores thoracis"
      },
      {
        "objectId": "muscular_system-intertransversarii_ID",
        "name": "Intertransversarii"
      },
      {
        "objectId": "muscular_system-anterior_cervical_intertransversarii_ID",
        "name": "Anterior cervical intertransversarii"
      },
      {
        "objectId": "muscular_system-right_anterior_cervical_intertransversarii_ID",
        "name": "Right anterior cervical intertransversarii"
      },
      {
        "objectId": "muscular_system-left_anterior_cervical_intertransversarii_ID",
        "name": "Left anterior cervical intertransversarii"
      },
      {
        "objectId": "muscular_system-lateral_posterior_cervical_intertransversarii_ID",
        "name": "Lateral posterior cervical intertransversarii"
      },
      {
        "objectId": "muscular_system-right_lateral_posterior_cervical_intertransversarii_ID",
        "name": "Right lateral posterior cervical intertransversarii"
      },
      {
        "objectId": "muscular_system-left_lateral_posterior_cervical_intertransversarii_ID",
        "name": "Left lateral posterior cervical intertransversarii"
      },
      {
        "objectId": "muscular_system-thoracic_intertransversarii_ID",
        "name": "Thoracic intertransversarii"
      },
      {
        "objectId": "muscular_system-right_thoracic_intertransversarii_ID",
        "name": "Right thoracic intertransversarii"
      },
      {
        "objectId": "muscular_system-left_thoracic_intertransversarii_ID",
        "name": "Left thoracic intertransversarii"
      },
      {
        "objectId": "muscular_system-lumbar_intertransversarii_ID",
        "name": "Lumbar intertransversarii"
      },
      {
        "objectId": "muscular_system-right_lumbar_intertransversarii_ID",
        "name": "Right lumbar intertransversarii"
      },
      {
        "objectId": "muscular_system-left_lumbar_intertransversarii_ID",
        "name": "Left lumbar intertransversarii"
      },
      {
        "objectId": "muscular_system-interspinales_ID",
        "name": "Interspinales"
      },
      {
        "objectId": "muscular_system-right_interspinales_ID",
        "name": "Right interspinales"
      },
      {
        "objectId": "muscular_system-left_interspinales_ID",
        "name": "Left interspinales"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_vertebral_column_ID",
        "name": "Connective tissue of vertebral column"
      },
      {
        "objectId": "connective_tissue-intervertebral_discs_ID",
        "name": "Intervertebral discs"
      },
      {
        "objectId": "connective_tissue-cervical_intervertebral_discs_ID",
        "name": "Cervical intervertebral discs"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_axis_C2_vertebra_ID",
        "name": "Intervertebral disc of axis C2 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_C3_vertebra_ID",
        "name": "Intervertebral disc of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_C4_vertebra_ID",
        "name": "Intervertebral disc of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_C5_vertebra_ID",
        "name": "Intervertebral disc of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_C6_vertebra_ID",
        "name": "Intervertebral disc of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_C7_vertebra_ID",
        "name": "Intervertebral disc of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-thoracic_intervertebral_discs_ID",
        "name": "Thoracic intervertebral discs"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T1_vertebra_ID",
        "name": "Intervertebral disc of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T2_vertebra_ID",
        "name": "Intervertebral disc of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T3_vertebra_ID",
        "name": "Intervertebral disc of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T4_vertebra_ID",
        "name": "Intervertebral disc of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T5_vertebra_ID",
        "name": "Intervertebral disc of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T6_vertebra_ID",
        "name": "Intervertebral disc of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T7_vertebra_ID",
        "name": "Intervertebral disc of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T8_vertebra_ID",
        "name": "Intervertebral disc of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T9_vertebra_ID",
        "name": "Intervertebral disc of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T10_vertebra_ID",
        "name": "Intervertebral disc of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T11_vertebra_ID",
        "name": "Intervertebral disc of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_T12_vertebra_ID",
        "name": "Intervertebral disc of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-ligaments_of_vertebral_column_ID",
        "name": "Ligaments of vertebral column"
      },
      {
        "objectId": "connective_tissue-ligaments_of_atlantooccipital_joint_ID",
        "name": "Ligaments of atlantooccipital joint"
      },
      {
        "objectId": "connective_tissue-capsules_of_atlantooccipital_joints_ID",
        "name": "Capsules of atlantooccipital joints"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_atlantooccipital_joint_ID",
        "name": "Right capsule of atlantooccipital joint"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_atlantooccipital_joint_ID",
        "name": "Left capsule of atlantooccipital joint"
      },
      {
        "objectId": "connective_tissue-anterior_atlantooccipital_membrane_ID",
        "name": "Anterior atlantooccipital membrane"
      },
      {
        "objectId": "connective_tissue-posterior_atlantooccipital_membrane_ID",
        "name": "Posterior atlantooccipital membrane"
      },
      {
        "objectId": "connective_tissue-cruciate_ligament_of_atlas_ID",
        "name": "Cruciate ligament of atlas"
      },
      {
        "objectId": "connective_tissue-transverse_ligament_of_atlas_ID",
        "name": "Transverse ligament of atlas"
      },
      {
        "objectId": "connective_tissue-superior_longitudinal_band_of_cruciate_ligament_of_atlas_ID",
        "name": "Superior longitudinal band of cruciate ligament of atlas"
      },
      {
        "objectId": "connective_tissue-inferior_longitudinal_band_of_cruciate_ligament_of_atlas_ID",
        "name": "Inferior longitudinal band of cruciate ligament of atlas"
      },
      {
        "objectId": "connective_tissue-ligaments_of_axis_and_occipital_joint_ID",
        "name": "Ligaments of axis and occipital joint"
      },
      {
        "objectId": "connective_tissue-tectorial_membrane_of_atlanto_hyphen_occipital_joint_ID",
        "name": "Tectorial membrane of atlanto-occipital joint"
      },
      {
        "objectId": "connective_tissue-accessory_tectorial_membrane_of_atlanto_hyphen_occipital_joint_ID",
        "name": "Accessory tectorial membrane of atlanto-occipital joint"
      },
      {
        "objectId": "connective_tissue-apical_ligament_of_dens_ID",
        "name": "Apical ligament of dens"
      },
      {
        "objectId": "connective_tissue-alar_ligaments_ID",
        "name": "Alar ligaments"
      },
      {
        "objectId": "connective_tissue-right_alar_ligament_ID",
        "name": "Right alar ligament"
      },
      {
        "objectId": "connective_tissue-left_alar_ligament_ID",
        "name": "Left alar ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_atlantoaxial_joint_ID",
        "name": "Ligaments of atlantoaxial joint"
      },
      {
        "objectId": "connective_tissue-capsules_of_lateral_atlantoaxial_joints_ID",
        "name": "Capsules of lateral atlantoaxial joints"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_lateral_atlantoaxial_joint_ID",
        "name": "Right capsule of lateral atlantoaxial joint"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_lateral_atlantoaxial_joint_ID",
        "name": "Left capsule of lateral atlantoaxial joint"
      },
      {
        "objectId": "connective_tissue-anterior_atlantoaxial_membrane_ID",
        "name": "Anterior atlantoaxial membrane"
      },
      {
        "objectId": "connective_tissue-posterior_atlantoaxial_membrane_ID",
        "name": "Posterior atlantoaxial membrane"
      },
      {
        "objectId": "connective_tissue-capsules_of_zygoapophyseal_joints_ID",
        "name": "Capsules of zygoapophyseal joints"
      },
      {
        "objectId": "connective_tissue-capsules_of_cervical_zygoapophyseal_joints_ID",
        "name": "Capsules of cervical zygoapophyseal joints"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_C2_hyphen_C3_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_C2_hyphen_C3_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_C2_hyphen_C3_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_C3_hyphen_C4_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_C3_hyphen_C4_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_C3_hyphen_C4_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_C4_hyphen_C5_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_C4_hyphen_C5_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_C4_hyphen_C5_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_C5_hyphen_C6_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_C5_hyphen_C6_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_C5_hyphen_C6_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_C6_hyphen_C7_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_C6_hyphen_C7_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_C6_hyphen_C7_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_C7_hyphen_T1_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_C7_hyphen_T1_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_C7_hyphen_T1_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsules_of_thoracic_zygoapophyseal_joints_ID",
        "name": "Capsules of thoracic zygoapophyseal joints"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T1_hyphen_T2_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T1_hyphen_T2_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T1_hyphen_T2_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T2_hyphen_T3_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T2_hyphen_T3_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T2_hyphen_T3_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T3_hyphen_T4_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T3_hyphen_T4_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T3_hyphen_T4_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T4_hyphen_T5_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T4_hyphen_T5_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T4_hyphen_T5_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T5_hyphen_T6_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T5_hyphen_T6_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T5_hyphen_T6_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T6_hyphen_T7_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T6_hyphen_T7_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T6_hyphen_T7_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T7_hyphen_T8_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T7_hyphen_T8_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T7_hyphen_T8_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T8_hyphen_T9_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T8_hyphen_T9_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T8_hyphen_T9_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T9_hyphen_T10_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T9_hyphen_T10_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T9_hyphen_T10_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T10_hyphen_T11_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T10_hyphen_T11_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T10_hyphen_T11_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T11_hyphen_T12_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T11_hyphen_T12_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T11_hyphen_T12_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_T12_hyphen_L1_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_T12_hyphen_L1_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_T12_hyphen_L1_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_ID",
        "name": "Ligamentum flavum"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_cervical_vertebrae_ID",
        "name": "Ligamentum flavum of cervical vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_C2_hyphen_C3_vertebrae_ID",
        "name": "Ligamentum flavum of C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_C3_hyphen_C4_vertebrae_ID",
        "name": "Ligamentum flavum of C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_C4_hyphen_C5_vertebrae_ID",
        "name": "Ligamentum flavum of C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_C5_hyphen_C6_vertebrae_ID",
        "name": "Ligamentum flavum of C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_C6_hyphen_C7_vertebrae_ID",
        "name": "Ligamentum flavum of C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_C7_hyphen_T1_vertebrae_ID",
        "name": "Ligamentum flavum of C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_thoracic_vertebrae_ID",
        "name": "Ligamentum flavum of thoracic vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T1_hyphen_T2_vertebrae_ID",
        "name": "Ligamentum flavum of T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T2_hyphen_T3_vertebrae_ID",
        "name": "Ligamentum flavum of T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T3_hyphen_T4_vertebrae_ID",
        "name": "Ligamentum flavum of T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T4_hyphen_T5_vertebrae_ID",
        "name": "Ligamentum flavum of T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T5_hyphen_T6_vertebrae_ID",
        "name": "Ligamentum flavum of T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T6_hyphen_T7_vertebrae_ID",
        "name": "Ligamentum flavum of T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T7_hyphen_T8_vertebrae_ID",
        "name": "Ligamentum flavum of T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T8_hyphen_T9_vertebrae_ID",
        "name": "Ligamentum flavum of T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T9_hyphen_T10_vertebrae_ID",
        "name": "Ligamentum flavum of T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T10_hyphen_T11_vertebrae_ID",
        "name": "Ligamentum flavum of T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T11_hyphen_T12_vertebrae_ID",
        "name": "Ligamentum flavum of T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_T12_hyphen_L1_vertebrae_ID",
        "name": "Ligamentum flavum of T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_lumbar_vertebrae_ID",
        "name": "Ligamentum flavum of lumbar vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_L1_hyphen_L2_vertebrae_ID",
        "name": "Ligamentum flavum of L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_L2_hyphen_L3_vertebrae_ID",
        "name": "Ligamentum flavum of L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_L3_hyphen_L4_vertebrae_ID",
        "name": "Ligamentum flavum of L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_L4_hyphen_L5_vertebrae_ID",
        "name": "Ligamentum flavum of L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-ligamentum_flavum_of_L5_hyphen_S1_vertebrae_ID",
        "name": "Ligamentum flavum of L5-S1 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligaments_of_vertebral_column_ID",
        "name": "Intertransverse ligaments of vertebral column"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligaments_of_cervical_vertebrae_ID",
        "name": "Intertransverse ligaments of cervical vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_C2_hyphen_C3_vertebrae_ID",
        "name": "Intertransverse ligament of C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_C2_hyphen_C3_vertebrae_ID",
        "name": "Right intertransverse ligament of C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_C2_hyphen_C3_vertebrae_ID",
        "name": "Left intertransverse ligament of C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_C3_hyphen_C4_vertebrae_ID",
        "name": "Intertransverse ligament of C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_C3_hyphen_C4_vertebrae_ID",
        "name": "Right intertransverse ligament of C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_C3_hyphen_C4_vertebrae_ID",
        "name": "Left intertransverse ligament of C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_C4_hyphen_C5_vertebrae_ID",
        "name": "Intertransverse ligament of C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_C4_hyphen_C5_vertebrae_ID",
        "name": "Right intertransverse ligament of C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_C4_hyphen_C5_vertebrae_ID",
        "name": "Left intertransverse ligament of C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_C5_hyphen_C6_vertebrae_ID",
        "name": "Intertransverse ligament of C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_C5_hyphen_C6_vertebrae_ID",
        "name": "Right intertransverse ligament of C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_C5_hyphen_C6_vertebrae_ID",
        "name": "Left intertransverse ligament of C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_C6_hyphen_C7_vertebrae_ID",
        "name": "Intertransverse ligament of C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_C6_hyphen_C7_vertebrae_ID",
        "name": "Right intertransverse ligament of C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_C6_hyphen_C7_vertebrae_ID",
        "name": "Left intertransverse ligament of C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_C7_hyphen_T1_vertebrae_ID",
        "name": "Intertransverse ligament of C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_C7_hyphen_T1_vertebrae_ID",
        "name": "Right intertransverse ligament of C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_C7_hyphen_T1_vertebrae_ID",
        "name": "Left intertransverse ligament of C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligaments_of_thoracic_vertebrae_ID",
        "name": "Intertransverse ligaments of thoracic vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T1_hyphen_T2_vertebrae_ID",
        "name": "Intertransverse ligament of T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T1_hyphen_T2_vertebrae_ID",
        "name": "Right intertransverse ligament of T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T1_hyphen_T2_vertebrae_ID",
        "name": "Left intertransverse ligament of T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T2_hyphen_T3_vertebrae_ID",
        "name": "Intertransverse ligament of T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T2_hyphen_T3_vertebrae_ID",
        "name": "Right intertransverse ligament of T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T2_hyphen_T3_vertebrae_ID",
        "name": "Left intertransverse ligament of T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T3_hyphen_T4_vertebrae_ID",
        "name": "Intertransverse ligament of T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T3_hyphen_T4_vertebrae_ID",
        "name": "Right intertransverse ligament of T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T3_hyphen_T4_vertebrae_ID",
        "name": "Left intertransverse ligament of T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T4_hyphen_T5_vertebrae_ID",
        "name": "Intertransverse ligament of T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T4_hyphen_T5_vertebrae_ID",
        "name": "Right intertransverse ligament of T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T4_hyphen_T5_vertebrae_ID",
        "name": "Left intertransverse ligament of T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T5_hyphen_T6_vertebrae_ID",
        "name": "Intertransverse ligament of T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T5_hyphen_T6_vertebrae_ID",
        "name": "Right intertransverse ligament of T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T5_hyphen_T6_vertebrae_ID",
        "name": "Left intertransverse ligament of T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T6_hyphen_T7_vertebrae_ID",
        "name": "Intertransverse ligament of T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T6_hyphen_T7_vertebrae_ID",
        "name": "Right intertransverse ligament of T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T6_hyphen_T7_vertebrae_ID",
        "name": "Left intertransverse ligament of T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T7_hyphen_T8_vertebrae_ID",
        "name": "Intertransverse ligament of T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T7_hyphen_T8_vertebrae_ID",
        "name": "Right intertransverse ligament of T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T7_hyphen_T8_vertebrae_ID",
        "name": "Left intertransverse ligament of T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T8_hyphen_T9_vertebrae_ID",
        "name": "Intertransverse ligament of T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T8_hyphen_T9_vertebrae_ID",
        "name": "Right intertransverse ligament of T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T8_hyphen_T9_vertebrae_ID",
        "name": "Left intertransverse ligament of T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T9_hyphen_T10_vertebrae_ID",
        "name": "Intertransverse ligament of T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T9_hyphen_T10_vertebrae_ID",
        "name": "Right intertransverse ligament of T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T9_hyphen_T10_vertebrae_ID",
        "name": "Left intertransverse ligament of T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T10_hyphen_T11_vertebrae_ID",
        "name": "Intertransverse ligament of T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T10_hyphen_T11_vertebrae_ID",
        "name": "Right intertransverse ligament of T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T10_hyphen_T11_vertebrae_ID",
        "name": "Left intertransverse ligament of T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T11_hyphen_T12_vertebrae_ID",
        "name": "Intertransverse ligament of T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T11_hyphen_T12_vertebrae_ID",
        "name": "Right intertransverse ligament of T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T11_hyphen_T12_vertebrae_ID",
        "name": "Left intertransverse ligament of T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_T12_hyphen_L1_vertebrae_ID",
        "name": "Intertransverse ligament of T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_T12_hyphen_L1_vertebrae_ID",
        "name": "Right intertransverse ligament of T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_T12_hyphen_L1_vertebrae_ID",
        "name": "Left intertransverse ligament of T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-spinous_ligaments_of_vertebral_column_ID",
        "name": "Spinous ligaments of vertebral column"
      },
      {
        "objectId": "connective_tissue-ligamentum_nuchae_ID",
        "name": "Ligamentum nuchae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligaments_of_vertebral_column_ID",
        "name": "Supraspinous ligaments of vertebral column"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_C7_hyphen_T1_vertebrae_ID",
        "name": "Supraspinous ligament of C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligaments_of_thoracic_vertebrae_ID",
        "name": "Supraspinous ligaments of thoracic vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T1_hyphen_T2_vertebrae_ID",
        "name": "Supraspinous ligament of T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T2_hyphen_T3_vertebrae_ID",
        "name": "Supraspinous ligament of T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T3_hyphen_T4_vertebrae_ID",
        "name": "Supraspinous ligament of T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T4_hyphen_T5_vertebrae_ID",
        "name": "Supraspinous ligament of T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T5_hyphen_T6_vertebrae_ID",
        "name": "Supraspinous ligament of T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T6_hyphen_T7_vertebrae_ID",
        "name": "Supraspinous ligament of T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T7_hyphen_T8_vertebrae_ID",
        "name": "Supraspinous ligament of T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T8_hyphen_T9_vertebrae_ID",
        "name": "Supraspinous ligament of T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T9_hyphen_T10_vertebrae_ID",
        "name": "Supraspinous ligament of T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T10_hyphen_T11_vertebrae_ID",
        "name": "Supraspinous ligament of T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T11_hyphen_T12_vertebrae_ID",
        "name": "Supraspinous ligament of T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_T12_hyphen_L1_vertebrae_ID",
        "name": "Supraspinous ligament of T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligaments_of_vertebral_column_ID",
        "name": "Interspinous ligaments of vertebral column"
      },
      {
        "objectId": "connective_tissue-interspinous_ligaments_of_cervical_vertebrae_ID",
        "name": "Interspinous ligaments of cervical vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_C2_hyphen_C3_vertebrae_ID",
        "name": "Interspinous ligament of C2-C3 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_C3_hyphen_C4_vertebrae_ID",
        "name": "Interspinous ligament of C3-C4 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_C4_hyphen_C5_vertebrae_ID",
        "name": "Interspinous ligament of C4-C5 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_C5_hyphen_C6_vertebrae_ID",
        "name": "Interspinous ligament of C5-C6 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_C6_hyphen_C7_vertebrae_ID",
        "name": "Interspinous ligament of C6-C7 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_C7_hyphen_T1_vertebrae_ID",
        "name": "Interspinous ligament of C7-T1 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligaments_of_thoracic_vertebrae_ID",
        "name": "Interspinous ligaments of thoracic vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T1_hyphen_T2_vertebrae_ID",
        "name": "Interspinous ligament of T1-T2 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T2_hyphen_T3_vertebrae_ID",
        "name": "Interspinous ligament of T2-T3 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T3_hyphen_T4_vertebrae_ID",
        "name": "Interspinous ligament of T3-T4 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T4_hyphen_T5_vertebrae_ID",
        "name": "Interspinous ligament of T4-T5 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T5_hyphen_T6_vertebrae_ID",
        "name": "Interspinous ligament of T5-T6 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T6_hyphen_T7_vertebrae_ID",
        "name": "Interspinous ligament of T6-T7 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T7_hyphen_T8_vertebrae_ID",
        "name": "Interspinous ligament of T7-T8 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T8_hyphen_T9_vertebrae_ID",
        "name": "Interspinous ligament of T8-T9 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T9_hyphen_T10_vertebrae_ID",
        "name": "Interspinous ligament of T9-T10 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T10_hyphen_T11_vertebrae_ID",
        "name": "Interspinous ligament of T10-T11 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T11_hyphen_T12_vertebrae_ID",
        "name": "Interspinous ligament of T11-T12 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_T12_hyphen_L1_vertebrae_ID",
        "name": "Interspinous ligament of T12-L1 vertebrae"
      },
      {
        "objectId": "connective_tissue-posterior_longitudinal_ligament_ID",
        "name": "Posterior longitudinal ligament"
      },
      {
        "objectId": "connective_tissue-anterior_longitudinal_ligament_ID",
        "name": "Anterior longitudinal ligament"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_vertebral_column_ID",
        "name": "Articular cartilage of vertebral column"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_cervical_vertebrae_ID",
        "name": "Articular cartilage of cervical vertebrae"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_atlas_ID",
        "name": "Articular cartilage of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_atlas_ID",
        "name": "Articular cartilage of superior articular facet of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_atlas_ID",
        "name": "Articular cartilage of right superior articular facet of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_atlas_ID",
        "name": "Articular cartilage of left superior articular facet of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_atlas_ID",
        "name": "Articular cartilage of inferior articular facet of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_atlas_ID",
        "name": "Articular cartilage of right inferior articular facet of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_atlas_ID",
        "name": "Articular cartilage of left inferior articular facet of atlas"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_axis_ID",
        "name": "Articular cartilage of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_anterior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of anterior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_posterior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of posterior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of superior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of right superior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of left superior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of inferior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of right inferior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_axis_ID",
        "name": "Articular cartilage of left inferior articular facet of axis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_C3_vertebra_ID",
        "name": "Articular cartilage of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_C3_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_C3_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_C3_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_C3_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_C3_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_C3_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of C3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_C4_vertebra_ID",
        "name": "Articular cartilage of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_C4_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_C4_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_C4_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_C4_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_C4_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_C4_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of C4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_C5_vertebra_ID",
        "name": "Articular cartilage of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_C5_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_C5_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_C5_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_C5_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_C5_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_C5_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of C5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_C6_vertebra_ID",
        "name": "Articular cartilage of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_C6_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_C6_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_C6_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_C6_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_C6_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_C6_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of C6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_C7_vertebra_ID",
        "name": "Articular cartilage of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_C7_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_C7_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_C7_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_C7_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_C7_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_C7_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of C7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_thoracic_vertebrae_ID",
        "name": "Articular cartilage of thoracic vertebrae"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T1_vertebra_ID",
        "name": "Articular cartilage of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T1_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T2_vertebra_ID",
        "name": "Articular cartilage of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T2_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T3_vertebra_ID",
        "name": "Articular cartilage of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T3_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T4_vertebra_ID",
        "name": "Articular cartilage of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T4_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T5_vertebra_ID",
        "name": "Articular cartilage of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T5_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T6_vertebra_ID",
        "name": "Articular cartilage of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T6_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T6 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T7_vertebra_ID",
        "name": "Articular cartilage of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T7_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T7 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T8_vertebra_ID",
        "name": "Articular cartilage of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of superior costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of right superior costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of left superior costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of inferior costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of right inferior costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_costal_facet_of_T8_vertebra_ID",
        "name": "Articular cartilage of left inferior costal facet of T8 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T9_vertebra_ID",
        "name": "Articular cartilage of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_costal_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of costal facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_costal_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of left costal facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_costal_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of right costal facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T9_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T9 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T10_vertebra_ID",
        "name": "Articular cartilage of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_costal_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of costal facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_costal_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of left costal facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_costal_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of right costal facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_transverse_costal_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of transverse costal facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_transverse_costal_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of right transverse costal facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_transverse_costal_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of left transverse costal facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T10_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T10 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T11_vertebra_ID",
        "name": "Articular cartilage of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_costal_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of costal facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_costal_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of left costal facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_costal_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of right costal facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T11_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T11 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_T12_vertebra_ID",
        "name": "Articular cartilage of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_costal_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of costal facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_costal_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of right costal facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_costal_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of left costal facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of T12 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_T12_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of T12 vertebra"
      },
      {
        "objectId": "skeletal_system-vertebral_column_ID",
        "name": "Vertebral column"
      },
      {
        "objectId": "skeletal_system-cervical_vertebrae_ID",
        "name": "Cervical vertebrae"
      },
      {
        "objectId": "skeletal_system-atlas_first_cervical_vertebra_ID",
        "name": "Atlas first cervical vertebra"
      },
      {
        "objectId": "skeletal_system-axis_second_cervical_vertebra_ID",
        "name": "Axis second cervical vertebra"
      },
      {
        "objectId": "skeletal_system-third_cervical_vertebra_ID",
        "name": "Third cervical vertebra"
      },
      {
        "objectId": "skeletal_system-fourth_cervical_vertebra_ID",
        "name": "Fourth cervical vertebra"
      },
      {
        "objectId": "skeletal_system-fifth_cervical_vertebra_ID",
        "name": "Fifth cervical vertebra"
      },
      {
        "objectId": "skeletal_system-sixth_cervical_vertebra_ID",
        "name": "Sixth cervical vertebra"
      },
      {
        "objectId": "skeletal_system-seventh_cervical_vertebra_ID",
        "name": "Seventh cervical vertebra"
      },
      {
        "objectId": "skeletal_system-thoracic_vertebrae_ID",
        "name": "Thoracic vertebrae"
      },
      {
        "objectId": "skeletal_system-first_thoracic_vertebra_ID",
        "name": "First thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-second_thoracic_vertebra_ID",
        "name": "Second thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-third_thoracic_vertebra_ID",
        "name": "Third thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-fourth_thoracic_vertebra_ID",
        "name": "Fourth thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-fifth_thoracic_vertebra_ID",
        "name": "Fifth thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-sixth_thoracic_vertebra_ID",
        "name": "Sixth thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-seventh_thoracic_vertebra_ID",
        "name": "Seventh thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-eighth_thoracic_vertebra_ID",
        "name": "Eighth thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-ninth_thoracic_vertebra_ID",
        "name": "Ninth thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-tenth_thoracic_vertebra_ID",
        "name": "Tenth thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-eleventh_thoracic_vertebra_ID",
        "name": "Eleventh thoracic vertebra"
      },
      {
        "objectId": "skeletal_system-twelfth_thoracic_vertebra_ID",
        "name": "Twelfth thoracic vertebra"
      }
    ]
  },
  "pelvisHip": {
    "id": "pelvis",
    "name": "Lower Back, Pelvis & Hip Region",
    "zoomId": "skeletal_system-bones_of_upper_limb_ID",
    "keywords": [
      "pelvis",
      "hip",
      "gluteal",
      "iliac",
      "psoas",
      "iliopsoas",
      "ilium",
      "sacrum",
      "coccyx",
      "pubis",
      "ischium",
      "acetabular"
    ],
    "selectIds": [
      "connective_tissue-connective_tissue_of_pelvis_ID",
      "muscular_system-muscles_of_pelvic_floor_and_perineum_ID",
      "muscular_system-muscles_of_pelvic_floor_ID",
      "muscular_system-lateral_rotator_muscles_of_right_hip_ID",
      "connective_tissue-connective_tissue_of_right_hip_ID",
      "skeletal_system-right_hip_bone_ID",
      "muscular_system-lateral_rotator_muscles_of_left_hip_ID",
      "connective_tissue-connective_tissue_of_left_hip_ID",
      "skeletal_system-left_hip_bone_ID",
      "muscular_system-left_iliopsoas_ID",
      "muscular_system-right_iliopsoas_ID",
      "skeletal_system-sacrum_ID",
      "connective_tissue-articular_cartilage_of_lumbar_vertebrae_ID",
      "connective_tissue-lumbar_intervertebral_discs_ID",
      "skeletal_system-lumbar_vertebrae_ID",
      "connective_tissue-capsules_of_lumbar_zygoapophyseal_joints_ID",
      "connective_tissue-ligamentum_flavum_of_lumbar_vertebrae_ID",
      "muscular_system-intertransversarii_lumborum_ID",
      "muscular_system-right_rotatores_lumborum_ID",
      "muscular_system-left_rotatores_lumborum_ID",
      "connective_tissue-cartilage_of_sacrum_ID",
      "skeletal_system-coccyx_ID",
      "connective_tissue-interspinous_ligaments_of_lumbar_vertebrae_ID",
      "connective_tissue-intertransverse_ligaments_of_lumbar_vertebrae_ID",
      "connective_tissue-supraspinous_ligaments_of_lumbar_vertebrae_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "connective_tissue-supraspinous_ligaments_of_lumbar_vertebrae_ID",
        "name": "Supraspinous ligaments of lumbar vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_L1_hyphen_L2_vertebrae_ID",
        "name": "Supraspinous ligament of L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_L2_hyphen_L3_vertebrae_ID",
        "name": "Supraspinous ligament of L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_L3_hyphen_L4_vertebrae_ID",
        "name": "Supraspinous ligament of L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_L4_hyphen_L5_vertebrae_ID",
        "name": "Supraspinous ligament of L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-supraspinous_ligament_of_L5_hyphen_S1_vertebrae_ID",
        "name": "Supraspinous ligament of L5-S1 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligaments_of_lumbar_vertebrae_ID",
        "name": "Intertransverse ligaments of lumbar vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_L1_hyphen_L2_vertebrae_ID",
        "name": "Intertransverse ligament of L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_L1_hyphen_L2_vertebrae_ID",
        "name": "Right intertransverse ligament of L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_L1_hyphen_L2_vertebrae_ID",
        "name": "Left intertransverse ligament of L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_L2_hyphen_L3_vertebrae_ID",
        "name": "Intertransverse ligament of L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_L2_hyphen_L3_vertebrae_ID",
        "name": "Right intertransverse ligament of L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_L2_hyphen_L3_vertebrae_ID",
        "name": "Left intertransverse ligament of L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_L3_hyphen_L4_vertebrae_ID",
        "name": "Intertransverse ligament of L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_L3_hyphen_L4_vertebrae_ID",
        "name": "Right intertransverse ligament of L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_L3_hyphen_L4_vertebrae_ID",
        "name": "Left intertransverse ligament of L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-intertransverse_ligament_of_L4_hyphen_L5_vertebrae_ID",
        "name": "Intertransverse ligament of L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_intertransverse_ligament_of_L4_hyphen_L5_vertebrae_ID",
        "name": "Right intertransverse ligament of L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_intertransverse_ligament_of_L4_hyphen_L5_vertebrae_ID",
        "name": "Left intertransverse ligament of L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligaments_of_lumbar_vertebrae_ID",
        "name": "Interspinous ligaments of lumbar vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_L1_hyphen_L2_vertebrae_ID",
        "name": "Interspinous ligament of L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_L2_hyphen_L3_vertebrae_ID",
        "name": "Interspinous ligament of L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_L3_hyphen_L4_vertebrae_ID",
        "name": "Interspinous ligament of L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_L4_hyphen_L5_vertebrae_ID",
        "name": "Interspinous ligament of L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-interspinous_ligament_of_L5_hyphen_S1_vertebrae_ID",
        "name": "Interspinous ligament of L5-S1 vertebrae"
      },
      {
        "objectId": "connective_tissue-cartilage_of_sacrum_ID",
        "name": "Cartilage of sacrum"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_sacrum_ID",
        "name": "Articular cartilage of superior articular facet of sacrum"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_sacrum_ID",
        "name": "Articular cartilage of right superior articular facet of sacrum"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_sacrum_ID",
        "name": "Articular cartilage of left superior articular facet of sacrum"
      },
      {
        "objectId": "connective_tissue-sacrococcygeal_symphysis_ID",
        "name": "Sacrococcygeal symphysis"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_lumbar_vertebrae_ID",
        "name": "Articular cartilage of lumbar vertebrae"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_L1_vertebra_ID",
        "name": "Articular cartilage of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_L1_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_L1_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_L1_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_L1_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_L1_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_L1_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_L2_vertebra_ID",
        "name": "Articular cartilage of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_L2_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_L2_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_L2_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_L2_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_L2_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_L2_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_L3_vertebra_ID",
        "name": "Articular cartilage of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_L3_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_L3_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_L3_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_L3_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_L3_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_L3_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_L4_vertebra_ID",
        "name": "Articular cartilage of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_L4_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_L4_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_L4_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_L4_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_L4_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_L4_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_L5_vertebra_ID",
        "name": "Articular cartilage of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_superior_articular_facet_of_L5_vertebra_ID",
        "name": "Articular cartilage of superior articular facet of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_superior_articular_facet_of_L5_vertebra_ID",
        "name": "Articular cartilage of right superior articular facet of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_superior_articular_facet_of_L5_vertebra_ID",
        "name": "Articular cartilage of left superior articular facet of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_facet_of_L5_vertebra_ID",
        "name": "Articular cartilage of inferior articular facet of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_L5_vertebra_ID",
        "name": "Articular cartilage of right inferior articular facet of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_inferior_articular_facet_of_L5_vertebra_ID",
        "name": "Articular cartilage of left inferior articular facet of L5 vertebra"
      },
      {
        "objectId": "connective_tissue-capsules_of_lumbar_zygoapophyseal_joints_ID",
        "name": "Capsules of lumbar zygoapophyseal joints"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_L1_hyphen_L2_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_L1_hyphen_L2_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_L1_hyphen_L2_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for L1-L2 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_L2_hyphen_L3_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_L2_hyphen_L3_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_L2_hyphen_L3_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for L2-L3 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_L3_hyphen_L4_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_L3_hyphen_L4_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_L3_hyphen_L4_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for L3-L4 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_L4_hyphen_L5_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_L4_hyphen_L5_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_L4_hyphen_L5_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for L4-L5 vertebrae"
      },
      {
        "objectId": "connective_tissue-capsule_of_zygapophyseal_joint_for_L5_hyphen_S1_vertebrae_ID",
        "name": "Capsule of zygapophyseal joint for L5-S1 vertebrae"
      },
      {
        "objectId": "connective_tissue-right_capsule_of_zygapophyseal_joint_for_L5_hyphen_S1_vertebrae_ID",
        "name": "Right capsule of zygapophyseal joint for L5-S1 vertebrae"
      },
      {
        "objectId": "connective_tissue-left_capsule_of_zygapophyseal_joint_for_L5_hyphen_S1_vertebrae_ID",
        "name": "Left capsule of zygapophyseal joint for L5-S1 vertebrae"
      },
      {
        "objectId": "connective_tissue-lumbar_intervertebral_discs_ID",
        "name": "Lumbar intervertebral discs"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_L1_vertebra_ID",
        "name": "Intervertebral disc of L1 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_L2_vertebra_ID",
        "name": "Intervertebral disc of L2 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_L3_vertebra_ID",
        "name": "Intervertebral disc of L3 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_L4_vertebra_ID",
        "name": "Intervertebral disc of L4 vertebra"
      },
      {
        "objectId": "connective_tissue-intervertebral_disc_of_L5_vertebra_ID",
        "name": "Intervertebral disc of L5 vertebra"
      },
      {
        "objectId": "skeletal_system-lumbar_vertebrae_ID",
        "name": "Lumbar vertebrae"
      },
      {
        "objectId": "skeletal_system-first_lumbar_vertebra_ID",
        "name": "First lumbar vertebra"
      },
      {
        "objectId": "skeletal_system-second_lumbar_vertebra_ID",
        "name": "Second lumbar vertebra"
      },
      {
        "objectId": "skeletal_system-third_lumbar_vertebra_ID",
        "name": "Third lumbar vertebra"
      },
      {
        "objectId": "skeletal_system-fourth_lumbar_vertebra_ID",
        "name": "Fourth lumbar vertebra"
      },
      {
        "objectId": "skeletal_system-fifth_lumbar_vertebra_ID",
        "name": "Fifth lumbar vertebra"
      },
      {
        "objectId": "skeletal_system-sacrum_ID",
        "name": "Sacrum"
      },
      {
        "objectId": "skeletal_system-coccyx_ID",
        "name": "Coccyx"
      },
      {
        "objectId": "muscular_system-intertransversarii_lumborum_ID",
        "name": "Intertransversarii lumborum"
      },
      {
        "objectId": "muscular_system-intertransversarii_laterales_lumborum_ID",
        "name": "Intertransversarii laterales lumborum"
      },
      {
        "objectId": "muscular_system-right_intertransversarii_laterales_lumborum_ID",
        "name": "Right intertransversarii laterales lumborum"
      },
      {
        "objectId": "muscular_system-left_intertransversarii_laterales_lumborum_ID",
        "name": "Left intertransversarii laterales lumborum"
      },
      {
        "objectId": "muscular_system-intertransversarii_mediales_lumborum_ID",
        "name": "Intertransversarii mediales lumborum"
      },
      {
        "objectId": "muscular_system-left_intertransversarii_mediales_lumborum_ID",
        "name": "Left intertransversarii mediales lumborum"
      },
      {
        "objectId": "muscular_system-right_intertransversarii_mediales_lumborum_ID",
        "name": "Right intertransversarii mediales lumborum"
      },
      {
        "objectId": "muscular_system-right_rotatores_lumborum_ID",
        "name": "Right rotatores lumborum"
      },
      {
        "objectId": "muscular_system-left_rotatores_lumborum_ID",
        "name": "Left rotatores lumborum"
      },
      {
        "objectId": "muscular_system-lateral_rotator_muscles_of_right_hip_ID",
        "name": "Lateral rotator muscles of right hip"
      },
      {
        "objectId": "muscular_system-right_superior_gemellus_ID",
        "name": "Right superior gemellus"
      },
      {
        "objectId": "muscular_system-right_inferior_gemellus_ID",
        "name": "Right inferior gemellus"
      },
      {
        "objectId": "muscular_system-right_quadratus_femoris_ID",
        "name": "Right quadratus femoris"
      },
      {
        "objectId": "muscular_system-right_obturator_externus_ID",
        "name": "Right obturator externus"
      },
      {
        "objectId": "muscular_system-right_obturator_internus_ID",
        "name": "Right obturator internus"
      },
      {
        "objectId": "muscular_system-right_piriformis_ID",
        "name": "Right piriformis"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_right_hip_ID",
        "name": "Connective tissue of right hip"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_hip_joint_ID",
        "name": "Cartilage of right hip joint"
      },
      {
        "objectId": "connective_tissue-right_acetabular_labrum_ID",
        "name": "Right acetabular labrum"
      },
      {
        "objectId": "connective_tissue-right_acetabular_cartilage_ID",
        "name": "Right acetabular cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_femoral_head_ID",
        "name": "Articular cartilage of right femoral head"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_hip_joint_ID",
        "name": "Ligaments of right hip joint"
      },
      {
        "objectId": "connective_tissue-right_ligament_of_head_of_femur_ID",
        "name": "Right ligament of head of femur"
      },
      {
        "objectId": "connective_tissue-right_transverse_acetabular_ligament_ID",
        "name": "Right transverse acetabular ligament"
      },
      {
        "objectId": "connective_tissue-right_pubofemoral_ligament_ID",
        "name": "Right pubofemoral ligament"
      },
      {
        "objectId": "connective_tissue-right_ischiofemoral_ligament_ID",
        "name": "Right ischiofemoral ligament"
      },
      {
        "objectId": "connective_tissue-right_iliofemoral_ligament_ID",
        "name": "Right iliofemoral ligament"
      },
      {
        "objectId": "connective_tissue-right_hip_joint_capsule_ID",
        "name": "Right hip joint capsule"
      },
      {
        "objectId": "connective_tissue-right_zona_orbicularis_ID",
        "name": "Right zona orbicularis"
      },
      {
        "objectId": "connective_tissue-right_iliopectineal_bursa_ID",
        "name": "Right iliopectineal bursa"
      },
      {
        "objectId": "skeletal_system-right_hip_bone_ID",
        "name": "Right hip bone"
      },
      {
        "objectId": "skeletal_system-right_ilium_ID",
        "name": "Right ilium"
      },
      {
        "objectId": "skeletal_system-right_pubis_ID",
        "name": "Right pubis"
      },
      {
        "objectId": "skeletal_system-right_ischium_ID",
        "name": "Right ischium"
      },
      {
        "objectId": "muscular_system-lateral_rotator_muscles_of_left_hip_ID",
        "name": "Lateral rotator muscles of left hip"
      },
      {
        "objectId": "muscular_system-left_superior_gemellus_ID",
        "name": "Left superior gemellus"
      },
      {
        "objectId": "muscular_system-left_inferior_gemellus_ID",
        "name": "Left inferior gemellus"
      },
      {
        "objectId": "muscular_system-left_quadratus_femoris_ID",
        "name": "Left quadratus femoris"
      },
      {
        "objectId": "muscular_system-left_obturator_externus_ID",
        "name": "Left obturator externus"
      },
      {
        "objectId": "muscular_system-left_obturator_internus_ID",
        "name": "Left obturator internus"
      },
      {
        "objectId": "muscular_system-left_piriformis_ID",
        "name": "Left piriformis"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_left_hip_ID",
        "name": "Connective tissue of left hip"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_hip_joint_ID",
        "name": "Cartilage of left hip joint"
      },
      {
        "objectId": "connective_tissue-left_acetabular_labrum_ID",
        "name": "Left acetabular labrum"
      },
      {
        "objectId": "connective_tissue-left_acetabular_cartilage_ID",
        "name": "Left acetabular cartilage"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_femoral_head_ID",
        "name": "Articular cartilage of left femoral head"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_hip_joint_ID",
        "name": "Ligaments of left hip joint"
      },
      {
        "objectId": "connective_tissue-left_ligament_of_head_of_femur_ID",
        "name": "Left ligament of head of femur"
      },
      {
        "objectId": "connective_tissue-left_transverse_acetabular_ligament_ID",
        "name": "Left transverse acetabular ligament"
      },
      {
        "objectId": "connective_tissue-left_pubofemoral_ligament_ID",
        "name": "Left pubofemoral ligament"
      },
      {
        "objectId": "connective_tissue-left_ischiofemoral_ligament_ID",
        "name": "Left ischiofemoral ligament"
      },
      {
        "objectId": "connective_tissue-left_iliofemoral_ligament_ID",
        "name": "Left iliofemoral ligament"
      },
      {
        "objectId": "connective_tissue-left_hip_joint_capsule_ID",
        "name": "Left hip joint capsule"
      },
      {
        "objectId": "connective_tissue-left_zona_orbicularis_ID",
        "name": "Left zona orbicularis"
      },
      {
        "objectId": "connective_tissue-left_iliopectineal_bursa_ID",
        "name": "Left iliopectineal bursa"
      },
      {
        "objectId": "skeletal_system-left_hip_bone_ID",
        "name": "Left hip bone"
      },
      {
        "objectId": "skeletal_system-left_ischium_ID",
        "name": "Left ischium"
      },
      {
        "objectId": "skeletal_system-left_pubis_ID",
        "name": "Left pubis"
      },
      {
        "objectId": "skeletal_system-left_ilium_ID",
        "name": "Left ilium"
      },
      {
        "objectId": "skeletal_system-sacrum_ID",
        "name": "Sacrum"
      },
      {
        "objectId": "muscular_system-left_iliopsoas_ID",
        "name": "Left iliopsoas"
      },
      {
        "objectId": "muscular_system-left_iliacus_ID",
        "name": "Left iliacus"
      },
      {
        "objectId": "muscular_system-left_psoas_minor_ID",
        "name": "Left psoas minor"
      },
      {
        "objectId": "muscular_system-left_psoas_major_ID",
        "name": "Left psoas major"
      },
      {
        "objectId": "muscular_system-right_iliopsoas_ID",
        "name": "Right iliopsoas"
      },
      {
        "objectId": "muscular_system-right_iliacus_ID",
        "name": "Right iliacus"
      },
      {
        "objectId": "muscular_system-right_psoas_minor_ID",
        "name": "Right psoas minor"
      },
      {
        "objectId": "muscular_system-right_psoas_major_ID",
        "name": "Right psoas major"
      },
      {
        "objectId": "muscular_system-muscles_of_pelvic_floor_and_perineum_ID",
        "name": "Muscles of pelvic floor and perineum"
      },
      {
        "objectId": "muscular_system-muscles_of_pelvic_floor_ID",
        "name": "Muscles of pelvic floor"
      },
      {
        "objectId": "muscular_system-coccygeus_ID",
        "name": "Coccygeus"
      },
      {
        "objectId": "muscular_system-right_coccygeus_ID",
        "name": "Right coccygeus"
      },
      {
        "objectId": "muscular_system-left_coccygeus_ID",
        "name": "Left coccygeus"
      },
      {
        "objectId": "muscular_system-levator_ani_ID",
        "name": "Levator ani"
      },
      {
        "objectId": "muscular_system-iliococcygeus_ID",
        "name": "Iliococcygeus"
      },
      {
        "objectId": "muscular_system-left_iliococcygeus_ID",
        "name": "Left iliococcygeus"
      },
      {
        "objectId": "muscular_system-right_iliococcygeus_ID",
        "name": "Right iliococcygeus"
      },
      {
        "objectId": "muscular_system-pubococcygeus_ID",
        "name": "Pubococcygeus"
      },
      {
        "objectId": "muscular_system-right_pubococcygeus_ID",
        "name": "Right pubococcygeus"
      },
      {
        "objectId": "muscular_system-left_pubococcygeus_ID",
        "name": "Left pubococcygeus"
      },
      {
        "objectId": "muscular_system-puborectalis_ID",
        "name": "Puborectalis"
      },
      {
        "objectId": "muscular_system-right_puborectalis_ID",
        "name": "Right puborectalis"
      },
      {
        "objectId": "muscular_system-left_puborectalis_ID",
        "name": "Left puborectalis"
      },
      {
        "objectId": "muscular_system-muscles_of_perineum_ID",
        "name": "Muscles of perineum"
      },
      {
        "objectId": "muscular_system-superficial_transverse_perineal_muscle_ID",
        "name": "Superficial transverse perineal muscle"
      },
      {
        "objectId": "muscular_system-right_superficial_transverse_perineal_muscle_ID",
        "name": "Right superficial transverse perineal muscle"
      },
      {
        "objectId": "muscular_system-left_superficial_transverse_perineal_muscle_ID",
        "name": "Left superficial transverse perineal muscle"
      },
      {
        "objectId": "muscular_system-external_urethral_sphincter_ID",
        "name": "External urethral sphincter"
      },
      {
        "objectId": "muscular_system-ischiocavernosus_ID",
        "name": "Ischiocavernosus"
      },
      {
        "objectId": "muscular_system-right_ischiocavernosus_ID",
        "name": "Right ischiocavernosus"
      },
      {
        "objectId": "muscular_system-left_ischiocavernosus_ID",
        "name": "Left ischiocavernosus"
      },
      {
        "objectId": "muscular_system-bulbospongiosus_muscle_ID",
        "name": "Bulbospongiosus muscle"
      },
      {
        "objectId": "muscular_system-right_bulbospongiosus_muscle_ID",
        "name": "Right bulbospongiosus muscle"
      },
      {
        "objectId": "muscular_system-left_bulbospongiosus_muscle_ID",
        "name": "Left bulbospongiosus muscle"
      },
      {
        "objectId": "muscular_system-deep_transverse_perineal_muscle_ID",
        "name": "Deep transverse perineal muscle"
      },
      {
        "objectId": "muscular_system-right_deep_transverse_perineal_muscle_ID",
        "name": "Right deep transverse perineal muscle"
      },
      {
        "objectId": "muscular_system-left_deep_transverse_perineal_muscle_ID",
        "name": "Left deep transverse perineal muscle"
      },
      {
        "objectId": "muscular_system-muscles_of_anal_sphincter_ID",
        "name": "Muscles of anal sphincter"
      },
      {
        "objectId": "muscular_system-corrugator_cutis_ani_ID",
        "name": "Corrugator cutis ani"
      },
      {
        "objectId": "muscular_system-external_anal_sphincter_ID",
        "name": "External anal sphincter"
      },
      {
        "objectId": "muscular_system-subcutaneous_part_of_external_anal_sphincter_muscle_ID",
        "name": "Subcutaneous part of external anal sphincter muscle"
      },
      {
        "objectId": "muscular_system-superficial_part_of_external_anal_sphincter_muscle_ID",
        "name": "Superficial part of external anal sphincter muscle"
      },
      {
        "objectId": "muscular_system-deep_part_of_external_anal_sphincter_muscle_ID",
        "name": "Deep part of external anal sphincter muscle"
      },
      {
        "objectId": "muscular_system-conjoined_longitudinal_anal_sphincter_ID",
        "name": "Conjoined longitudinal anal sphincter"
      },
      {
        "objectId": "muscular_system-internal_anal_sphincter_ID",
        "name": "Internal anal sphincter"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_pelvis_ID",
        "name": "Connective tissue of pelvis"
      },
      {
        "objectId": "connective_tissue-pubic_symphysis_ID",
        "name": "Pubic symphysis"
      },
      {
        "objectId": "connective_tissue-ligaments_of_pubic_symphysis_ID",
        "name": "Ligaments of pubic symphysis"
      },
      {
        "objectId": "connective_tissue-anterior_pubic_ligament_ID",
        "name": "Anterior pubic ligament"
      },
      {
        "objectId": "connective_tissue-superior_pubic_ligament_ID",
        "name": "Superior pubic ligament"
      },
      {
        "objectId": "connective_tissue-inferior_pubic_ligament_ID",
        "name": "Inferior pubic ligament"
      },
      {
        "objectId": "connective_tissue-posterior_pubic_ligament_ID",
        "name": "Posterior pubic ligament"
      },
      {
        "objectId": "connective_tissue-fascia_of_pelvis_ID",
        "name": "Fascia of pelvis"
      },
      {
        "objectId": "connective_tissue-obturator_fascia_ID",
        "name": "Obturator fascia"
      },
      {
        "objectId": "connective_tissue-right_obturator_fascia_ID",
        "name": "Right obturator fascia"
      },
      {
        "objectId": "connective_tissue-left_obturator_fascia_ID",
        "name": "Left obturator fascia"
      },
      {
        "objectId": "connective_tissue-tendinous_arch_of_levator_ani_ID",
        "name": "Tendinous arch of levator ani"
      },
      {
        "objectId": "connective_tissue-left_tendinous_arch_of_levator_ani_ID",
        "name": "Left tendinous arch of levator ani"
      },
      {
        "objectId": "connective_tissue-right_tendinous_arch_of_levator_ani_ID",
        "name": "Right tendinous arch of levator ani"
      },
      {
        "objectId": "connective_tissue-perineal_fascia_ID",
        "name": "Perineal fascia"
      },
      {
        "objectId": "connective_tissue-perineal_membrane_ID",
        "name": "Perineal membrane"
      },
      {
        "objectId": "connective_tissue-left_perineal_membrane_ID",
        "name": "Left perineal membrane"
      },
      {
        "objectId": "connective_tissue-right_perineal_membrane_ID",
        "name": "Right perineal membrane"
      },
      {
        "objectId": "connective_tissue-tendinous_arch_of_pelvic_fascia_ID",
        "name": "Tendinous arch of pelvic fascia"
      },
      {
        "objectId": "connective_tissue-left_tendinous_arch_of_pelvic_fascia_ID",
        "name": "Left tendinous arch of pelvic fascia"
      },
      {
        "objectId": "connective_tissue-right_tendinous_arch_of_pelvic_fascia_ID",
        "name": "Right tendinous arch of pelvic fascia"
      },
      {
        "objectId": "connective_tissue-ligaments_of_pelvis_ID",
        "name": "Ligaments of pelvis"
      },
      {
        "objectId": "connective_tissue-inguinal_ligament_ID",
        "name": "Inguinal ligament"
      },
      {
        "objectId": "connective_tissue-right_inguinal_ligament_ID",
        "name": "Right inguinal ligament"
      },
      {
        "objectId": "connective_tissue-left_inguinal_ligament_ID",
        "name": "Left inguinal ligament"
      },
      {
        "objectId": "connective_tissue-lacunar_ligament_ID",
        "name": "Lacunar ligament"
      },
      {
        "objectId": "connective_tissue-left_lacunar_ligament_ID",
        "name": "Left lacunar ligament"
      },
      {
        "objectId": "connective_tissue-right_lacunar_ligament_ID",
        "name": "Right lacunar ligament"
      },
      {
        "objectId": "connective_tissue-obturator_membrane_ID",
        "name": "Obturator membrane"
      },
      {
        "objectId": "connective_tissue-left_obturator_membrane_ID",
        "name": "Left obturator membrane"
      },
      {
        "objectId": "connective_tissue-right_obturator_membrane_ID",
        "name": "Right obturator membrane"
      },
      {
        "objectId": "connective_tissue-lumbosacral_ligament_ID",
        "name": "Lumbosacral ligament"
      },
      {
        "objectId": "connective_tissue-left_lumbosacral_ligament_ID",
        "name": "Left lumbosacral ligament"
      },
      {
        "objectId": "connective_tissue-right_lumbosacral_ligament_ID",
        "name": "Right lumbosacral ligament"
      },
      {
        "objectId": "connective_tissue-suspensory_ligament_of_penis_ID",
        "name": "Suspensory ligament of penis"
      },
      {
        "objectId": "connective_tissue-ligaments_of_sacroiliac_joint_ID",
        "name": "Ligaments of sacroiliac joint"
      },
      {
        "objectId": "connective_tissue-iliolumbar_ligament_ID",
        "name": "Iliolumbar ligament"
      },
      {
        "objectId": "connective_tissue-left_iliolumbar_ligament_ID",
        "name": "Left iliolumbar ligament"
      },
      {
        "objectId": "connective_tissue-right_iliolumbar_ligament_ID",
        "name": "Right iliolumbar ligament"
      },
      {
        "objectId": "connective_tissue-anterior_sacroiliac_ligament_ID",
        "name": "Anterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_sacroiliac_ligament_ID",
        "name": "Right anterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_sacroiliac_ligament_ID",
        "name": "Left anterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-posterior_interosseous_sacroiliac_ligament_ID",
        "name": "Posterior interosseous sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-right_posterior_interosseous_sacroiliac_ligament_ID",
        "name": "Right posterior interosseous sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-left_posterior_interosseous_sacroiliac_ligament_ID",
        "name": "Left posterior interosseous sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-interosseous_sacroiliac_ligament_ID",
        "name": "Interosseous sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-right_interosseous_sacroiliac_ligament_ID",
        "name": "Right interosseous sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-left_interosseous_sacroiliac_ligament_ID",
        "name": "Left interosseous sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-short_posterior_sacroiliac_ligament_ID",
        "name": "Short posterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-right_short_posterior_sacroiliac_ligament_ID",
        "name": "Right short posterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-left_short_posterior_sacroiliac_ligament_ID",
        "name": "Left short posterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-long_posterior_sacroiliac_ligament_ID",
        "name": "Long posterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-right_long_posterior_sacroiliac_ligament_ID",
        "name": "Right long posterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-left_long_posterior_sacroiliac_ligament_ID",
        "name": "Left long posterior sacroiliac ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_sacroischial_joint_ID",
        "name": "Ligaments of sacroischial joint"
      },
      {
        "objectId": "connective_tissue-sacrospinous_ligament_ID",
        "name": "Sacrospinous ligament"
      },
      {
        "objectId": "connective_tissue-left_sacrospinous_ligament_ID",
        "name": "Left sacrospinous ligament"
      },
      {
        "objectId": "connective_tissue-right_sacrospinous_ligament_ID",
        "name": "Right sacrospinous ligament"
      },
      {
        "objectId": "connective_tissue-sacrotuberous_ligament_ID",
        "name": "Sacrotuberous ligament"
      },
      {
        "objectId": "connective_tissue-right_sacrotuberous_ligament_ID",
        "name": "Right sacrotuberous ligament"
      },
      {
        "objectId": "connective_tissue-left_sacrotuberous_ligament_ID",
        "name": "Left sacrotuberous ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_sacrococcygeal_joint_ID",
        "name": "Ligaments of sacrococcygeal joint"
      },
      {
        "objectId": "connective_tissue-anterior_sacrococcygeal_ligament_ID",
        "name": "Anterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_sacrococcygeal_ligament_ID",
        "name": "Left anterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_sacrococcygeal_ligament_ID",
        "name": "Right anterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-superficial_posterior_sacrococcygeal_ligament_ID",
        "name": "Superficial posterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-left_superficial_posterior_sacrococcygeal_ligament_ID",
        "name": "Left superficial posterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-right_superficial_posterior_sacrococcygeal_ligament_ID",
        "name": "Right superficial posterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-lateral_sacrococcygeal_ligament_ID",
        "name": "Lateral sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_sacrococcygeal_ligament_ID",
        "name": "Left lateral sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_sacrococcygeal_ligament_ID",
        "name": "Right lateral sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-intercornual_ligament_ID",
        "name": "Intercornual ligament"
      },
      {
        "objectId": "connective_tissue-left_intercornual_ligament_ID",
        "name": "Left intercornual ligament"
      },
      {
        "objectId": "connective_tissue-right_intercornual_ligament_ID",
        "name": "Right intercornual ligament"
      },
      {
        "objectId": "connective_tissue-deep_posterior_sacrococcygeal_ligament_ID",
        "name": "Deep posterior sacrococcygeal ligament"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_ilium_ID",
        "name": "Articular cartilage of ilium"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_ilium_ID",
        "name": "Articular cartilage of left ilium"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_ilium_ID",
        "name": "Articular cartilage of right ilium"
      }
    ]
  },
  "glutes": {
    "id": "glutes",
    "name": "Glutes",
    "zoomId": "muscular_system-muscles_of_lower_limb_ID",
    "keywords": [
      "gluteal",
      "gluteus",
      "gluteus maximus",
      "gluteus medius",
      "gluteus minimus"
    ],
    "selectIds": [
      "muscular_system-right_gluteal_muscles_ID",
      "muscular_system-left_gluteal_muscles_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-right_gluteal_muscles_ID",
        "name": "Right gluteal muscles"
      },
      {
        "objectId": "muscular_system-right_tensor_fasciae_latae_ID",
        "name": "Right tensor fasciae latae"
      },
      {
        "objectId": "muscular_system-right_iliotibial_tract_ID",
        "name": "Right iliotibial tract"
      },
      {
        "objectId": "muscular_system-right_gluteus_maximus_ID",
        "name": "Right gluteus maximus"
      },
      {
        "objectId": "muscular_system-right_gluteus_medius_ID",
        "name": "Right gluteus medius"
      },
      {
        "objectId": "muscular_system-right_gluteus_minimus_ID",
        "name": "Right gluteus minimus"
      },
      {
        "objectId": "muscular_system-left_gluteal_muscles_ID",
        "name": "Left gluteal muscles"
      },
      {
        "objectId": "muscular_system-left_tensor_fasciae_latae_ID",
        "name": "Left tensor fasciae latae"
      },
      {
        "objectId": "muscular_system-left_iliotibial_tract_ID",
        "name": "Left iliotibial tract"
      },
      {
        "objectId": "muscular_system-left_gluteus_maximus_ID",
        "name": "Left gluteus maximus"
      },
      {
        "objectId": "muscular_system-left_gluteus_medius_ID",
        "name": "Left gluteus medius"
      },
      {
        "objectId": "muscular_system-left_gluteus_minimus_ID",
        "name": "Left gluteus minimus"
      }
    ]
  },
  "rightThigh": {
    "id": "right_thigh",
    "name": "Right Thigh",
    "zoomId": "muscular_system-muscles_of_right_thigh_ID",
    "keywords": [
      "right quadriceps",
      "right femur anterior",
      "right adductor",
      "right thigh anterior",
      "right femoral",
      "right vastus"
    ],
    "selectIds": [
      "muscular_system-muscles_of_right_thigh_ID",
      "skeletal_system-right_femur_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_right_thigh_ID",
        "name": "Muscles of right thigh"
      },
      {
        "objectId": "muscular_system-anterior_compartment_muscles_of_right_thigh_ID",
        "name": "Anterior compartment muscles of right thigh"
      },
      {
        "objectId": "muscular_system-right_sartorius_ID",
        "name": "Right sartorius"
      },
      {
        "objectId": "muscular_system-right_articularis_genus_ID",
        "name": "Right articularis genus"
      },
      {
        "objectId": "muscular_system-right_quadriceps_femoris_ID",
        "name": "Right quadriceps femoris"
      },
      {
        "objectId": "muscular_system-right_vastus_medialis_ID",
        "name": "Right vastus medialis"
      },
      {
        "objectId": "muscular_system-right_vastus_lateralis_ID",
        "name": "Right vastus lateralis"
      },
      {
        "objectId": "muscular_system-right_vastus_intermedius_ID",
        "name": "Right vastus intermedius"
      },
      {
        "objectId": "muscular_system-right_quadriceps_femoris_tendon_ID",
        "name": "Right quadriceps femoris tendon"
      },
      {
        "objectId": "muscular_system-right_rectus_femoris_ID",
        "name": "Right rectus femoris"
      },
      {
        "objectId": "muscular_system-posterior_compartment_muscles_of_right_thigh_ID",
        "name": "Posterior compartment muscles of right thigh"
      },
      {
        "objectId": "muscular_system-right_semimembranosus_ID",
        "name": "Right semimembranosus"
      },
      {
        "objectId": "muscular_system-right_semitendinosus_ID",
        "name": "Right semitendinosus"
      },
      {
        "objectId": "muscular_system-right_biceps_femoris_ID",
        "name": "Right biceps femoris"
      },
      {
        "objectId": "muscular_system-medial_compartment_muscles_of_right_thigh_ID",
        "name": "Medial compartment muscles of right thigh"
      },
      {
        "objectId": "muscular_system-right_gracilis_ID",
        "name": "Right gracilis"
      },
      {
        "objectId": "muscular_system-right_adductor_longus_ID",
        "name": "Right adductor longus"
      },
      {
        "objectId": "muscular_system-right_adductor_brevis_ID",
        "name": "Right adductor brevis"
      },
      {
        "objectId": "muscular_system-right_pectineus_ID",
        "name": "Right pectineus"
      },
      {
        "objectId": "muscular_system-right_adductor_magnus_ID",
        "name": "Right adductor magnus"
      },
      {
        "objectId": "muscular_system-right_adductor_minimus_ID",
        "name": "Right adductor minimus"
      },
      {
        "objectId": "skeletal_system-right_femur_ID",
        "name": "Right femur"
      }
    ]
  },
  "leftThigh": {
    "id": "left_thigh",
    "name": "Left Thigh",
    "zoomId": "muscular_system-muscles_of_left_thigh_ID",
    "keywords": [
      "left quadriceps",
      "left femur anterior",
      "left adductor",
      "left thigh anterior",
      "left femoral",
      "left vastus"
    ],
    "selectIds": [
      "muscular_system-muscles_of_left_thigh_ID",
      "skeletal_system-left_femur_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_left_thigh_ID",
        "name": "Muscles of left thigh"
      },
      {
        "objectId": "muscular_system-anterior_compartment_muscles_of_left_thigh_ID",
        "name": "Anterior compartment muscles of left thigh"
      },
      {
        "objectId": "muscular_system-left_sartorius_ID",
        "name": "Left sartorius"
      },
      {
        "objectId": "muscular_system-left_articularis_genus_ID",
        "name": "Left articularis genus"
      },
      {
        "objectId": "muscular_system-left_quadriceps_femoris_ID",
        "name": "Left quadriceps femoris"
      },
      {
        "objectId": "muscular_system-left_vastus_medialis_ID",
        "name": "Left vastus medialis"
      },
      {
        "objectId": "muscular_system-left_vastus_lateralis_ID",
        "name": "Left vastus lateralis"
      },
      {
        "objectId": "muscular_system-left_vastus_intermedius_ID",
        "name": "Left vastus intermedius"
      },
      {
        "objectId": "muscular_system-left_quadriceps_femoris_tendon_ID",
        "name": "Left quadriceps femoris tendon"
      },
      {
        "objectId": "muscular_system-left_rectus_femoris_ID",
        "name": "Left rectus femoris"
      },
      {
        "objectId": "muscular_system-posterior_compartment_muscles_of_left_thigh_ID",
        "name": "Posterior compartment muscles of left thigh"
      },
      {
        "objectId": "muscular_system-left_semimembranosus_ID",
        "name": "Left semimembranosus"
      },
      {
        "objectId": "muscular_system-left_semitendinosus_ID",
        "name": "Left semitendinosus"
      },
      {
        "objectId": "muscular_system-left_biceps_femoris_ID",
        "name": "Left biceps femoris"
      },
      {
        "objectId": "muscular_system-medial_compartment_muscles_of_left_thigh_ID",
        "name": "Medial compartment muscles of left thigh"
      },
      {
        "objectId": "muscular_system-left_gracilis_ID",
        "name": "Left gracilis"
      },
      {
        "objectId": "muscular_system-left_adductor_longus_ID",
        "name": "Left adductor longus"
      },
      {
        "objectId": "muscular_system-left_adductor_brevis_ID",
        "name": "Left adductor brevis"
      },
      {
        "objectId": "muscular_system-left_pectineus_ID",
        "name": "Left pectineus"
      },
      {
        "objectId": "muscular_system-left_adductor_magnus_ID",
        "name": "Left adductor magnus"
      },
      {
        "objectId": "muscular_system-left_adductor_minimus_ID",
        "name": "Left adductor minimus"
      },
      {
        "objectId": "skeletal_system-left_femur_ID",
        "name": "Left femur"
      }
    ]
  },
  "leftKnee": {
    "id": "left_knee",
    "name": "Left Knee",
    "zoomId": "connective_tissue-connective_tissue_of_left_knee_ID",
    "keywords": [
      "left knee",
      "left patella",
      "left meniscus",
      "left cruciate",
      "left tibial",
      "left popliteal",
      "left genicular"
    ],
    "selectIds": [
      "connective_tissue-connective_tissue_of_left_knee_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_left_knee_ID",
      "connective_tissue-left_anterior_ligament_of_head_of_fibula_ID",
      "connective_tissue-left_posterior_ligament_of_head_of_fibula_ID",
      "skeletal_system-left_patella_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "connective_tissue-connective_tissue_of_left_knee_ID",
        "name": "Connective tissue of left knee"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_left_knee_ID",
        "name": "Tendon sheaths and bursae of left knee"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_prepatellar_bursa_ID",
        "name": "Left subcutaneous prepatellar bursa"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_infrapatellar_bursa_ID",
        "name": "Left subcutaneous infrapatellar bursa"
      },
      {
        "objectId": "connective_tissue-left_subtendinous_suprapatellar_bursa_ID",
        "name": "Left subtendinous suprapatellar bursa"
      },
      {
        "objectId": "connective_tissue-left_subtendinous_infrapatellar_bursa_ID",
        "name": "Left subtendinous infrapatellar bursa"
      },
      {
        "objectId": "connective_tissue-left_knee_synovial_membrane_of_joint_capsule_ID",
        "name": "Left knee synovial membrane of joint capsule"
      },
      {
        "objectId": "connective_tissue-left_iliotibial_tract_bursa_ID",
        "name": "Left iliotibial tract bursa"
      },
      {
        "objectId": "connective_tissue-left_fibular_collateral_ligament_bursa_ID",
        "name": "Left fibular collateral ligament bursa"
      },
      {
        "objectId": "connective_tissue-left_biceps_femoris_tendon_bursa_ID",
        "name": "Left biceps femoris tendon bursa"
      },
      {
        "objectId": "connective_tissue-left_anserine_bursa_ID",
        "name": "Left anserine bursa"
      },
      {
        "objectId": "connective_tissue-medial_head_left_gastrocnemius_muscle_bursa_ID",
        "name": "Medial head left gastrocnemius muscle bursa"
      },
      {
        "objectId": "connective_tissue-lateral_head_left_gastrocnemius_muscle_bursa_ID",
        "name": "Lateral head left gastrocnemius muscle bursa"
      },
      {
        "objectId": "connective_tissue-left_semimembranosus_muscle_bursa_ID",
        "name": "Left semimembranosus muscle bursa"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_knee_ID",
        "name": "Ligaments of left knee"
      },
      {
        "objectId": "connective_tissue-fibrous_joint_capsule_of_left_knee_ID",
        "name": "Fibrous joint capsule of left knee"
      },
      {
        "objectId": "connective_tissue-left_anterolateral_ligament_ID",
        "name": "Left anterolateral ligament"
      },
      {
        "objectId": "connective_tissue-left_oblique_popliteal_ligament_ID",
        "name": "Left oblique popliteal ligament"
      },
      {
        "objectId": "connective_tissue-left_arcuate_popliteal_ligament_ID",
        "name": "Left arcuate popliteal ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_meniscofemoral_ligament_ID",
        "name": "Left anterior meniscofemoral ligament"
      },
      {
        "objectId": "connective_tissue-left_posterior_meniscofemoral_ligament_ID",
        "name": "Left posterior meniscofemoral ligament"
      },
      {
        "objectId": "connective_tissue-left_transverse_ligament_of_knee_ID",
        "name": "Left transverse ligament of knee"
      },
      {
        "objectId": "skeletal_system-left_patella_ID",
        "name": "Left patella"
      },
      {
        "objectId": "connective_tissue-left_patellar_ligament_ID",
        "name": "Left patellar ligament"
      },
      {
        "objectId": "connective_tissue-left_medial_collateral_ligament_ID",
        "name": "Left medial collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_collateral_ligament_ID",
        "name": "Left lateral collateral ligament"
      },
      {
        "objectId": "connective_tissue-left_posterior_cruciate_ligament_ID",
        "name": "Left posterior cruciate ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_cruciate_ligament_ID",
        "name": "Left anterior cruciate ligament"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_knee_ID",
        "name": "Cartilage of left knee"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_lateral_condylar_facet_of_left_tibia_ID",
        "name": "Articular cartilage of lateral condylar facet of left tibia"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_femur_ID",
        "name": "Articular cartilage of left femur"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_medial_condylar_facet_of_left_tibia_ID",
        "name": "Articular cartilage of medial condylar facet of left tibia"
      },
      {
        "objectId": "connective_tissue-left_lateral_meniscus_ID",
        "name": "Left lateral meniscus"
      },
      {
        "objectId": "connective_tissue-left_medial_meniscus_ID",
        "name": "Left medial meniscus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_patella_ID",
        "name": "Articular cartilage of left patella"
      },
      {
        "objectId": "connective_tissue-left_anterior_ligament_of_head_of_fibula_ID",
        "name": "Left anterior ligament of head of fibula"
      },
      {
        "objectId": "connective_tissue-left_posterior_ligament_of_head_of_fibula_ID",
        "name": "Left posterior ligament of head of fibula"
      }
    ]
  },
  "rightKnee": {
    "id": "right_knee",
    "name": "Right Knee",
    "zoomId": "connective_tissue-connective_tissue_of_right_knee_ID",
    "keywords": [
      "right knee",
      "right patella",
      "right meniscus",
      "right cruciate",
      "right tibial",
      "right popliteal",
      "right genicular"
    ],
    "selectIds": [
      "connective_tissue-connective_tissue_of_right_knee_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_right_knee_ID",
      "connective_tissue-right_anterior_ligament_of_head_of_fibula_ID",
      "connective_tissue-right_posterior_ligament_of_head_of_fibula_ID",
      "skeletal_system-right_patella_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "connective_tissue-connective_tissue_of_right_knee_ID",
        "name": "Connective tissue of right knee"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_right_knee_ID",
        "name": "Tendon sheaths and bursae of right knee"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_prepatellar_bursa_ID",
        "name": "Right subcutaneous prepatellar bursa"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_infrapatellar_bursa_ID",
        "name": "Right subcutaneous infrapatellar bursa"
      },
      {
        "objectId": "connective_tissue-right_subtendinous_suprapatellar_bursa_ID",
        "name": "Right subtendinous suprapatellar bursa"
      },
      {
        "objectId": "connective_tissue-right_subtendinous_infrapatellar_bursa_ID",
        "name": "Right subtendinous infrapatellar bursa"
      },
      {
        "objectId": "connective_tissue-right_knee_synovial_membrane_of_joint_capsule_ID",
        "name": "Right knee synovial membrane of joint capsule"
      },
      {
        "objectId": "connective_tissue-right_iliotibial_tract_bursa_ID",
        "name": "Right iliotibial tract bursa"
      },
      {
        "objectId": "connective_tissue-right_fibular_collateral_ligament_bursa_ID",
        "name": "Right fibular collateral ligament bursa"
      },
      {
        "objectId": "connective_tissue-right_biceps_femoris_tendon_bursa_ID",
        "name": "Right biceps femoris tendon bursa"
      },
      {
        "objectId": "connective_tissue-right_anserine_bursa_ID",
        "name": "Right anserine bursa"
      },
      {
        "objectId": "connective_tissue-medial_head_right_gastrocnemius_muscle_bursa_ID",
        "name": "Medial head right gastrocnemius muscle bursa"
      },
      {
        "objectId": "connective_tissue-lateral_head_right_gastrocnemius_muscle_bursa_ID",
        "name": "Lateral head right gastrocnemius muscle bursa"
      },
      {
        "objectId": "connective_tissue-right_semimembranosus_muscle_bursa_ID",
        "name": "Right semimembranosus muscle bursa"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_knee_ID",
        "name": "Ligaments of right knee"
      },
      {
        "objectId": "connective_tissue-fibrous_joint_capsule_of_right_knee_ID",
        "name": "Fibrous joint capsule of right knee"
      },
      {
        "objectId": "connective_tissue-right_anterolateral_ligament_ID",
        "name": "Right anterolateral ligament"
      },
      {
        "objectId": "connective_tissue-right_oblique_popliteal_ligament_ID",
        "name": "Right oblique popliteal ligament"
      },
      {
        "objectId": "connective_tissue-right_arcuate_popliteal_ligament_ID",
        "name": "Right arcuate popliteal ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_meniscofemoral_ligament_ID",
        "name": "Right anterior meniscofemoral ligament"
      },
      {
        "objectId": "connective_tissue-right_posterior_meniscofemoral_ligament_ID",
        "name": "Right posterior meniscofemoral ligament"
      },
      {
        "objectId": "connective_tissue-right_transverse_ligament_of_knee_ID",
        "name": "Right transverse ligament of knee"
      },
      {
        "objectId": "connective_tissue-right_patellar_ligament_ID",
        "name": "Right patellar ligament"
      },
      {
        "objectId": "skeletal_system-right_patella_ID",
        "name": "Right patella"
      },
      {
        "objectId": "connective_tissue-right_medial_collateral_ligament_ID",
        "name": "Right medial collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_collateral_ligament_ID",
        "name": "Right lateral collateral ligament"
      },
      {
        "objectId": "connective_tissue-right_posterior_cruciate_ligament_ID",
        "name": "Right posterior cruciate ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_cruciate_ligament_ID",
        "name": "Right anterior cruciate ligament"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_knee_ID",
        "name": "Cartilage of right knee"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_lateral_condylar_facet_of_right_tibia_ID",
        "name": "Articular cartilage of lateral condylar facet of right tibia"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_femur_ID",
        "name": "Articular cartilage of right femur"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_medial_condylar_facet_of_right_tibia_ID",
        "name": "Articular cartilage of medial condylar facet of right tibia"
      },
      {
        "objectId": "connective_tissue-right_lateral_meniscus_ID",
        "name": "Right lateral meniscus"
      },
      {
        "objectId": "connective_tissue-right_medial_meniscus_ID",
        "name": "Right medial meniscus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_patella_ID",
        "name": "Articular cartilage of right patella"
      },
      {
        "objectId": "connective_tissue-right_anterior_ligament_of_head_of_fibula_ID",
        "name": "Right anterior ligament of head of fibula"
      },
      {
        "objectId": "connective_tissue-right_posterior_ligament_of_head_of_fibula_ID",
        "name": "Right posterior ligament of head of fibula"
      }
    ]
  },
  "leftLowerLeg": {
    "id": "left_lower_leg",
    "name": "Left Lower Leg",
    "zoomId": "muscular_system-muscles_of_left_lower_leg_ID",
    "keywords": [
      "left lower leg",
      "left calf",
      "left shin",
      "left tibia",
      "left fibula",
      "left gastrocnemius",
      "left soleus",
      "left tibialis"
    ],
    "selectIds": [
      "muscular_system-muscles_of_left_lower_leg_ID",
      "skeletal_system-left_tibia_ID",
      "skeletal_system-left_fibula_ID",
      "connective_tissue-left_interosseous_membrane_of_leg_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_left_lower_leg_ID",
        "name": "Muscles of left lower leg"
      },
      {
        "objectId": "muscular_system-anterior_compartment_muscles_of_left_lower_leg_ID",
        "name": "Anterior compartment muscles of left lower leg"
      },
      {
        "objectId": "muscular_system-left_tibialis_anterior_ID",
        "name": "Left tibialis anterior"
      },
      {
        "objectId": "muscular_system-left_extensor_hallucis_longus_ID",
        "name": "Left extensor hallucis longus"
      },
      {
        "objectId": "muscular_system-left_extensor_digitorum_longus_ID",
        "name": "Left extensor digitorum longus"
      },
      {
        "objectId": "muscular_system-left_fibularis_tertius_ID",
        "name": "Left fibularis tertius"
      },
      {
        "objectId": "muscular_system-posterior_compartment_muscles_of_left_lower_leg_ID",
        "name": "Posterior compartment muscles of left lower leg"
      },
      {
        "objectId": "muscular_system-left_gastrocnemius_ID",
        "name": "Left gastrocnemius"
      },
      {
        "objectId": "muscular_system-lateral_head_of_left_gastrocnemius_ID",
        "name": "Lateral head of left gastrocnemius"
      },
      {
        "objectId": "muscular_system-medial_head_of_left_gastrocnemius_ID",
        "name": "Medial head of left gastrocnemius"
      },
      {
        "objectId": "muscular_system-left_plantaris_ID",
        "name": "Left plantaris"
      },
      {
        "objectId": "muscular_system-left_soleus_ID",
        "name": "Left soleus"
      },
      {
        "objectId": "muscular_system-left_calcaneal_tendon_ID",
        "name": "Left calcaneal tendon"
      },
      {
        "objectId": "muscular_system-left_popliteus_ID",
        "name": "Left popliteus"
      },
      {
        "objectId": "muscular_system-left_tibialis_posterior_ID",
        "name": "Left tibialis posterior"
      },
      {
        "objectId": "muscular_system-left_flexor_hallucis_longus_ID",
        "name": "Left flexor hallucis longus"
      },
      {
        "objectId": "muscular_system-left_flexor_digitorum_longus_ID",
        "name": "Left flexor digitorum longus"
      },
      {
        "objectId": "muscular_system-lateral_compartment_muscles_of_left_lower_leg_ID",
        "name": "Lateral compartment muscles of left lower leg"
      },
      {
        "objectId": "muscular_system-left_fibularis_longus_ID",
        "name": "Left fibularis longus"
      },
      {
        "objectId": "muscular_system-left_fibularis_brevis_ID",
        "name": "Left fibularis brevis"
      },
      {
        "objectId": "skeletal_system-left_tibia_ID",
        "name": "Left tibia"
      },
      {
        "objectId": "skeletal_system-left_fibula_ID",
        "name": "Left fibula"
      },
      {
        "objectId": "connective_tissue-left_interosseous_membrane_of_leg_ID",
        "name": "Left interosseous membrane of leg"
      }
    ]
  },
  "rightLowerLeg": {
    "id": "right_lower_leg",
    "name": "Right Lower Leg",
    "zoomId": "muscular_system-muscles_of_right_lower_leg_ID",
    "keywords": [
      "right lower leg",
      "right calf",
      "right shin",
      "right tibia",
      "right fibula",
      "right gastrocnemius",
      "right soleus",
      "right tibialis"
    ],
    "selectIds": [
      "muscular_system-muscles_of_right_lower_leg_ID",
      "skeletal_system-right_tibia_ID",
      "skeletal_system-right_fibula_ID",
      "connective_tissue-right_interosseous_membrane_of_leg_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_right_lower_leg_ID",
        "name": "Muscles of right lower leg"
      },
      {
        "objectId": "muscular_system-anterior_compartment_muscles_of_right_lower_leg_ID",
        "name": "Anterior compartment muscles of right lower leg"
      },
      {
        "objectId": "muscular_system-right_tibialis_anterior_ID",
        "name": "Right tibialis anterior"
      },
      {
        "objectId": "muscular_system-right_extensor_hallucis_longus_ID",
        "name": "Right extensor hallucis longus"
      },
      {
        "objectId": "muscular_system-right_extensor_digitorum_longus_ID",
        "name": "Right extensor digitorum longus"
      },
      {
        "objectId": "muscular_system-right_fibularis_tertius_ID",
        "name": "Right fibularis tertius"
      },
      {
        "objectId": "muscular_system-posterior_compartment_muscles_of_right_lower_leg_ID",
        "name": "Posterior compartment muscles of right lower leg"
      },
      {
        "objectId": "muscular_system-right_gastrocnemius_ID",
        "name": "Right gastrocnemius"
      },
      {
        "objectId": "muscular_system-lateral_head_of_right_gastrocnemius_ID",
        "name": "Lateral head of right gastrocnemius"
      },
      {
        "objectId": "muscular_system-medial_head_of_right_gastrocnemius_ID",
        "name": "Medial head of right gastrocnemius"
      },
      {
        "objectId": "muscular_system-right_plantaris_ID",
        "name": "Right plantaris"
      },
      {
        "objectId": "muscular_system-right_soleus_ID",
        "name": "Right soleus"
      },
      {
        "objectId": "muscular_system-right_calcaneal_tendon_ID",
        "name": "Right calcaneal tendon"
      },
      {
        "objectId": "muscular_system-right_popliteus_ID",
        "name": "Right popliteus"
      },
      {
        "objectId": "muscular_system-right_tibialis_posterior_ID",
        "name": "Right tibialis posterior"
      },
      {
        "objectId": "muscular_system-right_flexor_hallucis_longus_ID",
        "name": "Right flexor hallucis longus"
      },
      {
        "objectId": "muscular_system-right_flexor_digitorum_longus_ID",
        "name": "Right flexor digitorum longus"
      },
      {
        "objectId": "muscular_system-lateral_compartment_muscles_of_right_lower_leg_ID",
        "name": "Lateral compartment muscles of right lower leg"
      },
      {
        "objectId": "muscular_system-right_fibularis_longus_ID",
        "name": "Right fibularis longus"
      },
      {
        "objectId": "muscular_system-right_fibularis_brevis_ID",
        "name": "Right fibularis brevis"
      },
      {
        "objectId": "skeletal_system-right_tibia_ID",
        "name": "Right tibia"
      },
      {
        "objectId": "skeletal_system-right_fibula_ID",
        "name": "Right fibula"
      },
      {
        "objectId": "connective_tissue-right_interosseous_membrane_of_leg_ID",
        "name": "Right interosseous membrane of leg"
      }
    ]
  },
  "leftFoot": {
    "id": "left_foot",
    "name": "Left Foot",
    "zoomId": "muscular_system-muscles_of_left_foot_ID",
    "keywords": [
      "left foot",
      "left ankle",
      "left tarsus",
      "left metatarsus",
      "left toe",
      "left plantar",
      "left calcaneus",
      "left talus"
    ],
    "selectIds": [
      "muscular_system-muscles_of_left_foot_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_left_foot_ID",
      "connective_tissue-connective_tissue_of_left_ankle_and_foot_ID",
      "skeletal_system-bones_of_left_ankle_and_foot_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_left_foot_ID",
        "name": "Muscles of left foot"
      },
      {
        "objectId": "muscular_system-plantar_muscles_of_left_foot_ID",
        "name": "Plantar muscles of left foot"
      },
      {
        "objectId": "muscular_system-superficial_plantar_muscles_of_left_foot_ID",
        "name": "Superficial plantar muscles of left foot"
      },
      {
        "objectId": "muscular_system-left_abductor_hallucis_ID",
        "name": "Left abductor hallucis"
      },
      {
        "objectId": "muscular_system-left_flexor_digitorum_brevis_ID",
        "name": "Left flexor digitorum brevis"
      },
      {
        "objectId": "muscular_system-abductor_digiti_minimi_of_left_foot_ID",
        "name": "Abductor digiti minimi of left foot"
      },
      {
        "objectId": "muscular_system-middle_plantar_muscles_of_left_foot_ID",
        "name": "Middle plantar muscles of left foot"
      },
      {
        "objectId": "muscular_system-lumbrical_muscles_of_left_foot_ID",
        "name": "Lumbrical muscles of left foot"
      },
      {
        "objectId": "muscular_system-first_lumbrical_muscle_of_left_foot_ID",
        "name": "First lumbrical muscle of left foot"
      },
      {
        "objectId": "muscular_system-second_lumbrical_muscle_of_left_foot_ID",
        "name": "Second lumbrical muscle of left foot"
      },
      {
        "objectId": "muscular_system-third_lumbrical_muscle_of_left_foot_ID",
        "name": "Third lumbrical muscle of left foot"
      },
      {
        "objectId": "muscular_system-fourth_lumbrical_muscle_of_left_foot_ID",
        "name": "Fourth lumbrical muscle of left foot"
      },
      {
        "objectId": "muscular_system-left_quadratus_plantae_ID",
        "name": "Left quadratus plantae"
      },
      {
        "objectId": "muscular_system-deep_plantar_muscles_of_left_foot_ID",
        "name": "Deep plantar muscles of left foot"
      },
      {
        "objectId": "muscular_system-left_flexor_hallucis_brevis_ID",
        "name": "Left flexor hallucis brevis"
      },
      {
        "objectId": "muscular_system-medial_head_of_left_flexor_hallucis_brevis_ID",
        "name": "Medial head of left flexor hallucis brevis"
      },
      {
        "objectId": "muscular_system-lateral_head_of_left_flexor_hallucis_brevis_ID",
        "name": "Lateral head of left flexor hallucis brevis"
      },
      {
        "objectId": "muscular_system-left_adductor_hallucis_ID",
        "name": "Left adductor hallucis"
      },
      {
        "objectId": "muscular_system-left_adductor_hallucis_oblique_head_ID",
        "name": "Left adductor hallucis oblique head"
      },
      {
        "objectId": "muscular_system-left_adductor_hallucis_transverse_head_ID",
        "name": "Left adductor hallucis transverse head"
      },
      {
        "objectId": "muscular_system-plantar_interosseous_muscles_of_left_foot_ID",
        "name": "Plantar interosseous muscles of left foot"
      },
      {
        "objectId": "muscular_system-first_plantar_interosseous_muscle_of_left_foot_ID",
        "name": "First plantar interosseous muscle of left foot"
      },
      {
        "objectId": "muscular_system-second_plantar_interosseous_muscle_of_left_foot_ID",
        "name": "Second plantar interosseous muscle of left foot"
      },
      {
        "objectId": "muscular_system-third_plantar_interosseous_muscle_of_left_foot_ID",
        "name": "Third plantar interosseous muscle of left foot"
      },
      {
        "objectId": "muscular_system-left_flexor_digiti_minimi_brevis_of_foot_ID",
        "name": "Left flexor digiti minimi brevis of foot"
      },
      {
        "objectId": "muscular_system-dorsal_muscles_of_left_foot_ID",
        "name": "Dorsal muscles of left foot"
      },
      {
        "objectId": "muscular_system-superficial_dorsal_muscles_of_left_foot_ID",
        "name": "Superficial dorsal muscles of left foot"
      },
      {
        "objectId": "muscular_system-left_extensor_hallucis_brevis_ID",
        "name": "Left extensor hallucis brevis"
      },
      {
        "objectId": "muscular_system-left_extensor_digitorum_brevis_ID",
        "name": "Left extensor digitorum brevis"
      },
      {
        "objectId": "muscular_system-dorsal_interosseous_muscles_of_left_foot_ID",
        "name": "Dorsal interosseous muscles of left foot"
      },
      {
        "objectId": "muscular_system-first_dorsal_interosseus_muscle_of_left_foot_ID",
        "name": "First dorsal interosseus muscle of left foot"
      },
      {
        "objectId": "muscular_system-second_dorsal_interosseus_muscle_of_left_foot_ID",
        "name": "Second dorsal interosseus muscle of left foot"
      },
      {
        "objectId": "muscular_system-third_dorsal_interosseus_muscle_of_left_foot_ID",
        "name": "Third dorsal interosseus muscle of left foot"
      },
      {
        "objectId": "muscular_system-fourth_dorsal_interosseus_muscle_of_left_foot_ID",
        "name": "Fourth dorsal interosseus muscle of left foot"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_left_foot_ID",
        "name": "Tendon sheaths and bursae of left foot"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_calcaneal_bursa_ID",
        "name": "Left subcutaneous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-left_subtendinous_calcaneal_bursa_ID",
        "name": "Left subtendinous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_medial_malleolar_bursa_ID",
        "name": "Left subcutaneous medial malleolar bursa"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_lateral_malleolar_bursa_ID",
        "name": "Left subcutaneous lateral malleolar bursa"
      },
      {
        "objectId": "connective_tissue-left_extensor_hallucis_longus_tendon_sheath_ID",
        "name": "Left extensor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_flexor_hallucis_longus_tendon_sheath_ID",
        "name": "Left flexor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_flexor_digitorum_longus_tendon_sheath_ID",
        "name": "Left flexor digitorum longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_common_sheath_of_extensor_digitorum_longus_and_fibularis_tertius_ID",
        "name": "Left common sheath of extensor digitorum longus and fibularis tertius"
      },
      {
        "objectId": "connective_tissue-left_common_sheath_of_fibularis_longus_and_brevis_ID",
        "name": "Left common sheath of fibularis longus and brevis"
      },
      {
        "objectId": "connective_tissue-left_tibialis_anterior_tendon_sheath_ID",
        "name": "Left tibialis anterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_tibialis_posterior_tendon_sheath_ID",
        "name": "Left tibialis posterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_foot_ID",
        "name": "Ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_anterior_tibiofibular_ligament_ID",
        "name": "Left anterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_superior_extensor_retinaculum_of_foot_ID",
        "name": "Left superior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-left_inferior_extensor_retinaculum_of_foot_ID",
        "name": "Left inferior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-left_posterior_tibiofibular_ligament_ID",
        "name": "Left posterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_flexor_retinaculum_of_ankle_ID",
        "name": "Left flexor retinaculum of ankle"
      },
      {
        "objectId": "connective_tissue-intertarsal_ligaments_of_left_foot_ID",
        "name": "Intertarsal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-talocalcaneal_ligaments_of_left_foot_ID",
        "name": "Talocalcaneal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_posterior_talocalcaneal_ligament_ID",
        "name": "Left posterior talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-left_medial_talocalcaneal_ligament_ID",
        "name": "Left medial talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_talocalcaneal_ligament_ID",
        "name": "Left lateral talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-left_interosseous_talocalcaneal_ligament_ID",
        "name": "Left interosseous talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-talocalcaneonavicular_ligaments_of_left_foot_ID",
        "name": "Talocalcaneonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_dorsal_talonavicular_ligament_ID",
        "name": "Left dorsal talonavicular ligament"
      },
      {
        "objectId": "connective_tissue-calcaneocuboid_ligaments_of_left_foot_ID",
        "name": "Calcaneocuboid ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_calcaneocuboid_part_of_bifurcated_ligament_ID",
        "name": "Left calcaneocuboid part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-left_plantar_calcaneocuboid_ligament_ID",
        "name": "Left plantar calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_calcaneocuboid_ligament_ID",
        "name": "Left dorsal calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-left_long_plantar_ligament_ID",
        "name": "Left long plantar ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_left_foot_ID",
        "name": "Calcaneonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_calcaneonavicular_part_of_bifurcated_ligament_ID",
        "name": "Left calcaneonavicular part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_left_foot|left_plantar_calcaneonavicular_ligament_ID",
        "name": "Left plantar calcaneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-cuneonavicular_ligaments_of_left_foot_ID",
        "name": "Cuneonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_cuneonavicular_ligaments_ID",
        "name": "Left plantar cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-left_plantar_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Left plantar ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-left_plantar_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Left plantar ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-left_plantar_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Left plantar ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-left_medial_cuneonavicular_ligament_ID",
        "name": "Left medial cuneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_cuneonavicular_ligaments_ID",
        "name": "Left dorsal cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Left dorsal ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Left dorsal ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Left dorsal ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-cuboideonavicular_ligaments_of_left_foot_ID",
        "name": "Cuboideonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_cuboideonavicular_ligament_ID",
        "name": "Left plantar cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_cuboideonavicular_ligament_ID",
        "name": "Left dorsal cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-intercuneiform_ligaments_of_left_foot_ID",
        "name": "Intercuneiform ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_intercuneiform_ligament_ID",
        "name": "Left plantar intercuneiform ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_intercuneiform_ligaments_ID",
        "name": "Left dorsal intercuneiform ligaments"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_medial_cuneiform_and_intermediate_cuneiform_ID",
        "name": "Left dorsal ligament of medial cuneiform and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_intermediate_cuneiform_and_lateral_cuneiform_ID",
        "name": "Left dorsal ligament of intermediate cuneiform and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-left_plantar_cuneocuboid_ligament_ID",
        "name": "Left plantar cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_cuneocuboid_ligament_ID",
        "name": "Left dorsal cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_foot_ID",
        "name": "Tarsometatarsal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_cuneometatarsal_interosseous_ligaments_ID",
        "name": "Left cuneometatarsal interosseous ligaments"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_big_toe_ID",
        "name": "Tarsometatarsal ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_big_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_big_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_second_toe_ID",
        "name": "Tarsometatarsal ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_second_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_second_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_third_toe_ID",
        "name": "Tarsometatarsal ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_third_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_third_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_fourth_toe_ID",
        "name": "Tarsometatarsal ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_fourth_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_fourth_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_fifth_toe_ID",
        "name": "Tarsometatarsal ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_fifth_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_fifth_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-intermetatarsal_ligaments_of_left_foot_ID",
        "name": "Intermetatarsal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_intermetatarsal_ligaments_ID",
        "name": "Left plantar intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_first_and_second_left_metatarsal_bones_ID",
        "name": "Plantar ligament of first and second left metatarsal bones"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_second_and_third_left_metatarsals_ID",
        "name": "Plantar ligament of second and third left metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_third_and_fourth_left_metatarsals_ID",
        "name": "Plantar ligament of third and fourth left metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_fourth_and_fifth_left_metatarsals_ID",
        "name": "Plantar ligament of fourth and fifth left metatarsals"
      },
      {
        "objectId": "connective_tissue-left_interosseous_intermetatarsal_ligaments_ID",
        "name": "Left interosseous intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_first_and_second_left_metatarsals_ID",
        "name": "Interosseous ligament of first and second left metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_second_and_third_left_metatarsals_ID",
        "name": "Interosseous ligament of second and third left metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_third_and_fourth_left_metatarsals_ID",
        "name": "Interosseous ligament of third and fourth left metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_fourth_and_fifth_left_metatarsals_ID",
        "name": "Interosseous ligament of fourth and fifth left metatarsals"
      },
      {
        "objectId": "connective_tissue-left_dorsal_intermetatarsal_ligaments_ID",
        "name": "Left dorsal intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_first_and_second_left_metatarsals_ID",
        "name": "Dorsal ligament of first and second left metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_second_and_third_left_metatarsals_ID",
        "name": "Dorsal ligament of second and third left metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_third_and_fourth_left_metatarsals_ID",
        "name": "Dorsal ligament of third and fourth left metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_fourth_and_fifth_left_metatarsals_ID",
        "name": "Dorsal ligament of fourth and fifth left metatarsals"
      },
      {
        "objectId": "connective_tissue-left_superficial_transverse_metatarsal_ligament_ID",
        "name": "Left superficial transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-left_deep_transverse_metatarsal_ligament_ID",
        "name": "Left deep transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-left_plantar_aponeurosis_ligament_ID",
        "name": "Left plantar aponeurosis ligament"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_foot_ID",
        "name": "Metatarsophalangeal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_big_toe_ID",
        "name": "Metatarsophalangeal ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_big_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_big_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_big_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_big_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_second_toe_ID",
        "name": "Metatarsophalangeal ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_second_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_second_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_second_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_second_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_third_toe_ID",
        "name": "Metatarsophalangeal ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_third_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_third_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_third_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_third_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_foot_ID",
        "name": "Interphalangeal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_big_toe_ID",
        "name": "Interphalangeal ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsule_of_left_big_toe_ID",
        "name": "Interphalangeal joint capsule of left big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_big_toe_ID",
        "name": "Interphalangeal collateral ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_big_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_second_toe_ID",
        "name": "Interphalangeal ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_second_toe_ID",
        "name": "Interphalangeal joint capsules of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_second_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_second_toe_ID",
        "name": "Interphalangeal distal joint capsule of left second toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_second_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_second_toe_ID",
        "name": "Interphalangeal collateral ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_second_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_second_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_third_toe_ID",
        "name": "Interphalangeal ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_third_toe_ID",
        "name": "Interphalangeal joint capsules of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_third_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_third_toe_ID",
        "name": "Interphalangeal distal joint capsule of left third toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_third_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_third_toe_ID",
        "name": "Interphalangeal collateral ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_third_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_third_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_fourth_toe_ID",
        "name": "Interphalangeal ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_fourth_toe_ID",
        "name": "Interphalangeal joint capsules of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_fourth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_fourth_toe_ID",
        "name": "Interphalangeal distal joint capsule of left fourth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_fourth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_fourth_toe_ID",
        "name": "Interphalangeal collateral ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_fourth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_fourth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_fifth_toe_ID",
        "name": "Interphalangeal ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_fifth_toe_ID",
        "name": "Interphalangeal joint capsules of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_fifth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_fifth_toe_ID",
        "name": "Interphalangeal distal joint capsule of left fifth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_fifth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_fifth_toe_ID",
        "name": "Interphalangeal collateral ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_fifth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_fifth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_foot_ID",
        "name": "Cartilage of left foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_intertarsal_joints_ID",
        "name": "Cartilage of left intertarsal joints"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_navicular_facet_of_left_talus_ID",
        "name": "Articular cartilage of navicular facet of left talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_articular_facet_of_left_calcaneus_for_cuboid_ID",
        "name": "Articular cartilage of articular facet of left calcaneus for cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_anterior_talar_articular_facet_of_left_calcaneus_ID",
        "name": "Articular cartilage of anterior talar articular facet of left calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_cuboid_ID",
        "name": "Articular cartilage of left cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_first_metatarsal_ID",
        "name": "Articular cartilage of left first metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_second_metatarsal_ID",
        "name": "Articular cartilage of left second metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_third_metatarsal_ID",
        "name": "Articular cartilage of left third metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_fourth_metatarsal_ID",
        "name": "Articular cartilage of left fourth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_fifth_metatarsal_ID",
        "name": "Articular cartilage of left fifth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_lateral_cuneiform_ID",
        "name": "Articular cartilage of left lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_intermediate_cuneiform_ID",
        "name": "Articular cartilage of left intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_medial_cuneiform_ID",
        "name": "Articular cartilage of left medial cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_navicular_ID",
        "name": "Articular cartilage of left navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_talar_facet_of_left_navicular_ID",
        "name": "Articular cartilage of talar facet of left navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_posterior_talar_articular_facet_of_left_calcaneus_ID",
        "name": "Articular cartilage of posterior talar articular facet of left calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_talus_ID",
        "name": "Articular cartilage of left talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_middle_talar_articular_facet_of_left_calcaneus_ID",
        "name": "Articular cartilage of middle talar articular facet of left calcaneus"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_metatarsophalangeal_joints_ID",
        "name": "Cartilage of left metatarsophalangeal joints"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_big_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_first_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left first metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_big_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_second_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_second_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left second metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_third_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_third_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left third metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_fourth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fourth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left fourth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_fifth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fifth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left fifth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_foot_ID",
        "name": "Cartilage of interphalangeal joints of left foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joint_of_left_big_toe_ID",
        "name": "Cartilage of interphalangeal joint of left big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_big_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_big_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_second_toe_ID",
        "name": "Cartilage of interphalangeal joints of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_third_toe_ID",
        "name": "Cartilage of interphalangeal joints of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_fourth_toe_ID",
        "name": "Cartilage of interphalangeal joints of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_little_toe_ID",
        "name": "Cartilage of interphalangeal joints of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left little toe"
      },
      {
        "objectId": "skeletal_system-sesamoid_bones_of_left_foot_ID",
        "name": "Sesamoid bones of left foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_foot_ID",
        "name": "Phalanges of left foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_big_toe_ID",
        "name": "Phalanges of left big toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_big_toe_ID",
        "name": "Proximal phalanx of left big toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_big_toe_ID",
        "name": "Distal phalanx of left big toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_toe_ID",
        "name": "Phalanges of left toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_second_toe_ID",
        "name": "Proximal phalanx of left second toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_second_toe_ID",
        "name": "Middle phalanx of left second toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_second_toe_ID",
        "name": "Distal phalanx of left second toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_third_toe_ID",
        "name": "Phalanges of left third toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_third_toe_ID",
        "name": "Proximal phalanx of left third toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_third_toe_ID",
        "name": "Middle phalanx of left third toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_third_toe_ID",
        "name": "Distal phalanx of left third toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_fourth_toe_ID",
        "name": "Phalanges of left fourth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_fourth_toe_ID",
        "name": "Proximal phalanx of left fourth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_fourth_toe_ID",
        "name": "Middle phalanx of left fourth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_fourth_toe_ID",
        "name": "Distal phalanx of left fourth toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_fifth_toe_ID",
        "name": "Phalanges of left fifth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_fifth_toe_ID",
        "name": "Proximal phalanx of left fifth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_fifth_toe_ID",
        "name": "Middle phalanx of left fifth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_fifth_toe_ID",
        "name": "Distal phalanx of left fifth toe"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_left_ankle_and_foot_ID",
        "name": "Connective tissue of left ankle and foot"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_left_foot_ID",
        "name": "Tendon sheaths and bursae of left foot"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_calcaneal_bursa_ID",
        "name": "Left subcutaneous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-left_subtendinous_calcaneal_bursa_ID",
        "name": "Left subtendinous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_medial_malleolar_bursa_ID",
        "name": "Left subcutaneous medial malleolar bursa"
      },
      {
        "objectId": "connective_tissue-left_subcutaneous_lateral_malleolar_bursa_ID",
        "name": "Left subcutaneous lateral malleolar bursa"
      },
      {
        "objectId": "connective_tissue-left_extensor_hallucis_longus_tendon_sheath_ID",
        "name": "Left extensor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_flexor_hallucis_longus_tendon_sheath_ID",
        "name": "Left flexor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_flexor_digitorum_longus_tendon_sheath_ID",
        "name": "Left flexor digitorum longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_common_sheath_of_extensor_digitorum_longus_and_fibularis_tertius_ID",
        "name": "Left common sheath of extensor digitorum longus and fibularis tertius"
      },
      {
        "objectId": "connective_tissue-left_common_sheath_of_fibularis_longus_and_brevis_ID",
        "name": "Left common sheath of fibularis longus and brevis"
      },
      {
        "objectId": "connective_tissue-left_tibialis_anterior_tendon_sheath_ID",
        "name": "Left tibialis anterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-left_tibialis_posterior_tendon_sheath_ID",
        "name": "Left tibialis posterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_ankle_ID",
        "name": "Ligaments of left ankle"
      },
      {
        "objectId": "connective_tissue-left_deltoid_ligament_ID",
        "name": "Left deltoid ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_ankle|left_plantar_calcaneonavicular_ligament_ID",
        "name": "Left plantar calcaneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_calcaneofibular_ligament_ID",
        "name": "Left calcaneofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_anterior_talofibular_ligament_ID",
        "name": "Left anterior talofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_posterior_talofibular_ligament_ID",
        "name": "Left posterior talofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_superior_fibular_retinaculum_ID",
        "name": "Left superior fibular retinaculum"
      },
      {
        "objectId": "connective_tissue-left_inferior_fibular_retinaculum_ID",
        "name": "Left inferior fibular retinaculum"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_ankle_ID",
        "name": "Cartilage of left ankle"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_surface_of_left_tibia_ID",
        "name": "Articular cartilage of inferior articular surface of left tibia"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_medial_malleolus_ID",
        "name": "Articular cartilage of left medial malleolus"
      },
      {
        "objectId": "connective_tissue-ligaments_of_left_foot_ID",
        "name": "Ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_anterior_tibiofibular_ligament_ID",
        "name": "Left anterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_superior_extensor_retinaculum_of_foot_ID",
        "name": "Left superior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-left_inferior_extensor_retinaculum_of_foot_ID",
        "name": "Left inferior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-left_posterior_tibiofibular_ligament_ID",
        "name": "Left posterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-left_flexor_retinaculum_of_ankle_ID",
        "name": "Left flexor retinaculum of ankle"
      },
      {
        "objectId": "connective_tissue-intertarsal_ligaments_of_left_foot_ID",
        "name": "Intertarsal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-talocalcaneal_ligaments_of_left_foot_ID",
        "name": "Talocalcaneal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_posterior_talocalcaneal_ligament_ID",
        "name": "Left posterior talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-left_medial_talocalcaneal_ligament_ID",
        "name": "Left medial talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-left_lateral_talocalcaneal_ligament_ID",
        "name": "Left lateral talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-left_interosseous_talocalcaneal_ligament_ID",
        "name": "Left interosseous talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-talocalcaneonavicular_ligaments_of_left_foot_ID",
        "name": "Talocalcaneonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_dorsal_talonavicular_ligament_ID",
        "name": "Left dorsal talonavicular ligament"
      },
      {
        "objectId": "connective_tissue-calcaneocuboid_ligaments_of_left_foot_ID",
        "name": "Calcaneocuboid ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_calcaneocuboid_part_of_bifurcated_ligament_ID",
        "name": "Left calcaneocuboid part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-left_plantar_calcaneocuboid_ligament_ID",
        "name": "Left plantar calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_calcaneocuboid_ligament_ID",
        "name": "Left dorsal calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-left_long_plantar_ligament_ID",
        "name": "Left long plantar ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_left_foot_ID",
        "name": "Calcaneonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_calcaneonavicular_part_of_bifurcated_ligament_ID",
        "name": "Left calcaneonavicular part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_left_foot|left_plantar_calcaneonavicular_ligament_ID",
        "name": "Left plantar calcaneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-cuneonavicular_ligaments_of_left_foot_ID",
        "name": "Cuneonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_cuneonavicular_ligaments_ID",
        "name": "Left plantar cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-left_plantar_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Left plantar ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-left_plantar_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Left plantar ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-left_plantar_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Left plantar ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-left_medial_cuneonavicular_ligament_ID",
        "name": "Left medial cuneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_cuneonavicular_ligaments_ID",
        "name": "Left dorsal cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Left dorsal ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Left dorsal ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Left dorsal ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-cuboideonavicular_ligaments_of_left_foot_ID",
        "name": "Cuboideonavicular ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_cuboideonavicular_ligament_ID",
        "name": "Left plantar cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_cuboideonavicular_ligament_ID",
        "name": "Left dorsal cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-intercuneiform_ligaments_of_left_foot_ID",
        "name": "Intercuneiform ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_intercuneiform_ligament_ID",
        "name": "Left plantar intercuneiform ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_intercuneiform_ligaments_ID",
        "name": "Left dorsal intercuneiform ligaments"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_medial_cuneiform_and_intermediate_cuneiform_ID",
        "name": "Left dorsal ligament of medial cuneiform and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-left_dorsal_ligament_of_intermediate_cuneiform_and_lateral_cuneiform_ID",
        "name": "Left dorsal ligament of intermediate cuneiform and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-left_plantar_cuneocuboid_ligament_ID",
        "name": "Left plantar cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-left_dorsal_cuneocuboid_ligament_ID",
        "name": "Left dorsal cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_foot_ID",
        "name": "Tarsometatarsal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_cuneometatarsal_interosseous_ligaments_ID",
        "name": "Left cuneometatarsal interosseous ligaments"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_big_toe_ID",
        "name": "Tarsometatarsal ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_big_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_big_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_second_toe_ID",
        "name": "Tarsometatarsal ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_second_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_second_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_third_toe_ID",
        "name": "Tarsometatarsal ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_third_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_third_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_fourth_toe_ID",
        "name": "Tarsometatarsal ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_fourth_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_fourth_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_left_fifth_toe_ID",
        "name": "Tarsometatarsal ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-left_plantar_tarsometatarsal_ligament_of_left_fifth_toe_ID",
        "name": "Left plantar tarsometatarsal ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-left_dorsal_tarsometatarsal_ligament_of_left_fifth_toe_ID",
        "name": "Left dorsal tarsometatarsal ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-intermetatarsal_ligaments_of_left_foot_ID",
        "name": "Intermetatarsal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-left_plantar_intermetatarsal_ligaments_ID",
        "name": "Left plantar intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_first_and_second_left_metatarsal_bones_ID",
        "name": "Plantar ligament of first and second left metatarsal bones"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_second_and_third_left_metatarsals_ID",
        "name": "Plantar ligament of second and third left metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_third_and_fourth_left_metatarsals_ID",
        "name": "Plantar ligament of third and fourth left metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_fourth_and_fifth_left_metatarsals_ID",
        "name": "Plantar ligament of fourth and fifth left metatarsals"
      },
      {
        "objectId": "connective_tissue-left_interosseous_intermetatarsal_ligaments_ID",
        "name": "Left interosseous intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_first_and_second_left_metatarsals_ID",
        "name": "Interosseous ligament of first and second left metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_second_and_third_left_metatarsals_ID",
        "name": "Interosseous ligament of second and third left metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_third_and_fourth_left_metatarsals_ID",
        "name": "Interosseous ligament of third and fourth left metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_fourth_and_fifth_left_metatarsals_ID",
        "name": "Interosseous ligament of fourth and fifth left metatarsals"
      },
      {
        "objectId": "connective_tissue-left_dorsal_intermetatarsal_ligaments_ID",
        "name": "Left dorsal intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_first_and_second_left_metatarsals_ID",
        "name": "Dorsal ligament of first and second left metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_second_and_third_left_metatarsals_ID",
        "name": "Dorsal ligament of second and third left metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_third_and_fourth_left_metatarsals_ID",
        "name": "Dorsal ligament of third and fourth left metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_fourth_and_fifth_left_metatarsals_ID",
        "name": "Dorsal ligament of fourth and fifth left metatarsals"
      },
      {
        "objectId": "connective_tissue-left_superficial_transverse_metatarsal_ligament_ID",
        "name": "Left superficial transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-left_deep_transverse_metatarsal_ligament_ID",
        "name": "Left deep transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-left_plantar_aponeurosis_ligament_ID",
        "name": "Left plantar aponeurosis ligament"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_foot_ID",
        "name": "Metatarsophalangeal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_big_toe_ID",
        "name": "Metatarsophalangeal ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_big_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_big_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_big_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_big_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_second_toe_ID",
        "name": "Metatarsophalangeal ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_second_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_second_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_second_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_second_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_third_toe_ID",
        "name": "Metatarsophalangeal ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_third_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_third_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_third_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_third_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_fourth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_left_fifth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_foot_ID",
        "name": "Interphalangeal ligaments of left foot"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_big_toe_ID",
        "name": "Interphalangeal ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsule_of_left_big_toe_ID",
        "name": "Interphalangeal joint capsule of left big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_big_toe_ID",
        "name": "Interphalangeal collateral ligaments of left big toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_big_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_second_toe_ID",
        "name": "Interphalangeal ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_second_toe_ID",
        "name": "Interphalangeal joint capsules of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_second_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_second_toe_ID",
        "name": "Interphalangeal distal joint capsule of left second toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_second_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_second_toe_ID",
        "name": "Interphalangeal collateral ligaments of left second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_second_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_second_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_third_toe_ID",
        "name": "Interphalangeal ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_third_toe_ID",
        "name": "Interphalangeal joint capsules of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_third_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_third_toe_ID",
        "name": "Interphalangeal distal joint capsule of left third toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_third_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_third_toe_ID",
        "name": "Interphalangeal collateral ligaments of left third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_third_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_third_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_fourth_toe_ID",
        "name": "Interphalangeal ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_fourth_toe_ID",
        "name": "Interphalangeal joint capsules of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_fourth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_fourth_toe_ID",
        "name": "Interphalangeal distal joint capsule of left fourth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_fourth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_fourth_toe_ID",
        "name": "Interphalangeal collateral ligaments of left fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_fourth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_fourth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_left_fifth_toe_ID",
        "name": "Interphalangeal ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_left_fifth_toe_ID",
        "name": "Interphalangeal joint capsules of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_left_fifth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_left_fifth_toe_ID",
        "name": "Interphalangeal distal joint capsule of left fifth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_left_fifth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_left_fifth_toe_ID",
        "name": "Interphalangeal collateral ligaments of left fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_left_fifth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_left_fifth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_foot_ID",
        "name": "Cartilage of left foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_intertarsal_joints_ID",
        "name": "Cartilage of left intertarsal joints"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_navicular_facet_of_left_talus_ID",
        "name": "Articular cartilage of navicular facet of left talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_articular_facet_of_left_calcaneus_for_cuboid_ID",
        "name": "Articular cartilage of articular facet of left calcaneus for cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_anterior_talar_articular_facet_of_left_calcaneus_ID",
        "name": "Articular cartilage of anterior talar articular facet of left calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_cuboid_ID",
        "name": "Articular cartilage of left cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_first_metatarsal_ID",
        "name": "Articular cartilage of left first metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_second_metatarsal_ID",
        "name": "Articular cartilage of left second metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_third_metatarsal_ID",
        "name": "Articular cartilage of left third metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_fourth_metatarsal_ID",
        "name": "Articular cartilage of left fourth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_fifth_metatarsal_ID",
        "name": "Articular cartilage of left fifth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_lateral_cuneiform_ID",
        "name": "Articular cartilage of left lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_intermediate_cuneiform_ID",
        "name": "Articular cartilage of left intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_medial_cuneiform_ID",
        "name": "Articular cartilage of left medial cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_navicular_ID",
        "name": "Articular cartilage of left navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_talar_facet_of_left_navicular_ID",
        "name": "Articular cartilage of talar facet of left navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_posterior_talar_articular_facet_of_left_calcaneus_ID",
        "name": "Articular cartilage of posterior talar articular facet of left calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_left_talus_ID",
        "name": "Articular cartilage of left talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_middle_talar_articular_facet_of_left_calcaneus_ID",
        "name": "Articular cartilage of middle talar articular facet of left calcaneus"
      },
      {
        "objectId": "connective_tissue-cartilage_of_left_metatarsophalangeal_joints_ID",
        "name": "Cartilage of left metatarsophalangeal joints"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_big_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_first_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left first metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_big_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_second_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_second_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left second metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_third_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_third_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left third metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_fourth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fourth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left fourth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_left_fifth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of left fifth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_left_fifth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of left fifth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_foot_ID",
        "name": "Cartilage of interphalangeal joints of left foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joint_of_left_big_toe_ID",
        "name": "Cartilage of interphalangeal joint of left big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_big_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_big_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_second_toe_ID",
        "name": "Cartilage of interphalangeal joints of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_second_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_third_toe_ID",
        "name": "Cartilage of interphalangeal joints of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_third_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_fourth_toe_ID",
        "name": "Cartilage of interphalangeal joints of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_fourth_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_left_little_toe_ID",
        "name": "Cartilage of interphalangeal joints of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of left little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_left_little_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of left little toe"
      },
      {
        "objectId": "skeletal_system-bones_of_left_ankle_and_foot_ID",
        "name": "Bones of left ankle and foot"
      },
      {
        "objectId": "skeletal_system-tarsal_bones_of_left_ankle_and_foot_ID",
        "name": "Tarsal bones of left ankle and foot"
      },
      {
        "objectId": "skeletal_system-left_calcaneus_ID",
        "name": "Left calcaneus"
      },
      {
        "objectId": "skeletal_system-left_talus_ID",
        "name": "Left talus"
      },
      {
        "objectId": "skeletal_system-left_cuboid_ID",
        "name": "Left cuboid"
      },
      {
        "objectId": "skeletal_system-left_navicular_ID",
        "name": "Left navicular"
      },
      {
        "objectId": "skeletal_system-left_medial_cuneiform_ID",
        "name": "Left medial cuneiform"
      },
      {
        "objectId": "skeletal_system-left_intermediate_cuneiform_ID",
        "name": "Left intermediate cuneiform"
      },
      {
        "objectId": "skeletal_system-left_lateral_cuneiform_ID",
        "name": "Left lateral cuneiform"
      },
      {
        "objectId": "skeletal_system-metatarsal_bones_of_left_ankle_and_foot_ID",
        "name": "Metatarsal bones of left ankle and foot"
      },
      {
        "objectId": "skeletal_system-left_first_metatarsal_ID",
        "name": "Left first metatarsal"
      },
      {
        "objectId": "skeletal_system-left_second_metatarsal_ID",
        "name": "Left second metatarsal"
      },
      {
        "objectId": "skeletal_system-left_third_metatarsal_ID",
        "name": "Left third metatarsal"
      },
      {
        "objectId": "skeletal_system-left_fourth_metatarsal_ID",
        "name": "Left fourth metatarsal"
      },
      {
        "objectId": "skeletal_system-left_fifth_metatarsal_ID",
        "name": "Left fifth metatarsal"
      },
      {
        "objectId": "skeletal_system-sesamoid_bones_of_left_foot_ID",
        "name": "Sesamoid bones of left foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_foot_ID",
        "name": "Phalanges of left foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_big_toe_ID",
        "name": "Phalanges of left big toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_big_toe_ID",
        "name": "Proximal phalanx of left big toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_big_toe_ID",
        "name": "Distal phalanx of left big toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_toe_ID",
        "name": "Phalanges of left toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_second_toe_ID",
        "name": "Proximal phalanx of left second toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_second_toe_ID",
        "name": "Middle phalanx of left second toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_second_toe_ID",
        "name": "Distal phalanx of left second toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_third_toe_ID",
        "name": "Phalanges of left third toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_third_toe_ID",
        "name": "Proximal phalanx of left third toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_third_toe_ID",
        "name": "Middle phalanx of left third toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_third_toe_ID",
        "name": "Distal phalanx of left third toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_fourth_toe_ID",
        "name": "Phalanges of left fourth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_fourth_toe_ID",
        "name": "Proximal phalanx of left fourth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_fourth_toe_ID",
        "name": "Middle phalanx of left fourth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_fourth_toe_ID",
        "name": "Distal phalanx of left fourth toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_left_fifth_toe_ID",
        "name": "Phalanges of left fifth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_left_fifth_toe_ID",
        "name": "Proximal phalanx of left fifth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_left_fifth_toe_ID",
        "name": "Middle phalanx of left fifth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_left_fifth_toe_ID",
        "name": "Distal phalanx of left fifth toe"
      }
    ]
  },
  "rightFoot": {
    "id": "right_foot",
    "name": "Right Foot",
    "zoomId": "muscular_system-muscles_of_right_foot_ID",
    "keywords": [
      "right foot",
      "right ankle",
      "right tarsus",
      "right metatarsus",
      "right toe",
      "right plantar",
      "right calcaneus",
      "right talus"
    ],
    "selectIds": [
      "muscular_system-muscles_of_right_foot_ID",
      "connective_tissue-tendon_sheaths_and_bursae_of_right_foot_ID",
      "connective_tissue-connective_tissue_of_right_ankle_and_foot_ID",
      "skeletal_system-bones_of_right_ankle_and_foot_ID"
    ],
    "deselectIds": [],
    "parts": [
      {
        "objectId": "muscular_system-muscles_of_right_foot_ID",
        "name": "Muscles of right foot"
      },
      {
        "objectId": "muscular_system-plantar_muscles_of_right_foot_ID",
        "name": "Plantar muscles of right foot"
      },
      {
        "objectId": "muscular_system-superficial_plantar_muscles_of_right_foot_ID",
        "name": "Superficial plantar muscles of right foot"
      },
      {
        "objectId": "muscular_system-right_abductor_hallucis_ID",
        "name": "Right abductor hallucis"
      },
      {
        "objectId": "muscular_system-right_flexor_digitorum_brevis_ID",
        "name": "Right flexor digitorum brevis"
      },
      {
        "objectId": "muscular_system-abductor_digiti_minimi_of_right_foot_ID",
        "name": "Abductor digiti minimi of right foot"
      },
      {
        "objectId": "muscular_system-middle_plantar_muscles_of_right_foot_ID",
        "name": "Middle plantar muscles of right foot"
      },
      {
        "objectId": "muscular_system-lumbrical_muscles_of_right_foot_ID",
        "name": "Lumbrical muscles of right foot"
      },
      {
        "objectId": "muscular_system-first_lumbrical_muscle_of_right_foot_ID",
        "name": "First lumbrical muscle of right foot"
      },
      {
        "objectId": "muscular_system-second_lumbrical_muscle_of_right_foot_ID",
        "name": "Second lumbrical muscle of right foot"
      },
      {
        "objectId": "muscular_system-third_lumbrical_muscle_of_right_foot_ID",
        "name": "Third lumbrical muscle of right foot"
      },
      {
        "objectId": "muscular_system-fourth_lumbrical_muscle_of_right_foot_ID",
        "name": "Fourth lumbrical muscle of right foot"
      },
      {
        "objectId": "muscular_system-right_quadratus_plantae_ID",
        "name": "Right quadratus plantae"
      },
      {
        "objectId": "muscular_system-deep_plantar_muscles_of_right_foot_ID",
        "name": "Deep plantar muscles of right foot"
      },
      {
        "objectId": "muscular_system-right_flexor_hallucis_brevis_ID",
        "name": "Right flexor hallucis brevis"
      },
      {
        "objectId": "muscular_system-medial_head_of_right_flexor_hallucis_brevis_ID",
        "name": "Medial head of right flexor hallucis brevis"
      },
      {
        "objectId": "muscular_system-lateral_head_of_right_flexor_hallucis_brevis_ID",
        "name": "Lateral head of right flexor hallucis brevis"
      },
      {
        "objectId": "muscular_system-right_adductor_hallucis_ID",
        "name": "Right adductor hallucis"
      },
      {
        "objectId": "muscular_system-right_adductor_hallucis_oblique_head_ID",
        "name": "Right adductor hallucis oblique head"
      },
      {
        "objectId": "muscular_system-right_adductor_hallucis_transverse_head_ID",
        "name": "Right adductor hallucis transverse head"
      },
      {
        "objectId": "muscular_system-plantar_interosseous_muscles_of_right_foot_ID",
        "name": "Plantar interosseous muscles of right foot"
      },
      {
        "objectId": "muscular_system-first_plantar_interosseous_muscle_of_right_foot_ID",
        "name": "First plantar interosseous muscle of right foot"
      },
      {
        "objectId": "muscular_system-second_plantar_interosseous_muscle_of_right_foot_ID",
        "name": "Second plantar interosseous muscle of right foot"
      },
      {
        "objectId": "muscular_system-third_plantar_interosseous_muscle_of_right_foot_ID",
        "name": "Third plantar interosseous muscle of right foot"
      },
      {
        "objectId": "muscular_system-right_flexor_digiti_minimi_brevis_of_foot_ID",
        "name": "Right flexor digiti minimi brevis of foot"
      },
      {
        "objectId": "muscular_system-dorsal_muscles_of_right_foot_ID",
        "name": "Dorsal muscles of right foot"
      },
      {
        "objectId": "muscular_system-superficial_dorsal_muscles_of_right_foot_ID",
        "name": "Superficial dorsal muscles of right foot"
      },
      {
        "objectId": "muscular_system-right_extensor_hallucis_brevis_ID",
        "name": "Right extensor hallucis brevis"
      },
      {
        "objectId": "muscular_system-right_extensor_digitorum_brevis_ID",
        "name": "Right extensor digitorum brevis"
      },
      {
        "objectId": "muscular_system-dorsal_interosseous_muscles_of_right_foot_ID",
        "name": "Dorsal interosseous muscles of right foot"
      },
      {
        "objectId": "muscular_system-first_dorsal_interosseus_muscle_of_right_foot_ID",
        "name": "First dorsal interosseus muscle of right foot"
      },
      {
        "objectId": "muscular_system-second_dorsal_interosseus_muscle_of_right_foot_ID",
        "name": "Second dorsal interosseus muscle of right foot"
      },
      {
        "objectId": "muscular_system-third_dorsal_interosseus_muscle_of_right_foot_ID",
        "name": "Third dorsal interosseus muscle of right foot"
      },
      {
        "objectId": "muscular_system-fourth_dorsal_interosseus_muscle_of_right_foot_ID",
        "name": "Fourth dorsal interosseus muscle of right foot"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_right_foot_ID",
        "name": "Tendon sheaths and bursae of right foot"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_calcaneal_bursa_ID",
        "name": "Right subcutaneous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-right_subtendinous_calcaneal_bursa_ID",
        "name": "Right subtendinous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_medial_malleolar_bursa_ID",
        "name": "Right subcutaneous medial malleolar bursa"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_lateral_malleolar_bursa_ID",
        "name": "Right subcutaneous lateral malleolar bursa"
      },
      {
        "objectId": "connective_tissue-right_extensor_hallucis_longus_tendon_sheath_ID",
        "name": "Right extensor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_flexor_hallucis_longus_tendon_sheath_ID",
        "name": "Right flexor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_flexor_digitorum_longus_tendon_sheath_ID",
        "name": "Right flexor digitorum longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_common_sheath_of_extensor_digitorum_longus_and_fibularis_tertius_ID",
        "name": "Right common sheath of extensor digitorum longus and fibularis tertius"
      },
      {
        "objectId": "connective_tissue-right_common_sheath_of_fibularis_longus_and_brevis_ID",
        "name": "Right common sheath of fibularis longus and brevis"
      },
      {
        "objectId": "connective_tissue-right_tibialis_anterior_tendon_sheath_ID",
        "name": "Right tibialis anterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_tibialis_posterior_tendon_sheath_ID",
        "name": "Right tibialis posterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_foot_ID",
        "name": "Ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_anterior_tibiofibular_ligament_ID",
        "name": "Right anterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_superior_extensor_retinaculum_of_foot_ID",
        "name": "Right superior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-right_inferior_extensor_retinaculum_of_foot_ID",
        "name": "Right inferior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-right_posterior_tibiofibular_ligament_ID",
        "name": "Right posterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_flexor_retinaculum_of_ankle_ID",
        "name": "Right flexor retinaculum of ankle"
      },
      {
        "objectId": "connective_tissue-intertarsal_ligaments_of_right_foot_ID",
        "name": "Intertarsal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-talocalcaneal_ligaments_of_right_foot_ID",
        "name": "Talocalcaneal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_posterior_talocalcaneal_ligament_ID",
        "name": "Right posterior talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-right_medial_talocalcaneal_ligament_ID",
        "name": "Right medial talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_talocalcaneal_ligament_ID",
        "name": "Right lateral talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-right_interosseous_talocalcaneal_ligament_ID",
        "name": "Right interosseous talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-talocalcaneonavicular_ligaments_of_right_foot_ID",
        "name": "Talocalcaneonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_dorsal_talonavicular_ligament_ID",
        "name": "Right dorsal talonavicular ligament"
      },
      {
        "objectId": "connective_tissue-calcaneocuboid_ligaments_of_right_foot_ID",
        "name": "Calcaneocuboid ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_calcaneocuboid_part_of_bifurcated_ligament_ID",
        "name": "Right calcaneocuboid part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-right_plantar_calcaneocuboid_ligament_ID",
        "name": "Right plantar calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_calcaneocuboid_ligament_ID",
        "name": "Right dorsal calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-right_long_plantar_ligament_ID",
        "name": "Right long plantar ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_right_foot_ID",
        "name": "Calcaneonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_calcaneonavicular_part_of_bifurcated_ligament_ID",
        "name": "Right calcaneonavicular part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_right_foot|right_plantar_calcaneonavicular_ligament_ID",
        "name": "Right plantar calcaneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-cuneonavicular_ligaments_of_right_foot_ID",
        "name": "Cuneonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_cuneonavicular_ligaments_ID",
        "name": "Right plantar cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-right_plantar_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Right plantar ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-right_plantar_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Right plantar ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-right_plantar_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Right plantar ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-right_medial_cuneonavicular_ligament_ID",
        "name": "Right medial cuneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_cuneonavicular_ligaments_ID",
        "name": "Right dorsal cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Right dorsal ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Right dorsal ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Right dorsal ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-cuboideonavicular_ligaments_of_right_foot_ID",
        "name": "Cuboideonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_cuboideonavicular_ligament_ID",
        "name": "Right plantar cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_cuboideonavicular_ligament_ID",
        "name": "Right dorsal cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-intercuneiform_ligaments_of_right_foot_ID",
        "name": "Intercuneiform ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_intercuneiform_ligament_ID",
        "name": "Right plantar intercuneiform ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_intercuneiform_ligaments_ID",
        "name": "Right dorsal intercuneiform ligaments"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_medial_cuneiform_and_intermediate_cuneiform_ID",
        "name": "Right dorsal ligament of medial cuneiform and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_intermediate_cuneiform_and_lateral_cuneiform_ID",
        "name": "Right dorsal ligament of intermediate cuneiform and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-right_plantar_cuneocuboid_ligament_ID",
        "name": "Right plantar cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_cuneocuboid_ligament_ID",
        "name": "Right dorsal cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_foot_ID",
        "name": "Tarsometatarsal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_cuneometatarsal_interosseous_ligaments_ID",
        "name": "Right cuneometatarsal interosseous ligaments"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_big_toe_ID",
        "name": "Tarsometatarsal ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_big_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_big_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_second_toe_ID",
        "name": "Tarsometatarsal ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_second_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_second_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_third_toe_ID",
        "name": "Tarsometatarsal ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_third_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_third_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_fourth_toe_ID",
        "name": "Tarsometatarsal ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_fourth_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_fourth_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_fifth_toe_ID",
        "name": "Tarsometatarsal ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_fifth_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_fifth_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-intermetatarsal_ligaments_of_right_foot_ID",
        "name": "Intermetatarsal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_intermetatarsal_ligaments_ID",
        "name": "Right plantar intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_first_and_second_right_metatarsal_bones_ID",
        "name": "Plantar ligament of first and second right metatarsal bones"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_second_and_third_right_metatarsals_ID",
        "name": "Plantar ligament of second and third right metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_third_and_fourth_right_metatarsals_ID",
        "name": "Plantar ligament of third and fourth right metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_fourth_and_fifth_right_metatarsals_ID",
        "name": "Plantar ligament of fourth and fifth right metatarsals"
      },
      {
        "objectId": "connective_tissue-right_interosseous_intermetatarsal_ligaments_ID",
        "name": "Right interosseous intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_first_and_second_right_metatarsals_ID",
        "name": "Interosseous ligament of first and second right metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_second_and_third_right_metatarsals_ID",
        "name": "Interosseous ligament of second and third right metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_third_and_fourth_right_metatarsals_ID",
        "name": "Interosseous ligament of third and fourth right metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_fourth_and_fifth_right_metatarsals_ID",
        "name": "Interosseous ligament of fourth and fifth right metatarsals"
      },
      {
        "objectId": "connective_tissue-right_dorsal_intermetatarsal_ligaments_ID",
        "name": "Right dorsal intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_first_and_second_right_metatarsals_ID",
        "name": "Dorsal ligament of first and second right metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_second_and_third_right_metatarsals_ID",
        "name": "Dorsal ligament of second and third right metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_third_and_fourth_right_metatarsals_ID",
        "name": "Dorsal ligament of third and fourth right metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_fourth_and_fifth_right_metatarsals_ID",
        "name": "Dorsal ligament of fourth and fifth right metatarsals"
      },
      {
        "objectId": "connective_tissue-right_superficial_transverse_metatarsal_ligament_ID",
        "name": "Right superficial transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-right_deep_transverse_metatarsal_ligament_ID",
        "name": "Right deep transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-right_plantar_aponeurosis_ligament_ID",
        "name": "Right plantar aponeurosis ligament"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_foot_ID",
        "name": "Metatarsophalangeal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_big_toe_ID",
        "name": "Metatarsophalangeal ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_big_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_big_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_big_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_big_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_second_toe_ID",
        "name": "Metatarsophalangeal ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_second_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_second_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_second_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_second_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_third_toe_ID",
        "name": "Metatarsophalangeal ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_third_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_third_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_third_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_third_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_foot_ID",
        "name": "Interphalangeal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_big_toe_ID",
        "name": "Interphalangeal ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsule_of_right_big_toe_ID",
        "name": "Interphalangeal joint capsule of right big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_big_toe_ID",
        "name": "Interphalangeal collateral ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_big_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_second_toe_ID",
        "name": "Interphalangeal ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_second_toe_ID",
        "name": "Interphalangeal joint capsules of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_second_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_second_toe_ID",
        "name": "Interphalangeal distal joint capsule of right second toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_second_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_second_toe_ID",
        "name": "Interphalangeal collateral ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_second_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_second_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_third_toe_ID",
        "name": "Interphalangeal ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_third_toe_ID",
        "name": "Interphalangeal joint capsules of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_third_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_third_toe_ID",
        "name": "Interphalangeal distal joint capsule of right third toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_third_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_third_toe_ID",
        "name": "Interphalangeal collateral ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_third_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_third_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_fourth_toe_ID",
        "name": "Interphalangeal ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_fourth_toe_ID",
        "name": "Interphalangeal joint capsules of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_fourth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_fourth_toe_ID",
        "name": "Interphalangeal distal joint capsule of right fourth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_fourth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_fourth_toe_ID",
        "name": "Interphalangeal collateral ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_fourth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_fourth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_fifth_toe_ID",
        "name": "Interphalangeal ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_fifth_toe_ID",
        "name": "Interphalangeal joint capsules of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_fifth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_fifth_toe_ID",
        "name": "Interphalangeal distal joint capsule of right fifth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_fifth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_fifth_toe_ID",
        "name": "Interphalangeal collateral ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_fifth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_fifth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_foot_ID",
        "name": "Cartilage of right foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_intertarsal_joints_ID",
        "name": "Cartilage of right intertarsal joints"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_navicular_facet_of_right_talus_ID",
        "name": "Articular cartilage of navicular facet of right talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_articular_facet_of_right_calcaneus_for_cuboid_ID",
        "name": "Articular cartilage of articular facet of right calcaneus for cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_anterior_talar_articular_facet_of_right_calcaneus_ID",
        "name": "Articular cartilage of anterior talar articular facet of right calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_cuboid_ID",
        "name": "Articular cartilage of right cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_first_metatarsal_ID",
        "name": "Articular cartilage of right first metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_second_metatarsal_ID",
        "name": "Articular cartilage of right second metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_third_metatarsal_ID",
        "name": "Articular cartilage of right third metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_fourth_metatarsal_ID",
        "name": "Articular cartilage of right fourth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_fifth_metatarsal_ID",
        "name": "Articular cartilage of right fifth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_lateral_cuneiform_ID",
        "name": "Articular cartilage of right lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_intermediate_cuneiform_ID",
        "name": "Articular cartilage of right intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_medial_cuneiform_ID",
        "name": "Articular cartilage of right medial cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_navicular_ID",
        "name": "Articular cartilage of right navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_talar_facet_of_right_navicular_ID",
        "name": "Articular cartilage of talar facet of right navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_posterior_talar_articular_facet_of_right_calcaneus_ID",
        "name": "Articular cartilage of posterior talar articular facet of right calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_talus_ID",
        "name": "Articular cartilage of right talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_middle_talar_articular_facet_of_right_calcaneus_ID",
        "name": "Articular cartilage of middle talar articular facet of right calcaneus"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_metatarsophalangeal_joints_ID",
        "name": "Cartilage of right metatarsophalangeal joints"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_big_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_first_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right first metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_big_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_second_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_second_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right second metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_third_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_third_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right third metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_fourth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fourth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right fourth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_fifth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fifth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right fifth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_foot_ID",
        "name": "Cartilage of interphalangeal joints of right foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joint_of_right_big_toe_ID",
        "name": "Cartilage of interphalangeal joint of right big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_big_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_big_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_second_toe_ID",
        "name": "Cartilage of interphalangeal joints of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_third_toe_ID",
        "name": "Cartilage of interphalangeal joints of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_fourth_toe_ID",
        "name": "Cartilage of interphalangeal joints of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_little_toe_ID",
        "name": "Cartilage of interphalangeal joints of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right little toe"
      },
      {
        "objectId": "skeletal_system-sesamoid_bones_of_right_foot_ID",
        "name": "Sesamoid bones of right foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_foot_ID",
        "name": "Phalanges of right foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_big_toe_ID",
        "name": "Phalanges of right big toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_big_toe_ID",
        "name": "Proximal phalanx of right big toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_big_toe_ID",
        "name": "Distal phalanx of right big toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_second_toe_ID",
        "name": "Proximal phalanx of right second toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_second_toe_ID",
        "name": "Middle phalanx of right second toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_second_toe_ID",
        "name": "Distal phalanx of right second toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_third_toe_ID",
        "name": "Phalanges of right third toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_third_toe_ID",
        "name": "Proximal phalanx of right third toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_third_toe_ID",
        "name": "Middle phalanx of right third toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_third_toe_ID",
        "name": "Distal phalanx of right third toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_fourth_toe_ID",
        "name": "Phalanges of right fourth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_fourth_toe_ID",
        "name": "Proximal phalanx of right fourth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_fourth_toe_ID",
        "name": "Middle phalanx of right fourth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_fourth_toe_ID",
        "name": "Distal phalanx of right fourth toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_fifth_toe_ID",
        "name": "Phalanges of right fifth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_fifth_toe_ID",
        "name": "Proximal phalanx of right fifth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_fifth_toe_ID",
        "name": "Middle phalanx of right fifth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_fifth_toe_ID",
        "name": "Distal phalanx of right fifth toe"
      },
      {
        "objectId": "connective_tissue-connective_tissue_of_right_ankle_and_foot_ID",
        "name": "Connective tissue of right ankle and foot"
      },
      {
        "objectId": "connective_tissue-tendon_sheaths_and_bursae_of_right_foot_ID",
        "name": "Tendon sheaths and bursae of right foot"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_calcaneal_bursa_ID",
        "name": "Right subcutaneous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-right_subtendinous_calcaneal_bursa_ID",
        "name": "Right subtendinous calcaneal bursa"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_medial_malleolar_bursa_ID",
        "name": "Right subcutaneous medial malleolar bursa"
      },
      {
        "objectId": "connective_tissue-right_subcutaneous_lateral_malleolar_bursa_ID",
        "name": "Right subcutaneous lateral malleolar bursa"
      },
      {
        "objectId": "connective_tissue-right_extensor_hallucis_longus_tendon_sheath_ID",
        "name": "Right extensor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_flexor_hallucis_longus_tendon_sheath_ID",
        "name": "Right flexor hallucis longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_flexor_digitorum_longus_tendon_sheath_ID",
        "name": "Right flexor digitorum longus tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_common_sheath_of_extensor_digitorum_longus_and_fibularis_tertius_ID",
        "name": "Right common sheath of extensor digitorum longus and fibularis tertius"
      },
      {
        "objectId": "connective_tissue-right_common_sheath_of_fibularis_longus_and_brevis_ID",
        "name": "Right common sheath of fibularis longus and brevis"
      },
      {
        "objectId": "connective_tissue-right_tibialis_anterior_tendon_sheath_ID",
        "name": "Right tibialis anterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-right_tibialis_posterior_tendon_sheath_ID",
        "name": "Right tibialis posterior tendon sheath"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_ankle_ID",
        "name": "Ligaments of right ankle"
      },
      {
        "objectId": "connective_tissue-right_deltoid_ligament_ID",
        "name": "Right deltoid ligament"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_ankle|right_plantar_calcaneonavicular_ligament_ID",
        "name": "Right plantar calcaneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_calcaneofibular_ligament_ID",
        "name": "Right calcaneofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_anterior_talofibular_ligament_ID",
        "name": "Right anterior talofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_posterior_talofibular_ligament_ID",
        "name": "Right posterior talofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_superior_fibular_retinaculum_ID",
        "name": "Right superior fibular retinaculum"
      },
      {
        "objectId": "connective_tissue-right_inferior_fibular_retinaculum_ID",
        "name": "Right inferior fibular retinaculum"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_ankle_ID",
        "name": "Cartilage of right ankle"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_inferior_articular_surface_of_right_tibia_ID",
        "name": "Articular cartilage of inferior articular surface of right tibia"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_medial_malleolus_ID",
        "name": "Articular cartilage of right medial malleolus"
      },
      {
        "objectId": "connective_tissue-ligaments_of_right_foot_ID",
        "name": "Ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_anterior_tibiofibular_ligament_ID",
        "name": "Right anterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_superior_extensor_retinaculum_of_foot_ID",
        "name": "Right superior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-right_inferior_extensor_retinaculum_of_foot_ID",
        "name": "Right inferior extensor retinaculum of foot"
      },
      {
        "objectId": "connective_tissue-right_posterior_tibiofibular_ligament_ID",
        "name": "Right posterior tibiofibular ligament"
      },
      {
        "objectId": "connective_tissue-right_flexor_retinaculum_of_ankle_ID",
        "name": "Right flexor retinaculum of ankle"
      },
      {
        "objectId": "connective_tissue-intertarsal_ligaments_of_right_foot_ID",
        "name": "Intertarsal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-talocalcaneal_ligaments_of_right_foot_ID",
        "name": "Talocalcaneal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_posterior_talocalcaneal_ligament_ID",
        "name": "Right posterior talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-right_medial_talocalcaneal_ligament_ID",
        "name": "Right medial talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-right_lateral_talocalcaneal_ligament_ID",
        "name": "Right lateral talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-right_interosseous_talocalcaneal_ligament_ID",
        "name": "Right interosseous talocalcaneal ligament"
      },
      {
        "objectId": "connective_tissue-talocalcaneonavicular_ligaments_of_right_foot_ID",
        "name": "Talocalcaneonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_dorsal_talonavicular_ligament_ID",
        "name": "Right dorsal talonavicular ligament"
      },
      {
        "objectId": "connective_tissue-calcaneocuboid_ligaments_of_right_foot_ID",
        "name": "Calcaneocuboid ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_calcaneocuboid_part_of_bifurcated_ligament_ID",
        "name": "Right calcaneocuboid part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-right_plantar_calcaneocuboid_ligament_ID",
        "name": "Right plantar calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_calcaneocuboid_ligament_ID",
        "name": "Right dorsal calcaneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-right_long_plantar_ligament_ID",
        "name": "Right long plantar ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_right_foot_ID",
        "name": "Calcaneonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_calcaneonavicular_part_of_bifurcated_ligament_ID",
        "name": "Right calcaneonavicular part of bifurcated ligament"
      },
      {
        "objectId": "connective_tissue-calcaneonavicular_ligaments_of_right_foot|right_plantar_calcaneonavicular_ligament_ID",
        "name": "Right plantar calcaneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-cuneonavicular_ligaments_of_right_foot_ID",
        "name": "Cuneonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_cuneonavicular_ligaments_ID",
        "name": "Right plantar cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-right_plantar_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Right plantar ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-right_plantar_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Right plantar ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-right_plantar_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Right plantar ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-right_medial_cuneonavicular_ligament_ID",
        "name": "Right medial cuneonavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_cuneonavicular_ligaments_ID",
        "name": "Right dorsal cuneonavicular ligaments"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_navicular_and_medial_cuneiform_ID",
        "name": "Right dorsal ligament of navicular and medial cuneiform"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_navicular_and_intermediate_cuneiform_ID",
        "name": "Right dorsal ligament of navicular and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_navicular_and_lateral_cuneiform_ID",
        "name": "Right dorsal ligament of navicular and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-cuboideonavicular_ligaments_of_right_foot_ID",
        "name": "Cuboideonavicular ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_cuboideonavicular_ligament_ID",
        "name": "Right plantar cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_cuboideonavicular_ligament_ID",
        "name": "Right dorsal cuboideonavicular ligament"
      },
      {
        "objectId": "connective_tissue-intercuneiform_ligaments_of_right_foot_ID",
        "name": "Intercuneiform ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_intercuneiform_ligament_ID",
        "name": "Right plantar intercuneiform ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_intercuneiform_ligaments_ID",
        "name": "Right dorsal intercuneiform ligaments"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_medial_cuneiform_and_intermediate_cuneiform_ID",
        "name": "Right dorsal ligament of medial cuneiform and intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-right_dorsal_ligament_of_intermediate_cuneiform_and_lateral_cuneiform_ID",
        "name": "Right dorsal ligament of intermediate cuneiform and lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-right_plantar_cuneocuboid_ligament_ID",
        "name": "Right plantar cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-right_dorsal_cuneocuboid_ligament_ID",
        "name": "Right dorsal cuneocuboid ligament"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_foot_ID",
        "name": "Tarsometatarsal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_cuneometatarsal_interosseous_ligaments_ID",
        "name": "Right cuneometatarsal interosseous ligaments"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_big_toe_ID",
        "name": "Tarsometatarsal ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_big_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_big_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_second_toe_ID",
        "name": "Tarsometatarsal ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_second_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_second_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_third_toe_ID",
        "name": "Tarsometatarsal ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_third_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_third_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_fourth_toe_ID",
        "name": "Tarsometatarsal ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_fourth_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_fourth_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-tarsometatarsal_ligaments_of_right_fifth_toe_ID",
        "name": "Tarsometatarsal ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-right_plantar_tarsometatarsal_ligament_of_right_fifth_toe_ID",
        "name": "Right plantar tarsometatarsal ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-right_dorsal_tarsometatarsal_ligament_of_right_fifth_toe_ID",
        "name": "Right dorsal tarsometatarsal ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-intermetatarsal_ligaments_of_right_foot_ID",
        "name": "Intermetatarsal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-right_plantar_intermetatarsal_ligaments_ID",
        "name": "Right plantar intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_first_and_second_right_metatarsal_bones_ID",
        "name": "Plantar ligament of first and second right metatarsal bones"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_second_and_third_right_metatarsals_ID",
        "name": "Plantar ligament of second and third right metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_third_and_fourth_right_metatarsals_ID",
        "name": "Plantar ligament of third and fourth right metatarsals"
      },
      {
        "objectId": "connective_tissue-plantar_ligament_of_fourth_and_fifth_right_metatarsals_ID",
        "name": "Plantar ligament of fourth and fifth right metatarsals"
      },
      {
        "objectId": "connective_tissue-right_interosseous_intermetatarsal_ligaments_ID",
        "name": "Right interosseous intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_first_and_second_right_metatarsals_ID",
        "name": "Interosseous ligament of first and second right metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_second_and_third_right_metatarsals_ID",
        "name": "Interosseous ligament of second and third right metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_third_and_fourth_right_metatarsals_ID",
        "name": "Interosseous ligament of third and fourth right metatarsals"
      },
      {
        "objectId": "connective_tissue-interosseous_ligament_of_fourth_and_fifth_right_metatarsals_ID",
        "name": "Interosseous ligament of fourth and fifth right metatarsals"
      },
      {
        "objectId": "connective_tissue-right_dorsal_intermetatarsal_ligaments_ID",
        "name": "Right dorsal intermetatarsal ligaments"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_first_and_second_right_metatarsals_ID",
        "name": "Dorsal ligament of first and second right metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_second_and_third_right_metatarsals_ID",
        "name": "Dorsal ligament of second and third right metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_third_and_fourth_right_metatarsals_ID",
        "name": "Dorsal ligament of third and fourth right metatarsals"
      },
      {
        "objectId": "connective_tissue-dorsal_ligament_of_fourth_and_fifth_right_metatarsals_ID",
        "name": "Dorsal ligament of fourth and fifth right metatarsals"
      },
      {
        "objectId": "connective_tissue-right_superficial_transverse_metatarsal_ligament_ID",
        "name": "Right superficial transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-right_deep_transverse_metatarsal_ligament_ID",
        "name": "Right deep transverse metatarsal ligament"
      },
      {
        "objectId": "connective_tissue-right_plantar_aponeurosis_ligament_ID",
        "name": "Right plantar aponeurosis ligament"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_foot_ID",
        "name": "Metatarsophalangeal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_big_toe_ID",
        "name": "Metatarsophalangeal ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_big_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_big_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_big_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_big_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right big toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_second_toe_ID",
        "name": "Metatarsophalangeal ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_second_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_second_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_second_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_second_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right second toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_third_toe_ID",
        "name": "Metatarsophalangeal ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_third_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_third_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_third_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_third_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right third toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_fourth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right fourth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_ligaments_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_joint_capsule_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal joint capsule of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_collateral_ligaments_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal collateral ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_medial_collateral_ligament_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal proper medial collateral ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-metatarsophalangeal_proper_lateral_collateral_ligament_of_right_fifth_toe_ID",
        "name": "Metatarsophalangeal proper lateral collateral ligament of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_foot_ID",
        "name": "Interphalangeal ligaments of right foot"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_big_toe_ID",
        "name": "Interphalangeal ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsule_of_right_big_toe_ID",
        "name": "Interphalangeal joint capsule of right big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_big_toe_ID",
        "name": "Interphalangeal collateral ligaments of right big toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_big_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right big toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_second_toe_ID",
        "name": "Interphalangeal ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_second_toe_ID",
        "name": "Interphalangeal joint capsules of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_second_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_second_toe_ID",
        "name": "Interphalangeal distal joint capsule of right second toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_second_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_second_toe_ID",
        "name": "Interphalangeal collateral ligaments of right second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_second_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_second_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_third_toe_ID",
        "name": "Interphalangeal ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_third_toe_ID",
        "name": "Interphalangeal joint capsules of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_third_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_third_toe_ID",
        "name": "Interphalangeal distal joint capsule of right third toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_third_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_third_toe_ID",
        "name": "Interphalangeal collateral ligaments of right third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_third_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_third_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_fourth_toe_ID",
        "name": "Interphalangeal ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_fourth_toe_ID",
        "name": "Interphalangeal joint capsules of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_fourth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_fourth_toe_ID",
        "name": "Interphalangeal distal joint capsule of right fourth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_fourth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_fourth_toe_ID",
        "name": "Interphalangeal collateral ligaments of right fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_fourth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_fourth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_ligaments_of_right_fifth_toe_ID",
        "name": "Interphalangeal ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_joint_capsules_of_right_fifth_toe_ID",
        "name": "Interphalangeal joint capsules of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_proximal_joint_capsule_of_right_fifth_toe_ID",
        "name": "Interphalangeal proximal joint capsule of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_distal_joint_capsule_of_right_fifth_toe_ID",
        "name": "Interphalangeal distal joint capsule of right fifth toe"
      },
      {
        "objectId": "connective_tissue-plantar_plate_of_interphalangeal_joint_of_right_fifth_toe_ID",
        "name": "Plantar plate of interphalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-interphalangeal_collateral_ligaments_of_right_fifth_toe_ID",
        "name": "Interphalangeal collateral ligaments of right fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_proximal_interphalangeal_joint_of_right_fifth_toe_ID",
        "name": "Collateral ligaments of proximal interphalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-collateral_ligaments_of_distal_interphalangeal_joint_of_right_fifth_toe_ID",
        "name": "Collateral ligaments of distal interphalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_foot_ID",
        "name": "Cartilage of right foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_intertarsal_joints_ID",
        "name": "Cartilage of right intertarsal joints"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_navicular_facet_of_right_talus_ID",
        "name": "Articular cartilage of navicular facet of right talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_articular_facet_of_right_calcaneus_for_cuboid_ID",
        "name": "Articular cartilage of articular facet of right calcaneus for cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_anterior_talar_articular_facet_of_right_calcaneus_ID",
        "name": "Articular cartilage of anterior talar articular facet of right calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_cuboid_ID",
        "name": "Articular cartilage of right cuboid"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_first_metatarsal_ID",
        "name": "Articular cartilage of right first metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_second_metatarsal_ID",
        "name": "Articular cartilage of right second metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_third_metatarsal_ID",
        "name": "Articular cartilage of right third metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_fourth_metatarsal_ID",
        "name": "Articular cartilage of right fourth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_fifth_metatarsal_ID",
        "name": "Articular cartilage of right fifth metatarsal"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_lateral_cuneiform_ID",
        "name": "Articular cartilage of right lateral cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_intermediate_cuneiform_ID",
        "name": "Articular cartilage of right intermediate cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_medial_cuneiform_ID",
        "name": "Articular cartilage of right medial cuneiform"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_navicular_ID",
        "name": "Articular cartilage of right navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_talar_facet_of_right_navicular_ID",
        "name": "Articular cartilage of talar facet of right navicular"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_posterior_talar_articular_facet_of_right_calcaneus_ID",
        "name": "Articular cartilage of posterior talar articular facet of right calcaneus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_right_talus_ID",
        "name": "Articular cartilage of right talus"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_middle_talar_articular_facet_of_right_calcaneus_ID",
        "name": "Articular cartilage of middle talar articular facet of right calcaneus"
      },
      {
        "objectId": "connective_tissue-cartilage_of_right_metatarsophalangeal_joints_ID",
        "name": "Cartilage of right metatarsophalangeal joints"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_big_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_first_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right first metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_big_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_second_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_second_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right second metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_third_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_third_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right third metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_fourth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fourth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right fourth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_metatarsophalangeal_joint_of_right_fifth_toe_ID",
        "name": "Cartilage of metatarsophalangeal joint of right fifth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_right_fifth_metatarsal_bone_ID",
        "name": "Articular cartilage of head of right fifth metatarsal bone"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_proximal_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of base of proximal phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_foot_ID",
        "name": "Cartilage of interphalangeal joints of right foot"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joint_of_right_big_toe_ID",
        "name": "Cartilage of interphalangeal joint of right big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_big_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right big toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_big_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right big toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_second_toe_ID",
        "name": "Cartilage of interphalangeal joints of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_second_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right second toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_third_toe_ID",
        "name": "Cartilage of interphalangeal joints of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_third_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right third toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_fourth_toe_ID",
        "name": "Cartilage of interphalangeal joints of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_fourth_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right fourth toe"
      },
      {
        "objectId": "connective_tissue-cartilage_of_interphalangeal_joints_of_right_little_toe_ID",
        "name": "Cartilage of interphalangeal joints of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_proximal_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of head of proximal phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_middle_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of base of middle phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_head_of_middle_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of head of middle phalanx of right little toe"
      },
      {
        "objectId": "connective_tissue-articular_cartilage_of_base_of_distal_phalanx_of_right_little_toe_ID",
        "name": "Articular cartilage of base of distal phalanx of right little toe"
      },
      {
        "objectId": "skeletal_system-bones_of_right_ankle_and_foot_ID",
        "name": "Bones of right ankle and foot"
      },
      {
        "objectId": "skeletal_system-tarsal_bones_of_right_ankle_and_foot_ID",
        "name": "Tarsal bones of right ankle and foot"
      },
      {
        "objectId": "skeletal_system-right_calcaneus_ID",
        "name": "Right calcaneus"
      },
      {
        "objectId": "skeletal_system-right_talus_ID",
        "name": "Right talus"
      },
      {
        "objectId": "skeletal_system-right_cuboid_ID",
        "name": "Right cuboid"
      },
      {
        "objectId": "skeletal_system-right_navicular_ID",
        "name": "Right navicular"
      },
      {
        "objectId": "skeletal_system-right_medial_cuneiform_ID",
        "name": "Right medial cuneiform"
      },
      {
        "objectId": "skeletal_system-right_intermediate_cuneiform_ID",
        "name": "Right intermediate cuneiform"
      },
      {
        "objectId": "skeletal_system-right_lateral_cuneiform_ID",
        "name": "Right lateral cuneiform"
      },
      {
        "objectId": "skeletal_system-metatarsal_bones_of_right_ankle_and_foot_ID",
        "name": "Metatarsal bones of right ankle and foot"
      },
      {
        "objectId": "skeletal_system-right_first_metatarsal_ID",
        "name": "Right first metatarsal"
      },
      {
        "objectId": "skeletal_system-right_second_metatarsal_ID",
        "name": "Right second metatarsal"
      },
      {
        "objectId": "skeletal_system-right_third_metatarsal_ID",
        "name": "Right third metatarsal"
      },
      {
        "objectId": "skeletal_system-right_fourth_metatarsal_ID",
        "name": "Right fourth metatarsal"
      },
      {
        "objectId": "skeletal_system-right_fifth_metatarsal_ID",
        "name": "Right fifth metatarsal"
      },
      {
        "objectId": "skeletal_system-sesamoid_bones_of_right_foot_ID",
        "name": "Sesamoid bones of right foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_foot_ID",
        "name": "Phalanges of right foot"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_big_toe_ID",
        "name": "Phalanges of right big toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_big_toe_ID",
        "name": "Proximal phalanx of right big toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_big_toe_ID",
        "name": "Distal phalanx of right big toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_second_toe_ID",
        "name": "Proximal phalanx of right second toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_second_toe_ID",
        "name": "Middle phalanx of right second toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_second_toe_ID",
        "name": "Distal phalanx of right second toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_third_toe_ID",
        "name": "Phalanges of right third toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_third_toe_ID",
        "name": "Proximal phalanx of right third toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_third_toe_ID",
        "name": "Middle phalanx of right third toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_third_toe_ID",
        "name": "Distal phalanx of right third toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_fourth_toe_ID",
        "name": "Phalanges of right fourth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_fourth_toe_ID",
        "name": "Proximal phalanx of right fourth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_fourth_toe_ID",
        "name": "Middle phalanx of right fourth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_fourth_toe_ID",
        "name": "Distal phalanx of right fourth toe"
      },
      {
        "objectId": "skeletal_system-phalanges_of_right_fifth_toe_ID",
        "name": "Phalanges of right fifth toe"
      },
      {
        "objectId": "skeletal_system-proximal_phalanx_of_right_fifth_toe_ID",
        "name": "Proximal phalanx of right fifth toe"
      },
      {
        "objectId": "skeletal_system-middle_phalanx_of_right_fifth_toe_ID",
        "name": "Middle phalanx of right fifth toe"
      },
      {
        "objectId": "skeletal_system-distal_phalanx_of_right_fifth_toe_ID",
        "name": "Distal phalanx of right fifth toe"
      }
    ]
  }
};
