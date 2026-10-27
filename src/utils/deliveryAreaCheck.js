/**
 * Comprehensive Outside-Dhaka Delivery Restriction Checker
 * 
 * Blocked Areas:
 * 1. ঢাকা সংলগ্ন (কাছাকাছি): নারায়ণগঞ্জ, মুন্সিগঞ্জ, গাজীপুর, মানিকগঞ্জ, নরসিংদী, সাভার, আশুলিয়া, কেরানীগঞ্জ
 * 2. উত্তরাঞ্চল: টাঙ্গাইল, কিশোরগঞ্জ
 * 3. দক্ষিণাঞ্চল (পদ্মার ওপারে): ফরিদপুর, মাদারীপুর, শরীয়তপুর, গোপালগঞ্জ, রাজবাড়ী
 * 4. ঢাকা বিভাগের বাইরের ৭টি বিভাগ: চট্টগ্রাম, রাজশাহী, খুলনা, বরিশাল, সিলেট, রংপুর, ময়মনসিংহ
 *
 * Allowed / Open Area:
 * - ঢাকা সিটি / মেট্রোপলিটন (Dhaka City) - ধানমন্ডি, গুলশান, বনানী, উত্তরা, মিরপুর, মোহাম্মদপুর, বাড্ডা, তেজগাঁও ইত্যাদি ঢাকা সিটির সকল এলাকা।
 */

export const OUTSIDE_DHAKA_DIVISIONS = [
  // ১. ঢাকা সংলগ্ন (কাছাকাছি) জেলা ও শহর
  {
    divisionBn: "ঢাকা সংলগ্ন জেলা",
    divisionEn: "Dhaka Adjacent Districts",
    keywords: [
      // নারায়ণগঞ্জ
      "narayanganj", "narayangonj", "নারায়ণগঞ্জ", "নারায়ণগঞ্জ", "fatullah", "ফতুল্লা", "chasara", "চাষাড়া", "চাষাড়া", "siddhirganj", "সিদ্ধিরগঞ্জ", "sonargaon", "সোনারগাঁও", "kanchpur", "কাঁচপুর", "araihazar", "আড়াইহাজার", "রূপগঞ্জ", "rupganj",
      // মুন্সিগঞ্জ
      "munshiganj", "munshigonj", "মুন্সিগঞ্জ", "মুন্সীগঞ্জ", "sreenagar", "শ্রীনগর", "sirajdikhan", "সিরাজদিখান", "gajaria", "গজারিয়া", "গজারিয়া", "louhajang", "লৌহজং", "tongibari", "টঙ্গীবাড়ি", "টঙ্গীবাড়ি",
      // গাজীপুর ও টঙ্গী
      "gazipur", "গাজীপুর", "joydebpur", "জয়দেবপুর", "জয়দেবপুর", "kaliakair", "কালিয়াকৈর", "কালিয়াকৈর", "sreepur", "শ্রীপুর", "kapasia", "কাপাসিয়া", "কাপাসিয়া", "konabari", "কোনাবাড়ী", "কোনাবাড়ী", "boardbazar", "বোর্ডবাজার", "tongi", "টঙ্গী", "টঙ্গি",
      // মানিকগঞ্জ
      "manikganj", "manikgonj", "মানিকগঞ্জ", "singair", "সিংগাইর", "saturia", "সাটুরিয়া", "সাটুরিয়া", "shibalaya", "শিবালয়", "shibaloy", "harirampur", "হরিরামপুর", "ghior", "ঘিওর", "daulatpur", "দৌলতপুর",
      // নরসিংদী
      "narsingdi", "নরসিংদী", "belabo", "বেলাবো", "monohardi", "মনোহরদী", "raipura", "রায়পুরা", "রায়পুরা", "shibpur", "শিবপুর",
      // সাভার, আশুলিয়া, কেরানীগঞ্জ
      "savar", "সাভার", "ashulia", "আশুলিয়া", "আশুলিয়া", "keraniganj", "keranigonj", "কেরানীগঞ্জ", "কেরানিগঞ্জ"
    ]
  },
  // ২. যাত্রাবাড়ী, ডেমরা, জুরাইন, পোস্তগোলা, শ্যামপুর (যেখানে ডেলিভারি হয় না)
  {
    divisionBn: "যাত্রাবাড়ী-ডেমরা এলাকা (ডেলিভারি বন্ধ)",
    divisionEn: "Jatrabari, Demra & Adjacent Areas (No Delivery)",
    keywords: [
      "jatrabari", "jattrabari", "যাত্রাবাড়ী", "যাত্রাবাড়ি",
      "demra", "ডেমরা",
      "jurain", "juraine", "জুরাইন",
      "postogola", "postagola", "পোস্তগোলা",
      "shyampur", "shampur", "শ্যামপুর",
      "dholaipar", "dholaypar", "dholaiphar", "ধোলাইপাড়", "ধোলাইপাড়"
    ]
  },
  // ৩. উত্তরাঞ্চল
  {
    divisionBn: "উত্তরাঞ্চল জেলা",
    divisionEn: "Northern Districts",
    keywords: [
      // টাঙ্গাইল
      "tangail", "টাঙ্গাইল", "টাঙ্গাইল", "mirzapur", "মির্জাপুর", "delduar", "দেলদুয়ার", "দেলদুয়ার", "ghatail", "ঘাটাইল", "madhupur", "মধুপুর", "sakhipur", "সখিপুর", "kalihati", "কালিহাতী", "gopalpur", "গোপালপুর", "bhuapur", "ভূঞাপুর", "nagarpur", "নাগরপুর", "dhanbari", "ধনবাড়ী",
      // কিশোরগঞ্জ
      "kishoreganj", "kishoregonj", "কিশোরগঞ্জ", "bhairab", "ভৈরব", "bajitpur", "বাজিতপুর", "hosenpur", "হোসেনপুর", "karimganj", "করিমগঞ্জ", "tarail", "তাড়াইল", "তাড়াইল", "katiadi", "কটিয়াদী", "কটিয়াদী", "kuliarchar", "কুলিয়ারচর", "pakundia", "পাকুন্দিয়া", "nikli", "নিকলী", "astagram", "অষ্টগ্রাম", "itna", "ইটনা", "mithamain", "মিঠামইন"
    ]
  },
  // ৩. দক্ষিণাঞ্চল (পদ্মার ওপারে)
  {
    divisionBn: "দক্ষিণাঞ্চল (পদ্মার ওপারে)",
    divisionEn: "Southern Districts (Across Padma)",
    keywords: [
      // ফরিদপুর
      "faridpur", "ফরিদপুর", "boalmari", "বোয়ালমারী", "বোয়ালমারী", "modhukhali", "মধুখালী", "nagarkanda", "nagar kanda", "নগরকান্দা", "alfadanga", "আলফাডাঙ্গা", "sadorpur", "সদরপুর", "charbhadrasan", "চরভদ্রাসন", "saltha", "সালথা",
      // মাদারীপুর
      "madaripur", "মাদারীপুর", "মাদারিপুর", "shibchar", "শিবচর", "kalkini", "কালকিনি", "rajoir", "রাজৈর", "dashar", "ডাসার",
      // শরীয়তপুর
      "shariatpur", "শরীয়তপুর", "শরীয়তপুর", "naria", "নড়িয়া", "নড়িয়া", "zajira", "jajira", "জাজিরা", "bhedarganj", "ভেদরগঞ্জ", "damudya", "ডামুড্যা", "gosairhat", "গোসাইরহাট",
      // গোপালগঞ্জ
      "gopalganj", "gopalgonj", "গোপালগঞ্জ", "tungipara", "টুঙ্গিপাড়া", "টুঙ্গিপাড়া", "kotalipara", "কোটালীপাড়া", "কোটালীপাড়া", "kashiani", "কাশিয়ানী", "কাশিয়ানী", "muksudpur", "মুকসুদপুর",
      // রাজবাড়ী
      "rajbari", "রাজবাড়ী", "রাজবাড়ী", "pangsha", "পাংশা", "baliakandi", "বালিয়াকান্দি", "বালিয়াকান্দি", "goalanda", "গোয়ালন্দ", "গোয়ালন্দ", "kalukhali", "কালুখালী"
    ]
  },
  // ৪. চট্টগ্রাম বিভাগ
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
  // ৫. রাজশাহী বিভাগ
  {
    divisionBn: "রাজশাহী বিভাগ",
    divisionEn: "Rajshahi Division",
    keywords: [
      "rajshahi", "রাজশাহী",
      "bogura", "bogra", "বগুড়া", "বগুড়া",
      "joypurhat", "জয়পুরহাট", "জয়পুরহাট",
      "naogaon", "নওগাঁ",
      "natore", "নাটোর",
      "chapainawabganj", "চাঁপাইনবাবগঞ্জ",
      "pabna", "পাবনা",
      "sirajganj", "সিরাজগঞ্জ",
      "iswardi", "ishwardi", "ঈশ্বরদী"
    ]
  },
  // ৬. খুলনা বিভাগ
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
  // ৭. বরিশাল বিভাগ
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
  // ৮. সিলেট বিভাগ
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
  // ৯. রংপুর বিভাগ
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
  // ১০. ময়মনসিংহ বিভাগ
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
  "sonargaon janapath", "sonargaon road", "hotel sonargaon", "pan pacific sonargaon", "সোনারগাঁও জনপথ", "সোনারগাঁও রোড", "হোটেল সোনারগাঁও",
  "nawabganj road", "nawabganj lane", "nawabganj park", "নবাবগঞ্জ রোড", "নবাবগঞ্জ লেন", "লালবাগ নবাবগঞ্জ",
  "mymensingh road", "mymensingh lane", "ময়মনসিংহ রোড", "ময়মনসিংহ রোড",
  "comilla para", "কুমিল্লা পাড়া", "কুমিল্লা পাড়া",
  "noakhali tower", "নোয়াখালী টাওয়ার", "নোয়াখালী টাওয়ার",
  "barisal plaza", "বরিশাল প্লাজা",
  "sylhet tower", "সিলেট টাওয়ার", "সিলেট টাওয়ার",
  "bogura bhaban", "বগুড়া ভবন", "বগুড়া ভবন",
  "rajshahi market", "রাজশাহী মার্কেট",
  "rangpur house", "রংপুর হাউস",
  "faridpur mansion", "ফরিদপুর ভবন",
  // Common building, colony, hotel and store names inside Dhaka
  "chittagong colony", "chittagong building", "chittagong hotel", "chittagong store", "chittagong house",
  "chattogram building", "chattogram store", "chattogram house",
  "comilla building", "comilla store", "comilla hotel", "comilla house", "comilla bhaban",
  "noakhali building", "noakhali store", "noakhali hotel", "noakhali house", "noakhali bhaban",
  "barisal building", "barisal hotel", "barisal store", "barisal house", "barisal bhaban",
  "sylhet building", "sylhet store", "sylhet hotel", "sylhet house",
  "rajshahi building", "rajshahi house", "rajshahi store",
  "bogura building", "bogra building", "bogura store", "bogra store",
  "ময়মনসিংহ ভবন", "ময়মনসিংহ ভবন", "কুমিল্লা ভবন", "কুমিল্লা হোটেল", "নোয়াখালী ভবন", "বরিশাল ভবন", "সিলেট ভবন", "চট্টগ্রাম ভবন", "চট্টগ্রাম কলোনি"
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
      const escaped = kw.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
      // Accurate Unicode word boundary: prevents false positives (e.g. 'কালাচাঁদপুর' won't trigger 'চাঁদপুর', 'Manikdi' won't trigger 'Manikganj')
      const rx = new RegExp('(?<![\\p{L}\\p{M}\\p{N}])' + escaped + '(?![\\p{L}\\p{M}\\p{N}])', 'iu');
      if (rx.test(text)) {
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
