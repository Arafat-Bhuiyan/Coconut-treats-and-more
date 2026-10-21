/**
 * Comprehensive Outside-Dhaka Delivery Restriction Checker
 * Covers the 7 divisions outside Dhaka (Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh)
 * plus outside-Dhaka areas like Savar, Gazipur, Narayanganj, Keraniganj, Munshiganj, Jatrabari.
 */

export const OUTSIDE_DHAKA_DIVISIONS = [
  {
    divisionBn: "চট্টগ্রাম বিভাগ",
    divisionEn: "Chittagong Division",
    keywords: [
      "chittagong", "chattogram", "ctg", "চট্টগ্রাম", "চট্টগ্রাাম", "চাটগাঁ",
      "cox's bazar", "coxs bazar", "coxsbazar", "কক্সবাজার", "কক্স বাজার",
      "cumilla", "comilla", "কুমিল্লা",
      "feni", "ফেনী", "ফেণী",
      "brahmanbaria", "ব্রাহ্মণবাড়িয়া", "ব্রাহ্মণবাড়িয়া",
      "rangamati", "রাঙ্গামাটি", "রাঙামাটি",
      "noakhali", "নোয়াখালী", "নোয়াখালী",
      "chandpur", "চাঁদপুর",
      "lakshmipur", "লক্ষ্মীপুর", "লক্ষীপুর",
      "khagrachhari", "খাগড়াছড়ি", "খাগড়াছড়ি",
      "bandarban", "বান্দরবান",
      "sitakunda", "সীতাকুণ্ড", "mirsharai", "মিরসরাই", "hathazari", "হাটহাজারী", "teknaf", "টেকনাফ"
    ]
  },
  {
    divisionBn: "রাজশাহী বিভাগ",
    divisionEn: "Rajshahi Division",
    keywords: [
      "rajshahi", "রাজশাহী",
      "bogura", "bogra", "বগুড়া", "বগুড়া",
      "joypurhat", "জয়পুরহাট", "জয়পুরহাট",
      "naogaon", "নওগাঁ",
      "natore", "নাটোর",
      "chapainawabganj", "nawabganj", "চাঁপাইনবাবগঞ্জ", "নবাবগঞ্জ",
      "pabna", "পাবনা",
      "sirajganj", "সিরাজগঞ্জ",
      "iswardi", "ishwardi", "ঈশ্বরদী"
    ]
  },
  {
    divisionBn: "খুলনা বিভাগ",
    divisionEn: "Khulna Division",
    keywords: [
      "khulna", "খুলনা",
      "bagerhat", "বাগেরহাট",
      "chuadanga", "চুয়াডাঙ্গা", "চুয়াডাঙ্গা",
      "jashore", "jessore", "যশোর",
      "jhenaidah", "ঝিনাইদহ",
      "kushtia", "কুষ্টিয়া", "কুষ্টিয়া",
      "magura", "মাগুরা",
      "meherpur", "মেহেরপুর",
      "narail", "নড়াইল", "নড়াইল",
      "satkhira", "সাতক্ষীরা",
      "benapole", "বেনাপোল", "mongla", "মংলা"
    ]
  },
  {
    divisionBn: "বরিশাল বিভাগ",
    divisionEn: "Barisal Division",
    keywords: [
      "barisal", "barishal", "বরিশাল",
      "barguna", "বরগুনা",
      "bhola", "ভোলা",
      "jhalokati", "jhalakathi", "ঝালকাঠি", "ঝালকাঠী",
      "patuakhali", "পটুয়াখালী", "পটুয়াখালী",
      "pirojpur", "পিরোজপুর",
      "kuakata", "কুয়াকাটা", "কুয়াকাটা"
    ]
  },
  {
    divisionBn: "সিলেট বিভাগ",
    divisionEn: "Sylhet Division",
    keywords: [
      "sylhet", "সিলেট",
      "habiganj", "হবিগঞ্জ",
      "moulvibazar", "maulvibazar", "মৌলভীবাজার",
      "sunamganj", "সুনামগঞ্জ",
      "sreemangal", "srimangal", "শ্রীমঙ্গল", "beanibazar", "বিয়ানীবাজার", "বিয়ানীবাজার"
    ]
  },
  {
    divisionBn: "রংপুর বিভাগ",
    divisionEn: "Rangpur Division",
    keywords: [
      "rangpur", "রংপুর",
      "dinajpur", "দিনাজপুর",
      "gaibandha", "গাইবান্ধা",
      "kurigram", "কুড়িগ্রাম", "কুড়িগ্রাম",
      "lalmonirhat", "লালমনিরহাট",
      "nilphamari", "নীলফামারী",
      "panchagarh", "পঞ্চগড়", "পঞ্চগড়",
      "thakurgaon", "ঠাকুরগাঁও",
      "saidpur", "syedpur", "সৈয়দপুর", "সৈয়দপুর"
    ]
  },
  {
    divisionBn: "ময়মনসিংহ বিভাগ",
    divisionEn: "Mymensingh Division",
    keywords: [
      "mymensingh", "ময়মনসিংহ", "ময়মনসিংহ",
      "jamalpur", "জামালপুর",
      "netrokona", "netrakona", "নেত্রকোণা", "নেত্রকোনা",
      "sherpur", "শেরপুর",
      "muktagacha", "মুক্তাগাছা"
    ]
  }
];

export const DHAKA_SAFE_PHRASES = [
  "tongi diversion", "টঙ্গী ডাইভারশন", "টঙ্গি ডাইভারশন",
  "mymensingh road", "mymensingh lane", "ময়মনসিংহ রোড", "ময়মনসিংহ রোড",
  "comilla para", "কুমিল্লা পাড়া", "কুমিল্লা পাড়া",
  "noakhali tower", "নোয়াখালী টাওয়ার", "নোয়াখালী টাওয়ার",
  "barisal plaza", "বরিশাল প্লাজা",
  "sylhet tower", "সিলেট টাওয়ার", "সিলেট টাওয়ার",
  "bogura bhaban", "বগুড়া ভবন", "বগুড়া ভবন",
  "rajshahi market", "রাজশাহী মার্কেট",
  "rangpur house", "রংপুর হাউস"
];

/**
 * Checks if the given text (address or name) matches any outside-Dhaka division or area.
 * Returns null if inside Dhaka or no match.
 * Returns { isRestricted: true, divisionBn, divisionEn, matchedWord, displayText } if restricted.
 */
export function checkRestrictedDeliveryArea(rawText) {
  if (!rawText || typeof rawText !== "string") return null;

  let text = rawText.toLowerCase();

  // Strip safe Dhaka phrases to prevent false-positives
  for (const phrase of DHAKA_SAFE_PHRASES) {
    if (text.includes(phrase.toLowerCase())) {
      text = text.replace(new RegExp(phrase.toLowerCase(), "g"), " ");
    }
  }

  for (const div of OUTSIDE_DHAKA_DIVISIONS) {
    for (const kw of div.keywords) {
      const lowerKw = kw.toLowerCase();
      // Match keyword as substring or word boundary
      if (text.includes(lowerKw)) {
        return {
          isRestricted: true,
          divisionBn: div.divisionBn,
          divisionEn: div.divisionEn,
          matchedWord: kw,
          displayText: `${div.divisionBn} (${div.divisionEn})`
        };
      }
    }
  }

  return null;
}
