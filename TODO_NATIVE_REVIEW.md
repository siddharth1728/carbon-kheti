# Localisation & Native Review Tracker (TODO_NATIVE_REVIEW.md)
**Project:** Carbon Kheti Open MRV Engine (Team DoSA, INNOVASIA 2K26, PS-13)  
**Supported Languages:** Telugu (తెలుగు), Hindi (हिन्दी), English (Default)  
**Status:** DRAFTED WITH REGIONAL AGROFORESTRY TERMINOLOGY — PENDING NATIVE SPEAKER SIGN-OFF

---

## 1. Telugu (తెలుగు) Review Checklist

The following agricultural and technical terms in `src/i18n/translations.ts` were drafted based on Telangana rural agricultural vernacular (e.g., Dharani passbook, pattadar, bund planting):

- [ ] `welcomeGreeting`: "నమస్కారం, మీ వ్యవసాయ భూమిలో చెట్ల ద్వారా కార్బన్ ఆదాయాన్ని అంచనా వేసే డిజిటల్ వ్యవస్థకు స్వాగతం."
  - *Context:* Onboarding welcome screen.
  - *Notes:* Confirm formal tone ("స్వాగతం") vs rural conversational ("రండి").
- [ ] `consentItem1Title`: "మేము ఏమి కొలుస్తాము?"
  - *Context:* FPIC consent item 1 (What we measure).
  - *Notes:* Translates Above-Ground Biomass as "చెట్ల పెరుగుదల మరియు కలప పరిమాణం".
- [ ] `consentItem2Title`: "75% ఆదాయం మీకు చెందుతుంది"
  - *Context:* FPIC revenue share guarantee.
  - *Notes:* Verify phrasing for transparency.
- [ ] `registerPlotTitle`: "మీ పొలం హద్దులను నమోదు చేయండి"
  - *Context:* Boundary walk registration.
  - *Notes:* "హద్దులు" (Haddulu) is the standard revenue term in Telangana.
- [ ] `passbookLabel`: "ధరణి పట్టాదారు పాస్‌బుక్ సంఖ్య (Dharani Passbook)"
  - *Context:* Land record field. Matches Telangana Dharani portal RoR-1B passbook identifier.
- [ ] `compassDirections`: North (ఉత్తరం), South (దక్షిణం), East (తూర్పు), West (పడమర).
  - *Context:* 8-direction guided capture.

---

## 2. Hindi (हिन्दी) Review Checklist

- [ ] `welcomeGreeting`: "नमस्ते, अपने खेत में कृषि-वानिकी के माध्यम से कार्बन आय अर्जित करने के लिए आपका स्वागत है।"
- [ ] `consentItem1Title`: "हम क्या मापते हैं?"
- [ ] `consentItem2Title`: "75% कार्बन आय सीधे आपके बैंक खाते में"
- [ ] `registerPlotTitle`: "खेत की सीमा दर्ज करें"
- [ ] `passbookLabel`: "भू-अभिलेख / खतौनी / पासबुक संख्या"
- [ ] `compassDirections`: North (उत्तर), South (दक्षिण), East (पूर्व), West (पश्चिम).

---
*Tracker maintained for Team DoSA, INNOVASIA 2K26*
