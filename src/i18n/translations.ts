export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface TranslationStrings {
  common: {
    appName: string;
    tagline: string;
    demoChip: string;
    methodsAndLimits: string;
    offlineMode: string;
    queuedSubmissions: string;
    next: string;
    back: string;
    submit: string;
    cancel: string;
    save: string;
    verified: string;
    onHold: string;
    needsReview: string;
    insufficientData: string;
    acres: string;
    hectares: string;
    rupees: string;
    perHaPerYr: string;
  };
  farmerApp: {
    roleTitle: string;
    welcomeTitle: string;
    welcomeGreeting: string;
    phoneLabel: string;
    phonePlaceholder: string;
    sendOtp: string;
    otpLabel: string;
    verifyOtp: string;
    consentTitle: string;
    consentSubtitle: string;
    consentItem1Title: string;
    consentItem1Desc: string;
    consentItem2Title: string;
    consentItem2Desc: string;
    consentItem3Title: string;
    consentItem3Desc: string;
    consentItem4Title: string;
    consentItem4Desc: string;
    consentCheckbox: string;
    signaturePrompt: string;
    signatureClear: string;
    registerPlotTitle: string;
    plotNameLabel: string;
    passbookLabel: string;
    passbookPlaceholder: string;
    speciesLabel: string;
    plantingYearLabel: string;
    boundaryMethodDraw: string;
    boundaryMethodWalk: string;
    walkBoundaryBtn: string;
    walkingProgress: string;
    overlapCheckSuccess: string;
    overlapCheckFlagged: string;
    evidenceTitle: string;
    evidenceSubtitle: string;
    cornerA: string;
    cornerB: string;
    cornerC: string;
    cornerD: string;
    canopy: string;
    randomChallenge: string;
    chooseFile: string;
    useSampleBtn: string;
    sampleGood: string;
    sampleOutside: string;
    sampleDuplicate: string;
    sampleNoGps: string;
    processingTitle: string;
    processingSubtitle: string;
    stage1: string;
    stage2: string;
    stage3: string;
    stage4: string;
    stage5: string;
    stage6: string;
    stage7: string;
    stage8: string;
    resultsTitle: string;
    creditRangeLabel: string;
    payoutRangeLabel: string;
    confidenceScore: string;
    confidenceHigh: string;
    confidenceMed: string;
    confidenceLow: string;
    whyRangeTitle: string;
    whyRangeText: string;
    narrowRangeTipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    timelineTitle: string;
    stepSubmitted: string;
    stepSatellite: string;
    stepFraudChecks: string;
    stepReportSealed: string;
    stepAuditorReview: string;
    stepRegistry: string;
    stepSale: string;
    stepPayment: string;
    simulatedStepBadge: string;
    transparentSplitTitle: string;
    farmerShare75: string;
    platformFee: string;
    reserveBuffer: string;
    rejectionTitle: string;
    rejectionNextStepsTitle: string;
  };
  verifier: {
    roleTitle: string;
    tabOverview: string;
    tabCarbonEngine: string;
    tabPhenology: string;
    tabFraudChecks: string;
    tabAuditChain: string;
    tabEconomics: string;
    tabExport: string;
    showTheMath: string;
    closeMath: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    common: {
      appName: "Carbon Kheti",
      tagline: "Open, Low-Cost Agroforestry MRV for Smallholders",
      demoChip: "Demo data • Synthetic model",
      methodsAndLimits: "Methods & Limitations",
      offlineMode: "You are offline. Evidence will queue on your device.",
      queuedSubmissions: "Queued uploads will sync automatically when network returns.",
      next: "Continue",
      back: "Back",
      submit: "Submit for Verification",
      cancel: "Cancel",
      save: "Save",
      verified: "Clear Verified",
      onHold: "On Hold",
      needsReview: "Needs Review",
      insufficientData: "Insufficient Data",
      acres: "Acres",
      hectares: "Hectares",
      rupees: "₹",
      perHaPerYr: "tCO₂e/ha/yr",
    },
    farmerApp: {
      roleTitle: "Kisan Mobile Portal",
      welcomeTitle: "Welcome to Carbon Kheti",
      welcomeGreeting: "Earn fair carbon revenue for the trees on your farm without expensive middleman fees.",
      phoneLabel: "Mobile Number",
      phonePlaceholder: "e.g. 98490 12345",
      sendOtp: "Get OTP",
      otpLabel: "Enter 4-Digit Verification Code",
      verifyOtp: "Verify & Enter",
      consentTitle: "Farmer Consent (FPIC)",
      consentSubtitle: "Clear, honest terms before we begin. Your farm, your rights.",
      consentItem1Title: "What we measure",
      consentItem1Desc: "Satellite imagery and your field photos measure annual tree growth and biomass addition.",
      consentItem2Title: "Who sees your data",
      consentItem2Desc: "Accredited carbon auditors verify claims. Your personal phone number is never sold or shared.",
      consentItem3Title: "75% farmer revenue share",
      consentItem3Desc: "You receive 75% of carbon credit sales. Only ₹100/ha is deducted for automated MRV processing.",
      consentItem4Title: "Right to withdraw",
      consentItem4Desc: "You may leave the program at any time before verification is sealed with zero financial penalty.",
      consentCheckbox: "I understand and agree to the above terms in my own language.",
      signaturePrompt: "Tap to record your digital consent signature",
      signatureClear: "Clear",
      registerPlotTitle: "Register Your Plot",
      plotNameLabel: "Plot Nickname",
      passbookLabel: "Pattadar Passbook / Land Record No.",
      passbookPlaceholder: "e.g. TS/RR/2024/48192",
      speciesLabel: "Primary Tree Species",
      plantingYearLabel: "Planting Year",
      boundaryMethodDraw: "Tap Boundary Corners",
      boundaryMethodWalk: "Walk the Boundary (GPS)",
      walkBoundaryBtn: "Start GPS Walk",
      walkingProgress: "Walking boundary: recording coordinate breadcrumbs...",
      overlapCheckSuccess: "Spatial Check Passed: Zero overlap with adjacent registered farms.",
      overlapCheckFlagged: "Boundary Alert: This polygon overlaps with a neighbour's registered plot. Please adjust the marked edge.",
      evidenceTitle: "Capture Field Photos",
      evidenceSubtitle: "Take 4 boundary corner photos and 1 canopy photo inside your plot.",
      cornerA: "Corner A (North-East)",
      cornerB: "Corner B (South-East)",
      cornerC: "Corner C (South-West)",
      cornerD: "Corner D (North-West)",
      canopy: "Canopy / Tree Crown Photo",
      randomChallenge: "Verification challenge: Face North while capturing Corner B",
      chooseFile: "Select Camera Photo",
      useSampleBtn: "Use Sample Photo",
      sampleGood: "Valid Photo (In-Polygon GPS)",
      sampleOutside: "Outside Plot GPS (Flagged)",
      sampleDuplicate: "Duplicate Photo (Flagged)",
      sampleNoGps: "Stripped GPS EXIF (Flagged)",
      processingTitle: "Verification Engine Running",
      processingSubtitle: "Live satellite analysis and integrity checks in progress...",
      stage1: "Fetching Sentinel-2 10m multispectral imagery bands",
      stage2: "Evaluating per-scene cloud probability and monsoon mask",
      stage3: "Integrating Sentinel-1 C-band SAR radar backscatter fallback",
      stage4: "Extracting regional GEDI / ICESat-2 LiDAR canopy height feature",
      stage5: "Computing true paired biomass change dAGB = AGB(Y2) - AGB(Y1)",
      stage6: "Running 1,000x spatial bootstrap for 95% conservative lower bound",
      stage7: "Evaluating 5 automated anti-fraud checks (GPS, timestamp, hashes, overlap)",
      stage8: "Cryptographic SHA-256 seal computed and anchored to immutable log",
      resultsTitle: "Your Verification-Ready Estimate",
      creditRangeLabel: "Estimated Verifiable Credits",
      payoutRangeLabel: "Estimated Farmer Payout (75% Net)",
      confidenceScore: "Evidence Confidence Score",
      confidenceHigh: "High Confidence",
      confidenceMed: "Moderate Confidence",
      confidenceLow: "Low Confidence",
      whyRangeTitle: "Why is your estimate a range?",
      whyRangeText: "Nature fluctuates across seasons and satellite sensors have slight measurement uncertainty. To ensure buyers never doubt your credits, we guarantee the conservative lower bound, protecting you against future audits.",
      narrowRangeTipsTitle: "How to narrow the range and earn more:",
      tip1: "Submit 2 additional post-monsoon photos in late October to reduce variance.",
      tip2: "Cluster your boundary trees with neighbouring farms to eliminate edge penalties.",
      tip3: "Record tree collar diameter measurements during field agent visits.",
      timelineTitle: "Verification & Payout Timeline",
      stepSubmitted: "Evidence Submitted",
      stepSatellite: "Satellite & Radar Analyzed",
      stepFraudChecks: "Integrity Checks Passed",
      stepReportSealed: "Report Cryptographically Sealed",
      stepAuditorReview: "Auditor (VVB) Review",
      stepRegistry: "Registry Issuance",
      stepSale: "Credit Buyer Sale",
      stepPayment: "Direct Farmer Bank Transfer",
      simulatedStepBadge: "Simulated Milestone",
      transparentSplitTitle: "Transparent Revenue Breakdown",
      farmerShare75: "Farmer Direct Share (75%)",
      platformFee: "Carbon Kheti Automated MRV Fee (₹100/ha)",
      reserveBuffer: "Permanence Risk Pool Buffer (15%)",
      rejectionTitle: "Verification Temporarily On Hold",
      rejectionNextStepsTitle: "How to resolve this:",
    },
    verifier: {
      roleTitle: "Auditor & Science Console",
      tabOverview: "1. Overview & Map",
      tabCarbonEngine: "2. Carbon Engine & Bootstrap",
      tabPhenology: "3. Phenology & Radar Fallback",
      tabFraudChecks: "4. Fraud Checks",
      tabAuditChain: "5. Audit Log Chain",
      tabEconomics: "6. Unit Economics",
      tabExport: "7. Export Dossier",
      showTheMath: "Show the Math & Assumptions",
      closeMath: "Hide Math",
    },
  },
  te: {
    common: {
      appName: "కార్బన్ ఖేతీ",
      tagline: "చిన్న రైతులకు తక్కువ ఖర్చుతో కూడిన వ్యవసాయ అటవీ కార్బన్ ధృవీకరణ",
      demoChip: "డెమో సమాచారం • ప్రయోగాత్మక మోడల్",
      methodsAndLimits: "పద్ధతులు & పరిమితులు",
      offlineMode: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. ఫోటోలు మీ ఫోన్‌లో సురక్షితంగా ఉంటాయి.",
      queuedSubmissions: "నెట్‌వర్క్ వచ్చినప్పుడు వివరాలు ఆటోమేటిక్‌గా అప్‌లోడ్ అవుతాయి.",
      next: "ముందుకు సాగండి",
      back: "వెనుకకు",
      submit: "ధృవీకరణకు పంపండి",
      cancel: "రద్దు చేయండి",
      save: "భద్రపరచండి",
      verified: "ధృవీకరించబడింది",
      onHold: "తాత్కాలిక నిలిపివేత",
      needsReview: "సమీక్ష అవసరం",
      insufficientData: "సరిపడా డేటా లేదు",
      acres: "ఎకరాలు",
      hectares: "హెక్టార్లు",
      rupees: "₹",
      perHaPerYr: "టన్నుల CO₂e/హెక్టారు/సంవత్సరం",
    },
    farmerApp: {
      roleTitle: "రైతు మొబైల్ పోర్టల్",
      welcomeTitle: "కార్బన్ ఖేతీకి స్వాగతం",
      welcomeGreeting: "దళారుల కమీషన్లు లేకుండా మీ పొలంలోని చెట్లకు నేరుగా కార్బన్ ఆదాయం పొందండి.",
      phoneLabel: "మొబైల్ నంబర్",
      phonePlaceholder: "ఉదాహరణ: 98490 12345",
      sendOtp: "OTP పొందండి",
      otpLabel: "4 అంకెల కోడ్ నమోదు చేయండి",
      verifyOtp: "ధృవీకరించి ప్రవేశించండి",
      consentTitle: "రైతు సమ్మతి పత్రం (FPIC)",
      consentSubtitle: "స్పష్టమైన మరియు పారదర్శక నిబంధనలు. మీ భూమి, మీ హక్కులు.",
      consentItem1Title: "మేము ఏమి కొలుస్తాము",
      consentItem1Desc: "ఉపగ్రహ చిత్రాలు మరియు మీ పొలం ఫోటోల ద్వారా చెట్ల పెరుగుదలను కొలుస్తాము.",
      consentItem2Title: "మీ వివరాలను ఎవరు చూస్తారు",
      consentItem2Desc: "అధికారిక ఆడిటర్లు మాత్రమే పరిశీలిస్తారు. మీ ఫోన్ నంబర్ ఎవరికీ ఇవ్వబడదు.",
      consentItem3Title: "రైతుకు 75% ఆదాయం",
      consentItem3Desc: "కార్బన్ క్రెడిట్ అమ్మకాలలో 75% నేరుగా మీకే చేరుతుంది. ప్రాసెసింగ్ ఫీజు హెక్టారుకు ₹100 మాత్రమే.",
      consentItem4Title: "ఎప్పుడైనా వైదొలిగే హక్కు",
      consentItem4Desc: "ధృవీకరణ ఖరారు కావడానికి ముందు ఎటువంటి జరిమానా లేకుండా ప్రోగ్రామ్ నుండి తప్పుకోవచ్చు.",
      consentCheckbox: "పై నిబంధనలను నేను చదివి అర్థం చేసుకున్నాను మరియు అంగీకరిస్తున్నాను.",
      signaturePrompt: "సమ్మతి కోసం ఇక్కడ సంతకం చేయండి",
      signatureClear: "తుడిపివేయండి",
      registerPlotTitle: "మీ పొలం నమోదు చేయండి",
      plotNameLabel: "పొలం పేరు / గుర్తు",
      passbookLabel: "పట్టాదారు పాస్‌బుక్ సంఖ్య",
      passbookPlaceholder: "ఉదాహరణ: TS/RR/2024/48192",
      speciesLabel: "చెట్ల రకాలు (టేకు, మామిడి, మొదలైనవి)",
      plantingYearLabel: "నాటిన సంవత్సరం",
      boundaryMethodDraw: "హద్దులను మ్యాప్‌లో గుర్తించండి",
      boundaryMethodWalk: "హద్దుల వెంట నడవండి (GPS)",
      walkBoundaryBtn: "GPS వాక్ ప్రారంభించండి",
      walkingProgress: "హద్దుల వెంట నడక రికార్డ్ అవుతోంది...",
      overlapCheckSuccess: "సరిహద్దు తనిఖీ పూర్తయింది: పక్క రైతుల పొలాలతో ఎటువంటి కలయిక లేదు.",
      overlapCheckFlagged: "సరిహద్దు హెచ్చరిక: ఈ హద్దు పక్క రైతు పొలంతో కలిసింది. దయచేసి సరిచేయండి.",
      evidenceTitle: "పొలం ఫోటోలు తీయండి",
      evidenceSubtitle: "పొలం నాలుగు మూలల ఫోటోలు మరియు చెట్ల పైకప్పు ఫోటో తీయండి.",
      cornerA: "మూల A (ఈశాన్యం)",
      cornerB: "మూల B (ఆగ్నేయం)",
      cornerC: "మూల C (నైరుతి)",
      cornerD: "మూల D (వాయవ్యం)",
      canopy: "చెట్ల పైకప్పు (Canopy) ఫోటో",
      randomChallenge: "నియమం: మూల B వద్ద ఉత్తరం వైపు చూస్తూ ఫోటో తీయండి",
      chooseFile: "ఫోటోను ఎంచుకోండి",
      useSampleBtn: "నమూనా ఫోటో వాడండి",
      sampleGood: "సరైన ఫోటో (పొలం లోపల GPS)",
      sampleOutside: "పొలం బయట తీసిన ఫోటో (తిరస్కరించబడింది)",
      sampleDuplicate: "పాత ఫోటో నకలు (తిరస్కరించబడింది)",
      sampleNoGps: "GPS లేని ఫోటో (తిరస్కరించబడింది)",
      processingTitle: "విశ్లేషణ జరుగుతోంది",
      processingSubtitle: "ఉపగ్రహ పరిశీలన మరియు నిబంధనల తనిఖీ జరుగుతోంది...",
      stage1: "సెంటినెల్-2 ఉపగ్రహ చిత్రాలను సేకరిస్తున్నాము",
      stage2: "వర్షాకాలం మేఘాల స్థితిని పరిశీలిస్తున్నాము",
      stage3: "మేఘాల అడ్డంకిని అధిగమించడానికి రాడార్ (SAR) డేటా వినియోగిస్తున్నాము",
      stage4: "GEDI లేజర్ ద్వారా చెట్ల ఎత్తును లెక్కిస్తున్నాము",
      stage5: "చెట్ల జీవపదార్థం (Biomass) పెరుగుదలను లెక్కిస్తున్నాము",
      stage6: "1000x గణాంక విశ్లేషణ ద్వారా కచ్చితమైన అంచనా వేస్తున్నాము",
      stage7: "5 రకాల నిబంధనల తనిఖీలు పూర్తయ్యాయి",
      stage8: "డిజిటల్ రికార్డు సురక్షితంగా నమోదు చేయబడింది",
      resultsTitle: "మీ కార్బన్ అంచనా ఫలితం",
      creditRangeLabel: "అంచనా వేసిన కార్బన్ క్రెడిట్స్",
      payoutRangeLabel: "రైతుకు అందే అంచనా ఆదాయం (75%)",
      confidenceScore: "ఆధారాల విశ్వసనీయత స్కోరు",
      confidenceHigh: "అధిక విశ్వసనీయత",
      confidenceMed: "మధ్యస్థ విశ్వసనీయత",
      confidenceLow: "తక్కువ విశ్వసనీయత",
      whyRangeTitle: "అంచనా ఒకే సంఖ్య కాకుండా పరిధిగా ఎందుకు ఉంది?",
      whyRangeText: "ప్రకృతిలో మార్పులు మరియు ఉపగ్రహ కొలతల్లో చిన్న తేడాలు సహజం. మీ క్రెడిట్లను ఎవరూ ప్రశ్నించకుండా ఉండటానికి మేము సురక్షితమైన కనిష్ట పరిమితిని లెక్కిస్తాము.",
      narrowRangeTipsTitle: "ఆదాయాన్ని పెంచుకోవడానికి సలహాలు:",
      tip1: "అక్టోబర్ చివరలో మరో 2 స్పష్టమైన ఫోటోలు అప్‌లోడ్ చేయండి.",
      tip2: "పక్క రైతులతో కలిసి క్లస్టర్‌గా నమోదు చేసుకోండి.",
      tip3: "చెట్ల కాండం కొలతలను ఫీల్డ్ అసిస్టెంట్‌తో నమోదు చేయించండి.",
      timelineTitle: "చెల్లింపుల ప్రక్రియ దశలు",
      stepSubmitted: "వివరాలు సమర్పించబడ్డాయి",
      stepSatellite: "ఉపగ్రహ పరిశీలన పూర్తయింది",
      stepFraudChecks: "నిబంధనల తనిఖీ విజయవంతం",
      stepReportSealed: "రికార్డు సీల్ చేయబడింది",
      stepAuditorReview: "ఆడిటర్ సమీక్ష",
      stepRegistry: "రిజిస్ట్రీ జారీ",
      stepSale: "కొనుగోలుదారులకు అమ్మకం",
      stepPayment: "రైతు ఖాతాకు జమ",
      simulatedStepBadge: "భవిష్యత్ దశ",
      transparentSplitTitle: "పారదర్శక ఆదాయ వివరాలు",
      farmerShare75: "రైతుకు నేరుగా అందే వాటా (75%)",
      platformFee: "కార్బన్ ఖేతీ నిర్వహణ రుసుము (₹100/హెక్టారు)",
      reserveBuffer: "భద్రతా నిల్వ పూల్ (15%)",
      rejectionTitle: "ధృవీకరణ తాత్కాలికంగా నిలిపివేయబడింది",
      rejectionNextStepsTitle: "దీన్ని ఎలా పరిష్కరించాలి:",
    },
    verifier: {
      roleTitle: "ఆడిటర్ & సైన్స్ కన్సోల్",
      tabOverview: "1. అవలోకనం & మ్యాప్",
      tabCarbonEngine: "2. కార్బన్ ఇంజిన్ & బూట్‌స్ట్రాప్",
      tabPhenology: "3. ఫెనాలజీ & రాడార్ బ్యాకప్",
      tabFraudChecks: "4. ఫ్రాడ్ చెక్స్",
      tabAuditChain: "5. ఆడిట్ లాగ్ చైన్",
      tabEconomics: "6. యూనిట్ ఎకనామిక్స్",
      tabExport: "7. రిపోర్ట్ ఎక్స్‌పోర్ట్",
      showTheMath: "గణనలు & సూత్రాలను చూడండి",
      closeMath: "సూత్రాలను దాచండి",
    },
  },
  hi: {
      common: {
        appName: "कार्बन खेती",
        tagline: "छोटे किसानों के लिए खुली और किफायती कृषि-वानिकी एमआरवी",
        demoChip: "डेमो डेटा • सैद्धांतिक मॉडल",
        methodsAndLimits: "पद्धति और सीमाएं",
        offlineMode: "आप ऑफ़लाइन हैं। फोटो आपके फ़ोन में सुरक्षित रहेंगे।",
        queuedSubmissions: "नेटवर्क आने पर फ़ाइलें अपने आप अपलोड हो जाएंगी।",
        next: "आगे बढ़ें",
        back: "पीछे",
        submit: "सत्यापन के लिए भेजें",
        cancel: "रद्द करें",
        save: "सुरक्षित करें",
        verified: "सत्यापित",
        onHold: "अस्थायी रोक",
        needsReview: "समीक्षा आवश्यक",
        insufficientData: "अपर्याप्त डेटा",
        acres: "एकड़",
        hectares: "हेक्टेयर",
        rupees: "₹",
        perHaPerYr: "टन CO₂e/हेक्टेयर/वर्ष",
      },
      farmerApp: {
        roleTitle: "किसान मोबाइल पोर्टल",
        welcomeTitle: "कार्बन खेती में आपका स्वागत है",
        welcomeGreeting: "बिना बिचौलियों के अपने खेत के पेड़ों से सीधे कार्बन आय प्राप्त करें।",
        phoneLabel: "मोबाइल नंबर",
        phonePlaceholder: "उदा. 98490 12345",
        sendOtp: "ओटीपी प्राप्त करें",
        otpLabel: "4 अंकों का कोड दर्ज करें",
        verifyOtp: "सत्यापित करें और प्रवेश करें",
        consentTitle: "किसान सहमति पत्र (FPIC)",
        consentSubtitle: "शुरू करने से पहले स्पष्ट और पारदर्शी नियम। आपकी जमीन, आपके अधिकार।",
        consentItem1Title: "हम क्या मापते हैं",
        consentItem1Desc: "उपग्रह चित्रों और खेत की तस्वीरों से पेड़ों की सालाना वृद्धि और बायोमास मापा जाता है।",
        consentItem2Title: "आपका डेटा कौन देखता है",
        consentItem2Desc: "केवल मान्यता प्राप्त ऑडिटर सत्यापन के लिए देखते हैं। आपका फ़ोन नंबर कभी साझा नहीं किया जाता।",
        consentItem3Title: "किसान का 75% हिस्सा",
        consentItem3Desc: "कार्बन बिक्री का 75% सीधा आपको मिलता है। प्रोसेसिंग शुल्क मात्र ₹100 प्रति हेक्टेयर है।",
        consentItem4Title: "हटने का अधिकार",
        consentItem4Desc: "सत्यापन पूरा होने से पहले आप बिना किसी जुर्माने के कभी भी बाहर निकल सकते हैं।",
        consentCheckbox: "मैंने उपरोक्त शर्तों को समझ लिया है और अपनी सहमति देता हूँ।",
        signaturePrompt: "सहमति के लिए यहाँ हस्ताक्षर करें",
        signatureClear: "मिटाएं",
        registerPlotTitle: "अपना खेत पंजीकृत करें",
        plotNameLabel: "खेत का नाम / पहचान",
        passbookLabel: "पट्टादार पासबुक / खसरा संख्या",
        passbookPlaceholder: "उदा. TS/RR/2024/48192",
        speciesLabel: "पेड़ों की प्रजाति (सागौन, आम, आदि)",
        plantingYearLabel: "रोपण का वर्ष",
        boundaryMethodDraw: "नक्शे पर सीमा चिह्नित करें",
        boundaryMethodWalk: "खेत की मेड़ पर चलें (GPS)",
        walkBoundaryBtn: "GPS वॉक शुरू करें",
        walkingProgress: "सीमा की जीपीएस रिकॉर्डिंग जारी है...",
        overlapCheckSuccess: "सीमा जांच सफल: पड़ोसी खेतों के साथ कोई ओवरलैप नहीं है।",
        overlapCheckFlagged: "सीमा चेतावनी: यह सीमा पड़ोसी के पंजीकृत खेत से मिलती है। कृपया इसे सुधारें।",
        evidenceTitle: "खेत की तस्वीरें लें",
        evidenceSubtitle: "खेत के चारों कोनों और पेड़ों की छत्र (Canopy) की तस्वीर लें।",
        cornerA: "कोना A (उत्तर-पूर्व)",
        cornerB: "कोना B (दक्षिण-पूर्व)",
        cornerC: "कोना C (दक्षिण-पश्चिम)",
        cornerD: "कोना D (उत्तर-पश्चिम)",
        canopy: "पेड़ों की छत्र (Canopy) फोटो",
        randomChallenge: "नियम: कोना B पर उत्तर दिशा की ओर मुंह करके फोटो लें",
        chooseFile: "फ़ोटो चुनें",
        useSampleBtn: "नमूना फ़ोटो चुनें",
        sampleGood: "वैध फ़ोटो (खेत के अंदर GPS)",
        sampleOutside: "खेत के बाहर की फ़ोटो (अस्वीकृत)",
        sampleDuplicate: "पुरानी दोहराई गई फ़ोटो (अस्वीकृत)",
        sampleNoGps: "बिना जीपीएस की फ़ोटो (अस्वीकृत)",
        processingTitle: "सत्यापन प्रक्रिया जारी",
        processingSubtitle: "उपग्रह विश्लेषण और अखंडता जांच चल रही है...",
        stage1: "सेंटिनल-2 उपग्रह से मल्टीस्पेक्ट्रल चित्र प्राप्त किए जा रहे हैं",
        stage2: "मानसून के बादलों की स्थिति का आकलन किया जा रहा है",
        stage3: "बादलों से निपटने के लिए सेंटिनल-1 रडार बैकस्कैटर का उपयोग किया जा रहा है",
        stage4: "GEDI लेजर द्वारा पेड़ों की औसत ऊंचाई मापी जा रही है",
        stage5: "पेड़ों के बायोमास में वार्षिक बदलाव dAGB की गणना की जा रही है",
        stage6: "1000x बूटस्ट्रैप सांख्यिकी द्वारा सुरक्षित निचली सीमा तय की जा रही है",
        stage7: "5 स्वचालित धोखाधड़ी विरोधी नियमों की जांच की जा रही है",
        stage8: "डिजिटल रिकॉर्ड सील कर सुरक्षित लेजर में दर्ज किया गया",
        resultsTitle: "आपका सत्यापन-योग्य अनुमान",
        creditRangeLabel: "अनुमानित सत्यापन-योग्य क्रेडिट्स",
        payoutRangeLabel: "किसान को अनुमानित भुगतान (75% शुद्ध)",
        confidenceScore: "साक्ष्य विश्वसनीयता स्कोर",
        confidenceHigh: "उच्च विश्वसनीयता",
        confidenceMed: "मध्यम विश्वसनीयता",
        confidenceLow: "कम विश्वसनीयता",
        whyRangeTitle: "अनुमान एक सीमा (Range) में क्यों है?",
        whyRangeText: "मौसम में प्राकृतिक बदलाव और उपग्रह मापों में थोड़ी अनिश्चितता होती है। खरीदार कभी आपके क्रेडिट पर संदेह न करें, इसलिए हम सुरक्षित निचली सीमा की गारंटी देते हैं।",
        narrowRangeTipsTitle: "आय बढ़ाने और सीमा को छोटा करने के सुझाव:",
        tip1: "अक्टूबर के अंत में 2 अतिरिक्त स्पष्ट तस्वीरें अपलोड करें।",
        tip2: "किनारे के पेड़ों के नुकसान से बचने के लिए पड़ोसी किसानों के साथ समूह बनाएं।",
        tip3: "फील्ड एजेंट की यात्रा के दौरान पेड़ों के तने की मोटाई दर्ज कराएं।",
        timelineTitle: "सत्यापन और भुगतान समय-सीमा",
        stepSubmitted: "जानकारी सबमिट की गई",
        stepSatellite: "उपग्रह विश्लेषण पूर्ण",
        stepFraudChecks: "नियम जांच सफल",
        stepReportSealed: "रिपोर्ट सुरक्षित सील की गई",
        stepAuditorReview: "ऑडिटर समीक्षा",
        stepRegistry: "रजिस्ट्री जारी करना",
        stepSale: "क्रेडिट्स की बिक्री",
        stepPayment: "किसान के बैंक खाते में सीधा भुगतान",
        simulatedStepBadge: "भावी चरण",
        transparentSplitTitle: "पारदर्शी आय विवरण",
        farmerShare75: "किसान का सीधा हिस्सा (75%)",
        platformFee: "कार्बन खेती ऑटोमेटेड शुल्क (₹100/हेक्टेयर)",
        reserveBuffer: "स्थायित्व जोखिम बफर (15%)",
        rejectionTitle: "सत्यापन अस्थायी रूप से रोका गया",
        rejectionNextStepsTitle: "इसे कैसे हल करें:",
      },
      verifier: {
        roleTitle: "ऑडिटर और साइंस कंसोल",
        tabOverview: "1. अवलोकन और नक्शा",
        tabCarbonEngine: "2. कार्बन इंजन और बूटस्ट्रैप",
        tabPhenology: "3. फेनोलॉजी और रडार बैकअप",
        tabFraudChecks: "4. धोखाधड़ी जांच",
        tabAuditChain: "5. ऑडिट लॉग चेन",
        tabEconomics: "6. यूनिट अर्थशास्त्र",
        tabExport: "7. रिपोर्ट निर्यात",
        showTheMath: "गणना और सूत्र देखें",
        closeMath: "सूत्र छिपाएं",
      },
    },
};
