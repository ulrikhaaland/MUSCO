// @ts-nocheck
// ------------------------------------------------------------
// Rehab Programs – FULL UPDATE 2025‑05‑31
// ▸ Keeps all 5 programs intact
// ▸ Each ProgramWeek now contains **7 days (0‑6)**
// ▸ Exercise days follow a Mo‑We‑Fr pattern (0, 2, 4)
// ▸ Rest‑day objects match the requested shape and may include
//   light optional drills for mobility/recovery.
// ------------------------------------------------------------

import { ExerciseProgram } from '../../../src/app/types/program';
import { DiagnosisAssistantResponse } from '../../../src/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../shared/types';

// Locale-aware helpers (descriptions only)
// We intentionally only localize ProgramDay.description strings per request.
// Diagnosis, questionnaire and other metadata remain unchanged.
export const localizeProgramDayDescriptions = (
  program: ExerciseProgram,
  locale: 'en' | 'nb'
): ExerciseProgram => {
  if (locale !== 'nb') return program;

  // Minimal phrase mapping for common workout day descriptions
  const dayTitleMap: Record<string, string> = {
    'Relief & Mobility': 'Lindring og mobilitet',
    'Core Reset (dead bug + plank)': 'Kjernereset (dead bug + planke)',
    'Reset & Brace (dead bug + plank). Exhale to brace; stop if symptoms travel or spike >3/10.':
      'Reset og buktrykk (dead bug + planke). Pust ut for å spenne; stopp hvis symptomer stråler eller øker >3/10.',
    'Glute Bridge + Anti-rotation': 'Seteløft + anti-rotasjon',
    'Glutes + Spine Stability (bridge + bird dog). Quiet trunk; move from hips/shoulders, not the low back.':
      'Sete + ryggstabilitet (seteløft + bird dog). Stabil overkropp; beveg fra hofter/skuldre, ikke korsryggen.',
    'Repeat & Extend (control + confidence)': 'Gjenta og utvid (kontroll + trygghet)',
    // Low Back (Week 1)
    'Reset & Brace (dead bug + plank). Exhale to brace; stop if symptoms travel or spike >3/10.':
      'Reset og buktrykk (dead bug + planke). Pust ut for å spenne; stopp hvis symptomer stråler eller øker >3/10.',
    'Glutes + Spine Stability (bridge + bird dog). Quiet trunk; move from hips/shoulders, not the low back.':
      'Sete + ryggstabilitet (seteløft + bird dog). Rolig overkropp; beveg fra hofter/skuldre, ikke korsrygg.',
    'Repeat & Build Confidence. Same-day should feel easier; next morning should be stable or better.':
      'Gjenta og bygg trygghet. Det skal kjennes litt lettere samme dag; neste morgen stabilt eller bedre.',
    'Repeat & Build Confidence. Same-day should feel easier; next morning should be stable or better.':
      'Gjenta og bygg trygghet. Det skal føles lettere samme dag; neste morgen stabilt eller bedre.',
    // Shin Splints (MTSS)
    'Zone 2 + Calf Strength (easy). Slow reps; pain stays ≤3/10 during and the next morning.':
      'Zone 2 + leggstyrke (lett). Rolige reps; smerte ≤3/10 underveis og neste morgen.',
    'Calf Capacity + Zone 2 (easy). Keep cadence smooth; stop if pain climbs above 3/10.':
      'Leggkapasitet + Zone 2 (lett). Jevn frekvens; stopp hvis smerte går over 3/10.',
    'Eccentric Calf Lowers + Zone 2. 3–4s lowering; reduce volume if sore >24h.':
      'Eksentriske leggsenk + Zone 2. 3–4s senk; reduser volum ved ømhet >24t.',
    'Foot Control + Eccentric Calf. Controlled foot/ankle; avoid “pushing through” tenderness.':
      'Fotkontroll + eksentrisk legg. Kontrollert fot/ankel; ikke press gjennom ømhet.',
    'Walk–Jog (1:1) + Calf Strength. Soft surface; keep stride short and cadence high.':
      'Gå–jogg (1:1) + leggstyrke. Mykt underlag; korte steg og høy frekvens.',
    'Walk–Jog (2:1) + Calf Strength. Add time slowly; one variable at a time (surface OR volume).':
      'Gå–jogg (2:1) + leggstyrke. Øk tid rolig; én variabel om gangen (underlag ELLER volum).',
    'Hinge + Glute Strength (progress eccentrics)': 'Hoftebøy + setestyrke (øk eksentrisk belastning)',
    'Functional Strength (squat + anti-rotation)': 'Funksjonell styrke (knebøy + anti-rotasjon)',
    'Return‑to‑Activity (loaded hinge)': 'Tilbake til aktivitet (belastet hoftebøy)',
    'De‑load & Control': 'Avlasting og kontroll',
    'Controlled Loading (add single‑leg)': 'Kontrollert belastning (legg til ettbeinsarbeid)',
    'Return‑to‑Run Prep (add Bulgarians + step‑downs)': 'Forberedelse til løping (Bulgarske splittknebøy + step-down)',
    'Return‑to‑Run (progress mileage)': 'Tilbake til løping (øk distanse)',
    'Pain‑Free Range & Control': 'Smertefri bevegelse og kontroll',
    'Add Pulling & Light Press': 'Legg til roing og lett press',
    'Overhead Strength Transition': 'Overgang til press over hodet',
    'Acute Recovery (mobility & swelling)': 'Akutt restitusjon (mobilitet og hevelse)',
    'Strength Return (calf & glute)': 'Styrketilbakekomst (legg og sete)',
    'Balance & Proprioception': 'Balanse og propriosepsjon',
    'Return‑to‑Jog (dynamic loading)': 'Tilbake til lett jogg (dynamisk belastning)',
    'Isometric Pain Modulation': 'Isometrisk smertedemping',
    'Introduce Eccentric Loading': 'Introduser eksentrisk belastning',
    'Forearm Control + Grip Strength': 'Underarmskontroll + grepstyrke',
    'Functional Loading & Carryover': 'Funksjonell belastning og overføring',
    'Mobility & Awareness': 'Mobilitet og bevissthet',
    'Scapular Strength & Cuff Activation': 'Skulderbladstyrke og rotatorcuff-aktivering',
    'Postural Endurance & Volume': 'Holdningsutholdenhet og volum',
    'Integration & Habit Anchoring': 'Integrasjon og vaneetablering',
    'Light Load & Arch Activation': 'Lett belastning og fotbueaktivering',
    'Eccentric Calf & Toe Control': 'Eksentrisk legg + tåkontroll',
    'Balance & Midfoot Strength': 'Balanse og midtfotsstyrke',
    'Function & Return‑to‑Impact': 'Funksjon og tilbake til belastning',
    'Function & Return to Impact': 'Funksjon og tilbake til belastning',
    'Isometric Activation & Mobility': 'Isometrisk aktivering og mobilitet',
    'Single-Leg Control & Hinge Strength': 'Ettbeinskontroll og hoftebøystyrke',
    'Return‑to‑Jog (light dynamic work)': 'Tilbake til lett jogg (lett dynamikk)',
    'Posture Awareness & Mobility': 'Holdningsbevissthet og mobilitet',
    'Scapular Control & Pull Strength': 'Skulderbladskontroll og trekkstyrke',
    'Endurance & Time Under Tension': 'Utholdenhet og tid under spenning',
    'Posture Integration (core + upper back)': 'Holdningsintegrasjon (kjerne + øvre rygg)',
    'Activation & Control': 'Aktivering og kontroll',
    'Time Under Tension & Movement': 'Tid under spenning og bevegelse',
    'Stability & Balance Challenges': 'Stabilitet og balanseutfordringer',
    'Multi-Planar Core Integration': 'Multiplanar kjerneintegrasjon',
    // Runner's Knee (Week 1)
    'Symptom Calm + Hip Activation. Keep knee tracking over mid-foot and pain ≤3/10.':
      'Ro ned symptomer + hofteaktivering. Hold kneet over midtfoten og smerte ≤3/10.',
    'Hip Control + Quad Isometrics. Slow reps, no knee collapse inward.':
      'Hoftekontroll + isometrisk lår. Rolige reps, unngå at kneet faller innover.',
    'Build Tolerance (same pattern, slightly more work). Next morning should be stable or better.':
      'Bygg toleranse (samme mønster, litt mer arbeid). Neste morgen skal være stabil eller bedre.',
    // Shoulder (Week 1)
    'Restore Motion + Scap Control. Smooth reps; stay below pinch range.':
      'Gjenopprett bevegelse + skulderbladkontroll. Rolige reps; hold deg under klypegrensen.',
    'Cuff Endurance + Flexion Control. Keep ribs down; avoid shrugging.':
      'Cuff-utholdenhet + fleksjonskontroll. Hold ribbeina nede; unngå å trekke skuldrene opp.',
    'Build Shoulder Tolerance (same pattern, slightly more volume). Next day should feel stable or better.':
      'Bygg skuldertoleranse (samme mønster, litt mer volum). Neste dag skal være stabil eller bedre.',
    // Ankle (Week 1)
    'Calm Swelling + Restore Motion. Keep steps quiet and pain ≤3/10.':
      'Demp hevelse + gjenopprett bevegelse. Hold stegene rolige og smerte ≤3/10.',
    'Ankle Mobility + Calf Pump. Slow tempo, full-foot contact.':
      'Ankelmobilitet + leggpumpe. Rolig tempo, full fotkontakt.',
    'Build Confidence in Stance. Repeat pattern; next day should be stable or better.':
      'Bygg trygghet i standfase. Gjenta mønster; neste dag skal være stabil eller bedre.',
    // Tennis Elbow (Week 1)
    'Settle Tendon Irritability + Isometric Relief. Keep grip light and pain ≤3/10.':
      'Demp senesmerte + isometrisk lindring. Hold lett grep og smerte ≤3/10.',
    'Forearm Control + Slow Rotation. Move smoothly; no sharp or radiating pain.':
      'Underarmskontroll + rolig rotasjon. Beveg rolig; ingen skarp eller utstrålende smerte.',
    'Build Daily-Use Tolerance. Repeat pattern with slightly longer holds if stable next day.':
      'Bygg toleranse for hverdagsbruk. Gjenta mønsteret med litt lengre hold hvis neste dag er stabil.',
    // Tech Neck (Week 1)
    'Reset Posture + Mobility. Keep jaw relaxed and shoulders away from ears.':
      'Nullstill holdning + mobilitet. Hold kjeven avslappet og skuldrene ned fra ørene.',
    'Scapular Endurance + Neck Calm. Slow pulls; avoid neck tension compensation.':
      'Skulderbladutholdenhet + ro i nakken. Rolige trekk; unngå kompensasjon med nakken.',
    'Build Desk-Day Tolerance. Repeat pattern with slightly more control and hold quality.':
      'Bygg toleranse for kontordag. Gjenta mønsteret med litt mer kontroll og kvalitet i holdene.',
    // Plantar Fasciitis (Week 1)
    'Calm Heel Pain + Restore Foot Motion. Keep load sub-symptomatic and controlled.':
      'Demp hælsmerte + gjenopprett fotbevegelse. Hold belastningen kontrollert og under symptomgrense.',
    'Calf-Arch Control + Gentle Capacity. Slow tempo; no sharp heel pain.':
      'Legg-/fotbuekontroll + skånsom kapasitet. Rolig tempo; ingen skarp hælsmerte.',
    'Build First-Step Confidence. Repeat pattern with slightly more time under tension.':
      'Bygg trygghet i de første stegene. Gjenta mønsteret med litt mer tid under spenning.',
    // Hamstring (Week 1)
    'Calm Hamstring Irritability + Gentle Activation. Keep stride short and pain ≤3/10.':
      'Demp hamstring-irritasjon + skånsom aktivering. Hold stegene korte og smerte ≤3/10.',
    'Posterior Chain Control. Slow hinge patterning without stretch pain.':
      'Baksidekjede-kontroll. Rolig hoftebøy-mønster uten strekksmerte.',
    'Build Walking Confidence. Repeat pattern with slightly more control and tolerance.':
      'Bygg trygghet i gange. Gjenta mønsteret med litt mer kontroll og toleranse.',
    // Upper Back & Core (Week 1)
    'Posture Reset + Thoracic Mobility. Keep ribs stacked and shoulders down.':
      'Holdningsreset + brystryggmobilitet. Hold ribbeina stable og skuldrene nede.',
    'Scapular Endurance + Core Support. Slow pulls; avoid neck compensation.':
      'Skulderbladutholdenhet + kjernestøtte. Rolige trekk; unngå nakkekompensasjon.',
    'Build Upright Tolerance. Repeat pattern with slightly more time under tension.':
      'Bygg toleranse i oppreist holdning. Gjenta mønsteret med litt mer tid under spenning.',
    // Core Stability (Week 1)
    'Deep Core Reset. Slow bracing with neutral spine and controlled breathing.':
      'Dyp kjerne-reset. Rolig buktrykk med nøytral rygg og kontrollert pust.',
    'Core Control + Limb Coordination. Keep pelvis stable and movement quiet.':
      'Kjernekontroll + koordinasjon med armer/bein. Hold bekkenet stabilt og bevegelsen rolig.',
    'Build Trunk Endurance. Repeat pattern with slightly longer quality holds.':
      'Bygg kjerneutholdenhet. Gjenta mønsteret med litt lengre kvalitets-hold.',
  };

  // Rest day description mappings across all programs/weeks
  const restDayMap: Record<string, string> = {
    'Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.': 'Hviledag. Skånsom ryggmobilitet og diafragmapust for å redusere stivhet.',
    'Rest day. Add light glute and core coordination to support spinal alignment.': 'Hviledag. Lett sete- og kjernesamspill for å støtte nøytral ryggrad.',
    'Rest day. Reinforce deep core and oblique control while maintaining spinal neutrality.': 'Hviledag. Forsterk dyp kjerne og skrå magemuskler med nøytral rygg.',
    'Rest day. Integrate breathing with movement and reinforce core-endurance patterns.': 'Hviledag. Integrer pust med bevegelse og bygg kjerneutholdenhet.',

    'Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.': 'Hviledag. Lett mobilitet for lår/hofte for blodsirkulasjon uten knestress.',
    'Rest day. Add posterior chain support to improve knee control without loading the joint.': 'Hviledag. Styrk baksidekjeden for bedre kne-kontroll uten leddbelastning.',
    'Rest day. Improve balance and hip control while continuing to offload the knee.': 'Hviledag. Bedre balanse og hoftekontroll samtidig som kneet avlastes.',
    'Rest day. Reinforce posterior support and tolerance for static quad activation.': 'Hviledag. Forsterk bakside-støtte og toleranse for statisk lårarbeid.',

    'Rest day. Scapular mobility and low-load cuff activation for circulation.': 'Hviledag. Skulderbladmobilitet og lett rotatorcuff-aktivering for sirkulasjon.',
    'Rest day. Build shoulder control with higher rep scapular and cuff movements.': 'Hviledag. Øk skulderkontroll med flere repetisjoner for skulderblad og cuff.',
    'Rest day. Introduce gentle shoulder flexion to promote functional mobility.': 'Hviledag. Innfør skånsom skulderfleksjon for funksjonell mobilitet.',
    'Rest day. Strengthen shoulder stabilizers and reinforce safe movement patterns.': 'Hviledag. Styrk skulderstabilisatorer og sikre trygge bevegelsesmønstre.',

    'Rest day. Gentle range of motion and calf pump to assist lymph drainage.': 'Hviledag. Skånsomt bevegelsesutslag og leggpumpe for lymfedrenasje.',
    'Rest day. Increase calf control and begin rebuilding joint awareness.': 'Hviledag. Øk kontroll i leggen og bygg opp leddsans.',
    'Rest day. Reinforce ankle control with unilateral loading and balance prep.': 'Hviledag. Forsterk ankelkontroll med ettbeinsbelastning og balanseforberedelse.',
    'Rest day. Improve single-leg stability and ankle control for walking and return to activity.': 'Hviledag. Bedre ettbeinsstabilitet og ankelkontroll for gange og aktivitet.',

    'Rest day. Low-load wrist mobility and gentle neural glide to reduce elbow tension.': 'Hviledag. Lett håndleddmobilitet og skånsom nerveglidning for mindre albuetensjon.',
    'Rest day. Increase control with slightly higher reps and slow eccentric emphasis.': 'Hviledag. Øk kontroll med litt flere repetisjoner og rolig eksentrisk fokus.',
    'Rest day. Reinforce tendon loading tolerance with a light isometric hold.': 'Hviledag. Forsterk sene-toleranse med lett isometrisk hold.',
    'Rest day. Improve endurance with higher-rep grip work and rotation control.': 'Hviledag. Bedre utholdenhet med flere grep-reps og rotasjonskontroll.',

    'Rest day. Gentle neck and shoulder mobility to maintain progress without overworking.': 'Hviledag. Skånsom nakke- og skuldermobilitet for å vedlikeholde fremgang.',
    'Rest day. Reinforce shoulder control and introduce spinal dissociation for postural support.': 'Hviledag. Forsterk skulderkontroll og introduser spinal dissosiasjon for holdning.',
    'Rest day. Build scapular control and add flexion patterning without neck strain.': 'Hviledag. Bygg skulderbladskontroll og legg til fleksjonsmønstre uten nakkestress.',
    'Rest day. Light rotator cuff activation and posture control to reinforce recovery gains.': 'Hviledag. Lett rotatorcuff-aktivering og holdningskontroll for varig effekt.',

    'Rest day. Light foot mobility and calf stretches to support healing.': 'Hviledag. Lett fotmobilitet og leggstrekk for å støtte tilheling.',
    'Rest day. Optional easy 5–10 min marching in place; gentle calf stretch if pain‑free.':
      'Hviledag. Valgfritt: 5–10 min rolig marsj på stedet; lett leggstrekk hvis smertefritt.',
    'Rest day. Avoid impact; optional easy 5–10 min marching in place if fully pain‑free.':
      'Hviledag. Unngå støt; valgfritt: 5–10 min rolig marsj på stedet hvis helt smertefritt.',
    'Rest day. Reinforce calf control and introduce light arch stability.': 'Hviledag. Forsterk leggkontroll og innfør lett fotbue-stabilitet.',
    'Rest day. Challenge ankle control and foot arch through unilateral work.': 'Hviledag. Utfordre ankelkontroll og fotbue med ettbeinsarbeid.',
    'Rest day. Improve foot strength and maintain calf endurance with controlled loading.': 'Hviledag. Bedre fotstyrke og vedlikehold legg-utholdenhet med kontrollert belastning.',

    'Rest day. Gentle activation for the glutes and trunk to promote circulation and postural control.': 'Hviledag. Skånsom aktivering av sete og kjerne for sirkulasjon og holdningskontroll.',
    'Rest day. Light anti-rotation and core control to improve deep stabilizer endurance.': 'Hviledag. Lett anti-rotasjon og kjernestyring for dype stabilisatorer.',
    'Rest day. Introduce lateral control and balance to challenge trunk stability.': 'Hviledag. Innfør lateral kontroll og balanse for å utfordre kjernestabilitet.',
    'Rest day. Reinforce anti-rotation control and increase endurance for deep core.': 'Hviledag. Forsterk anti-rotasjon og øk utholdenheten i dyp kjerne.',
  };

  // Weekly summary mapping (short strings)
  const summaryMap: Record<string, string> = {
    // Shin Splints (MTSS)
    'Deload impact to calm shin pain. Maintain fitness with Zone 2 cardio + gentle calf work.':
      'Avlast støt for å roe leggsmerten. Behold kondisjon med Zone 2 + lett leggarbeid.',
    'Build capacity with eccentrics. Return to walking in short, cadence-focused doses.':
      'Bygg kapasitet med eksentriker. Tilbake til gange i korte doser med kadensfokus.',
    'Reintroduce jogging with 1:1 intervals. Keep calf strength and foot control consistent.':
      'Gjeninnfør jogging med 1:1-intervaller. Hold leggstyrke og fotkontroll jevnt.',
    'Longer jog blocks (2:1). Progress slowly and reintroduce firmer surfaces gradually.':
      'Lengre joggbolker (2:1). Øk rolig og gjeninnfør fastere underlag gradvis.',

    'Calm pain; rebuild neutral spine and glute activation': 'Demp smerte; gjenoppbygg nøytral rygg og seteaktivering',
    'Hinge mechanics + glute strength; controlled hamstring eccentrics': 'Hoftebøyteknikk + setestyrke; kontrollerte hamstrings-eksentriker',
    'Functional lower‑body strength + anti‑rotation core': 'Funksjonell underkroppsstyrke + anti-rotasjonskjerne',
    'Loaded hinge confidence; core endurance for daily lifting': 'Trygghet i belastet hoftebøy; kjerneutholdenhet for daglige løft',
    'Reduce flare-ups; re-find neutral spine and core control': 'Reduser oppbluss; finn nøytral rygg og kjerne-kontroll',
    'Hip hinge + posterior-chain strength without provoking the back': 'Hoftebøy + styrke i baksidekjeden uten å provosere ryggen',
    'Return to full-body patterns: squat/hinge + anti-rotation': 'Tilbake til helkroppsmønstre: knebøy/hoftebøy + anti-rotasjon',
    'Build lifting confidence: light loaded hinge + core endurance': 'Bygg løfte-trygghet: lett belastet hoftebøy + kjerneutholdenhet',

    'De‑load knee; build hip control and quad tolerance': 'Avlast kneet; bygg hoftekontroll og lårtoleranse',
    'Controlled squats/lunges; better alignment and tolerance': 'Kontrollerte knebøy/utfall; bedre sporing og toleranse',
    'Eccentric quad control + single‑leg strength': 'Eksentrisk lårkontroll + ettbeinsstyrke',
    'Return‑to‑run with strength maintenance': 'Tilbake til løping med styrkevedlikehold',

    'Scapular control + cuff activation, pain‑free range': 'Skulderbladskontroll + cuff-aktivering, smertefri bevegelse',
    'Cuff endurance and scapular retraction volume': 'Cuff-utholdenhet og volum i retraksjon',
    'Introduce row + safe‑range press; keep cuff volume': 'Innfør roing + trygg press; behold cuff-volum',
    'Progress overhead strength with stable scapular mechanics': 'Fremdrift i press over hodet med stabile skulderblad',

    'Circulation + gentle ROM; ankle feels safer': 'Sirkulasjon + skånsom bevegelighet; ankelen føles tryggere',
    'Calf strength + hip control for ankle stability': 'Leggstyrke + hoftekontroll for ankelstabilitet',
    'Single‑leg control + proprioception': 'Ettbeinskontroll + propriosepsjon',
    'Return‑to‑jog while keeping ankle strong': 'Tilbake til lett jogg med sterk ankel',

    'Isometric analgesia + gentle forearm rotation': 'Isometrisk smertelindring + skånsom underarmsrotasjon',
    'Add slow eccentrics; keep pain modest': 'Legg til langsomme eksentriker; hold smerte lav',
    'Rotation capacity + light grip endurance': 'Rotasjonskapasitet + lett grep-utholdenhet',
    'Functional loading and return to tasks': 'Funksjonell belastning og tilbake til oppgaver',

    'Mobility + scapular activation to unload neck': 'Mobilitet + skulderblad-aktivering for å avlaste nakken',
    'Row volume + cuff endurance for posture': 'Ro-volum + cuff-utholdenhet for holdning',
    'Higher volume + anti‑rotation endurance': 'Høyere volum + anti-rotasjonsutholdenhet',
    'Integrate posture into daily movement + maintain strength': 'Integrer holdning i hverdagen + vedlikehold styrke',

    'Calm heel pain; start calf activation': 'Demp hælsmerte; start leggaktivering',
    'Eccentric calf loading + arch support': 'Eksentrisk legg-belastning + fotbue-støtte',
    'Balance + midfoot control': 'Balanse + midtfotskontroll',
    'Functional loading; return to brisk walking': 'Funksjonell belastning; tilbake til rask gange',

    'Mobility + pain‑free isometric activation': 'Mobilitet + smertefri isometrisk aktivering',
    'Introduce eccentrics for tissue capacity': 'Introduser eksentriker for vevstoleranse',
    'Single‑leg hinge + coordination': 'Ettbeins hoftebøy + koordinasjon',
    'Return‑to‑jog + maintain eccentrics': 'Tilbake til lett jogg + vedlikehold eksentriker',

    'Comprehensive postural reset with mobility and strengthening': 'Helhetlig holdningsreset med mobilitet og styrke',
    'Controlled pulling and scapular strengthening': 'Kontrollert trekk og skulderbladsstyrke',
    'Endurance building with time-under-tension work': 'Bygg utholdenhet med tid-under-spenning',
    'Integrated core and full-body postural control': 'Integrert kjerne og helkroppskontroll for holdning',

    'Deep core activation and control foundation': 'Dyp kjerneaktivering og kontrollgrunnlag',
    'Core endurance with coordinated movement challenges': 'Kjerneutholdenhet med koordinerte utfordringer',
    'Advanced stability with multi-directional core control': 'Avansert stabilitet med flerveis kjerne-kontroll',
    'Advanced multi-planar core mastery': 'Avansert multiplanar kjernemestring',
  };

  // Per-week narrative fields (long blocks)
  const overviewMap: Record<string, string> = {
    // Shin Splints (MTSS)
    'Shin splints often flare when impact volume ramps faster than your lower leg can adapt. This week we dial down running/jumping to calm the tibia while keeping you active with low-impact cardio. You’ll build gentle calf/ankle capacity and blood flow so walking and stairs feel easier. Use pain (during + next morning) as your guide—steady or improving is the goal.': 'Leggskinnebetennelse (shin splints) blusser ofte opp når støtbelastningen øker raskere enn leggen rekker å tilpasse seg. Denne uken skrur vi ned løping/hopp for å roe ned tibia, men holder deg i aktivitet med lav‑impact kondisjon. Du bygger lett kapasitet i legg/ankel og øker blodsirkulasjon slik at gange og trapper føles lettere. Bruk smerte (underveis + neste morgen) som guide—stabilt eller bedre er målet.',
    'With symptoms calmer, we start rebuilding capacity: slow eccentrics for the calves and more single-leg control so the tibia absorbs less braking force. Walking returns in short doses on soft surfaces with a cadence focus. You’ll still keep most cardio low-impact while we build tissue tolerance.': 'Når symptomene er roligere, starter vi å bygge kapasitet: langsomme eksentriker for leggene og mer ettbeinskontroll slik at tibia får mindre “bremsing” for hvert steg. Gange kommer tilbake i korte doser på mykt underlag med fokus på høyere frekvens. Du holder fortsatt mesteparten av kondisjonen lav‑impact mens vevet bygger toleranse.',
    'Now we reintroduce impact in controlled doses: short walk–jog intervals on soft surfaces while keeping calf strength and foot control. The goal is to feel the same or better the next morning, not to “prove” fitness. You’ll keep cadence high and stride short to reduce braking.': 'Nå gjeninnfører vi støt i kontrollerte doser: korte gå–jogg‑intervaller på mykt underlag, samtidig som du beholder leggstyrke og fotkontroll. Målet er å være lik eller bedre neste morgen—ikke å “bevise” formen. Hold høy frekvens og kortere steg for å redusere bremsing.',
    'We build running confidence by slightly increasing jog time while keeping strength work consistent. This week is about repeatability: same-day feels fine and next-day stays calm. If you meet the criteria, you can begin sprinkling in brief firm-surface exposure.': 'Du bygger løpe‑trygghet ved å øke joggetiden litt, samtidig som styrkearbeidet holdes jevnt. Denne uken handler om gjentakbarhet: det kjennes ok samme dag og er rolig neste morgen. Hvis kriteriene er oppfylt, kan du begynne med korte innslag på litt fastere underlag.',

    // Lower Back
    'Week 1 restores spinal neutrality and deep-core control with Dead Bug, Plank, and Glute Bridge to calm symptoms.': 'Uke 1 gjenoppretter nøytral rygg og dyp kjerne-kontroll med Dead Bug, Planke og Seteløft for å dempe symptomer.',
    "Week 2 grooves the hip hinge and progresses glute work; introduce hamstring eccentrics (e.g., single‑leg RDL pattern).": 'Uke 2 finpusser hoftebøy og øker setearbeid; introduserer eksentrisk hamstrings (f.eks. ettbeins RDL-mønster).',
    'Week 3 adds functional strength—squats, hinge work, and anti‑rotation (Side Plank) with steady load.': 'Uke 3 legger til funksjonell styrke—knebøy, hoftebøy og anti‑rotasjon (sideplanke) med jevn belastning.',
    'Week 4 integrates loaded hinge, core endurance, and glute strength for return‑to‑activity.': 'Uke 4 integrerer belastet hoftebøy, kjerneutholdenhet og setestyrke for retur til aktivitet.',
    'This week is about calming flare-ups and finding a neutral spine you can keep during daily moves. You’ll practice breathing + bracing, then pair it with gentle glute work so your hips share the load. Aim to finish each session feeling looser, not “worked.”': 'Denne uken handler om å roe ned oppbluss og finne en nøytral rygg du kan holde i hverdagsbevegelser. Du trener pust + buktrykk, og kombinerer det med lett setearbeid så hoftene tar mer av belastningen. Målet er å avslutte hver økt litt løsere – ikke utslitt.',
    'We start building capacity by teaching your hips to hinge while your trunk stays steady. Glute bridges progress, and hamstrings get slow, controlled work to support bending and picking things up.': 'Vi bygger kapasitet ved å lære hoftene å hoftebøye mens overkroppen holder seg stabil. Seteløft progresseres, og hamstrings får rolig, kontrollert arbeid som støtter bøy og løft i hverdagen.',
    'This week looks more like normal training: squats + hinges with steady core control. Anti-rotation work builds tolerance for carrying, reaching, and asymmetrical tasks.': 'Denne uken ligner mer på vanlig trening: knebøy + hoftebøy med stabil kjerne-kontroll. Anti-rotasjon bygger toleranse for bæring, rekke-bevegelser og asymmetriske oppgaver.',
    'You’ll integrate light loaded hinge work and longer core sets so bending/lifting in real life feels predictable. The goal is confidence and consistency, not max strength.': 'Du integrerer lett belastet hoftebøy og lengre kjerne-sett slik at bøy/løft i praksis føles forutsigbart. Målet er trygghet og jevnhet – ikke maks styrke.',
    // Runner's Knee
    "Week 1 reduces patellofemoral irritation with hip abduction (glute med), wall sits, and incline walking.": 'Uke 1 reduserer patellofemoral irritasjon med hofteabduksjon (glute med), veggsitt og gange i motbakke.',
    'Week 2 adds bodyweight squats and lunges to improve single‑leg control and knee tracking.': 'Uke 2 legger til knebøy og utfall med kroppsvekt for bedre ettbeinskontroll og knesporing.',
    'Week 3 builds eccentric control (step‑downs) and single‑leg strength (Bulgarian split squats).': 'Uke 3 bygger eksentrisk kontroll (step‑downs) og ettbeinsstyrke (bulgarske splittknebøy).',
    'Week 4 layers gradual jog mileage onto maintained single‑leg strength for resilient knees.': 'Uke 4 øker joggedistanse gradvis samtidig som ettbeinsstyrke vedlikeholdes for robuste knær.',
    // Shoulder
    'Week 1 restores pain‑free shoulder motion via band pull‑aparts and external rotations with scapular control.': 'Uke 1 gjenoppretter smertefri skulderbevegelse med strikk-drag og utadrotasjon med skulderbladskontroll.',
    'Week 2 builds cuff endurance with higher reps/holds while keeping motion pain‑free.': 'Uke 2 bygger cuff‑utholdenhet med flere repetisjoner/hold og smertefri bevegelse.',
    'Week 3 adds light rows and controlled vertical press while maintaining cuff work.': 'Uke 3 legger til lette roinger og kontrollert vertikal press samtidig som cuff‑arbeid opprettholdes.',
    'Week 4 progresses to dumbbell overhead strength with full‑range control and stable scapulae.': 'Uke 4 går videre til manual-press over hodet med full kontroll og stabile skulderblad.',
    // Ankle
    'Week 1 restores pain‑free ankle motion with light jogging in place and double‑leg calf raises to manage swelling.': 'Uke 1 gjenoppretter smertefri ankelbevegelse med lett jogging på stedet og tåhev med begge bein for å håndtere hevelse.',
    'Week 2 adds calf strength (double‑leg + eccentric single‑leg) and hip abduction for ankle control.': 'Uke 2 legger til leggstyrke (dobbel + eksentrisk ettbeins) og hofteabduksjon for ankelkontroll.',
    'Week 3 emphasizes single‑leg control and balance with unilateral raises and hip abduction.': 'Uke 3 vektlegger ettbeinskontroll og balanse med unilateral tåhev og hofteabduksjon.',
    'Week 4 reintroduces short jog bouts while maintaining calf strength and hip control.': 'Uke 4 gjeninnfører korte joggebolker samtidig som leggstyrke og hoftekontroll vedlikeholdes.',
    // Tennis Elbow
    'Week 1 uses isometric wrist extension and light rotation to calm symptoms and load the tendon safely.': 'Uke 1 bruker isometrisk håndleddsstrekk og lett rotasjon for å roe symptomer og belaste sene trygt.',
    'Week 2 adds slow eccentrics for tendon remodeling while maintaining pain‑free rotation.': 'Uke 2 legger til langsomme eksentriker for senetilpasning, med fortsatt smertefri rotasjon.',
    'Week 3 increases wrist rotation control and introduces light grip endurance (hammer curls).': 'Uke 3 øker kontroll i håndleddsrotasjon og introduserer lett grep‑utholdenhet (hammercurls).',
    'Week 4 integrates functional loading so daily tasks and sport prep feel natural and pain‑free.': 'Uke 4 integrerer funksjonell belastning slik at daglige oppgaver og idrettsforberedelse kjennes naturlig og smertefri.',
    // Tech Neck
    'Week 1 reduces neck/upper‑back tension with arm circles, band pull‑aparts, trunk rotation, and gentle cuff work.': 'Uke 1 reduserer spenning i nakke/øvre rygg med armerundinger, strikk-drag, rotasjon og skånsomt cuff‑arbeid.',
    'Week 2 builds upper‑back endurance with band rows and cuff work to support posture.': 'Uke 2 bygger øvre rygg‑utholdenhet med strikkroing og cuff‑arbeid for bedre holdning.',
    'Week 3 raises volume and adds anti‑rotation for lasting postural endurance.': 'Uke 3 øker volum og legger til anti‑rotasjon for varig holdningsutholdenhet.',
    'Week 4 anchors alignment into daily habits while maintaining upper‑back/cuff strength.': 'Uke 4 forankrer holdning i daglige vaner og vedlikeholder øvre rygg/cuff‑styrke.',
    // Plantar Fasciitis
    'Week 1 reduces heel pain with calf pumps and gentle walking tolerance; keep loads sub‑symptomatic.': 'Uke 1 demper hælsmerte med leggpumpe og skånsom gangtoleranse; hold belastning under symptomnivå.',
    'Week 2 adds calf eccentrics and toe control to stimulate tissue remodeling.': 'Uke 2 legger til eksentrisk legg og tåkontroll for vevsremodellering.',
    'Week 3 builds single‑leg control and midfoot strength to prep for longer walks.': 'Uke 3 bygger ettbeinskontroll og midtfotsstyrke som forberedelse til lengre turer.',
    'Week 4 increases functional loading for brisk walking and early return to impact.': 'Uke 4 øker funksjonell belastning for rask gange og tidlig retur til støt.',
    // Hamstring
    'Week 1 restores mobility and introduces pain‑free hamstring isometrics and bridges.': 'Uke 1 gjenoppretter mobilitet og introduserer smertefrie hamstrings‑isometrier og broer.',
    'Week 2 adds eccentric hamstring work (RDL/Nordic regressions) with steady glute volume.': 'Uke 2 legger til eksentrisk hamstrings (RDL/Nordic regresjoner) med jevnt setearbeid.',
    'Week 3 emphasizes single‑leg hip hinge and trunk‑pelvis coordination.': 'Uke 3 vektlegger ettbeins hoftebøy og koordinasjon mellom kjerne og bekken.',
    'Week 4 reintroduces short jog bouts while maintaining eccentric work and hip strength.': 'Uke 4 gjeninnfører korte joggebolker samtidig som eksentrisk arbeid og hoftestyrke vedlikeholdes.',
    // Upper Back & Core Reset
    'Week 1 focuses on gentle spinal mobility and basic postural awareness to counteract forward positioning.': 'Uke 1 fokuserer på skånsom ryggmobilitet og grunnleggende holdningsbevissthet for å motvirke fremoverposisjonering.',
    'Week 2 introduces controlled pulling and shoulder blade activation.': 'Uke 2 introduserer kontrollert trekk og skulderbladaktivering.',
    'Week 3 adds time-under-tension and stability work for endurance.': 'Uke 3 legger til tid‑under‑spenning og stabilitetsarbeid for utholdenhet.',
    'Week 4 integrates core and full-body posture control for daily function.': 'Uke 4 integrerer kjerne og helkroppskontroll av holdning for daglig funksjon.',
    // Core Stability
    'Week 1 focuses on reactivating your deep core muscles and practicing control.': 'Uke 1 fokuserer på reaktivering av dype kjernemuskler og kontroll.',
    'Week 2 adds time under tension and limb coordination.': 'Uke 2 legger til tid under spenning og koordinasjon.',
    'Week 3 incorporates balance, anti-rotation, and lateral core engagement.': 'Uke 3 inkluderer balanse, anti‑rotasjon og lateral kjernemuskulatur.',
    'Week 4 transitions to longer holds and multi-planar control.': 'Uke 4 går over til lengre hold og multiplanar kontroll.',
  };

  const timeframeMap: Record<string, string> = {
    // Shin Splints (MTSS)
    'Do the strength sessions 3x/week and replace runs with Zone 2 bike/row/elliptical for 15–25 min. Keep impact exposure to short, flat, soft-surface walks only if symptoms stay ≤3/10 and don’t worsen the next day. Prioritize supportive shoes and a slightly higher cadence/shorter stride on any walks.': 'Gjør styrkeøktene 3x/uke og bytt ut løping med Zone 2 sykkel/roing/elliptisk i 15–25 min. Hold støtbelastning til korte, flate turer på mykt underlag kun hvis symptomer er ≤3/10 og ikke blir verre neste dag. Prioriter støttende sko og litt høyere frekvens/kortere steg på gåturene.',
    'Use a slow eccentric (3–4 sec lowering) and stop sets at mild discomfort (≤3/10). Add 5–10 min soft-surface cadence walks 2–3x/week, and only increase time if next-day pain is stable. Keep cross-training Zone 2 on other days to maintain fitness.': 'Bruk langsom eksentrisk fase (3–4 sek senk) og stopp settene ved mildt ubehag (≤3/10). Legg til 5–10 min kadens‑fokusert gange på mykt underlag 2–3x/uke, og øk kun tiden hvis neste dags smerte er stabil. Hold Zone 2 kryss-trening på andre dager for å vedlikeholde kondisjon.',
    'Start with 1:1 walk–jog (60s/60s) for 10–12 rounds on grass/track, 2–3x/week, with a rest day after. Keep calf eccentrics 2x/week and stop the jog portion if pain climbs above 3/10. If mornings are calm, add 1–2 rounds next session.': 'Start med 1:1 gå–jogg (60s/60s) i 10–12 runder på gress/bane, 2–3x/uke, med hviledag etter. Behold legg-eksentriker 2x/uke og stopp joggedelen hvis smerte går over 3/10. Hvis morgener er rolige, legg til 1–2 runder neste økt.',
    'Move to 2:1 jog:walk (120s/60s) for 8–10 rounds on track/grass, 2–3 sessions/week, with at least 1 rest day between. Increase total run time by ~10% per week and keep cadence high/stride short. Optional: add 2–3% incline walking only if you’re pain-free the next morning.': 'Gå over til 2:1 jogg:gange (120s/60s) i 8–10 runder på bane/gress, 2–3 økter/uke, med minst 1 hviledag mellom. Øk total løpetid med ca. 10% per uke og hold høy frekvens/kortere steg. Valgfritt: legg til 2–3% stigning på gange kun hvis du er smertefri neste morgen.',

    // Lower Back
    'Anti‑extension core (Dead Bug, Plank) and glute bridging reduce lumbar load and re‑train positioning for daily moves.': 'Anti‑ekstensjon kjerne (Dead Bug, Planke) og seteløft reduserer belastning på korsrygg og gjenlærer posisjonering til hverdagsbevegelser.',
    'Single‑leg and hinge variations load hips—not spine—while building time‑under‑tension safely.': 'Ettbeins- og hoftebøyvarianter belaster hofter—ikke rygg—og bygger tid under spenning trygt.',
    'Progress volume/load while keeping spine neutral; oblique work resists unwanted trunk motion.': 'Øk volum/belastning med nøytral rygg; skrå magemuskler motstår uønsket bevegelse i overkroppen.',
    'Gradually increase load on hinge and trunk while maintaining neutral mechanics.': 'Øk gradvis belastning på hoftebøy og kjerne med nøytral mekanikk.',
    'Do 3 short sessions (Mon/Wed/Fri style). Keep pain ≤3/10 during and the next morning. Move slowly, breathe out as you brace, and stop the set if form slips. Optional: 10–20 min easy walking on non-training days.': 'Gjør 3 korte økter (typisk man/ons/fre). Hold smerte ≤3/10 underveis og neste morgen. Beveg deg rolig, pust ut når du spenner opp, og stopp settet hvis teknikken glipper. Valgfritt: 10–20 min rolig gange på fridager.',
    'Use a controlled tempo (about 3 sec down) and keep ribs stacked over pelvis. Increase reps/load only if next-day symptoms are stable. If pain rises above 3/10, shorten range or reduce load.': 'Bruk kontrollert tempo (ca. 3 sek ned) og hold ribbene stablet over bekkenet. Øk reps/belastning kun hvis neste dags symptomer er stabile. Hvis smerte stiger over 3/10, forkort bevegelsesutslag eller reduser belastning.',
    'Keep technique first: neutral spine, controlled lowering, and even weight through both feet. If you add load, add small increments (one step at a time) and keep 1–2 reps in reserve.': 'Prioriter teknikk: nøytral rygg, kontrollert senk og jevn vekt på begge føtter. Hvis du øker belastning, øk i små steg og ha 1–2 repetisjoner i reserve.',
    'Progress load or time under tension conservatively (about 5–10%/week). Stop sets when form changes, and prioritize breathing/bracing on every rep.': 'Øk belastning eller tid under spenning konservativt (ca. 5–10% per uke). Stopp sett når teknikken endrer seg, og prioriter pust/buktrykk på hver repetisjon.',
    // Runner's Knee
    'Glute med activation (Side‑lying Abduction), quad isometrics (Wall Sit), and walking keep load knee‑friendly.': 'Glute med‑aktivering (sideliggende abduksjon), lår‑isometrisk (veggsitt) og gange holder belastning knevennlig.',
    'Hip‑dominant cues + slow tempo reinforce patella tracking without irritating compressive angles.': 'Hoftedominante signaler + rolig tempo styrker patellasporing uten å irritere kompresjonsvinkler.',
    'Emphasize slow lowering and hip stability to prep for return‑to‑run.': 'Vektlegg langsom senking og hofte-stabilitet for å forberede retur til løp.',
    'Progress intervals conservatively while keeping hip/quad work to protect the patellofemoral joint.': 'Øk intervaller konservativt og oppretthold hofte/lårarbeid for å beskytte PF‑leddet.',
    // Shoulder
    'Band Pull‑Apart (shoulders‑30) + External Rotation (shoulders‑94) build upward rotation and cuff endurance.': 'Strikk-drag (shoulders‑30) + utadrotasjon (shoulders‑94) bygger oppadrotasjon og cuff‑utholdenhet.',
    'Progress band ER (shoulders‑94) + pull‑aparts (shoulders‑30) to prep for pressing/pulling.': 'Øk strikk‑ER (shoulders‑94) + pull‑aparts (shoulders‑30) som forberedelse til press/trekk.',
    'Combine band ER, pull‑aparts, and light press to restore coordinated overhead control.': 'Kombiner strikk‑ER, pull‑aparts og lett press for koordinert kontroll over hodet.',
    'Slight load increases on cuff + press patterns prepare for normal training.': 'Små belastningsøkninger på cuff + pressmønstre forbereder normal trening.',
    // Ankle
    'Jog in place (warmup‑6) and calf pumps (calves‑6) aid lymph flow and restore tolerance.': 'Jogging på stedet (warmup‑6) og legg‑pumpe (calves‑6) bedrer lymfeflyt og toleranse.',
    'Calves‑6 + Calves‑63 build tendon tolerance; glute med work improves stance stability.': 'Calves‑6 + Calves‑63 bygger senetoleranse; glute med‑arbeid bedrer standstabilitet.',
    'Single‑leg calf work (calves‑12) + glute med build ankle strategy for uneven ground.': 'Ettbeins tåhev (calves‑12) + glute med bygger ankelstrategi for ujevnt underlag.',
    'Alternate easy jog/walk and sustain calf work to protect the ankle under impact.': 'Veksle lett jogg/gange og oppretthold leggarbeid for å beskytte ankelen ved støt.',
    // Tennis Elbow
    'Wrist isometrics (forearms‑1) and light rotations (forearms‑2) reduce pain sensitivity and start capacity.': 'Håndleddsisometrier (forearms‑1) og lette rotasjoner (forearms‑2) reduserer smertesensitivitet og bygger kapasitet.',
    'Eccentric wrist extension builds capacity; rotation stays light and controlled.': 'Eksentrisk håndleddsstrekk bygger kapasitet; rotasjon forblir lett og kontrollert.',
    'Controlled rotation with gradual time‑under‑tension supports return to function.': 'Kontrollert rotasjon med gradvis tid under spenning støtter retur til funksjon.',
    'Blend rotation, wrist work, and light compound tasks to finish rehab.': 'Bland rotasjon, håndleddstrening og lette sammensatte oppgaver for å fullføre rehab.',
    // Tech Neck
    'Arm Circles (warmup‑8), Band Pull‑Apart, Trunk Rotation (warmup‑9), and ER build posture without strain.': 'Armrullinger (warmup‑8), strikk‑pull‑apart, rotasjon (warmup‑9) og utadrotasjon bygger holdning uten belastning.',
    'High standing band row (upper‑back‑60) + band ER (shoulders‑94) reduce neck reliance on traps.': 'Høy stående strikk‑roing (upper‑back‑60) + strikk‑ER (shoulders‑94) reduserer nakkebelastning på trapezius.',
    'Face‑pull/rows + oblique work reinforce thoracic extension and rib cage alignment.': 'Face‑pull/roing + skrå mage styrker thorakal ekstensjon og ribbekasse‑justering.',
    'Short, frequent posture breaks + 2x/week rows/ER keep gains sticky.': 'Korte, hyppige holdningspauser + roing/ER 2x/uke gjør fremgangen varig.',
    // Plantar Fasciitis
    'Double‑leg calf raises and easy marching restore blood flow without irritating the fascia.': 'Tåhev med begge bein og lett marsj gjenoppretter blodtilførsel uten å irritere fascien.',
    'Calves‑63 eccentrics improve tendon/fascia capacity; maintain low‑pain walking.': 'Eksentrisk Calves‑63 bedrer sene/fascie‑kapasitet; oppretthold lavsmertende gange.',
    'Single‑leg calf raises and hip abduction reinforce arch support and gait stability.': 'Ettbeins tåhev og hofteabduksjon forsterker fotbue og gangstabilitet.',
    'Sustain eccentrics and add volume to tolerate longer, faster walks.': 'Vedlikehold eksentriker og øk volum for å tåle lengre, raskere turer.',
    // Hamstring
    'Glute bridges and single‑leg RDL patterning (short ROM) engage posterior chain without flare‑ups.': 'Setebro og ettbeins RDL‑mønster (kort ROM) aktiverer baksidekjeden uten oppbluss.',
    'Slow eccentrics build resilience; volume kept modest to avoid setbacks.': 'Langsomme eksentriker bygger robusthet; moderat volum for å unngå tilbakeslag.',
    'Single‑leg RDL and hip thrust variants improve symmetry and control for daily tasks.': 'Ettbeins RDL og hip thrust‑varianter bedrer symmetri og kontroll i hverdagen.',
    'Keep eccentrics and hinge strength while adding conservative jog volume.': 'Behold eksentriker og hoftebøy‑styrke mens joggevolum økes forsiktig.',
    // Upper Back & Core Reset
    'Start with gentle extension exercises and breathing pattern correction for postural improvement.': 'Start med skånsom ekstensjon og pustemønster‑korreksjon for bedre holdning.',
    'Build scapular control and strengthen the muscles that support good posture.': 'Bygg skulderbladskontroll og styrk musklene som støtter god holdning.',
    'Challenge your postural muscles with longer holds and stability exercises.': 'Utfordre holdningsmuskler med lengre hold og stabilitetsøvelser.',
    'Combine all elements for comprehensive postural control and strength.': 'Kombiner alt for helhetlig holdningskontroll og styrke.',
    // Core Stability
    'Begin with basic core stabilization exercises to build foundational strength.': 'Start med grunnleggende kjernestabilisering for å bygge grunnstyrke.',
    'Challenge your core stability with longer holds and coordinated movements.': 'Utfordre kjernestabilitet med lengre hold og koordinerte bevegelser.',
    'Challenge your core with stability exercises and multi-directional control.': 'Utfordre kjernen med stabilitetsøvelser og flerveis kontroll.',
    'Master advanced core stability for preparation to more demanding training.': 'Mestre avansert kjernestabilitet som forberedelse til mer krevende trening.',
  };

  const expectedMap: Record<string, string> = {
    // Shin Splints (MTSS)
    'Lower shin tenderness to touch, and normal walking/stairs feel easier the next day. You should tolerate light calf work without a symptom spike.': 'Mindre ømhet i leggen ved berøring, og vanlig gange/trapper føles lettere neste dag. Du bør tåle lett leggarbeid uten symptomøkning.',
    'Better walking tolerance with less next-day shin soreness, and improved calf fatigue resistance. Tenderness should trend down or stay stable week-to-week.': 'Bedre gangtoleranse med mindre ømhet i leggen neste dag, og bedre utholdenhet i leggen. Ømheten bør gå ned eller holde seg stabil fra uke til uke.',
    'Comfortable short jog intervals with minimal next-day tenderness and no increase in baseline pain. Calf work feels strong and controlled.': 'Komfortable korte joggeintervaller med minimal ømhet neste dag og ingen økning i grunnsmerte. Leggarbeidet føles sterkt og kontrollert.',
    'Able to jog 15–20 minutes total on soft surface with minimal soreness the next day. You feel ready to progress gradually rather than needing longer rest after runs.': 'I stand til å jogge 15–20 minutter totalt på mykt underlag med minimal ømhet neste dag. Du føler deg klar for gradvis progresjon uten å trenge lengre restitusjon etter løp.',

    // Lower Back
    'Less morning stiffness; easier sit‑to‑stand and bend within pain‑free range.': 'Mindre morgenstivhet; lettere å reise seg og bøye innen smertefri grense.',
    'More confident hip hinging and lifting light loads with stable trunk.': 'Mer trygg hoftebøy og løft av lette vekter med stabil kjerne.',
    'Stronger, pain‑tolerant hinge/squat patterns and improved trunk endurance.': 'Sterkere, mer smerte‑tolerante hoftebøy/knebøy‑mønstre og bedre kjerneutholdenhet.',
    'Comfort with routine bending/lifting; minimal flare‑ups at daily loads.': 'Komfort ved daglige bøy/løft; minimale oppbluss ved daglig belastning.',
    'Less morning stiffness; sit-to-stand and light bending feel easier and more controlled.': 'Mindre morgenstivhet; lettere og mer kontrollert oppreisning og lett bøy.',
    'Hinging and lifting light objects feels smoother; less “grabbing” in the low back.': 'Hoftebøy og lette løft føles jevnere; mindre “klyping” i korsryggen.',
    'Better endurance in trunk and legs; daily tasks provoke fewer flare-ups.': 'Bedre utholdenhet i kjerne og bein; hverdagsoppgaver gir færre oppbluss.',
    'Routine bending and light lifting feel normal; flare-ups are rarer and smaller.': 'Vanlig bøy og lette løft føles normalt; oppbluss kommer sjeldnere og blir mindre.',
    // Runner's Knee
    'Less front‑of‑knee pain; easier stairs and sit‑to‑stand at low loads.': 'Mindre framsidesmerter i kne; enklere trapper og oppreisning ved lav belastning.',
    'Smoother single‑leg mechanics; improved tolerance to sit‑to‑stand and stairs.': 'Glattere ettbeinsmekanikk; bedre toleranse for oppreisning og trapper.',
    'Comfortable step‑downs and Bulgarians; stairs feel stable.': 'Komfortable step‑downs og bulgarske; trapper føles stabile.',
    'Comfortable 15–20 min jogs with stable knees and minimal soreness.': 'Komfortable 15–20 min joggeturer med stabile knær og minimal ømhet.',
    // Shoulder
    'Less pinching; easier shoulder elevation within a comfortable range.': 'Mindre klemming; lettere skulderløft innen komfortabelt område.',
    'Better overhead tolerance and less fatigue with daily reaching.': 'Bedre toleranse over hodet og mindre tretthet ved daglige løft.',
    'Controlled rows/presses with minimal irritation; posture feels steadier.': 'Kontrollerte roinger/presser med minimal irritasjon; holdning føles stødigere.',
    'Pain‑free overhead motion and confidence pressing light‑moderate loads.': 'Smertefri bevegelse over hodet og trygghet med lette/moderate press.',
    // Ankle
    'Less swelling; calmer walking and easy stairs.': 'Mindre hevelse; roligere gange og enkle trapper.',
    'Stronger push‑off and better control on stairs with minimal swelling.': 'Sterkere fraspark og bedre kontroll i trapper med minimal hevelse.',
    'Steadier single‑leg balance; confident gait on small irregularities.': 'Stødigere ettbeinsbalanse; trygg gange på små ujevnheter.',
    'Comfortable 8–12 min jogs with stable foot strike and minimal swelling.': 'Komfortable 8–12 min joggeturer med stabil fotisett og minimal hevelse.',
    // Tennis Elbow
    'Lower resting pain; easier light grip/typing and daily tasks.': 'Lavere hvilesmerte; lettere lett grep/tasting og daglige oppgaver.',
    'Improved tolerance to gripping and lifting light objects.': 'Bedre toleranse for grep og løft av lette gjenstander.',
    'Smoother rotation; light carries and household tasks feel fine.': 'Glattere rotasjon; lette bæringer og husarbeid føles fint.',
    'Grip, lift, and type pain‑free with confident wrist extension.': 'Grep, løft og tasting smertefritt med trygg håndleddsstrekk.',
    // Tech Neck
    'Less neck tightness; better ability to sit tall without fatigue.': 'Mindre nakkestivhet; bedre evne til å sitte oppreist uten å bli sliten.',
    'Stronger mid‑back; longer screen time with less neck fatigue.': 'Sterkere midtrygg; lengre skjermtid med mindre nakkeslitasje.',
    'Able to hold upright posture longer with minimal neck tightness.': 'Kan holde oppreist holdning lenger med minimal nakkespenn.',
    'Noticeably less neck tension; posture holds automatically longer.': 'Merkbart mindre nakkespenning; holdningen holder seg lenger automatisk.',
    // Plantar Fasciitis
    'Lower morning pain; easier first steps and short walks.': 'Lavere morgensmerte; enklere første skritt og korte turer.',
    'Smoother walking and improved push‑off with less heel soreness.': 'Glattere gange og bedre fraspark med mindre ømhet i hælen.',
    'Better balance; longer walks with minimal morning stiffness.': 'Bedre balanse; lengre turer med minimal morgenstivhet.',
    'Brisk walks and long stands are comfortable with minimal flare‑ups.': 'Rask gange og lang ståtid er komfortabelt med minimale oppbluss.',
    // Hamstring
    'Less tightness; comfortable walking and gentle hip hinge.': 'Mindre stramhet; komfortabel gange og skånsom hoftebøy.',
    'Improved tolerance to bending and light picking tasks.': 'Bedre toleranse for bøying og lette løft.',
    'Controlled single‑leg loading; reduced fear with bending/lifting.': 'Kontrollert ettbeinsbelastning; mindre frykt for bøying/løft.',
    'Pain‑free short jogs; confident hinge under daily loads.': 'Smertefrie korte joggeturer; trygg hoftebøy ved daglig belastning.',
    // Upper Back & Core Reset
    'Reduced upper back tension and improved postural awareness during daily activities.': 'Redusert spenning i øvre rygg og bedre holdningsbevissthet i hverdagen.',
    'Better shoulder blade control and reduced upper back tension.': 'Bedre skulderbladskontroll og mindre spenning i øvre rygg.',
    'Improved postural endurance and strength for maintaining good alignment.': 'Bedre holdningsutholdenhet og styrke for god justering.',
    'Visibly better posture and reduced shoulder fatigue during daily activities.': 'Synlig bedre holdning og mindre skuldertretthet i hverdagen.',
    // Core Stability
    'Improved core activation and better control in basic positions.': 'Bedre kjerneaktivering og kontroll i grunnposisjoner.',
    'Improved core endurance and better stability during movement.': 'Bedre kjerneutholdenhet og stabilitet under bevegelse.',
    'Better balance and control in challenging positions.': 'Bedre balanse og kontroll i krevende posisjoner.',
    'Strong, stable core with better posture and movement control.': 'Sterk, stabil kjerne med bedre holdning og bevegelseskontroll.',
  };

  const nextStepsMap: Record<string, string> = {
    // Shin Splints (MTSS)
    'Week 2 adds slow eccentrics and short cadence-focused walks to start rebuilding impact tolerance. If mornings stay calm, we’ll gradually increase walk time before any jogging.': 'Uke 2 legger til langsomme eksentriker og korte kadens‑fokuserte gåturer for å bygge opp støt-toleranse. Hvis morgener holder seg rolige, øker vi gåtiden gradvis før vi begynner å jogge.',
    'Week 3 introduces walk–jog intervals on grass/track while keeping eccentrics and single-leg control. If pain stays ≤2/10 the next morning, we progress the total interval time.': 'Uke 3 introduserer gå–jogg‑intervaller på gress/bane, samtidig som du beholder eksentriker og ettbeinskontroll. Hvis smerte er ≤2/10 neste morgen, øker vi total intervalltid.',
    'Week 4 moves toward longer jog blocks (2:1) and a small increase in total time. We’ll start a gradual transition back toward firmer surfaces only when symptoms are stable.': 'Uke 4 går mot lengre joggebolker (2:1) og en liten økning i total tid. Vi starter gradvis overgang til fastere underlag først når symptomene er stabile.',
    'Continue the ~10% rule for 2–3 more weeks, then reintroduce road surfaces gradually (short segments first). Once you’re symptom-free for 2 weeks, you can start gentle hills and strides.': 'Fortsett ~10%-regelen i 2–3 uker til, og gjeninnfør vei-underlag gradvis (korte segmenter først). Når du har vært symptomfri i 2 uker, kan du starte med forsiktige bakker og korte stigningsløp.',

    // Lower Back
    'Add hip‑hinge patterning and gentle hamstring loading in Week 2.': 'Legg til hoftebøy‑mønster og skånsom hamstrings‑belastning i uke 2.',
    'Advance volume and integrate squats/anti‑rotation work in Week 3.': 'Øk volum og integrer knebøy/anti‑rotasjon i uke 3.',
    'Integrate more complex patterns and mild loaded hinge in Week 4.': 'Integrer mer komplekse mønstre og lett belastet hoftebøy i uke 4.',
    'Maintain 2–3x/week; progress hinge load and overall volume as tolerated.': 'Vedlikehold 2–3x/uke; øk hoftebøy‑belastning og totalvolum etter toleranse.',
    'Week 2 adds hip-hinge patterning and slow hamstring loading so you can lift and bend with confidence.': 'Uke 2 legger til hoftebøy-mønster og rolig hamstrings-belastning slik at du kan bøye og løfte med trygghet.',
    'Week 3 adds squat patterns and more anti-rotation to handle everyday twisting/uneven loads.': 'Uke 3 legger til knebøy-mønstre og mer anti-rotasjon for å tåle hverdagslig vridning/ujevn belastning.',
    'Week 4 introduces light loaded hinge/carry-over work to prepare for normal lifting.': 'Uke 4 introduserer lett belastet hoftebøy/overføringsarbeid for å forberede normal løfting.',
    'Maintain 2–3 sessions/week, then gradually return to your usual strength plan while keeping 1 core session as insurance.': 'Vedlikehold 2–3 økter/uke, og gå gradvis tilbake til din vanlige styrkeplan mens du beholder 1 kjerneøkt som “forsikring”.',
    // Runner's Knee
    "Add controlled squats/lunges in Week 2 if pain ≤3/10.": 'Legg til kontrollerte knebøy/utfall i uke 2 hvis smerte ≤3/10.',
    'Introduce step‑downs and Bulgarians in Week 3.': 'Introduser step‑downs og bulgarske i uke 3.',
    'Start jog intervals in Week 4 if pain ≤3/10 during/after.': 'Start joggeintervaller i uke 4 hvis smerte ≤3/10 under/etter.',
    'Build mileage ~10%/week and reintroduce speed only if pain‑free.': 'Øk distanse ~10%/uke og reintroduser fart kun hvis smertefri.',
    // Shoulder
    'Increase reps/holds and add light flexion work in Week 2.': 'Øk reps/hold og legg til lett fleksjon i uke 2.',
    'Add light rows and safe‑range pressing in Week 3.': 'Legg til lette roinger og trygg press i uke 3.',
    'Increase resistance and range in Week 4 if pain‑free.': 'Øk motstand og bevegelsesutslag i uke 4 hvis smertefri.',
    'Keep weekly cuff work; progress dumbbell loads gradually.': 'Behold ukentlig cuff‑arbeid; øk manual‑belastning gradvis.',
    // Ankle
    'Begin strength return with double‑/eccentric raises in Week 2.': 'Start styrketilbakekomst med dobbel/eksentrisk tåhev i uke 2.',
    'Add single‑leg control and balance in Week 3.': 'Legg til ettbeinskontroll og balanse i uke 3.',
    'Reintroduce light jogging in Week 4.': 'Gjeninnfør lett jogging i uke 4.',
    'Build volume conservatively; add gentle plyos only if fully pain‑free.': 'Bygg volum konservativt; legg til skånsomme plyos kun hvis helt smertefri.',
    // Tennis Elbow
    'Introduce slow eccentrics in Week 2 if pain ≤3/10.': 'Introduser langsomme eksentriker i uke 2 hvis smerte ≤3/10.',
    'Add rotation volume and light hammer curls in Week 3.': 'Legg til rotasjonsvolum og lette hammercurls i uke 3.',
    'Integrate compound loading and carryover in Week 4.': 'Integrer sammensatt belastning og overføring i uke 4.',
    'Progress to normal strength work; maintain rotation/ER weekly.': 'Gå videre til normal styrketrening; vedlikehold rotasjon/ER ukentlig.',
    // Tech Neck
    'Add upper‑back row volume and longer ER sets in Week 2.': 'Legg til mer ro‑volum for øvre rygg og lengre ER‑sett i uke 2.',
    'Increase endurance and add anti‑rotation in Week 3.': 'Øk utholdenhet og legg til anti‑rotasjon i uke 3.',
    'Integrate habits and maintain 2x/week strength in Week 4.': 'Integrer vaner og vedlikehold styrke 2x/uke i uke 4.',
    'Maintain 2x/week rows/ER and 1 daily mobility drill.': 'Vedlikehold ro/ER 2x/uke og én daglig mobilitetsøvelse.',
    // Plantar Fasciitis
    'Add calf eccentrics in Week 2 if pain ≤3/10.': 'Legg til eksentrisk legg i uke 2 hvis smerte ≤3/10.',
    'Progress to balance and midfoot strength in Week 3.': 'Gå videre til balanse og midtfotsstyrke i uke 3.',
    'Increase functional loading in Week 4.': 'Øk funksjonell belastning i uke 4.',
    'Maintain calves 2x/week; ramp to light jog/hike as pain allows.': 'Vedlikehold legg 2x/uke; øk til lett jogg/tur etter toleranse.',
    // Hamstring
    'Add controlled eccentrics in Week 2.': 'Legg til kontrollerte eksentriker i uke 2.',
    'Progress to single‑leg control in Week 3.': 'Gå videre til ettbeinskontroll i uke 3.',
    'Introduce light jog intervals in Week 4 if pain ≤3/10.': 'Introduser lette joggeintervaller i uke 4 hvis smerte ≤3/10.',
    'Build run distance gradually; keep weekly hamstring eccentrics.': 'Bygg løpedistanse gradvis; behold ukentlig hamstrings‑eksentriker.',
    // Upper Back & Core Reset
    'Progress to Week 2 for targeted pulling movements and posterior chain strengthening.': 'Gå videre til uke 2 for målrettede trekk og styrking av baksidekjeden.',
    'Continue to Week 3 for endurance and time-under-tension training.': 'Fortsett til uke 3 for utholdenhet og tid‑under‑spenning.',
    'Progress to Week 4 for core-integrated posture training.': 'Gå videre til uke 4 for kjerneintegrert holdningstrening.',
    'Maintain progress with upper back training twice per week and daily mobility.': 'Vedlikehold fremgangen med øvre rygg 2x/uke og daglig mobilitet.',
    // Core Stability
    'Progress to Week 2 for time under tension and movement coordination.': 'Gå videre til uke 2 for tid under spenning og bevegelser.',
    'Continue to Week 3 for balance and anti-rotation challenges.': 'Fortsett til uke 3 for balanse og anti‑rotasjon.',
    'Progress to Week 4 for multi-planar core integration.': 'Gå videre til uke 4 for multiplanar kjerneintegrasjon.',
    'Progress to resistance training or maintain with 1-2 core sessions weekly.': 'Gå videre til styrketrening eller vedlikehold med 1–2 kjerneøkter ukentlig.',
  };

  const notToDoMap: Record<string, string> = {
    // Shin Splints (MTSS)
    'Avoid running, jumping, hills, and hard surfaces this week—especially when sore or fatigued. Don’t push through sharp or increasing tibial pain; if symptoms worsen the next morning, reduce volume.': 'Unngå løping, hopping, bakker og hardt underlag denne uken—særlig når du er øm eller sliten. Ikke press gjennom skarp/økende smerte i tibia; hvis du er verre neste morgen, reduser volumet.',
    'Skip hills, speed work, and hard-surface mileage; keep pain ≤3/10 and avoid “testing” the leg with a hard run. If soreness lingers >24 hours, cut the next session volume by 20–30%.': 'Dropp bakker, fart og kilometer på hardt underlag; hold smerte ≤3/10 og unngå å “teste” leggen med en hard økt. Hvis ømhet varer >24 timer, kutt volumet i neste økt med 20–30%.',
    'Avoid volume spikes, hills, sprints, and hard surfaces; keep the “easy” in easy. Don’t change shoes and surface at the same time—change one variable per week.': 'Unngå volumtopper, bakker, spurter og hardt underlag; hold det rolig. Ikke bytt sko og underlag samtidig—endre én variabel per uke.',
    'No speed work, downhill running, or rapid jumps in volume or surface firmness. If pain rises above 3/10 or worsens the next morning, back off and repeat the previous week.': 'Ingen fart, nedoverbakke eller raske hopp i volum eller fasthet på underlag. Hvis smerte går over 3/10 eller blir verre neste morgen, trapp ned og gjenta forrige uke.',

    // Lower Back
    'No breath‑holding, end‑range spine flexion/extension, or ballistic work; stop with sharp pain.': 'Ingen pusteholding, ytterposisjon i fleksjon/ekstensjon eller ballistisk arbeid; stopp ved skarp smerte.',
    'No loaded spinal flexion, jerky tempo, or pushing past a 3/10 pain; keep reps smooth.': 'Ingen belastet ryggfleksjon, rykkete tempo eller over 3/10 smerte; hold repene jevne.',
    'No heavy spinal compression, twisting into pain, or fast range changes; quality over load.': 'Ingen tung ryggkompresjon, vridning inn i smerte eller raske bevegelsesendringer; kvalitet foran belastning.',
    'No max‑effort singles, forced end‑range extension, or pain‑provoking reps; prioritize form.': 'Ingen maks‑enkeltløft, tvunget ytterstilling i ekstensjon eller smerteprovoserende reps; prioriter teknikk.',
    'Avoid breath-holding, repeated end-range flexion/extension, and “testing” heavy lifts. If pain spikes or symptoms travel down the leg, pause and scale back.': 'Unngå å holde pusten, gjentatt enderange fleksjon/ekstensjon og å “teste” tunge løft. Hvis smerten øker kraftig eller symptomene stråler ned i benet, ta en pause og skaler ned.',
    'Don’t round under load, rush reps, or chase fatigue. Skip stretching into sharp pain; keep movements smooth and hip-dominant.': 'Ikke rund ryggen under belastning, ikke stress repetisjonene og ikke jag utmattelse. Unngå å strekke inn i skarp smerte; hold bevegelsene jevne og hoftedominante.',
    'Avoid maximal loading, fast twisting, and pushing through sharp pain. If you feel worse the next day, reduce volume by 20–30%.': 'Unngå maksimal belastning, raske vridninger og å presse gjennom skarp smerte. Hvis du er verre dagen etter, reduser volumet med 20–30%.',
    'Don’t test 1RM, force end-range extension, or grind reps. Avoid long sitting without breaks; move every 30–45 min.': 'Ikke test 1RM, ikke press enderange ekstensjon og ikke “grind” repetisjoner. Unngå lange perioder med sitting uten pauser; beveg deg hver 30–45 min.',
    // Runner's Knee
    'No downhill running, deep knee flexion under pain, or plyometrics; avoid kneecap compression positions.': 'Ingen nedoverbakke‑løping, dyp knefleksjon med smerte eller plyometrikk; unngå kneskål‑kompresjon.',
    'No fast depth changes, twisting under load, or knee‑in collapse; keep pain ≤3/10.': 'Ingen raske dybdeendringer, vridning under belastning eller kne‑inn kollaps; hold smerte ≤3/10.',
    'No sharp downhill runs, plyos, or volume spikes; keep mechanics crisp.': 'Ingen skarpe nedoverbakker, plyos eller volumtopper; hold teknikken ren.',
    'No rapid mileage/speed spikes or downhill repeats; stop if pain rises >3/10.': 'Ingen raske distanse/fart‑økninger eller nedoverbakke‑repetisjoner; stopp hvis smerte >3/10.',
    // Shoulder
    'No forced overhead range, shrugging into pain, or heavy press variations.': 'Ingen tvunget bevegelse over hodet, skuldertrekk inn i smerte eller tunge pressvarianter.',
    'No end‑range pain, fast tempos, or kipping/ballistic reps.': 'Ingen smerte i ytterstilling, raske tempo eller kipping/ballistiske reps.',
    'No grinding overhead reps, forced end‑range, or shrug‑dominant patterns.': 'Ingen "grinding" over hodet, tvunget ytterstilling eller skuldertrekk‑dominans.',
    'No rapid load jumps or pressing through pain; maintain clean tempo.': 'Ingen raske belastningshopp eller press gjennom smerte; hold jevnt tempo.',
    // Ankle
    'No cutting, unstable surfaces, or forced deep dorsiflexion; stop if swelling spikes.': 'Ingen retningsendringer, ustøtt underlag eller tvunget dyp dorsalfleksjon; stopp ved økt hevelse.',
    'No plyos, cutting, or high‑impact; keep tempo slow and pain ≤3/10.': 'Ingen plyos, retningsendringer eller høy‑impact; hold rolig tempo og smerte ≤3/10.',
    'No cutting, explosive direction changes, or painful ranges.': 'Ingen retningsendringer, eksplosive bevegelser eller smertefulle utslag.',
    'No sharp cutting or long downhill runs; stop if swelling/pain increases.': 'Ingen skarpe retningsendringer eller lange nedoverbakker; stopp ved økt smerte/hevelse.',
    // Tennis Elbow
    'No fast grip work, heavy carries, or jerky wrist extension; stop if sharp/radiating pain.': 'Ikke raskt grep, tunge bæringer eller rykkvis håndleddsstrekk; stopp ved skarp/utstrålende smerte.',
    'No jerky or fast‑loaded movements, especially wrist extension or gripping under fatigue. If pain >3/10 or lingers next day, reduce load or reps. Stop any exercise with sharp, radiating pain down the arm.': 'Ingen rykkvise eller raskt belastede bevegelser, særlig håndleddsstrekk eller grep under tretthet. Ved smerte >3/10 eller vedvarende neste dag, reduser belastning eller reps. Stopp ved skarp/utstrålende smerte nedover armen.',
    // Tech Neck
    'No shrug‑dominant lifts, forced end‑range neck stretches, or painful ranges.': 'Ingen løft dominert av skuldertrekk, tvungne nakkestrekk i ytterstilling eller smertefulle utslag.',
    'No ballistic reps; avoid forcing end‑range cervical motion.': 'Ingen ballistiske reps; unngå tvunget bevegelse i nakken ytterstilling.',
    'No long static slouching without breaks; skip shrug‑dominant work.': 'Ingen langvarig statisk krumming uten pauser; unngå skuldertrekk‑dominert arbeid.',
    // Plantar Fasciitis
    'No barefoot walking on hard floors; do not push through sharp heel pain.': 'Ikke gå barbeint på harde gulv; ikke press gjennom skarp hælsmerte.',
    // Hamstring
    'No overstretching or ballistic movements; stop if sharp pain occurs.': 'Ingen overstrekk eller ballistiske bevegelser; stopp ved skarp smerte.',
  };

  const updatedDays = program.days.map((d) => {
    const original = d.description?.trim();
    if (d.isRestDay) {
      const mappedRest = (original && restDayMap[original]) || 'Hviledag';
      return { ...d, description: mappedRest };
    }
    const mapped = (original && dayTitleMap[original]) || d.description;
    return { ...d, description: mapped };
  });

  // Also localize the short weekly summary if available
  const localizedSummary = summaryMap[program.summary?.trim()] || program.summary;
  const localizedOverview = overviewMap[program.programOverview?.trim()] || program.programOverview;
  const localizedTimeframe = timeframeMap[program.timeFrameExplanation?.trim()] || program.timeFrameExplanation;
  const localizedExpected = expectedMap[program.afterTimeFrame?.expectedOutcome?.trim()] || program.afterTimeFrame?.expectedOutcome;
  const localizedNext = nextStepsMap[program.afterTimeFrame?.nextSteps?.trim()] || program.afterTimeFrame?.nextSteps;
  const localizedNotToDo = notToDoMap[program.whatNotToDo?.trim()] || program.whatNotToDo;

  return {
    ...program,
    days: updatedDays,
    summary: localizedSummary,
    programOverview: localizedOverview,
    timeFrameExplanation: localizedTimeframe,
    afterTimeFrame: {
      expectedOutcome: localizedExpected || program.afterTimeFrame.expectedOutcome,
      nextSteps: localizedNext || program.afterTimeFrame.nextSteps,
    },
    whatNotToDo: localizedNotToDo,
  };
};

// Duration helpers for recovery programs
// NOTE: In recovery.ts we treat `exercise.duration` as MINUTES (not seconds).
// `restBetweenSets` remains in seconds.
const calculateRecoveryExerciseDurationSeconds = (exercise: any): number => {
  if (!exercise) return 0;

  if (exercise.sets && exercise.duration) {
    const holdSecondsPerSet = Number(exercise.duration) * 60;
    const totalHoldTime = exercise.sets * holdSecondsPerSet;
    const restTime = exercise.restBetweenSets
      ? (exercise.sets - 1) * exercise.restBetweenSets
      : 0;
    return totalHoldTime + restTime;
  }

  if (exercise.duration) {
    return Number(exercise.duration) * 60;
  }

  if (exercise.sets && exercise.repetitions) {
    const timePerRepSeconds = 5;
    const exerciseTimePerSet = exercise.repetitions * timePerRepSeconds;
    const totalExerciseTime = exercise.sets * exerciseTimePerSet;
    const restTime = exercise.restBetweenSets
      ? (exercise.sets - 1) * exercise.restBetweenSets
      : 0;
    return totalExerciseTime + restTime;
  }

  return 60;
};

const calculateRecoveryDayDuration = (exercises: any[]): number => {
  if (!exercises || exercises.length === 0) return 0;
  const totalSeconds = exercises.reduce((total, exercise) => {
    return total + calculateRecoveryExerciseDurationSeconds(exercise);
  }, 0);
  return Math.ceil(totalSeconds / 60);
};

const getOptionalHomeRestExercises = (program: ExerciseProgram): any[] => {
  const profile = `${(program.targetAreas || []).join(' ')} ${(program.bodyParts || []).join(' ')}`.toLowerCase();

  const isLowerLeg =
    profile.includes('shin') ||
    profile.includes('calf') ||
    profile.includes('ankle') ||
    profile.includes('foot') ||
    profile.includes('plantar');

  const isForearm = profile.includes('forearm') || profile.includes('elbow');

  const isUpperBody =
    profile.includes('shoulder') ||
    profile.includes('upper back') ||
    profile.includes('neck') ||
    profile.includes('trap');

  if (isForearm) {
    return [
      {
        exerciseId: 'warmup-8',
        sets: 1,
        repetitions: 20,
        restBetweenSets: 30,
        warmup: true,
        modification: 'Easy shoulder/arm circulation. Keep shoulders relaxed.',
      },
      {
        exerciseId: 'forearms-3',
        sets: 1,
        duration: 0.5,
        restBetweenSets: 45,
        modification: 'Light isometric hold. Stop if sharp or radiating pain.',
      },
      {
        exerciseId: 'forearms-4',
        sets: 1,
        repetitions: 12,
        restBetweenSets: 45,
        modification: 'Slow, controlled rotation in pain-free range.',
      },
    ];
  }

  if (isUpperBody) {
    return [
      {
        exerciseId: 'warmup-8',
        duration: 2,
        warmup: true,
        modification: 'Gentle range. No pinching or shrugging.',
      },
      {
        exerciseId: 'shoulders-94',
        sets: 1,
        repetitions: 12,
        restBetweenSets: 45,
        modification: 'Light band. Keep pain ≤3/10.',
      },
      {
        exerciseId: 'shoulders-30',
        sets: 1,
        repetitions: 15,
        restBetweenSets: 45,
        modification: 'Smooth reps. Keep ribs stacked over pelvis.',
      },
    ];
  }

  if (isLowerLeg) {
    return [
      {
        exerciseId: 'calves-13',
        sets: 2,
        repetitions: 12,
        restBetweenSets: 30,
        warmup: true,
        modification: 'Smooth rocks; keep heel down as tolerated. Stay pain-free or ≤2–3/10.',
      },
      {
        exerciseId: 'calves-9',
        sets: 2,
        repetitions: 15,
        restBetweenSets: 45,
        modification:
          'Light band tension. If you don’t have a band, skip this and focus on ankle mobility instead.',
      },
      {
        exerciseId: 'calves-6',
        sets: 1,
        repetitions: 12,
        restBetweenSets: 45,
        modification: 'Slow tempo; full-foot contact; stop if pain increases the next morning.',
      },
    ];
  }

  // Default: gentle trunk + glute activation for general recovery
  return [
    {
      exerciseId: 'warmup-9',
      duration: 3,
      warmup: true,
      modification: 'Comfortable range. Breathe slowly.',
    },
    {
      exerciseId: 'abs-20',
      sets: 1,
      repetitions: 6,
      restBetweenSets: 45,
      modification: 'Exhale as you brace; stop if back pain increases.',
    },
    {
      exerciseId: 'glutes-7',
      sets: 1,
      repetitions: 12,
      restBetweenSets: 45,
      modification: 'Pause 1s at top; keep pelvis level.',
    },
  ];
};

const ensureRestDaysHaveOptionalHomeExercises = (
  program: ExerciseProgram,
): ExerciseProgram => {
  const updatedDays = program.days.map((day) => {
    const isRestDay = day.isRestDay === true || day.dayType === 'rest';
    if (!isRestDay) return day;

    const hasExercises = Array.isArray(day.exercises) && day.exercises.length > 0;
    if (hasExercises) return day;

    const exercises = getOptionalHomeRestExercises(program);
    return {
      ...day,
      exercises,
      duration: calculateRecoveryDayDuration(exercises),
    };
  });

  return { ...program, days: updatedDays };
};

const isWarmupExerciseRef = (exercise: any): boolean => {
  if (!exercise) return false;
  if (exercise.warmup === true) return true;
  const exerciseId =
    typeof exercise.exerciseId === 'string' ? exercise.exerciseId : '';
  return exerciseId.startsWith('warmup-');
};

const orderWarmupsFirst = (exercises: any[]): any[] => {
  if (!Array.isArray(exercises) || exercises.length === 0) return exercises;
  const warmups = exercises.filter(isWarmupExerciseRef);
  const nonWarmups = exercises.filter((ex) => !isWarmupExerciseRef(ex));
  return [...warmups, ...nonWarmups];
};

// Helper function to create workout days with computed durations
const createWorkoutDay = (day: number, description: string, exercises: any[]) => {
  const orderedExercises = orderWarmupsFirst(exercises);
  return {
    day,
    description,
    dayType: 'strength' as const,
    exercises: orderedExercises,
    duration: calculateRecoveryDayDuration(orderedExercises),
  };
};

// ------------------------------------------------------------
// Rest‑Day Templates for BodAI Rehab Programs
// Generated: 2025‑05‑31
// ------------------------------------------------------------
// Each helper returns a ProgramDay object that fits the interfaces you
// provided (`ProgramDay`, `Exercise`, etc.) and marks the day as a rest
// day (`isRestDay: true`).
// Feel free to swap, remove, or add optional drills – they're low‑load,
// body‑part‑specific mobility / activation moves that shouldn't exceed
// RPE 3‑4.
// ------------------------------------------------------------

/* ---------------- Low‑Back Pain ---------------- */
const createLowBackRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Foundational mobility and diaphragm control
    const exercises = [
      { exerciseId: 'warmup-9', duration: 5, warmup: true, modification: 'Keep abdomen tall; rotate only to a comfortable range.' },
      { exerciseId: 'warmup-5', duration: 5, warmup: true, modification: 'Engage core lightly; avoid lumbar pain.' },
      { exerciseId: 'lower-back-4', sets: 2, repetitions: 6, restBetweenSets: 30, modification: 'Slow, controlled crossover. Keep ribs down; stop before pinching.' },
      { exerciseId: 'abs-102', sets: 1, repetitions: 6, restBetweenSets: 45, modification: 'Reach long; keep hips level. Move only as far as you can stay neutral.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add hip stability and core tension hold
    const exercises = [
      { exerciseId: 'warmup-5', duration: 5, warmup: true, modification: 'Pelvic tilt with breath coordination.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Bodyweight bridge; pause 1s at top.' },
      { exerciseId: 'lower-back-1', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Controlled extension, no pain.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Add light glute and core coordination to support spinal alignment.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add oblique anti-rotation for control
    const exercises = [
      { exerciseId: 'obliques-4', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Slow controlled movement; avoid trunk shifting.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 20, restBetweenSets: 45, modification: 'Add 2s pause at top of each rep.' },
      { exerciseId: 'lower-back-1', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Limit range if tension increases.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce deep core and oblique control while maintaining spinal neutrality.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: Breathing under load + trunk endurance
  const exercises = [
    { exerciseId: 'abs-20', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Exhale during lift, keep lumbar spine neutral.' },
    { exerciseId: 'glutes-7', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s, avoid hyperextension.' },
    { exerciseId: 'lower-back-1', sets: 2, repetitions: 8, restBetweenSets: 45, modification: 'Light lift, pause, and controlled lower.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Integrate breathing with movement and reinforce core-endurance patterns.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Runner's Knee ---------------- */
const createRunnersKneeRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Circulation + basic isometric control
    const exercises = [
      { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy marching pace; keep steps quiet and pain-free.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause 1s at the top; keep pelvis stable.' },
      { exerciseId: 'quads-193', sets: 1, duration: 0.5, restBetweenSets: 60, modification: 'Hold shallow angle (≤ 60° knee flexion).' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add reps and posterior chain balance
    const exercises = [
      { exerciseId: 'warmup-3', duration: 5, warmup: true, modification: 'Walk at incline or light uphill if available.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Controlled tempo, no pelvic tilt.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Bodyweight glute bridge, pause 1s at top.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Add posterior chain support to improve knee control without loading the joint.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add balance challenge + eccentric emphasis
    const exercises = [
      { exerciseId: 'warmup-3', duration: 5, warmup: true, modification: 'Maintain steady breathing, easy pace.' },
      { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Pause 1s at top; control descent.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Controlled tempo; focus on symmetry.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Improve balance and hip control while continuing to offload the knee.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: Reinforce glute patterning and reintroduce wall sit
  const exercises = [
    { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Slow and stable reps.' },
    { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s at top, breathe out on lift.' },
    { exerciseId: 'quads-193', sets: 1, duration: 0.67, restBetweenSets: 60, modification: 'Wall sit at 45–60°; stop if knee discomfort.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Reinforce posterior support and tolerance for static quad activation.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Shoulder Impingement ---------------- */
const createShoulderRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Basic scapular mobility and cuff circulation
    const exercises = [
      { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Small circles → medium; stay below pain threshold.' },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Use light band; focus on scapular squeeze.' },
      { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Elbow tucked to side; slow tempo.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Scapular mobility and low-load cuff activation for circulation.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Slightly increased volume, focus on control
    const exercises = [
      { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Controlled, full-range circles.' },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Pause 1s at full retraction.' },
      { exerciseId: 'shoulders-94', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Keep band tension consistent throughout.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Build shoulder control with higher rep scapular and cuff movements.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add shoulder flexion patterning (safe range)
    const exercises = [
      { exerciseId: 'shoulders-179', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Banded shoulder flexion; lift only to eye level.' },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Scapular control; avoid shrugging.' },
      { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Slow, pain-free external rotation.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Introduce gentle shoulder flexion to promote functional mobility.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: Reinforce control with higher rep and small load tolerance
  const exercises = [
    { exerciseId: 'shoulders-94', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Perform with tempo: 2s out, 2s back.' },
    { exerciseId: 'shoulders-30', sets: 2, repetitions: 18, restBetweenSets: 45, modification: 'Squeeze at end range, no compensatory shrug.' },
    { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Finish with smooth scapular circles.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Strengthen shoulder stabilizers and reinforce safe movement patterns.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Lateral Ankle Sprain ---------------- */
const createAnkleRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Gentle mobility and circulation
    const exercises = [
      { exerciseId: 'calves-13', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rock gently into dorsiflexion; stay in pain-free range.' },
      { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Both legs; slow up-down, support as needed.' },
      { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy marching pace for circulation; no impact.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Gentle range of motion and calf pump to assist lymph drainage.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: More volume and proprioceptive cueing
    const exercises = [
      { exerciseId: 'warmup-6', duration: 1.5, warmup: true, modification: 'March in place; full-foot contact, quiet landings.' },
      { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Use wall support; pause 1s at top.' },
      { exerciseId: 'calves-6', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Smooth tempo, both legs.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Increase calf control and begin rebuilding joint awareness.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Emphasize single-leg control and time-under-tension
    const exercises = [
      { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Balance focus; add finger support only if needed.' },
      { exerciseId: 'glutes-44', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Isolate hip abduction; keep pelvis stable.' },
      { exerciseId: 'warmup-6', duration: 1, warmup: true, modification: 'Jog or march in place to finish; no heel strike.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce ankle control with unilateral loading and balance prep.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: Slight increase in challenge, reinforce stability
  const exercises = [
    { exerciseId: 'calves-12', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Use slow tempo. Focus on balance.' },
    { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Double-leg raise with strong control.' },
    { exerciseId: 'glutes-44', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Pause 1s at top. Maintain posture.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Improve single-leg stability and ankle control for walking and return to activity.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Tennis Elbow ---------------- */
const createTennisElbowRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Forearm mobility and low-load circulation
    const exercises = [
      { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Relax shoulders and neck; easy circles only.' },
      { exerciseId: 'forearms-4', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Support forearm on thigh/table and rotate only in pain-free range.' },
      { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Gentle isometric hold with forearm supported on thigh/table.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Low-load wrist mobility and gentle neural glide to reduce elbow tension.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add tempo cue and control
    const exercises = [
      { exerciseId: 'forearms-2', sets: 2, repetitions: 18, restBetweenSets: 30, modification: 'Slow down rotation tempo; keep range pain-free.' },
      { exerciseId: 'biceps-1', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Lower slowly for 3s per rep.' },
      { exerciseId: 'warmup-8', sets: 1, repetitions: 25, restBetweenSets: 30, warmup: true }
    ];
    
    return {
      ...base,
      description: 'Rest day. Increase control with slightly higher reps and slow eccentric emphasis.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Introduce low-volume isometric hold
    const exercises = [
      { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 30, modification: 'Pause 1s at end range.' },
      { exerciseId: 'forearms-1', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Gentle static wrist extension; stop if painful.' },
      { exerciseId: 'biceps-1', sets: 2, repetitions: 12, restBetweenSets: 45 }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce tendon loading tolerance with a light isometric hold.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: Add light grip endurance challenge
  const exercises = [
    { exerciseId: 'forearms-2', sets: 2, repetitions: 20, restBetweenSets: 30, modification: 'Smooth, continuous motion through full pain-free range.' },
    { exerciseId: 'forearms-1', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Use very light load or towel grip; controlled tempo.' },
    { exerciseId: 'biceps-1', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Stay relaxed in shoulder; focus on wrist position.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Improve endurance with higher-rep grip work and rotation control.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Hamstring Strain ---------------- */
const createHamstringRestDay = (day: number): any => {
  const exercises = [
    {
      exerciseId: 'cardio-13',
      duration: 2,
      warmup: true,
      modification: 'Easy march for circulation; keep steps short and controlled.',
    },
    {
      exerciseId: 'glutes-7',
      sets: 1,
      repetitions: 15,
      restBetweenSets: 45,
      modification: 'Bodyweight bridge; pause at top for 1 second.',
    },
    {
      exerciseId: 'hamstrings-48',
      sets: 1,
      repetitions: 8,
      restBetweenSets: 45,
      modification: 'Use no added weight. Control the descent.',
    },
  ];
  
  return {
    day,
    description:
      'Rest day. Gentle mobility and circulation work for healing and neural gliding.',
    isRestDay: true,
    duration: calculateRecoveryDayDuration(exercises),
    exercises,
  };
};

/* ---------------- Posture ---------------- */
const createPostureRestDay = (day: number): any => {
  const exercises = [
    {
      exerciseId: 'warmup-8',
      sets: 1,
      repetitions: 20,
      restBetweenSets: 30,
      modification: 'Slow, smooth shoulder circles. Pause at the back.',
      warmup: true,
    },
    {
      exerciseId: 'shoulders-30',
      sets: 1,
      repetitions: 15,
      restBetweenSets: 45,
      modification: 'Light tension band. Focus on posture and breath.',
    },
    {
      exerciseId: 'warmup-9',
      sets: 1,
      repetitions: 12,
      restBetweenSets: 30,
      modification: 'Rotate only to a comfortable range. Don\'t force it.',
    },
  ];
  
  return {
    day,
    isRestDay: true,
    duration: calculateRecoveryDayDuration(exercises),
    description:
      'Rest day. Gentle thoracic mobility and postural activation to maintain upright awareness.',
    exercises,
  };
};

/* ---------------- Tech Neck ---------------- */
const createTechNeckRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1
    const exercises = [
      { exerciseId: 'warmup-8', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Small, slow circles. Focus on relaxed shoulders.', warmup: true },
      { exerciseId: 'shoulders-30', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Very light tension. Pause and breathe at the squeeze.' },
      { exerciseId: 'warmup-9', sets: 1, repetitions: 8, restBetweenSets: 30, modification: 'Gentle rotation, keep head neutral.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Gentle neck and shoulder mobility to maintain progress without overworking.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2
    const exercises = [
      { exerciseId: 'warmup-8', sets: 1, repetitions: 15, restBetweenSets: 30, modification: 'Relax shoulders; increase range slightly.', warmup: true },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Control the squeeze; keep neck neutral.' },
      { exerciseId: 'warmup-5', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Pelvic tilt with light core engagement.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce shoulder control and introduce spinal dissociation for postural support.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3
    const exercises = [
      { exerciseId: 'shoulders-179', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Lift only to shoulder height with light band tension.' },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Squeeze shoulder blades together gently.' },
      { exerciseId: 'warmup-9', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Slow and mindful spinal rotation.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Build scapular control and add flexion patterning without neck strain.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4 (day 22+)
  const exercises = [
    { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Slow external rotation with elbow tucked to side.' },
    { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Add brief pause at full retraction.' },
    { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Keep chest tall, rotate gently.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Light rotator cuff activation and posture control to reinforce recovery gains.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Plantar Fasciitis ---------------- */
const createPlantarRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Basic mobility and light calf activation
    const exercises = [
      { exerciseId: 'calves-13', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rock gently into ankle mobility; stay below heel-pain threshold.' },
      { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Light heel raises, control the descent.' },
      { exerciseId: 'cardio-13', duration: 2, warmup: true, modification: 'Easy marching for circulation; keep steps quiet and controlled.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Light foot mobility and calf stretches to support healing.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add volume and reinforce eccentric control
    const exercises = [
      { exerciseId: 'warmup-6', duration: 1.5, warmup: true, modification: 'March in place with full foot roll-through.' },
      { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Use slow eccentric lowering.' },
      { exerciseId: 'glutes-44', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Engage glutes fully; no rotation.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce calf control and introduce light arch stability.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add unilateral balance
    const exercises = [
      { exerciseId: 'warmup-6', duration: 1.5, warmup: true, modification: 'Light jog in place, no heel impact.' },
      { exerciseId: 'calves-12', sets: 1, repetitions: 8, restBetweenSets: 60, modification: 'Single-leg heel raise; use support if needed.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Pause at top, keep pelvis stable.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Challenge ankle control and foot arch through unilateral work.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: Increase control, reinforce strength
  const exercises = [
    { exerciseId: 'calves-63', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Use slow lowering; moderate tempo up.' },
    { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Double-leg raise with longer pause at top.' },
    { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Slow reps, squeeze glutes at top.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Improve foot strength and maintain calf endurance with controlled loading.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

/* ---------------- Core Stability ---------------- */
const createCoreRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true
  };

  if (day <= 7) {
    // WEEK 1: Basic glute and trunk activation
    const exercises = [
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s at top, focus on breath and core tension.' },
      { exerciseId: 'abs-20', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Slow and controlled; keep lower back in contact with floor.' },
      { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rotate gently through comfortable range.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Gentle activation for the glutes and trunk to promote circulation and postural control.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Introduce anti-rotation (obliques) and longer hold
    const exercises = [
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold each rep for 2s at top.' },
      { exerciseId: 'obliques-4', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Maintain symmetry, slow tempo.' },
      { exerciseId: 'abs-6', sets: 1, duration: 0.5, restBetweenSets: 30, modification: 'Brace core during each marching movement.', warmup: true }
    ];
    
    return {
      ...base,
      description: 'Rest day. Light anti-rotation and core control to improve deep stabilizer endurance.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add balance & lateral challenge
    const exercises = [
      { exerciseId: 'abs-121', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Slow tempo, avoid wobbling.' },
      { exerciseId: 'glutes-45', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Engage core throughout.' },
      { exerciseId: 'warmup-9', sets: 1, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Slow spinal rotation.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Introduce lateral control and balance to challenge trunk stability.',
      exercises,
      duration: calculateRecoveryDayDuration(exercises)
    };
  }

  // WEEK 4: More volume on anti-rotation + deep core endurance
  const exercises = [
    { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Resist rotation throughout full range.' },
    { exerciseId: 'abs-20', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Focus on breath and bracing.' },
    { exerciseId: 'abs-6', sets: 1, duration: 0.67, restBetweenSets: 30, warmup: true, modification: 'Controlled marching, avoid spine movement.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Reinforce anti-rotation control and increase endurance for deep core.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises)
  };
};

const rehabProgramsAllWeeks: ExerciseProgram[] = [
  // -----------------------------------------------------------------
  // 0. Medial Tibial Stress Syndrome (Shin Splints)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Shin splints often flare when impact volume ramps faster than your lower leg can adapt. This week we dial down running/jumping to calm the tibia while keeping you active with low-impact cardio. You’ll build gentle calf/ankle capacity and blood flow so walking and stairs feel easier. Use pain (during + next morning) as your guide—steady or improving is the goal.',
    summary:
      'Get back to pain-free running foundations by calming shin pain while keeping your fitness up.',
    timeFrameExplanation:
      'Do the strength sessions 3x/week and add 15–25 min of low-impact Zone 2 cardio that you can do at home (marching in place). Add gentle ankle mobility and light tibialis work to reduce stress on the shin with each step. Keep impact exposure to short, flat walks only if symptoms stay ≤3/10 and don’t worsen the next day. Prioritize supportive shoes and a slightly higher cadence/shorter stride on any walks.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower shin tenderness to touch, and normal walking/stairs feel easier the next day. You should tolerate light calf work without a symptom spike.',
      nextSteps:
        'Week 2 adds slow eccentrics and short cadence-focused walks to start rebuilding impact tolerance. If mornings stay calm, we’ll gradually increase walk time before any jogging.',
    },
    whatNotToDo:
      'Avoid running, jumping, hills, and hard surfaces this week—especially when sore or fatigued. Don’t push through sharp or increasing tibial pain; if symptoms worsen the next morning, reduce volume.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(
        1,
        'Zone 2 + Calf Strength (easy). Slow reps; pain stays ≤3/10 during and the next morning.',
        [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
        { exerciseId: 'cardio-13', duration: 20, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'calves-9', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      ),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Gentle ankle mobility and light calf pumps to reduce tibial irritation.',
        exercises: [
          { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
          { exerciseId: 'calves-9', sets: 1, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'calves-6', sets: 1, repetitions: 12, restBetweenSets: 45 },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
          { exerciseId: 'calves-9', sets: 1, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'calves-6', sets: 1, repetitions: 12, restBetweenSets: 45 },
        ]),
      },
      createWorkoutDay(
        3,
        'Calf Capacity + Zone 2 (easy). Keep cadence smooth; stop if pain climbs above 3/10.',
        [
        { exerciseId: 'cardio-13', duration: 15, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 20, restBetweenSets: 45 },
        { exerciseId: 'calves-9', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      ),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Optional easy 5–10 min marching in place; gentle calf stretch if pain‑free.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(
        5,
        'Zone 2 + Calf Strength (easy). Slow reps; pain stays ≤3/10 during and the next morning.',
        [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
        { exerciseId: 'cardio-13', duration: 20, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'calves-9', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      ),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Gentle foot intrinsic activation (toe spread) and ankle circles.',
        exercises: [],
        duration: 10,
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Avoid impact; optional easy 5–10 min marching in place if fully pain‑free.',
        exercises: [],
        duration: 10,
      },
    ],
    targetAreas: ['shin'],
    bodyParts: ['Shin', 'Calves'],
  },
  {
    programOverview:
      'With symptoms calmer, we start rebuilding capacity: slow eccentrics for the calves and more single-leg control so the tibia absorbs less braking force. Walking returns in short doses on soft surfaces with a cadence focus. You’ll still keep most cardio low-impact while we build tissue tolerance.',
    summary:
      'Build capacity with eccentrics. Return to walking in short, cadence-focused doses.',
    timeFrameExplanation:
      'Use a slow eccentric (3–4 sec lowering) and stop sets at mild discomfort (≤3/10). Add 5–10 min soft-surface cadence walks 2–3x/week, and only increase time if next-day pain is stable. Keep cross-training Zone 2 on other days to maintain fitness.',
    afterTimeFrame: {
      expectedOutcome:
        'Better walking tolerance with less next-day shin soreness, and improved calf fatigue resistance. Tenderness should trend down or stay stable week-to-week.',
      nextSteps:
        'Week 3 introduces walk–jog intervals on grass/track while keeping eccentrics and single-leg control. If pain stays ≤2/10 the next morning, we progress the total interval time.',
    },
    whatNotToDo:
      'Skip hills, speed work, and hard-surface mileage; keep pain ≤3/10 and avoid “testing” the leg with a hard run. If soreness lingers >24 hours, cut the next session volume by 20–30%.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      createWorkoutDay(
        1,
        'Eccentric Calf Lowers + Zone 2. 3–4s lowering; reduce volume if sore >24h.',
        [
        { exerciseId: 'cardio-5', duration: 20, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      ),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Short cadence‑focused walk on soft surface (≤10 min); light calf pumps.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(
        3,
        'Foot Control + Eccentric Calf. Controlled foot/ankle; avoid “pushing through” tenderness.',
        [
        { exerciseId: 'cardio-9', duration: 15, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
        ],
      ),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Gentle ankle circles; optional 10–15 min cycling Zone 2.',
        exercises: [],
        duration: 15,
      },
      createWorkoutDay(
        5,
        'Eccentric Calf Lowers + Zone 2. 3–4s lowering; reduce volume if sore >24h.',
        [
        { exerciseId: 'cardio-7', duration: 20, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      ),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Soft‑tissue work as tolerated; avoid poking tender tibia.',
        exercises: [],
        duration: 10,
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Optional 10 min soft‑surface walk if fully pain‑free next morning.',
        exercises: [],
        duration: 10,
      },
    ],
    targetAreas: ['shin'],
    bodyParts: ['Shin', 'Calves', 'Foot'],
  },
  {
    programOverview:
      'Now we reintroduce impact in controlled doses: short walk–jog intervals on soft surfaces while keeping calf strength and foot control. The goal is to feel the same or better the next morning, not to “prove” fitness. You’ll keep cadence high and stride short to reduce braking.',
    summary:
      'Reintroduce jogging with 1:1 intervals. Keep calf strength and foot control consistent.',
    timeFrameExplanation:
      'Start with 1:1 walk–jog (60s/60s) for 10–12 rounds on grass/track, 2–3x/week, with a rest day after. Keep calf eccentrics 2x/week and stop the jog portion if pain climbs above 3/10. If mornings are calm, add 1–2 rounds next session.',
    afterTimeFrame: {
      expectedOutcome:
        'Comfortable short jog intervals with minimal next-day tenderness and no increase in baseline pain. Calf work feels strong and controlled.',
      nextSteps:
        'Week 4 moves toward longer jog blocks (2:1) and a small increase in total time. We’ll start a gradual transition back toward firmer surfaces only when symptoms are stable.',
    },
    whatNotToDo:
      'Avoid volume spikes, hills, sprints, and hard surfaces; keep the “easy” in easy. Don’t change shoes and surface at the same time—change one variable per week.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      createWorkoutDay(
        1,
        'Walk–Jog (1:1) + Calf Strength. Soft surface; keep stride short and cadence high.',
        [
        { exerciseId: 'cardio-1', duration: 20, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
        ],
      ),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Easy cycling 10–15 min or rest; check morning pain (≤2/10).',
        exercises: [],
        duration: 15,
      },
      createWorkoutDay(
        3,
        'Walk–Jog (1:1) + Calf Strength. Soft surface; keep stride short and cadence high.',
        [
        { exerciseId: 'cardio-1', duration: 20, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      ),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Foot intrinsic drills and ankle mobility only if pain‑free.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(
        5,
        'Walk–Jog (1:1) + Calf Strength. Soft surface; keep stride short and cadence high.',
        [
        { exerciseId: 'cardio-1', duration: 20, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
        ],
      ),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Optional 10 min walk; avoid pain >2/10 next morning.',
        exercises: [],
        duration: 10,
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Reflect on symptoms; keep notes on surface, shoes, cadence.',
        exercises: [],
        duration: 10,
      },
    ],
    targetAreas: ['shin'],
    bodyParts: ['Shin', 'Calves', 'Foot'],
  },
  {
    programOverview:
      'We build running confidence by slightly increasing jog time while keeping strength work consistent. This week is about repeatability: same-day feels fine and next-day stays calm. If you meet the criteria, you can begin sprinkling in brief firm-surface exposure.',
    summary:
      'Longer jog blocks (2:1). Progress slowly and reintroduce firmer surfaces gradually.',
    timeFrameExplanation:
      'Move to 2:1 jog:walk (120s/60s) for 8–10 rounds on track/grass, 2–3 sessions/week, with at least 1 rest day between. Increase total run time by ~10% per week and keep cadence high/stride short. Optional: add 2–3% incline walking only if you’re pain-free the next morning.',
    afterTimeFrame: {
      expectedOutcome:
        'Able to jog 15–20 minutes total on soft surface with minimal soreness the next day. You feel ready to progress gradually rather than needing longer rest after runs.',
      nextSteps:
        'Continue the ~10% rule for 2–3 more weeks, then reintroduce road surfaces gradually (short segments first). Once you’re symptom-free for 2 weeks, you can start gentle hills and strides.',
    },
    whatNotToDo:
      'No speed work, downhill running, or rapid jumps in volume or surface firmness. If pain rises above 3/10 or worsens the next morning, back off and repeat the previous week.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      createWorkoutDay(
        1,
        'Walk–Jog (2:1) + Calf Strength. Add time slowly; one variable at a time (surface OR volume).',
        [
        { exerciseId: 'cardio-1', duration: 25, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      ),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Optional short incline walk ≤5 min if pain‑free next morning.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(
        3,
        'Walk–Jog (2:1) + Calf Strength. Add time slowly; one variable at a time (surface OR volume).',
        [
        { exerciseId: 'cardio-1', duration: 25, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
        ],
      ),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Gentle mobility and soft‑tissue; avoid tibial tenderness.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(
        5,
        'Walk–Jog (2:1) + Calf Strength. Add time slowly; one variable at a time (surface OR volume).',
        [
        { exerciseId: 'cardio-1', duration: 25, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      ),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Optional technique check: short stride, high cadence, mid‑foot strike.',
        exercises: [],
        duration: 10,
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Prepare plan to transition off soft surfaces gradually next month.',
        exercises: [],
        duration: 10,
      },
    ],
    targetAreas: ['shin'],
    bodyParts: ['Shin', 'Calves', 'Foot'],
  },
  // -----------------------------------------------------------------
  // 1. Low‑Back Pain (non‑specific mechanical)
  // -----------------------------------------------------------------
  {
    programOverview:
      'This week is about calming flare-ups and making your back feel predictable again. You’ll practice “neutral spine” (a comfortable middle range), then layer in breathing + bracing so your trunk stays steady during sitting, standing up, and light bending. We pair that with gentle glute work so your hips share the load. The goal is to finish each session feeling looser and more confident—not exhausted.',
    summary:
      'Feel your back calm down and move with confidence using simple, high-impact core and glute resets.',
    timeFrameExplanation:
      'Do 3 short sessions (Mon/Wed/Fri style). Keep pain ≤3/10 during training and the next morning. Use slow reps, breathe out as you brace, and stop the set if you can’t keep ribs stacked over pelvis. On rest days, optional 10–20 min easy walking is fine if it doesn’t flare symptoms.',
    afterTimeFrame: {
      expectedOutcome:
        'Less morning stiffness, and day-to-day movements (getting up from a chair, rolling in bed, light bending) feel easier and more controlled. You should feel more “steady” through your trunk during the exercises.',
      nextSteps:
        'If symptoms are stable or improving, the next week adds hip-hinge patterning and slow posterior-chain loading so you can lift and bend with confidence—without losing your brace.',
    },
    whatNotToDo:
      'Avoid breath-holding, repeated end-range flexion/extension, and “testing” heavy lifts. Don’t push through sharp pain or new numbness/tingling; if symptoms travel down the leg or worsen the next morning, scale volume down. Seek care promptly for red flags (progressive weakness, saddle numbness, bowel/bladder changes).',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Reset & Brace (dead bug + plank). Exhale to brace; stop if symptoms travel or spike >3/10.', [
        { exerciseId: 'warmup-5', duration: 3, warmup: true, modification: 'Find neutral spine; slow breath in/out.' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Low back stays heavy on the floor; move slow.' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Shorten lever (knees down) if you feel the back.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Pause 1s at top; ribs down; no back arch.' },
      ]),
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Glutes + Spine Stability (bridge + bird dog). Quiet trunk; move from hips/shoulders, not the low back.', [
        { exerciseId: 'warmup-5', duration: 3, warmup: true, modification: 'Reset pelvis position before you load.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Keep shins vertical; squeeze glutes, not low back.' },
        { exerciseId: 'abs-102', sets: 3, repetitions: 6, restBetweenSets: 45, modification: 'Slow reach; keep hips level and ribs down.' },
        { exerciseId: 'abs-11', sets: 2, duration: 0.5, restBetweenSets: 60, modification: 'Hold steady; breathe slowly; keep hips stacked.' },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Repeat & Build Confidence. Same-day should feel easier; next morning should be stable or better.', [
        { exerciseId: 'warmup-5', duration: 2, warmup: true, modification: 'Find neutral; gentle brace on exhale.' },
        { exerciseId: 'warmup-9', duration: 2, warmup: true, modification: 'Comfortable range only; breathe slow. Skip if rotation irritates symptoms.' },
        { exerciseId: 'abs-20', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Keep low back heavy; slow tempo.' },
        { exerciseId: 'abs-6', sets: 2, duration: 0.5, restBetweenSets: 60, modification: 'Shorten lever (knees down) if you feel the back.' },
        { exerciseId: 'abs-102', sets: 2, repetitions: 6, restBetweenSets: 45, modification: 'Stay level; stop if you feel back “pinch”.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Pause at top; no back arch.' },
      ]),
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 2
  {
    programOverview:
      'We start building capacity by teaching your hips to hinge while your trunk stays steady. Glute bridges progress, and hamstrings get slow, controlled work to support bending and picking things up.',
    summary: 'Hip hinge + posterior-chain strength without provoking the back',
    timeFrameExplanation:
      'Use a controlled tempo (about 3 sec down) and keep ribs stacked over pelvis. Increase reps/load only if next-day symptoms are stable. If pain rises above 3/10, shorten range or reduce load.',
    afterTimeFrame: {
      expectedOutcome:
        'Hinging and lifting light objects feels smoother; less “grabbing” in the low back.',
      nextSteps:
        'Week 3 adds squat patterns and more anti-rotation to handle everyday twisting/uneven loads.',
    },
    whatNotToDo:
      'Don’t round under load, rush reps, or chase fatigue. Skip stretching into sharp pain; keep movements smooth and hip-dominant.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Hinge + Glute Strength (progress eccentrics)',
        isRestDay: false,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ]),
      },
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Hinge + Glute Strength (progress eccentrics)', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Hinge + Glute Strength (progress eccentrics)', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 3
  {
    programOverview:
      'This week looks more like normal training: squats + hinges with steady core control. Anti-rotation work builds tolerance for carrying, reaching, and asymmetrical tasks.',
    summary: 'Return to full-body patterns: squat/hinge + anti-rotation',
    timeFrameExplanation:
      'Keep technique first: neutral spine, controlled lowering, and even weight through both feet. If you add load, add small increments (one step at a time) and keep 1–2 reps in reserve.',
    afterTimeFrame: {
      expectedOutcome:
        'Better endurance in trunk and legs; daily tasks provoke fewer flare-ups.',
      nextSteps:
        'Week 4 introduces light loaded hinge/carry-over work to prepare for normal lifting.',
    },
    whatNotToDo:
      'Avoid maximal loading, fast twisting, and pushing through sharp pain. If you feel worse the next day, reduce volume by 20–30%.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Functional Strength (squat + anti-rotation)', [
        { exerciseId: 'quads-190', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Functional Strength (squat + anti-rotation)', [
        { exerciseId: 'quads-190', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Functional Strength (squat + anti-rotation)', [
        { exerciseId: 'quads-190', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 4
  {
    programOverview:
      'You’ll integrate light loaded hinge work and longer core sets so bending/lifting in real life feels predictable. The goal is confidence and consistency, not max strength.',
    summary: 'Build lifting confidence: light loaded hinge + core endurance',
    timeFrameExplanation:
      'Progress load or time under tension conservatively (about 5–10%/week). Stop sets when form changes, and prioritize breathing/bracing on every rep.',
    afterTimeFrame: {
      expectedOutcome:
        'Routine bending and light lifting feel normal; flare-ups are rarer and smaller.',
      nextSteps:
        'Maintain 2–3 sessions/week, then gradually return to your usual strength plan while keeping 1 core session as insurance.',
    },
    whatNotToDo:
      'Don’t test 1RM, force end-range extension, or grind reps. Avoid long sitting without breaks; move every 30–45 min.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Return‑to‑Activity (loaded hinge)', [
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
      ]),
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Activity (loaded hinge)', [
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Activity (loaded hinge)', [
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
      ]),
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // -----------------------------------------------------------------
  // 2. Runner's Knee (patellofemoral pain)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 calms patellofemoral irritation by reducing compressive knee stress while building hip and quad support. You will use glute-med activation, controlled bodyweight squats, and short wall-sit holds to improve tracking and tolerance without overload. The target outcome is smoother sit-to-stand and stair function with less front-of-knee pain.',
    summary:
      'Take pressure off the knee and rebuild control fast so stairs, squats, and daily movement feel smoother.',
    timeFrameExplanation:
      'Complete 3 sessions this week with pain kept at or below 3/10 during exercise and the next morning. Use slow tempo and keep the knee aligned over the mid-foot on every squat/hold. Optional easy walking is fine if symptoms remain stable.',
    afterTimeFrame: {
      expectedOutcome:
        'Less front-of-knee sensitivity and easier stairs, chair rises, and short walks at low load.',
      nextSteps:
        'Next week adds controlled lunge and step patterns if pain remains stable (≤3/10) with no next-day flare.',
    },
    whatNotToDo:
      'Avoid downhill running, deep painful knee flexion, jumping/plyometrics, and high-volume stairs this week. Stop if pain becomes sharp, catching, or clearly worse the next morning.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Symptom Calm + Hip Activation. Keep knee tracking over mid-foot and pain ≤3/10.', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy march in place; no bouncing.' },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Keep pelvis stacked; controlled lift and lower.' },
        { exerciseId: 'quads-193', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Use shallow knee angle and pain-free hold range.' },
        { exerciseId: 'quads-190', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Sit back slightly and keep knee in line with toes.' },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Hip Control + Quad Isometrics. Slow reps, no knee collapse inward.', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Steady pace; keep steps quiet.' },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Pause briefly at top; avoid trunk sway.' },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 8, restBetweenSets: 60, modification: 'Short ROM is fine; prioritize alignment and control.' },
        { exerciseId: 'quads-193', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Maintain even pressure through both feet.' },
        { exerciseId: 'quads-190', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Control descent; no pain spike on ascent.' },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Build Tolerance (same pattern, slightly more work). Next morning should be stable or better.', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy march; stay relaxed through shoulders and hips.' },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Smooth tempo; keep knee and foot pointing forward.' },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Use support if needed; avoid knee cave.' },
        { exerciseId: 'quads-193', sets: 3, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold only if pain remains ≤3/10.' },
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Controlled reps; stop 1-2 reps before form loss.' },
      ]),
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },
  {
    programOverview:
      'Week 2 adds bodyweight squats and lunges to improve single‑leg control and knee tracking.',
    summary: 'Controlled squats/lunges; better alignment and tolerance',
    timeFrameExplanation:
      'Hip‑dominant cues + slow tempo reinforce patella tracking without irritating compressive angles.',
    afterTimeFrame: {
      expectedOutcome:
        'Smoother single‑leg mechanics; improved tolerance to sit‑to‑stand and stairs.',
      nextSteps:
        'Introduce step‑downs and Bulgarians in Week 3.',
    },
    whatNotToDo:
      'No fast depth changes, twisting under load, or knee‑in collapse; keep pain ≤3/10.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Controlled Loading (add single‑leg)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Controlled Loading (add single‑leg)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Controlled Loading (add single‑leg)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },
  {
    programOverview:
      'Week 3 builds eccentric control (step‑downs) and single‑leg strength (Bulgarian split squats).',
    summary: 'Eccentric quad control + single‑leg strength',
    timeFrameExplanation:
      'Emphasize slow lowering and hip stability to prep for return‑to‑run.',
    afterTimeFrame: {
      expectedOutcome:
        'Comfortable step‑downs and Bulgarians; stairs feel stable.',
      nextSteps:
        'Start jog intervals in Week 4 if pain ≤3/10 during/after.',
    },
    whatNotToDo:
      'No sharp downhill runs, plyos, or volume spikes; keep mechanics crisp.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Return‑to‑Run Prep (add Bulgarians + step‑downs)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Run Prep (add Bulgarians + step‑downs)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Run Prep (add Bulgarians + step‑downs)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },
  {
    programOverview:
      'Week 4 layers gradual jog mileage onto maintained single‑leg strength for resilient knees.',
    summary: 'Return‑to‑run with strength maintenance',
    timeFrameExplanation:
      'Progress intervals conservatively while keeping hip/quad work to protect the patellofemoral joint.',
    afterTimeFrame: {
      expectedOutcome:
        'Comfortable 15–20 min jogs with stable knees and minimal soreness.',
      nextSteps:
        'Build mileage ~10%/week and reintroduce speed only if pain‑free.',
    },
    whatNotToDo:
      'No rapid mileage/speed spikes or downhill repeats; stop if pain rises >3/10.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Return‑to‑Run (progress mileage)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Run (progress mileage)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
        createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Run (progress mileage)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
        createRunnersKneeRestDay(6),
        createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },

  // -----------------------------------------------------------------
  // 3. Shoulder Impingement / Rotator‑Cuff Pain
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on calming shoulder irritation and restoring predictable, pain-managed motion. You will train scapular control, rotator-cuff endurance, and light flexion patterning with bands so overhead movement feels smoother without forcing range. The goal is less pinching with daily reaching and better shoulder control under low load.',
    summary:
      'Stop the shoulder pinch cycle and restore smooth, confident overhead motion with smart low-load work.',
    timeFrameExplanation:
      'Perform 3 short sessions this week, staying at or below 3/10 pain during training and the next morning. Keep ribs stacked and avoid shrugging as you raise the arm. Use smooth tempo and stop each set if compensation starts (neck tension, lumbar arch, or shoulder hiking).',
    afterTimeFrame: {
      expectedOutcome:
        'Less painful arc/pinching and easier shoulder elevation in a comfortable range with improved control.',
      nextSteps:
        'If symptoms stay stable, next week increases cuff/scapular volume and progresses controlled shoulder flexion.',
    },
    whatNotToDo:
      'Do not force overhead range, shrug into pain, or do heavy pressing this week. Avoid sharp anterior shoulder pain, catching, or night-pain escalation after sessions; reduce range/volume if symptoms increase next day.',
    createdAt: new Date('2025-05-29T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Restore Motion + Scap Control. Smooth reps; stay below pinch range.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Small to medium circles; pain-free range only.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, warmup: true, modification: 'Light band and steady scapular squeeze.' },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Elbow tucked; rotate without trunk twist.' },
        { exerciseId: 'shoulders-179', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Raise only to comfortable range; ribs stay down.' },
        { exerciseId: 'shoulders-78', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Pull to eye level; avoid upper-trap shrug.' },
      ]),
      createShoulderRestDay(2),
      createWorkoutDay(3, 'Cuff Endurance + Flexion Control. Keep ribs down; avoid shrugging.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Smooth circles; no pinch zone.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Control scapular retraction; do not arch low back.' },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60, modification: '2-second out / 2-second back tempo.' },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Pain-free arc only; slow lowering.' },
        { exerciseId: 'shoulders-78', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Elbows high enough for rear delt/cuff, not neck tension.' },
      ]),
      createShoulderRestDay(4),
      createWorkoutDay(5, 'Build Shoulder Tolerance (same pattern, slightly more volume). Next day should feel stable or better.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Smooth circles; keep shoulders down away from ears.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Steady retraction; no trunk sway.' },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Controlled external rotation with consistent band tension.' },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Increase only if no next-day symptom spike.' },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Stop before compensating with neck or low back.' },
      ]),
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 2 builds cuff endurance with higher reps/holds while keeping motion pain‑free.',
    summary: 'Cuff endurance and scapular retraction volume',
    timeFrameExplanation:
      'Progress band ER (shoulders‑94) + pull‑aparts (shoulders‑30) to prep for pressing/pulling.',
    afterTimeFrame: {
      expectedOutcome:
        'Better overhead tolerance and less fatigue with daily reaching.',
      nextSteps:
        'Add light rows and safe‑range pressing in Week 3.',
    },
    whatNotToDo:
      'No end‑range pain, fast tempos, or kipping/ballistic reps.',
    createdAt: new Date('2025-05-22T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Build Cuff Endurance', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(2),
      createWorkoutDay(3, 'Build Cuff Endurance', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(4),
      createWorkoutDay(5, 'Build Cuff Endurance', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 3 adds light rows and controlled vertical press while maintaining cuff work.',
    summary: 'Introduce row + safe‑range press; keep cuff volume',
    timeFrameExplanation:
      'Combine band ER, pull‑aparts, and light press to restore coordinated overhead control.',
    afterTimeFrame: {
      expectedOutcome:
        'Controlled rows/presses with minimal irritation; posture feels steadier.',
      nextSteps:
        'Increase resistance and range in Week 4 if pain‑free.',
    },
    whatNotToDo:
      'No grinding overhead reps, forced end‑range, or shrug‑dominant patterns.',
    createdAt: new Date('2025-05-15T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Add Pulling & Light Press', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(2),
      createWorkoutDay(3, 'Add Pulling & Light Press', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(4),
      {
        day: 5,
        description: 'Add Pulling & Light Press',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 4 progresses to dumbbell overhead strength with full‑range control and stable scapulae.',
    summary: 'Progress overhead strength with stable scapular mechanics',
    timeFrameExplanation:
      'Slight load increases on cuff + press patterns prepare for normal training.',
    afterTimeFrame: {
      expectedOutcome:
        'Pain‑free overhead motion and confidence pressing light‑moderate loads.',
      nextSteps:
        'Keep weekly cuff work; progress dumbbell loads gradually.',
    },
    whatNotToDo:
      'No rapid load jumps or pressing through pain; maintain clean tempo.',
    createdAt: new Date('2025-05-08T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Overhead Strength Transition', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(2),
      createWorkoutDay(3, 'Overhead Strength Transition', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(4),
      createWorkoutDay(5, 'Overhead Strength Transition', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ]),
        createShoulderRestDay(6),
        createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  // -----------------------------------------------------------------
  // 4. Lateral Ankle Sprain (grade I–II)
  // -----------------------------------------------------------------

  {
    programOverview:
      'Week 1 focuses on calming swelling and restoring safe ankle motion after a lateral sprain. You will use gentle ankle mobility, low-impact circulation work, and controlled calf pumping to improve tolerance for walking and stairs without provoking symptoms. The goal is to feel more stable under bodyweight by the end of the week.',
    summary:
      'Rebuild ankle confidence quickly with swelling-friendly mobility and stability work you can trust.',
    timeFrameExplanation:
      'Complete 3 short sessions this week and keep pain at or below 3/10 during exercise and the next morning. Use slow, controlled reps and keep movements pain-managed. Optional easy walking is fine on rest days if swelling and pain remain stable.',
    afterTimeFrame: {
      expectedOutcome:
        'Less swelling and stiffness, with more comfortable walking and easier stair negotiation at low speed.',
      nextSteps:
        'Next week progresses calf strength and introduces more single-leg control if symptoms stay stable.',
    },
    whatNotToDo:
      'Avoid cutting, jumping, unstable surfaces, and forced end-range dorsiflexion this week. Stop and reduce volume if swelling spikes, gait worsens, or pain increases the next morning.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Calm Swelling + Restore Motion. Keep steps quiet and pain ≤3/10.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Rock slowly; stop before pinch at front of ankle.' },
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy marching pace for circulation, no bounce.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Even loading through both feet; controlled rise/lower.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Keep pelvis stable; help ankle control through hip support.' },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Ankle Mobility + Calf Pump. Slow tempo, full-foot contact.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Increase range slightly only if pain stays low.' },
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Quiet steps; symmetrical loading left/right.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Pause briefly at top; no sharp pain on lowering.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Slow reps; avoid trunk sway.' },
      ]),
      createAnkleRestDay(4),
      createWorkoutDay(5, 'Build Confidence in Stance. Repeat pattern; next day should be stable or better.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Controlled mobility; no forcing end range.' },
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy march with full-foot roll through.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Smooth tempo; stop before form loss.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Slightly higher volume if no next-day symptom spike.' },
      ]),
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 2 adds calf strength (double‑leg + eccentric single‑leg) and hip abduction for ankle control.',
    summary: 'Calf strength + hip control for ankle stability',
    timeFrameExplanation:
      'Calves‑6 + Calves‑63 build tendon tolerance; glute med work improves stance stability.',
    afterTimeFrame: {
      expectedOutcome:
        'Stronger push‑off and better control on stairs with minimal swelling.',
      nextSteps:
        'Add single‑leg control and balance in Week 3.',
    },
    whatNotToDo:
      'No plyos, cutting, or high‑impact; keep tempo slow and pain ≤3/10.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Strength Return (calf & glute)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Strength Return (calf & glute)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(4),
      createWorkoutDay(5, 'Strength Return (calf & glute)', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 3 emphasizes single‑leg control and balance with unilateral raises and hip abduction.',
    summary: 'Single‑leg control + proprioception',
    timeFrameExplanation:
      'Single‑leg calf work (calves‑12) + glute med build ankle strategy for uneven ground.',
    afterTimeFrame: {
      expectedOutcome:
        'Steadier single‑leg balance; confident gait on small irregularities.',
      nextSteps:
        'Reintroduce light jogging in Week 4.',
    },
    whatNotToDo:
      'No cutting, explosive direction changes, or painful ranges.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Balance & Proprioception', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Balance & Proprioception', [
        { exerciseId: 'warmup-6', duration: 5, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(4),
      {
        day: 5,
        description: 'Balance & Proprioception',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 5, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 4 reintroduces short jog bouts while maintaining calf strength and hip control.',
    summary: 'Return‑to‑jog while keeping ankle strong',
    timeFrameExplanation:
      'Alternate easy jog/walk and sustain calf work to protect the ankle under impact.',
    afterTimeFrame: {
      expectedOutcome:
        'Comfortable 8–12 min jogs with stable foot strike and minimal swelling.',
      nextSteps:
        'Build volume conservatively; add gentle plyos only if fully pain‑free.',
    },
    whatNotToDo:
      'No sharp cutting or long downhill runs; stop if swelling/pain increases.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Return‑to‑Jog (dynamic loading)', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
        createAnkleRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Jog (dynamic loading)', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
        createAnkleRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Jog (dynamic loading)', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
        createAnkleRestDay(6),
        createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  // -----------------------------------------------------------------
  // 5. Tennis Elbow (lateral epicondylitis)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 aims to calm tendon irritability at the outside of the elbow while restoring tolerance to light daily gripping and typing. You will use pain-managed isometric wrist loading and controlled forearm rotation to reduce sensitivity and begin rebuilding tendon capacity. Sessions should feel controlled and leave symptoms stable or improved the next morning.',
    summary:
      'Settle elbow pain and restore grip confidence for typing, lifting, and everyday hand use.',
    timeFrameExplanation:
      'Do 3 short sessions this week and keep pain at or below 3/10 during exercise and the next morning. Use very light load (or a household object) and support your forearm on a thigh/table if a bench is not available. Prioritize smooth tempo and stop before sharp or radiating pain.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower resting elbow pain and improved tolerance to light grip, mouse/keyboard use, and daily hand tasks.',
      nextSteps:
        'If symptoms remain stable, next week introduces more slow eccentrics and modest volume progression.',
    },
    whatNotToDo:
      'Avoid high-force gripping, heavy carries, repetitive wrist extension under fatigue, and jerky movement. Reduce volume if morning pain clearly worsens, and stop if symptoms become sharp, radiating, or neurologic.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Settle Tendon Irritability + Isometric Relief. Keep grip light and pain ≤3/10.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Relax shoulder/neck before forearm loading.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 12, restBetweenSets: 45, warmup: true, modification: 'Support forearm on thigh/table and move in pain-free arc.' },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.5, restBetweenSets: 60, modification: 'Light isometric hold; keep wrist neutral and steady.' },
      ]),
      createTennisElbowRestDay(2),
      createWorkoutDay(3, 'Forearm Control + Slow Rotation. Move smoothly; no sharp or radiating pain.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Keep shoulder relaxed and posture tall.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: '2-second rotation each way; no end-range forcing.' },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold only if symptoms stay calm.' },
      ]),
      createTennisElbowRestDay(4),
      createWorkoutDay(5, 'Build Daily-Use Tolerance. Repeat pattern with slightly longer holds if stable next day.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Easy circles; no shoulder tension.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Controlled rotation under light load.' },
        { exerciseId: 'forearms-3', sets: 5, duration: 0.67, restBetweenSets: 60, modification: 'Maintain neutral wrist and light grip pressure.' },
      ]),
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 2 adds slow eccentrics for tendon remodeling while maintaining pain‑free rotation.',
    summary: 'Add slow eccentrics; keep pain modest',
    timeFrameExplanation:
      'Eccentric wrist extension builds capacity; rotation stays light and controlled.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved tolerance to gripping and lifting light objects.',
      nextSteps:
        'Add rotation volume and light hammer curls in Week 3.',
    },
    whatNotToDo:
      'No jerky or fast‑loaded movements, especially wrist extension or gripping under fatigue. If pain >3/10 or lingers next day, reduce load or reps. Stop any exercise with sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(2),
      {
        day: 3,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(4),
      createWorkoutDay(5, 'Introduce Eccentric Loading', [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 3 increases wrist rotation control and introduces light grip endurance (hammer curls).',
    summary: 'Rotation capacity + light grip endurance',
    timeFrameExplanation:
      'Controlled rotation with gradual time‑under‑tension supports return to function.',
    afterTimeFrame: {
      expectedOutcome:
        'Smoother rotation; light carries and household tasks feel fine.',
      nextSteps:
        'Integrate compound loading and carryover in Week 4.',
    },
    whatNotToDo:
      'No jerky or fast‑loaded movements, especially wrist extension or gripping under fatigue. If pain >3/10 or lingers next day, reduce load or reps. Stop any exercise with sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Forearm Control + Grip Strength', [
        { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(2),
      createWorkoutDay(3, 'Forearm Control + Grip Strength', [
        { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(4),
      createWorkoutDay(5, 'Forearm Control + Grip Strength', [
        { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 4 integrates functional loading so daily tasks and sport prep feel natural and pain‑free.',
    summary: 'Functional loading and return to tasks',
    timeFrameExplanation:
      'Blend rotation, wrist work, and light compound tasks to finish rehab.',
    afterTimeFrame: {
      expectedOutcome:
        'Grip, lift, and type pain‑free with confident wrist extension.',
      nextSteps:
        'Progress to normal strength work; maintain rotation/ER weekly.',
    },
    whatNotToDo:
      'No jerky or fast‑loaded movements, especially wrist extension or gripping under fatigue. If pain >3/10 or lingers next day, reduce load or reps. Stop any exercise with sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Functional Loading & Carryover', [
        { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(2),
      createWorkoutDay(3, 'Functional Loading & Carryover', [
        { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(4),
      createWorkoutDay(5, 'Functional Loading & Carryover', [
        { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },
  // -----------------------------------------------------------------
  // 6. Tech Neck
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on reducing neck and upper-back tension by improving scapular control and postural endurance. You will combine gentle mobility with low-load band work so the shoulders and mid-back share more of the workload during desk time. The goal is to feel less neck tightness and better sitting tolerance without forcing painful ranges.',
    summary:
      'Ease neck tension from desk work and build posture endurance that actually lasts through the day.',
    timeFrameExplanation:
      'Perform 3 short sessions this week and keep pain at or below 3/10 during and the next morning. Prioritize slow reps, relaxed jaw/breathing, and shoulders staying down away from ears. Stop or regress if you feel pinching, headaches worsening, or heavy neck compensation.',
    afterTimeFrame: {
      expectedOutcome:
        'Less neck tightness/stiffness and improved ability to sit upright with less fatigue during screen work.',
      nextSteps:
        'If symptoms remain stable, next week increases upper-back row volume and cuff endurance.',
    },
    whatNotToDo:
      'Avoid shrug-dominant lifting, forced end-range neck stretching, and painful movement ranges. Reduce session volume if symptoms clearly worsen the next day or if headaches are aggravated.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Reset Posture + Mobility. Keep jaw relaxed and shoulders away from ears.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Small circles first, then medium range if symptom-free.' },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 8, restBetweenSets: 30, warmup: true, modification: 'Gentle trunk rotation, chest tall, no neck cranking.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Light band tension; slow scapular squeeze.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 8, restBetweenSets: 45, modification: 'Elbow tucked; rotate without neck or trunk compensation.' },
      ]),
      createTechNeckRestDay(2),
      createWorkoutDay(3, 'Scapular Endurance + Neck Calm. Slow pulls; avoid neck tension compensation.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Controlled circles; keep shoulders depressed.' },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Move from trunk; keep chin neutral.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause at squeeze; avoid rib flare.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: '2-second out / 2-second back tempo.' },
      ]),
      createTechNeckRestDay(4),
      createWorkoutDay(5, 'Build Desk-Day Tolerance. Repeat pattern with slightly more control and hold quality.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Smooth circles, no shrugging.' },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Comfortable range only; breathe steadily.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Light to moderate band tension with strict form.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Hold end position briefly if no symptom increase.' },
      ]),
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 2 builds upper‑back endurance with band rows and cuff work to support posture.',
    summary: 'Row volume + cuff endurance for posture',
    timeFrameExplanation:
      'High standing band row (upper‑back‑60) + band ER (shoulders‑94) reduce neck reliance on traps.',
    afterTimeFrame: {
      expectedOutcome:
        'Stronger mid‑back; longer screen time with less neck fatigue.',
      nextSteps:
        'Increase endurance and add anti‑rotation in Week 3.',
    },
    whatNotToDo:
      'No heavy shrugs, fast reps, or neck cranking; keep scapulae down/back.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Scapular Strength & Cuff Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Scapular Strength & Cuff Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Scapular Strength & Cuff Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 3 raises volume and adds anti‑rotation for lasting postural endurance.',
    summary: 'Higher volume + anti‑rotation endurance',
    timeFrameExplanation:
      'Face‑pull/rows + oblique work reinforce thoracic extension and rib cage alignment.',
    afterTimeFrame: {
      expectedOutcome:
        'Able to hold upright posture longer with minimal neck tightness.',
      nextSteps:
        'Integrate habits and maintain 2x/week strength in Week 4.',
    },
    whatNotToDo:
      'No ballistic reps; avoid forcing end‑range cervical motion.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Postural Endurance & Volume',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Postural Endurance & Volume',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Postural Endurance & Volume',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 4 anchors alignment into daily habits while maintaining upper‑back/cuff strength.',
    summary: 'Integrate posture into daily movement + maintain strength',
    timeFrameExplanation:
      'Short, frequent posture breaks + 2x/week rows/ER keep gains sticky.',
    afterTimeFrame: {
      expectedOutcome:
        'Noticeably less neck tension; posture holds automatically longer.',
      nextSteps:
        'Maintain 2x/week rows/ER and 1 daily mobility drill.',
    },
    whatNotToDo:
      'No long static slouching without breaks; skip shrug‑dominant work.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Integration & Habit Anchoring',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 12, restBetweenSets: 30 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Integration & Habit Anchoring',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 12, restBetweenSets: 30 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Integration & Habit Anchoring',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 12, restBetweenSets: 30 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  // -----------------------------------------------------------------
  // 7. Plantar Fasciitis
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 aims to reduce heel irritability and morning first-step pain by restoring gentle ankle-foot motion and controlled calf loading. You will use low-impact circulation work, calf pumps, and hip support work to improve tissue tolerance without flare-ups. The target is steadier walking comfort and less “sharp” heel sensitivity at the start of the day.',
    summary:
      'Make first steps pain-free again by rebuilding heel and calf tolerance with controlled daily progress.',
    timeFrameExplanation:
      'Complete 3 short sessions this week and keep pain at or below 3/10 during and the next morning. Use slow tempo and avoid sharp heel pain, especially in first-step movements. Supportive footwear and avoiding long barefoot time on hard floors are key this week.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower morning heel pain with easier first steps, and better tolerance for short walks at comfortable pace.',
      nextSteps:
        'If symptoms remain stable, next week introduces more eccentric calf emphasis and arch-control progressions.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors, sudden volume spikes, and forcing through sharp plantar heel pain. If next-morning pain spikes, reduce session volume and total standing/walking exposure.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Calm Heel Pain + Restore Foot Motion. Keep load sub-symptomatic and controlled.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Gentle ankle-rock mobility, pain-managed range only.' },
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy march in place; soft, quiet steps.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Slow lift and controlled lowering, no bounce.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Stable pelvis to support foot loading mechanics.' },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Calf-Arch Control + Gentle Capacity. Slow tempo; no sharp heel pain.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Increase range slightly only if pain stays low.' },
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Maintain relaxed cadence and even foot contact.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Pause briefly at top; control full descent.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'No trunk sway; smooth controlled reps.' },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Build First-Step Confidence. Repeat pattern with slightly more time under tension.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Smooth mobility; avoid forcing end range.' },
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy march for circulation, avoid hard forefoot strike.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Keep tempo strict; stop before heel pain sharpens.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Slightly higher volume if next-day pain remains stable.' },
      ]),
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 2 adds calf eccentrics and toe control to stimulate tissue remodeling.',
    summary: 'Eccentric calf loading + arch support',
    timeFrameExplanation:
      'Calves‑63 eccentrics improve tendon/fascia capacity; maintain low‑pain walking.',
    afterTimeFrame: {
      expectedOutcome:
        'Smoother walking and improved push‑off with less heel soreness.',
      nextSteps:
        'Progress to balance and midfoot strength in Week 3.',
    },
    whatNotToDo:
      'No barefoot walking on hard floors; do not push through sharp heel pain.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 3 builds single‑leg control and midfoot strength to prep for longer walks.',
    summary: 'Balance + midfoot control',
    timeFrameExplanation:
      'Single‑leg calf raises and hip abduction reinforce arch support and gait stability.',
    afterTimeFrame: {
      expectedOutcome:
        'Better balance; longer walks with minimal morning stiffness.',
      nextSteps:
        'Increase functional loading in Week 4.',
    },
    whatNotToDo:
      'No barefoot walking on hard floors; do not push through sharp heel pain.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Balance & Midfoot Strength', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Balance & Midfoot Strength', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Balance & Midfoot Strength', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 4 increases functional loading for brisk walking and early return to impact.',
    summary: 'Functional loading; return to brisk walking',
    timeFrameExplanation:
      'Sustain eccentrics and add volume to tolerate longer, faster walks.',
    afterTimeFrame: {
      expectedOutcome:
        'Brisk walks and long stands are comfortable with minimal flare‑ups.',
      nextSteps:
        'Maintain calves 2x/week; ramp to light jog/hike as pain allows.',
    },
    whatNotToDo:
      'No barefoot walking on hard floors; do not push through sharp heel pain.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Function & Return‑to‑Impact', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(2),
      {
        day: 3,
        description: 'Function & Return to Impact',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 3, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Function & Return‑to‑Impact', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },
  // -----------------------------------------------------------------
  // 8. Hamstring Strain
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on calming hamstring irritability and restoring confident movement in walking and light hinging. You will use low-impact circulation, glute bridge work, and controlled short-range hinge patterns to load the posterior chain without provoking stretch pain. The aim is smoother daily movement with less guarding and less next-day tightness.',
    summary:
      'Calm hamstring flare-ups and rebuild confident movement without re-triggering painful stretch tension.',
    timeFrameExplanation:
      'Complete 3 short sessions this week with pain at or below 3/10 during and the next morning. Keep stride length short and avoid aggressive stretching. Use slow hinge tempo and stop before sharp pulling pain, cramping, or loss of control.',
    afterTimeFrame: {
      expectedOutcome:
        'Less hamstring tightness/guarding with easier walking and more comfortable low-load hip hinge patterns.',
      nextSteps:
        'If symptoms stay stable, next week progresses controlled eccentric hamstring loading and single-leg tolerance.',
    },
    whatNotToDo:
      'Avoid overstretching, sprinting, and ballistic movement this week. Do not push through sharp pain or cramping; reduce volume if next-day soreness clearly spikes.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Calm Hamstring Irritability + Gentle Activation. Keep stride short and pain ≤3/10.', [
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy marching to warm tissue; no bounce or long stride.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Pause 1 second at top without low-back arching.' },
        { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 60, modification: 'Bodyweight only; very short range and slow descent.' },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Pain-free range only; prioritize control over depth.' },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Posterior Chain Control. Slow hinge patterning without stretch pain.', [
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Steady march; keep pelvis level and relaxed.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Smooth ascent/descent and full-foot contact.' },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Increase range slightly only if pain remains low.' },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Slow patterning; avoid pulling sensation at end range.' },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Build Walking Confidence. Repeat pattern with slightly more control and tolerance.', [
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Short, quiet steps; stop if pain rises.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Slightly more volume if next-day symptoms are stable.' },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Strict bodyweight control; no sudden stretch at bottom.' },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Keep tempo slow and pain-managed.' },
      ]),
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 2 adds eccentric hamstring work (RDL/Nordic regressions) with steady glute volume.',
    summary: 'Introduce eccentrics for tissue capacity',
    timeFrameExplanation:
      'Slow eccentrics build resilience; volume kept modest to avoid setbacks.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved tolerance to bending and light picking tasks.',
      nextSteps:
        'Progress to single‑leg control in Week 3.',
    },
    whatNotToDo:
      'No overstretching or ballistic movements; stop if sharp pain occurs.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Introduce Eccentric Loading', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Introduce Eccentric Loading', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Introduce Eccentric Loading', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 3 emphasizes single‑leg hip hinge and trunk‑pelvis coordination.',
    summary: 'Single‑leg hinge + coordination',
    timeFrameExplanation:
      'Single‑leg RDL and hip thrust variants improve symmetry and control for daily tasks.',
    afterTimeFrame: {
      expectedOutcome:
        'Controlled single‑leg loading; reduced fear with bending/lifting.',
      nextSteps:
        'Introduce light jog intervals in Week 4 if pain ≤3/10.',
    },
    whatNotToDo:
      'No overstretching or ballistic movements; stop if sharp pain occurs.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Single-Leg Control & Hinge Strength', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Single-Leg Control & Hinge Strength', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Single-Leg Control & Hinge Strength', [
        { exerciseId: 'warmup-6', duration: 3, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 4 reintroduces short jog bouts while maintaining eccentric work and hip strength.',
    summary: 'Return‑to‑jog + maintain eccentrics',
    timeFrameExplanation:
      'Keep eccentrics and hinge strength while adding conservative jog volume.',
    afterTimeFrame: {
      expectedOutcome:
        'Pain‑free short jogs; confident hinge under daily loads.',
      nextSteps:
        'Build run distance gradually; keep weekly hamstring eccentrics.',
    },
    whatNotToDo:
      'No overstretching or ballistic movements; stop if sharp pain occurs.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Return‑to‑Jog (light dynamic work)', [
        { exerciseId: 'cardio-1', duration: 10, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Jog (light dynamic work)', [
        { exerciseId: 'cardio-1', duration: 10, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Jog (light dynamic work)', [
        { exerciseId: 'cardio-1', duration: 10, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },
  // -----------------------------------------------------------------
  // 9. Upper Back & Core Reset (Posture) 
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on reducing upper-back and shoulder fatigue by improving thoracic mobility, scapular positioning, and core-assisted posture control. You will combine gentle movement prep with low-load band pulling so your mid-back does more work and your neck does less. The target is better tolerance to upright sitting and standing without stiffness buildup.',
    summary:
      'Reset posture fast with upper-back strength and mobility so sitting tall feels natural, not forced.',
    timeFrameExplanation:
      'Complete 3 short sessions this week with pain at or below 3/10 during and the next morning. Keep ribs stacked over pelvis, avoid shrugging, and use smooth controlled pulling tempo. Optional walking and short movement breaks during desk work will support progress.',
    afterTimeFrame: {
      expectedOutcome:
        'Reduced upper-back/shoulder tension with better awareness and tolerance of upright posture in daily tasks.',
      nextSteps:
        'If symptoms are stable, next week increases pulling volume and posterior-chain support work.',
    },
    whatNotToDo:
      'Avoid heavy pressing, prolonged static slouching, and forcing end-range extension. Reduce volume if neck/shoulder symptoms spike the next day.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Posture Reset + Thoracic Mobility. Keep ribs stacked and shoulders down.', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 8, restBetweenSets: 30, warmup: true, modification: 'Gentle trunk rotation; avoid lumbar over-twist.' },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Small circles first, then medium range.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Light band; controlled scapular squeeze.' },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Tall posture, elbows track smoothly.' },
      ]),
      createPostureRestDay(2),
      createWorkoutDay(3, 'Scapular Endurance + Core Support. Slow pulls; avoid neck compensation.', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Move from thoracic spine with relaxed neck.' },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Smooth circles without shrugging.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause briefly at retraction; ribs down.' },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Steady row tempo; avoid low-back sway.' },
      ]),
      createPostureRestDay(4),
      createWorkoutDay(5, 'Build Upright Tolerance. Repeat pattern with slightly more time under tension.', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Comfortable range only; breathe steadily.' },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Keep shoulders away from ears.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Maintain consistent band tension and form.' },
        { exerciseId: 'upper-back-60', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Slight volume increase only if next-day symptoms are stable.' },
      ]),
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 2 introduces controlled pulling and shoulder blade activation.',
    summary: 'Controlled pulling and scapular strengthening',
    timeFrameExplanation:
      'Build scapular control and strengthen the muscles that support good posture.',
    afterTimeFrame: {
      expectedOutcome:
        'Better shoulder blade control and reduced upper back tension.',
      nextSteps:
        'Continue to Week 3 for endurance and time-under-tension training.',
    },
    whatNotToDo:
      'No heavy pressing or prolonged slouching during the early stages.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Scapular Control & Pull Strength', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createPostureRestDay(2),
      createWorkoutDay(3, 'Scapular Control & Pull Strength', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createPostureRestDay(4),
      createWorkoutDay(5, 'Scapular Control & Pull Strength', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 3 adds time-under-tension and stability work for endurance.',
    summary: 'Endurance building with time-under-tension work',
    timeFrameExplanation:
      'Challenge your postural muscles with longer holds and stability exercises.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved postural endurance and strength for maintaining good alignment.',
      nextSteps:
        'Progress to Week 4 for core-integrated posture training.',
    },
    whatNotToDo:
      'No heavy pressing or prolonged slouching during the early stages.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Endurance & Time Under Tension', [
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createPostureRestDay(2),
      createWorkoutDay(3, 'Endurance & Time Under Tension', [
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createPostureRestDay(4),
      createWorkoutDay(5, 'Endurance & Time Under Tension', [
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 4 integrates core and full-body posture control for daily function.',
    summary: 'Integrated core and full-body postural control',
    timeFrameExplanation:
      'Combine all elements for comprehensive postural control and strength.',
    afterTimeFrame: {
      expectedOutcome:
        'Visibly better posture and reduced shoulder fatigue during daily activities.',
      nextSteps:
        'Maintain progress with upper back training twice per week and daily mobility.',
    },
    whatNotToDo:
      'No heavy pressing or prolonged slouching during the early stages.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Posture Integration (core + upper back)', [
        { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createPostureRestDay(2),
      createWorkoutDay(3, 'Posture Integration (core + upper back)', [
        { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createPostureRestDay(4),
      createWorkoutDay(5, 'Posture Integration (core + upper back)', [
        { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },
  // -----------------------------------------------------------------
  // 10. Core Stability
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 rebuilds deep core control so your trunk stays stable during basic movement and daily tasks. You will combine low-load bracing, anti-extension work, and glute support to improve pelvic control without over-fatiguing the back or hip flexors. The goal is quality reps and predictable control, not high intensity.',
    summary:
      'Build a stronger, steadier core foundation that makes everyday movement feel controlled and pain-safe.',
    timeFrameExplanation:
      'Perform 3 short sessions this week with pain at or below 3/10 during and the next morning. Exhale to brace on each rep, keep neutral spine, and stop sets when form quality drops. Prioritize controlled breathing and posture over extra reps.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved core recruitment with better control in plank/brace positions and easier trunk stability in daily movement.',
      nextSteps:
        'If control is consistent, next week adds more time under tension and limb coordination demands.',
    },
    whatNotToDo:
      'Avoid high-rep sit-ups, long planks with poor form, and breath-holding under effort. If low-back symptoms increase the next morning, reduce hold time and total volume.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Deep Core Reset. Slow bracing with neutral spine and controlled breathing.', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Low back stays in contact; exhale on limb movement.' },
        { exerciseId: 'abs-6', sets: 2, duration: 0.5, restBetweenSets: 60, modification: 'Use knees-down version if you lose spinal control.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Hold 1 second at top with ribs down.' },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Core Control + Limb Coordination. Keep pelvis stable and movement quiet.', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Slow alternating pattern; no trunk rocking.' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Brace continuously and keep breathing steady.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Maintain pelvis level through full rep.' },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Build Trunk Endurance. Repeat pattern with slightly longer quality holds.', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Increase reps only if form remains clean.' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold, stop before shaking or lumbar sag.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Controlled tempo with steady breath pattern.' },
      ]),
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 2 adds time under tension and limb coordination.',
    summary: 'Core endurance with coordinated movement challenges',
    timeFrameExplanation:
      'Challenge your core stability with longer holds and coordinated movements.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved core endurance and better stability during movement.',
      nextSteps:
        'Continue to Week 3 for balance and anti-rotation challenges.',
    },
    whatNotToDo:
      'No high‑rep sit‑ups or long planks with poor form.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Time Under Tension & Movement', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Time Under Tension & Movement', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Time Under Tension & Movement', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 3 incorporates balance, anti-rotation, and lateral core engagement.',
    summary: 'Advanced stability with multi-directional core control',
    timeFrameExplanation:
      'Challenge your core with stability exercises and multi-directional control.',
    afterTimeFrame: {
      expectedOutcome:
        'Better balance and control in challenging positions.',
      nextSteps:
        'Progress to Week 4 for multi-planar core integration.',
    },
    whatNotToDo:
      'No high‑rep sit‑ups or long planks with poor form.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Stability & Balance Challenges', [
        { exerciseId: 'abs-121', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Stability & Balance Challenges', [
        { exerciseId: 'abs-121', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Stability & Balance Challenges', [
        { exerciseId: 'abs-121', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 4 transitions to longer holds and multi-planar control.',
    summary: 'Advanced multi-planar core mastery',
    timeFrameExplanation:
      'Master advanced core stability for preparation to more demanding training.',
    afterTimeFrame: {
      expectedOutcome:
        'Strong, stable core with better posture and movement control.',
      nextSteps:
        'Progress to resistance training or maintain with 1-2 core sessions weekly.',
    },
    whatNotToDo:
      'No high‑rep sit‑ups or long planks with poor form.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Multi-Planar Core Integration', [
        { exerciseId: 'abs-121', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-120', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Multi-Planar Core Integration', [
        { exerciseId: 'abs-121', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-120', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Multi-Planar Core Integration', [
        { exerciseId: 'abs-121', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-120', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },
  // -----------------------------------------------------------------
  // 11. Wrist Pain (overuse / desk-related)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on calming wrist irritation from repetitive daily loading while restoring forearm control and grip tolerance. You will use gentle mobility, low-load isometrics, and controlled rotation so typing, lifting light objects, and household tasks feel easier without flare-ups.',
    summary:
      'Calm wrist pain and rebuild daily grip confidence with low-load forearm and wrist control work.',
    timeFrameExplanation:
      'Perform 3 short sessions this week and keep pain at or below 3/10 during exercise and the next morning. Use light resistance and controlled tempo. Keep the wrist in neutral when possible and stop if pain becomes sharp or radiates.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower wrist sensitivity at rest and better tolerance to typing, carrying light items, and daily hand use.',
      nextSteps:
        'If symptoms remain stable, week 2 can introduce slightly longer isometric holds and gradual load progression for grip and extension tolerance.',
    },
    whatNotToDo:
      'Avoid high-force gripping, fast loaded wrist extension, and repetitive end-range wrist positions under fatigue. Reduce volume if symptoms are clearly worse the next morning.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Wrist Calm + Forearm Activation. Light load, neutral wrist, pain ≤3/10.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 12, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.5, restBetweenSets: 60 },
      ]),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Optional gentle wrist circles and easy grip open/close drills.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(3, 'Forearm Rotation + Isometric Capacity. Smooth tempo; avoid sharp pain.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.67, restBetweenSets: 60 },
      ]),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Keep wrist neutral during desk work; add short movement breaks.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(5, 'Build Daily-Use Tolerance. Repeat pattern with slightly longer quality holds.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-3', sets: 5, duration: 0.67, restBetweenSets: 60 },
      ]),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Optional 5–10 min light forearm mobility if symptoms stay calm.',
        exercises: [],
        duration: 10,
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Avoid long static wrist positions; keep load light.',
        exercises: [],
        duration: 10,
      },
    ],
    targetAreas: ['wrist', 'forearm'],
    bodyParts: ['Wrist', 'Forearm'],
  },
].map(ensureRestDaysHaveOptionalHomeExercises);

// Keep only the first week for each recovery program. Subsequent weeks are generated
// dynamically based on user feedback.
export const rehabPrograms: ExerciseProgram[] = rehabProgramsAllWeeks.filter(
  (_, index) => index % 4 === 0
);

// URL slug mapping for direct program access - maps to the single-week program index
export const programSlugs: Record<string, number> = {
  'shin-splints': 0,
  // Low Back
  lowback: 1,
  'low-back': 1,
  'lower-back': 1,
  
  // Runner's Knee
  runnersknee: 2,
  'runners-knee': 2,
  
  // Shoulder
  shoulder: 3,
  'shoulder-impingement': 3,
  
  // Ankle
  ankle: 4,
  'ankle-sprain': 4,
  
  // Tennis Elbow
  'tennis-elbow': 5,
  elbow: 5,
  
  // Tech Neck
  techneck: 6,
  
  // Plantar Fasciitis
  'plantar-fasciitis': 7,
  plantarfasciitis: 7,
  plantar: 7,
  
  // Hamstring
  'hamstring-strain': 8,
  hamstring: 8,
  
  // Upper Back & Core
  'upper-back-core': 9,
  upperbackcore: 9,
  
  // Core Stability
  'core-stability': 10,
  corestability: 10,

  // Wrist Pain
  'wrist-pain': 11,
  wrist: 11,
  wristpain: 11,
};

// Function to get program by URL slug - returns the single-week program
export const getProgramBySlug = (slug: string): ExerciseProgram | null => {
  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;

  return rehabPrograms[baseIndex] ?? null;
};

// Function to get all available program slugs
export const getAvailableSlugs = (): string[] => {
  return Object.keys(programSlugs);
};

// Create tailored UserProgram objects for each recovery program
export const getUserProgramBySlug = (slug: string): {
  programs: ExerciseProgram[];
  diagnosis: DiagnosisAssistantResponse;
  questionnaire: ExerciseQuestionnaireAnswers;
  active: boolean;
  createdAt: string;
  updatedAt: Date;
  type: ProgramType;
  timeFrame: string;
  title: string;
  docId: string;
} | null => {
  const normalizeUserProgram = (userProgram: any) => ({
    ...userProgram,
    timeFrame: '1 week',
    diagnosis: { ...userProgram.diagnosis, timeFrame: '1 week' },
    isCustomProgram: true, // Mark as predefined custom/recovery program
  });

  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;
  
  const week1 = rehabPrograms[baseIndex];
  if (!week1) return null;

  const today = new Date();
  const normalizedSlug = slug.toLowerCase();

  // Update the program's createdAt to today so dates display correctly
  const updatedWeekPrograms = [{ ...week1, createdAt: today }];

  // Create specific diagnosis and questionnaire for each program type
  if (normalizedSlug.includes('lowback') || normalizedSlug.includes('low-back') || normalizedSlug.includes('lower-back')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Lower Back Pain',
        painfulAreas: ['Lower Back'],
        informationalInsights: 'Lower back pain is one of the most common musculoskeletal complaints. This program focuses on strengthening core muscles, improving spinal mobility, and addressing postural dysfunction to reduce pain and prevent recurrence.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Prolonged sitting', 'Bending forward', 'Lifting'],
        relievingFactors: ['Rest', 'Gentle movement', 'Heat therapy'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lower lumbar region',
        painCharacter: 'dull',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy lifting', 'Prolonged sitting', 'High-impact activities'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Lower Back', 'Core']
      },
      questionnaire: {
        age: '30-40',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Lower Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Lower Back', 'Core'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Back Relief Blueprint',
      docId: `recovery-lowback-${Date.now()}`
    });
  }

  if (
    normalizedSlug.includes('shin') ||
    normalizedSlug.includes('shin-splints') ||
    normalizedSlug.includes('mtss')
  ) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Medial Tibial Stress Syndrome (Shin Splints)',
        painfulAreas: ['Shin'],
        informationalInsights:
          'Shin splints arise from repetitive tibial loading. This plan deloads impact, restores calf/foot capacity, and re‑introduces running with cadence and surface control.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Running', 'Hard surfaces', 'Rapid mileage increase'],
        relievingFactors: ['Impact deload', 'Soft surfaces', 'Eccentric calf work'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Medial tibia',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Downhill running', 'Sprints', 'Hard-surface mileage spikes'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Shin', 'Calves', 'Foot']
      },
      questionnaire: {
        age: '20-40',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Shin'],
        exerciseEnvironments: 'both',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Shin', 'Calves', 'Foot'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'stationary_bike']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Run Without Shin Pain',
      docId: `recovery-shin-splints-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('runners') || normalizedSlug.includes('knee')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Patellofemoral Pain Syndrome (Runner\'s Knee)',
        painfulAreas: ['Knee'],
        informationalInsights: 'Runner\'s knee is characterized by pain around or behind the kneecap. This program focuses on strengthening the quadriceps, glutes, and hip muscles while improving flexibility and movement patterns.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Running', 'Stairs', 'Prolonged sitting'],
        relievingFactors: ['Rest', 'Ice', 'Gentle stretching'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Around or behind kneecap',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running', 'Jumping', 'Deep squats'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Knee', 'Quadriceps', 'Glutes']
      },
      questionnaire: {
        age: '25-35',
        lastYearsExerciseFrequency: '3-4 times per week',
        numberOfActivityDays: '4',
        generallyPainfulAreas: ['Knee'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '30-45 minutes',
        targetAreas: ['Knee', 'Quadriceps', 'Glutes'],
        experienceLevel: 'intermediate',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Knee Comeback Plan',
      docId: `recovery-runnersknee-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('shoulder')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Shoulder Impingement Syndrome',
        painfulAreas: ['Shoulder'],
        informationalInsights: 'Shoulder impingement occurs when soft tissues are compressed during shoulder movements. This program focuses on strengthening the rotator cuff, improving posture, and restoring normal shoulder mechanics.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Overhead activities', 'Reaching behind back', 'Sleeping on affected side'],
        relievingFactors: ['Rest', 'Avoiding overhead movements', 'Ice'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Top and front of shoulder',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Overhead lifting', 'Throwing motions', 'Sleeping on affected side'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Shoulder', 'Rotator Cuff']
      },
      questionnaire: {
        age: '35-45',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Shoulder'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '25-35 minutes',
        targetAreas: ['Shoulder', 'Rotator Cuff'],
        experienceLevel: 'beginner',
        equipment: ['resistance_bands', 'light_weights']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Shoulder Freedom Plan',
      docId: `recovery-shoulder-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('ankle')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Ankle Sprain Recovery',
        painfulAreas: ['Ankle'],
        informationalInsights: 'Ankle sprains are common injuries that require proper rehabilitation to prevent re-injury. This program focuses on restoring range of motion, strength, balance, and proprioception.',
        onset: 'acute',
        painScale: 4,
        mechanismOfInjury: 'trauma',
        aggravatingFactors: ['Walking on uneven surfaces', 'Weight bearing', 'Lateral movements'],
        relievingFactors: ['Rest', 'Elevation', 'Ice', 'Compression'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lateral ankle',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running', 'Jumping', 'Sports with cutting movements'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Ankle', 'Calf']
      },
      questionnaire: {
        age: '20-30',
        lastYearsExerciseFrequency: '3-4 times per week',
        numberOfActivityDays: '4',
        generallyPainfulAreas: ['Ankle'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Ankle', 'Calf'],
        experienceLevel: 'intermediate',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Ankle Stability Reset',
      docId: `recovery-ankle-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('tennis') || normalizedSlug.includes('elbow')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Lateral Epicondylitis (Tennis Elbow)',
        painfulAreas: ['Elbow', 'Forearm'],
        informationalInsights: 'Tennis elbow is caused by overuse of the extensor muscles of the forearm. This program focuses on eccentric strengthening, progressive loading, and addressing contributing factors.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Gripping', 'Lifting', 'Computer use', 'Racquet sports'],
        relievingFactors: ['Rest', 'Ice', 'Avoiding aggravating activities'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lateral elbow',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy gripping', 'Racquet sports', 'Repetitive wrist extension'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Elbow', 'Forearm', 'Wrist']
      },
      questionnaire: {
        age: '35-50',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Elbow', 'Forearm'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Elbow', 'Forearm', 'Wrist'],
        experienceLevel: 'beginner',
        equipment: ['light_weights', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Elbow Strength Reset',
      docId: `recovery-tennis-elbow-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('techneck') || normalizedSlug.includes('tech-neck')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Tech Neck (Cervical Strain)',
        painfulAreas: ['Neck', 'Upper Back'],
        informationalInsights: 'Tech neck results from prolonged forward head posture during device use. This program addresses postural dysfunction, strengthens deep neck flexors, and improves upper back mobility.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Computer work', 'Phone use', 'Poor posture', 'Stress'],
        relievingFactors: ['Posture breaks', 'Gentle stretching', 'Heat'],
        priorInjury: 'no',
        painPattern: 'constant',
        painLocation: 'Back of neck and upper shoulders',
        painCharacter: 'tight',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Prolonged computer use without breaks', 'Looking down at phone for extended periods'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Neck', 'Upper Back', 'Shoulders']
      },
      questionnaire: {
        age: '25-40',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Neck', 'Upper Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '15-25 minutes',
        targetAreas: ['Neck', 'Upper Back', 'Shoulders'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Neck Reset Routine',
      docId: `recovery-techneck-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('plantar')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Plantar Fasciitis',
        painfulAreas: ['Foot'],
        informationalInsights: 'Plantar fasciitis involves inflammation of the plantar fascia, causing heel pain. This program focuses on stretching, strengthening, and addressing biomechanical factors.',
        onset: 'gradual',
        painScale: 6,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['First steps in morning', 'Prolonged standing', 'Walking barefoot'],
        relievingFactors: ['Rest', 'Ice', 'Supportive footwear', 'Stretching'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Bottom of heel',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running on hard surfaces', 'Walking barefoot', 'High-impact activities'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Foot', 'Calf', 'Ankle']
      },
      questionnaire: {
        age: '40-55',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Foot'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '15-25 minutes',
        targetAreas: ['Foot', 'Calf', 'Ankle'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'tennis_ball']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Heel Pain Reset',
      docId: `recovery-plantar-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('hamstring')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Hamstring Strain',
        painfulAreas: ['Hamstring'],
        informationalInsights: 'Hamstring strains are common in athletes and active individuals. This program focuses on progressive strengthening, flexibility, and functional movement patterns to prevent re-injury.',
        onset: 'acute',
        painScale: 5,
        mechanismOfInjury: 'trauma',
        aggravatingFactors: ['Running', 'Stretching', 'Bending forward'],
        relievingFactors: ['Rest', 'Ice', 'Gentle movement'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Back of thigh',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Sprinting', 'Aggressive stretching', 'High-intensity leg exercises'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Hamstring', 'Glutes']
      },
      questionnaire: {
        age: '20-35',
        lastYearsExerciseFrequency: '4-5 times per week',
        numberOfActivityDays: '5',
        generallyPainfulAreas: ['Hamstring'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '30-40 minutes',
        targetAreas: ['Hamstring', 'Glutes'],
        experienceLevel: 'intermediate',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Hamstring Rebuild Plan',
      docId: `recovery-hamstring-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('wrist')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Wrist Overuse Pain',
        painfulAreas: ['Wrist', 'Forearm'],
        informationalInsights:
          'Wrist overuse pain often responds well to load management and gradual forearm strength progression. This plan calms irritation while restoring grip and wrist tolerance.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Typing', 'Mouse use', 'Gripping', 'Wrist extension under load'],
        relievingFactors: ['Relative rest', 'Load reduction', 'Gentle mobility'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Wrist and forearm',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy gripping', 'Fast loaded wrist extension', 'Repetitive painful wrist positions'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Wrist', 'Forearm']
      },
      questionnaire: {
        age: '25-45',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Wrist', 'Forearm'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '15-25 minutes',
        targetAreas: ['Wrist', 'Forearm'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'light_weights', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Wrist Relief Reset',
      docId: `recovery-wrist-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('upper-back') || normalizedSlug.includes('upperback')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Upper Back & Core Dysfunction',
        painfulAreas: ['Upper Back', 'Core'],
        informationalInsights: 'Upper back pain often results from poor posture and weak core muscles. This program strengthens the thoracic spine, improves posture, and builds core stability.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Desk work', 'Poor posture', 'Stress', 'Heavy lifting'],
        relievingFactors: ['Movement', 'Stretching', 'Posture correction'],
        priorInjury: 'no',
        painPattern: 'constant',
        painLocation: 'Between shoulder blades',
        painCharacter: 'tight',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Prolonged slouching', 'Heavy overhead lifting', 'Poor lifting mechanics'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Upper Back', 'Core', 'Shoulders']
      },
      questionnaire: {
        age: '30-45',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Upper Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '25-35 minutes',
        targetAreas: ['Upper Back', 'Core', 'Shoulders'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Posture Power Reset',
      docId: `recovery-upperback-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('core')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Core Instability',
        painfulAreas: ['Core', 'Lower Back'],
        informationalInsights: 'Core instability can lead to lower back pain and poor movement patterns. This program focuses on deep core strengthening, spinal stabilization, and functional movement.',
        onset: 'gradual',
        painScale: 3,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Poor posture', 'Weak core muscles', 'Sedentary lifestyle'],
        relievingFactors: ['Core strengthening', 'Proper posture', 'Regular movement'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lower back and abdominal region',
        painCharacter: 'dull',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy lifting with poor form', 'Prolonged sitting', 'High-impact activities without proper preparation'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Core', 'Lower Back']
      },
      questionnaire: {
        age: '25-40',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Core', 'Lower Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Core', 'Lower Back'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Core Control Reset',
      docId: `recovery-core-${Date.now()}`
    });
  }

  // Fallback for any unmatched slugs
  return null;
};
