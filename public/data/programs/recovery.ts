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
import { calculateDayDuration } from '../../../src/app/helpers/duration-calculation';

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
    'Calm pain; rebuild neutral spine and glute activation': 'Demp smerte; gjenoppbygg nøytral rygg og seteaktivering',
    'Hinge mechanics + glute strength; controlled hamstring eccentrics': 'Hoftebøyteknikk + setestyrke; kontrollerte hamstrings-eksentriker',
    'Functional lower‑body strength + anti‑rotation core': 'Funksjonell underkroppsstyrke + anti-rotasjonskjerne',
    'Loaded hinge confidence; core endurance for daily lifting': 'Trygghet i belastet hoftebøy; kjerneutholdenhet for daglige løft',

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
    // Lower Back
    'Week 1 restores spinal neutrality and deep-core control with Dead Bug, Plank, and Glute Bridge to calm symptoms.': 'Uke 1 gjenoppretter nøytral rygg og dyp kjerne-kontroll med Dead Bug, Planke og Seteløft for å dempe symptomer.',
    "Week 2 grooves the hip hinge and progresses glute work; introduce hamstring eccentrics (e.g., single‑leg RDL pattern).": 'Uke 2 finpusser hoftebøy og øker setearbeid; introduserer eksentrisk hamstrings (f.eks. ettbeins RDL-mønster).',
    'Week 3 adds functional strength—squats, hinge work, and anti‑rotation (Side Plank) with steady load.': 'Uke 3 legger til funksjonell styrke—knebøy, hoftebøy og anti‑rotasjon (sideplanke) med jevn belastning.',
    'Week 4 integrates loaded hinge, core endurance, and glute strength for return‑to‑activity.': 'Uke 4 integrerer belastet hoftebøy, kjerneutholdenhet og setestyrke for retur til aktivitet.',
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
    // Lower Back
    'Anti‑extension core (Dead Bug, Plank) and glute bridging reduce lumbar load and re‑train positioning for daily moves.': 'Anti‑ekstensjon kjerne (Dead Bug, Planke) og seteløft reduserer belastning på korsrygg og gjenlærer posisjonering til hverdagsbevegelser.',
    'Single‑leg and hinge variations load hips—not spine—while building time‑under‑tension safely.': 'Ettbeins- og hoftebøyvarianter belaster hofter—ikke rygg—og bygger tid under spenning trygt.',
    'Progress volume/load while keeping spine neutral; oblique work resists unwanted trunk motion.': 'Øk volum/belastning med nøytral rygg; skrå magemuskler motstår uønsket bevegelse i overkroppen.',
    'Gradually increase load on hinge and trunk while maintaining neutral mechanics.': 'Øk gradvis belastning på hoftebøy og kjerne med nøytral mekanikk.',
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
    // Lower Back
    'Less morning stiffness; easier sit‑to‑stand and bend within pain‑free range.': 'Mindre morgenstivhet; lettere å reise seg og bøye innen smertefri grense.',
    'More confident hip hinging and lifting light loads with stable trunk.': 'Mer trygg hoftebøy og løft av lette vekter med stabil kjerne.',
    'Stronger, pain‑tolerant hinge/squat patterns and improved trunk endurance.': 'Sterkere, mer smerte‑tolerante hoftebøy/knebøy‑mønstre og bedre kjerneutholdenhet.',
    'Comfort with routine bending/lifting; minimal flare‑ups at daily loads.': 'Komfort ved daglige bøy/løft; minimale oppbluss ved daglig belastning.',
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
    // Lower Back
    'Add hip‑hinge patterning and gentle hamstring loading in Week 2.': 'Legg til hoftebøy‑mønster og skånsom hamstrings‑belastning i uke 2.',
    'Advance volume and integrate squats/anti‑rotation work in Week 3.': 'Øk volum og integrer knebøy/anti‑rotasjon i uke 3.',
    'Integrate more complex patterns and mild loaded hinge in Week 4.': 'Integrer mer komplekse mønstre og lett belastet hoftebøy i uke 4.',
    'Maintain 2–3x/week; progress hinge load and overall volume as tolerated.': 'Vedlikehold 2–3x/uke; øk hoftebøy‑belastning og totalvolum etter toleranse.',
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
    // Lower Back
    'No breath‑holding, end‑range spine flexion/extension, or ballistic work; stop with sharp pain.': 'Ingen pusteholding, ytterposisjon i fleksjon/ekstensjon eller ballistisk arbeid; stopp ved skarp smerte.',
    'No loaded spinal flexion, jerky tempo, or pushing past a 3/10 pain; keep reps smooth.': 'Ingen belastet ryggfleksjon, rykkete tempo eller over 3/10 smerte; hold repene jevne.',
    'No heavy spinal compression, twisting into pain, or fast range changes; quality over load.': 'Ingen tung ryggkompresjon, vridning inn i smerte eller raske bevegelsesendringer; kvalitet foran belastning.',
    'No max‑effort singles, forced end‑range extension, or pain‑provoking reps; prioritize form.': 'Ingen maks‑enkeltløft, tvunget ytterstilling i ekstensjon eller smerteprovoserende reps; prioriter teknikk.',
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

// Helper function to create workout days with computed durations
const createWorkoutDay = (day: number, description: string, exercises: any[]) => ({
  day,
  description,
  isRestDay: false,
  exercises,
  duration: calculateDayDuration(exercises),
});

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
      { exerciseId: 'warmup-9', duration: 300, warmup: true, modification: 'Keep abdomen tall; rotate only to a comfortable range.' },
      { exerciseId: 'warmup-5', duration: 300, warmup: true, modification: 'Engage core lightly; avoid lumbar pain.' },
      { exerciseId: 'lower-back-1', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Lift only to the point where tension is felt, not pain.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add hip stability and core tension hold
    const exercises = [
      { exerciseId: 'warmup-5', duration: 300, warmup: true, modification: 'Pelvic tilt with breath coordination.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Bodyweight bridge; pause 1s at top.' },
      { exerciseId: 'lower-back-1', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Controlled extension, no pain.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Add light glute and core coordination to support spinal alignment.',
      exercises,
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
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
    duration: calculateDayDuration(exercises)
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
      { exerciseId: 'warmup-3', duration: 300, warmup: true, modification: 'Walk at 5% incline, easy pace, no pain.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause 1s at the top; keep pelvis stable.' },
      { exerciseId: 'quads-193', sets: 1, duration: 30, restBetweenSets: 60, modification: 'Hold shallow angle (≤ 60° knee flexion).' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add reps and posterior chain balance
    const exercises = [
      { exerciseId: 'warmup-3', duration: 300, warmup: true, modification: 'Walk at incline or light uphill if available.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Controlled tempo, no pelvic tilt.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Bodyweight glute bridge, pause 1s at top.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Add posterior chain support to improve knee control without loading the joint.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add balance challenge + eccentric emphasis
    const exercises = [
      { exerciseId: 'warmup-3', duration: 300, warmup: true, modification: 'Maintain steady breathing, easy pace.' },
      { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Pause 1s at top; control descent.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Controlled tempo; focus on symmetry.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Improve balance and hip control while continuing to offload the knee.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  // WEEK 4: Reinforce glute patterning and reintroduce wall sit
  const exercises = [
    { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Slow and stable reps.' },
    { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s at top, breathe out on lift.' },
    { exerciseId: 'quads-193', sets: 1, duration: 40, restBetweenSets: 60, modification: 'Wall sit at 45–60°; stop if knee discomfort.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Reinforce posterior support and tolerance for static quad activation.',
    exercises,
    duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
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
    duration: calculateDayDuration(exercises)
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
      { exerciseId: 'warmup-6', duration: 60, warmup: true, modification: 'Light jogging in place, focus on ankle mobility.' },
      { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Both legs; slow up-down, support as needed.' },
      { exerciseId: 'calves-12', sets: 1, repetitions: 8, restBetweenSets: 60, modification: 'Add wall support if unstable.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Gentle range of motion and calf pump to assist lymph drainage.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: More volume and proprioceptive cueing
    const exercises = [
      { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'March in place; full-foot contact, quiet landings.' },
      { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Use wall support; pause 1s at top.' },
      { exerciseId: 'calves-6', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Smooth tempo, both legs.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Increase calf control and begin rebuilding joint awareness.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Emphasize single-leg control and time-under-tension
    const exercises = [
      { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Balance focus; add finger support only if needed.' },
      { exerciseId: 'glutes-44', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Isolate hip abduction; keep pelvis stable.' },
      { exerciseId: 'warmup-6', duration: 60, warmup: true, modification: 'Jog or march in place to finish; no heel strike.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce ankle control with unilateral loading and balance prep.',
      exercises,
      duration: calculateDayDuration(exercises)
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
    duration: calculateDayDuration(exercises)
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
      { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 30, modification: 'Rotate through pain-free range only.' },
      { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
      { exerciseId: 'biceps-1', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Use 0.5 kg or no weight; focus on controlled lowering.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Low-load wrist mobility and gentle neural glide to reduce elbow tension.',
      exercises,
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Introduce low-volume isometric hold
    const exercises = [
      { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 30, modification: 'Pause 1s at end range.' },
      { exerciseId: 'forearms-1', sets: 1, duration: 30, restBetweenSets: 45, modification: 'Gentle static wrist extension; stop if painful.' },
      { exerciseId: 'biceps-1', sets: 2, repetitions: 12, restBetweenSets: 45 }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce tendon loading tolerance with a light isometric hold.',
      exercises,
      duration: calculateDayDuration(exercises)
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
    duration: calculateDayDuration(exercises)
  };
};

/* ---------------- Hamstring Strain ---------------- */
const createHamstringRestDay = (day: number): any => {
  const exercises = [
    {
      exerciseId: 'warmup-6',
      duration: 90,
      warmup: true,
      modification: 'March in place or jog lightly with relaxed form.',
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
    duration: calculateDayDuration(exercises),
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
    duration: calculateDayDuration(exercises),
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
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
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
    duration: calculateDayDuration(exercises)
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
      { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'March gently in place, focus on foot contact.' },
      { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Light heel raises, control the descent.' },
      { exerciseId: 'glutes-44', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Keep movements slow and controlled.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Light foot mobility and calf stretches to support healing.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Add volume and reinforce eccentric control
    const exercises = [
      { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'March in place with full foot roll-through.' },
      { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Use slow eccentric lowering.' },
      { exerciseId: 'glutes-44', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Engage glutes fully; no rotation.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Reinforce calf control and introduce light arch stability.',
      exercises,
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 21) {
    // WEEK 3: Add unilateral balance
    const exercises = [
      { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'Light jog in place, no heel impact.' },
      { exerciseId: 'calves-12', sets: 1, repetitions: 8, restBetweenSets: 60, modification: 'Single-leg heel raise; use support if needed.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Pause at top, keep pelvis stable.' }
    ];
    
    return {
      ...base,
      description: 'Rest day. Challenge ankle control and foot arch through unilateral work.',
      exercises,
      duration: calculateDayDuration(exercises)
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
    duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
    };
  }

  if (day <= 14) {
    // WEEK 2: Introduce anti-rotation (obliques) and longer hold
    const exercises = [
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold each rep for 2s at top.' },
      { exerciseId: 'obliques-4', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Maintain symmetry, slow tempo.' },
      { exerciseId: 'abs-6', sets: 1, duration: 30, restBetweenSets: 30, modification: 'Brace core during each marching movement.', warmup: true }
    ];
    
    return {
      ...base,
      description: 'Rest day. Light anti-rotation and core control to improve deep stabilizer endurance.',
      exercises,
      duration: calculateDayDuration(exercises)
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
      duration: calculateDayDuration(exercises)
    };
  }

  // WEEK 4: More volume on anti-rotation + deep core endurance
  const exercises = [
    { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Resist rotation throughout full range.' },
    { exerciseId: 'abs-20', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Focus on breath and bracing.' },
    { exerciseId: 'abs-6', sets: 1, duration: 40, restBetweenSets: 30, warmup: true, modification: 'Controlled marching, avoid spine movement.' }
  ];
  
  return {
    ...base,
    description: 'Rest day. Reinforce anti-rotation control and increase endurance for deep core.',
    exercises,
    duration: calculateDayDuration(exercises)
  };
};

export const rehabPrograms: ExerciseProgram[] = [
  // -----------------------------------------------------------------
  // 0. Medial Tibial Stress Syndrome (Shin Splints)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 calms tibial stress with impact deload, ankle/calf mobility, and isometric calf holds.',
    summary: 'Deload impact; mobility + isometric calf capacity',
    timeFrameExplanation:
      'Replace running with Zone 2 cycling/rowing; use gentle ankle mobility and static calf work to reduce pain.',
    afterTimeFrame: {
      expectedOutcome: 'Lower tibial soreness; pain‑free walking and stairs.',
      nextSteps: 'Add eccentric calf work and introduce foot intrinsic activation in Week 2.',
    },
    whatNotToDo:
      'No running/jumping or hard‑surface mileage; stop if sharp tibial pain.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Deload & Mobility (ankle/calf)', [
        { exerciseId: 'cardio-7', duration: 1200, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'warmup-6', duration: 90, warmup: true },
      ]),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Gentle ankle mobility and light calf pumps to reduce tibial irritation.',
        exercises: [
          { exerciseId: 'warmup-6', duration: 60, warmup: true },
          { exerciseId: 'calves-6', sets: 1, repetitions: 12, restBetweenSets: 45 },
        ],
        duration: calculateDayDuration([
          { exerciseId: 'warmup-6', duration: 60, warmup: true },
          { exerciseId: 'calves-6', sets: 1, repetitions: 12, restBetweenSets: 45 },
        ]),
      },
      createWorkoutDay(3, 'Isometric Calf Capacity', [
        { exerciseId: 'calves-6', sets: 3, repetitions: 20, restBetweenSets: 45 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'cardio-9', duration: 900, warmup: true },
      ]),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Short walk on soft surface; avoid hills. Gentle calf stretch if pain‑free.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(5, 'Deload & Mobility (ankle/calf)', [
        { exerciseId: 'cardio-7', duration: 1200, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'warmup-6', duration: 90, warmup: true },
      ]),
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
        description: 'Rest day. Avoid impact; light cycling optional if fully pain‑free.',
        exercises: [],
        duration: 10,
      },
    ],
    targetAreas: ['shin'],
    bodyParts: ['Shin', 'Calves'],
  },
  {
    programOverview:
      'Week 2 adds eccentric calf loading, foot intrinsics, and cadence cues to reduce tibial load.',
    summary: 'Eccentric calf + foot control; cadence awareness',
    timeFrameExplanation:
      'Calves‑63 eccentrics and toe control remodel tissue; practice walk cadence 165–175 spm on flats.',
    afterTimeFrame: {
      expectedOutcome: 'Improved walking tolerance; less soreness post‑activity.',
      nextSteps: 'Begin walk‑jog intervals and soft‑surface progressions in Week 3.',
    },
    whatNotToDo:
      'No hills, speed work, or hard‑surface mileage; keep pain ≤3/10.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'calves-63', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'cardio-5', duration: 1200, warmup: true },
      ]),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Short cadence‑focused walk on soft surface (≤10 min); light calf pumps.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(3, 'Foot Intrinsics + Eccentric Calf', [
        { exerciseId: 'calves-63', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'cardio-9', duration: 900, warmup: true },
      ]),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Gentle ankle circles; optional 10–15 min cycling Zone 2.',
        exercises: [],
        duration: 15,
      },
      createWorkoutDay(5, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'cardio-7', duration: 1200, warmup: true },
      ]),
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
      'Week 3 introduces walk‑jog intervals on soft surfaces while maintaining eccentric calf strength.',
    summary: 'Walk‑jog return; maintain eccentrics',
    timeFrameExplanation:
      'Use 1:1 walk‑jog (60s/60s) x 10–12 on grass/track; keep cadence high and stride short.',
    afterTimeFrame: {
      expectedOutcome: 'Comfortable short jog intervals; minimal next‑day tibial tenderness.',
      nextSteps: 'Progress interval ratio and total time in Week 4.',
    },
    whatNotToDo:
      'No spikes in weekly volume; avoid hills, sprints, and hard surfaces.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Walk‑Jog Intervals (soft surface)', [
        { exerciseId: 'cardio-1', duration: 1200, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
      ]),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Easy cycling 10–15 min or rest; check morning pain (≤2/10).',
        exercises: [],
        duration: 15,
      },
      createWorkoutDay(3, 'Walk‑Jog Intervals (soft surface)', [
        { exerciseId: 'cardio-1', duration: 1200, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Foot intrinsic drills and ankle mobility only if pain‑free.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(5, 'Walk‑Jog Intervals (soft surface)', [
        { exerciseId: 'cardio-1', duration: 1200, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
      ]),
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
      'Week 4 progresses jog volume and reintroduces gentle inclines while preserving calf strength.',
    summary: 'Progress jog volume; gentle incline; keep strength',
    timeFrameExplanation:
      'Move to 2:1 jog:walk (120s/60s) x 8–10 on track/grass; add short 2–3% incline walks only if pain‑free.',
    afterTimeFrame: {
      expectedOutcome: 'Able to jog 15–20 min continuously on soft surface with minimal soreness.',
      nextSteps: 'Increase weekly run time by ~10% and reintroduce road gradually as tolerated.',
    },
    whatNotToDo:
      'No speed work, downhill running, or rapid surface changes; keep pain ≤3/10.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Walk‑Jog Progression (2:1)', [
        { exerciseId: 'cardio-1', duration: 1500, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Optional short incline walk ≤5 min if pain‑free next morning.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(3, 'Walk‑Jog Progression (2:1)', [
        { exerciseId: 'cardio-1', duration: 1500, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-12', sets: 2, repetitions: 8, restBetweenSets: 60 },
      ]),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Gentle mobility and soft‑tissue; avoid tibial tenderness.',
        exercises: [],
        duration: 10,
      },
      createWorkoutDay(5, 'Walk‑Jog Progression (2:1)', [
        { exerciseId: 'cardio-1', duration: 1500, warmup: true },
        { exerciseId: 'calves-63', sets: 2, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
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
      'Week 1 restores spinal neutrality and deep-core control with Dead Bug, Plank, and Glute Bridge to calm symptoms.',
    summary: 'Calm pain; rebuild neutral spine and glute activation',
    timeFrameExplanation:
      'Anti‑extension core (Dead Bug, Plank) and glute bridging reduce lumbar load and re‑train positioning for daily moves.',
    afterTimeFrame: {
      expectedOutcome:
        'Less morning stiffness; easier sit‑to‑stand and bend within pain‑free range.',
      nextSteps:
        'Add hip‑hinge patterning and gentle hamstring loading in Week 2.',
    },
    whatNotToDo:
      'No breath‑holding, end‑range spine flexion/extension, or ballistic work; stop with sharp pain.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Relief & Mobility',
        isRestDay: false,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
        duration: calculateDayDuration([
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ]),
      },
      createLowBackRestDay(2),
      {
        day: 3,
        description: 'Relief & Mobility',
        isRestDay: false,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
        duration: calculateDayDuration([
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ]),
      },
      createLowBackRestDay(4),
      {
        day: 5,
        description: 'Relief & Mobility',
        isRestDay: false,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
        duration: calculateDayDuration([
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ]),
      },
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 2
  {
    programOverview:
      'Week 2 grooves the hip hinge and progresses glute work; introduce hamstring eccentrics (e.g., single‑leg RDL pattern).',
    summary: 'Hinge mechanics + glute strength; controlled hamstring eccentrics',
    timeFrameExplanation:
      'Single‑leg and hinge variations load hips—not spine—while building time‑under‑tension safely.',
    afterTimeFrame: {
      expectedOutcome:
        'More confident hip hinging and lifting light loads with stable trunk.',
      nextSteps:
        'Advance volume and integrate squats/anti‑rotation work in Week 3.',
    },
    whatNotToDo:
      'No loaded spinal flexion, jerky tempo, or pushing past a 3/10 pain; keep reps smooth.',
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
        duration: calculateDayDuration([
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
      'Week 3 adds functional strength—squats, hinge work, and anti‑rotation (Side Plank) with steady load.',
    summary: 'Functional lower‑body strength + anti‑rotation core',
    timeFrameExplanation:
      'Progress volume/load while keeping spine neutral; oblique work resists unwanted trunk motion.',
    afterTimeFrame: {
      expectedOutcome:
        'Stronger, pain‑tolerant hinge/squat patterns and improved trunk endurance.',
      nextSteps:
        'Integrate more complex patterns and mild loaded hinge in Week 4.',
    },
    whatNotToDo:
      'No heavy spinal compression, twisting into pain, or fast range changes; quality over load.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Functional Strength (squat + anti-rotation)', [
        { exerciseId: 'quads-87', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Functional Strength (squat + anti-rotation)', [
        { exerciseId: 'quads-87', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Functional Strength (squat + anti-rotation)', [
        { exerciseId: 'quads-87', sets: 3, repetitions: 10, restBetweenSets: 60 },
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
      'Week 4 integrates loaded hinge, core endurance, and glute strength for return‑to‑activity.',
    summary: 'Loaded hinge confidence; core endurance for daily lifting',
    timeFrameExplanation:
      'Gradually increase load on hinge and trunk while maintaining neutral mechanics.',
    afterTimeFrame: {
      expectedOutcome:
        'Comfort with routine bending/lifting; minimal flare‑ups at daily loads.',
      nextSteps:
        'Maintain 2–3x/week; progress hinge load and overall volume as tolerated.',
    },
    whatNotToDo:
      'No max‑effort singles, forced end‑range extension, or pain‑provoking reps; prioritize form.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Return‑to‑Activity (loaded hinge)', [
        { exerciseId: 'quads-87', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
      ]),
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Activity (loaded hinge)', [
        { exerciseId: 'quads-87', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Activity (loaded hinge)', [
        { exerciseId: 'quads-87', sets: 3, repetitions: 12, restBetweenSets: 60 },
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
      'Week 1 reduces patellofemoral irritation with hip abduction (glute med), wall sits, and incline walking.',
    summary: 'De‑load knee; build hip control and quad tolerance',
    timeFrameExplanation:
      'Glute med activation (Side‑lying Abduction), quad isometrics (Wall Sit), and walking keep load knee‑friendly.',
    afterTimeFrame: {
      expectedOutcome:
        'Less front‑of‑knee pain; easier stairs and sit‑to‑stand at low loads.',
      nextSteps:
        'Add controlled squats/lunges in Week 2 if pain ≤3/10.',
    },
    whatNotToDo:
      'No downhill running, deep knee flexion under pain, or plyometrics; avoid kneecap compression positions.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'De‑load & Control', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'De‑load & Control', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'De‑load & Control', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
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
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Controlled Loading (add single‑leg)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Controlled Loading (add single‑leg)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Run Prep (add Bulgarians + step‑downs)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Run Prep (add Bulgarians + step‑downs)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Run (progress mileage)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ]),
        createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Run (progress mileage)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
      'Week 1 restores pain‑free shoulder motion via band pull‑aparts and external rotations with scapular control.',
    summary: 'Scapular control + cuff activation, pain‑free range',
    timeFrameExplanation:
      'Band Pull‑Apart (shoulders‑30) + External Rotation (shoulders‑94) build upward rotation and cuff endurance.',
    afterTimeFrame: {
      expectedOutcome:
        'Less pinching; easier shoulder elevation within a comfortable range.',
      nextSteps:
        'Increase reps/holds and add light flexion work in Week 2.',
    },
    whatNotToDo:
      'No forced overhead range, shrugging into pain, or heavy press variations.',
    createdAt: new Date('2025-05-29T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Pain‑Free Range & Control', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(2),
      createWorkoutDay(3, 'Pain‑Free Range & Control', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ]),
      createShoulderRestDay(4),
      {
        day: 5,
        description: 'Pain‑Free Range & Control',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
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
      'Week 1 restores pain‑free ankle motion with light jogging in place and double‑leg calf raises to manage swelling.',
    summary: 'Circulation + gentle ROM; ankle feels safer',
    timeFrameExplanation:
      'Jog in place (warmup‑6) and calf pumps (calves‑6) aid lymph flow and restore tolerance.',
    afterTimeFrame: {
      expectedOutcome:
        'Less swelling; calmer walking and easy stairs.',
      nextSteps:
        'Begin strength return with double‑/eccentric raises in Week 2.',
    },
    whatNotToDo:
      'No cutting, unstable surfaces, or forced deep dorsiflexion; stop if swelling spikes.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Acute Recovery (mobility & swelling)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Acute Recovery (mobility & swelling)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(4),
      {
        day: 5,
        description: 'Acute Recovery (mobility & swelling)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
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
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Strength Return (calf & glute)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(4),
      createWorkoutDay(5, 'Strength Return (calf & glute)', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Balance & Proprioception', [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
        createAnkleRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Jog (dynamic loading)', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
        createAnkleRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Jog (dynamic loading)', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
      'Week 1 uses isometric wrist extension and light rotation to calm symptoms and load the tendon safely.',
    summary: 'Isometric analgesia + gentle forearm rotation',
    timeFrameExplanation:
      'Wrist isometrics (forearms‑1) and light rotations (forearms‑2) reduce pain sensitivity and start capacity.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower resting pain; easier light grip/typing and daily tasks.',
      nextSteps:
        'Introduce slow eccentrics in Week 2 if pain ≤3/10.',
    },
    whatNotToDo:
      'No fast grip work, heavy carries, or jerky wrist extension; stop if sharp/radiating pain.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Isometric Pain Modulation', [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-1', sets: 5, duration: 45, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(2),
      createWorkoutDay(3, 'Isometric Pain Modulation', [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-1', sets: 5, duration: 45, restBetweenSets: 60 },
      ]),
      createTennisElbowRestDay(4),
      createWorkoutDay(5, 'Isometric Pain Modulation', [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'forearms-1', sets: 5, duration: 45, restBetweenSets: 60 },
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
      'Week 1 reduces neck/upper‑back tension with arm circles, band pull‑aparts, trunk rotation, and gentle cuff work.',
    summary: 'Mobility + scapular activation to unload neck',
    timeFrameExplanation:
      'Arm Circles (warmup‑8), Band Pull‑Apart, Trunk Rotation (warmup‑9), and ER build posture without strain.',
    afterTimeFrame: {
      expectedOutcome:
        'Less neck tightness; better ability to sit tall without fatigue.',
      nextSteps:
        'Add upper‑back row volume and longer ER sets in Week 2.',
    },
    whatNotToDo:
      'No shrug‑dominant lifts, forced end‑range neck stretches, or painful ranges.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Mobility & Awareness', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30 },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45 },
      ]),
      createTechNeckRestDay(2),
      createWorkoutDay(3, 'Mobility & Awareness', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30 },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45 },
      ]),
      createTechNeckRestDay(4),
      createWorkoutDay(5, 'Mobility & Awareness', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30 },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45 },
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
      'Week 1 reduces heel pain with calf pumps and gentle walking tolerance; keep loads sub‑symptomatic.',
    summary: 'Calm heel pain; start calf activation',
    timeFrameExplanation:
      'Double‑leg calf raises and easy marching restore blood flow without irritating the fascia.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower morning pain; easier first steps and short walks.',
      nextSteps:
        'Add calf eccentrics in Week 2 if pain ≤3/10.',
    },
    whatNotToDo:
      'No barefoot walking on hard floors; do not push through sharp heel pain.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Light Load & Arch Activation', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Light Load & Arch Activation', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Light Load & Arch Activation', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
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
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Eccentric Calf & Toe Control', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Balance & Midfoot Strength', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Balance & Midfoot Strength', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Function & Return‑to‑Impact', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
      'Week 1 restores mobility and introduces pain‑free hamstring isometrics and bridges.',
    summary: 'Mobility + pain‑free isometric activation',
    timeFrameExplanation:
      'Glute bridges and single‑leg RDL patterning (short ROM) engage posterior chain without flare‑ups.',
    afterTimeFrame: {
      expectedOutcome:
        'Less tightness; comfortable walking and gentle hip hinge.',
      nextSteps:
        'Add controlled eccentrics in Week 2.',
    },
    whatNotToDo:
      'No overstretching or ballistic movements; stop if sharp pain occurs.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Isometric Activation & Mobility', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Isometric Activation & Mobility', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Isometric Activation & Mobility', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60 },
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
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Introduce Eccentric Loading', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Introduce Eccentric Loading', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Single-Leg Control & Hinge Strength', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Single-Leg Control & Hinge Strength', [
        { exerciseId: 'warmup-6', duration: 180, warmup: true },
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
        { exerciseId: 'cardio-1', duration: 600, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Return‑to‑Jog (light dynamic work)', [
        { exerciseId: 'cardio-1', duration: 600, warmup: true },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Return‑to‑Jog (light dynamic work)', [
        { exerciseId: 'cardio-1', duration: 600, warmup: true },
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
      'Week 1 focuses on gentle spinal mobility and basic postural awareness to counteract forward positioning.',
    summary: 'Comprehensive postural reset with mobility and strengthening',
    timeFrameExplanation:
      'Start with gentle extension exercises and breathing pattern correction for postural improvement.',
    afterTimeFrame: {
      expectedOutcome:
        'Reduced upper back tension and improved postural awareness during daily activities.',
      nextSteps:
        'Progress to Week 2 for targeted pulling movements and posterior chain strengthening.',
    },
    whatNotToDo:
      'No heavy pressing or prolonged slouching during the early stages.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Posture Awareness & Mobility', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createPostureRestDay(2),
      createWorkoutDay(3, 'Posture Awareness & Mobility', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60 },
      ]),
      createPostureRestDay(4),
      createWorkoutDay(5, 'Posture Awareness & Mobility', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60 },
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
      'Week 1 focuses on reactivating your deep core muscles and practicing control.',
    summary: 'Deep core activation and control foundation',
    timeFrameExplanation:
      'Begin with basic core stabilization exercises to build foundational strength.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved core activation and better control in basic positions.',
      nextSteps:
        'Progress to Week 2 for time under tension and movement coordination.',
    },
    whatNotToDo:
      'No high‑rep sit‑ups or long planks with poor form.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Activation & Control', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Activation & Control', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Activation & Control', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
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
        { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Time Under Tension & Movement', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Time Under Tension & Movement', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
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
];

// URL slug mapping for direct program access - maps to the starting index of each 4-week sequence
export const programSlugs: Record<string, number> = {
  'shin-splints': 0,
  // Low Back: indices 4-7 (4 weeks)
  lowback: 4,
  'low-back': 4,
  'lower-back': 4,
  
  // Runner's Knee: indices 8-11 (4 weeks)
  runnersknee: 8,
  'runners-knee': 8,
  
  // Shoulder: indices 12-15 (4 weeks)
  shoulder: 12,
  'shoulder-impingement': 12,
  
  // Ankle: indices 16-19 (4 weeks)
  ankle: 16,
  'ankle-sprain': 16,
  
  // Tennis Elbow: indices 20-23 (4 weeks)
  'tennis-elbow': 20,
  elbow: 20,
  
  // Tech Neck: indices 24-27 (4 weeks)
  techneck: 24,
  
  // Plantar Fasciitis: indices 28-31 (4 weeks)
  'plantar-fasciitis': 28,
  plantarfasciitis: 28,
  plantar: 28,
  
  // Hamstring: indices 32-35 (4 weeks)
  'hamstring-strain': 32,
  hamstring: 32,
  
  // Upper Back & Core: indices 36-39 (4 weeks)
  'upper-back-core': 36,
  upperbackcore: 36,
  
  // Core Stability: indices 40-43 (4 weeks)
  'core-stability': 40,
  corestability: 40,
};

// Function to get program by URL slug - combines all 4 weeks into a single 28-day program
export const getProgramBySlug = (slug: string): ExerciseProgram | null => {
  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;
  
  // Get all 4 weeks for this condition
  const week1 = rehabPrograms[baseIndex];
  const week2 = rehabPrograms[baseIndex + 1];
  const week3 = rehabPrograms[baseIndex + 2];
  const week4 = rehabPrograms[baseIndex + 3];
  
  if (!week1 || !week2 || !week3 || !week4) return null;
  
  // Combine all days from all 4 weeks, renumbering them 1-28
  const allDays = [
    // Week 1: days 1-7
    ...week1.days.map((day, index) => ({ ...day, day: index + 1 })),
    // Week 2: days 8-14
    ...week2.days.map((day, index) => ({ ...day, day: index + 8 })),
    // Week 3: days 15-21
    ...week3.days.map((day, index) => ({ ...day, day: index + 15 })),
    // Week 4: days 22-28
    ...week4.days.map((day, index) => ({ ...day, day: index + 22 }))
  ];
  
  // Return the combined program using week1 as the base
  return {
    ...week1,
    days: allDays,
    // Use the most comprehensive overview from week1
    programOverview: week1.programOverview,
    timeFrameExplanation: week1.timeFrameExplanation,
    afterTimeFrame: week1.afterTimeFrame,
    whatNotToDo: week1.whatNotToDo
  };
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
  // Get the 4 separate week programs instead of the combined 28-day program
  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;
  
  // Get all 4 weeks for this condition as separate programs
  const week1 = rehabPrograms[baseIndex];
  const week2 = rehabPrograms[baseIndex + 1];
  const week3 = rehabPrograms[baseIndex + 2];
  const week4 = rehabPrograms[baseIndex + 3];
  
  if (!week1 || !week2 || !week3 || !week4) return null;

  const today = new Date();
  const normalizedSlug = slug.toLowerCase();

  // Update each week's createdAt to today so dates display correctly
  const updatedWeekPrograms = [
    { ...week1, createdAt: today },
    { ...week2, createdAt: today },
    { ...week3, createdAt: today },
    { ...week4, createdAt: today }
  ];

  // Create specific diagnosis and questionnaire for each program type
  if (normalizedSlug.includes('lowback') || normalizedSlug.includes('low-back') || normalizedSlug.includes('lower-back')) {
    return {
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
      title: 'Lower Back Pain Recovery',
      docId: `recovery-lowback-${Date.now()}`
    };
  }

  if (
    normalizedSlug.includes('shin') ||
    normalizedSlug.includes('shin-splints') ||
    normalizedSlug.includes('mtss')
  ) {
    return {
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
      title: 'Shin Splints (MTSS) Recovery',
      docId: `recovery-shin-splints-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('runners') || normalizedSlug.includes('knee')) {
    return {
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
      title: 'Patellofemoral Pain Syndrome Recovery',
      docId: `recovery-runnersknee-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('shoulder')) {
    return {
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
      title: 'Shoulder Impingement Recovery',
      docId: `recovery-shoulder-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('ankle')) {
    return {
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
      title: 'Ankle Sprain Recovery',
      docId: `recovery-ankle-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('tennis') || normalizedSlug.includes('elbow')) {
    return {
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
      title: 'Lateral Epicondylitis Recovery',
      docId: `recovery-tennis-elbow-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('techneck') || normalizedSlug.includes('tech-neck')) {
    return {
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
      title: 'Tech Neck (Cervical Strain) Recovery',
      docId: `recovery-techneck-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('plantar')) {
    return {
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
      title: 'Plantar Fasciitis Recovery',
      docId: `recovery-plantar-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('hamstring')) {
    return {
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
      title: 'Hamstring Strain Recovery',
      docId: `recovery-hamstring-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('upper-back') || normalizedSlug.includes('upperback')) {
    return {
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
      title: 'Upper Back & Core Dysfunction Recovery',
      docId: `recovery-upperback-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('core')) {
    return {
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
      title: 'Core Instability Recovery',
      docId: `recovery-core-${Date.now()}`
    };
  }

  // Fallback for any unmatched slugs
  return null;
};
