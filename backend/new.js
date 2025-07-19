import { writeFileSync } from "fs";

<<<<<<< HEAD
const categorizedDestinations = [
  { name: "Nanglo Restaurant", category: "restaurant" }, // Legacy and well-known chain
  { name: "Bhojan Griha", category: "restaurant" }, // Cultural, heritage building
  { name: "OR2K", category: "restaurant" }, // Popular with tourists
  { name: "Le Sherpa", category: "restaurant" }, // Known fine dining
];

// Wikipedia API fetch helper using search + summary
async function fetchWikipediaData(place) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    place.name + " Kathmandu Nepal"
  )}&format=json&origin=*`;

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const bestMatch = searchData.query?.search?.[0]?.title;
    if (!bestMatch) {
      return {
        name: place.name,
        categories: Array.isArray(place.category)
          ? place.category
          : [place.category],
        error: "No Wikipedia match found.",
      };
    }

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      bestMatch
    )}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) {
      return {
        name: place.name,
        categories: Array.isArray(place.category)
          ? place.category
          : [place.category],
        error: "Summary not found.",
      };
    }

    const data = await summaryRes.json();

    // Normalize place.category to array
    const categories = Array.isArray(place.category)
      ? [...place.category]
      : [place.category];

    const desc = (data.extract || "").toLowerCase();

    // Add categories based on description keywords
    if (
      desc.includes("temple") ||
      desc.includes("stupa") ||
      desc.includes("buddha")
    ) {
      categories.push("temple", "religious");
    }
    if (
      desc.includes("durbar") ||
      desc.includes("palace") ||
      desc.includes("historic") ||
      desc.includes("museum")
    ) {
      categories.push("historic", "monument");
    }
    if (desc.includes("market") || desc.includes("bazaar")) {
      categories.push("market", "business");
    }
    if (
      desc.includes("garden") ||
      desc.includes("lake") ||
      desc.includes("pond") ||
      desc.includes("park")
    ) {
      categories.push("park", "natural");
    }
    if (desc.includes("monastery") || desc.includes("gompa")) {
      categories.push("monastery", "religious");
    }
    if (desc.includes("hotel")) {
      categories.push("hotel", "business");
    }
    if (desc.includes("restaurant")) {
      categories.push("restaurant", "business");
    }
    if (desc.includes("cafe")) {
      categories.push("cafe", "business");
    }
    if (
      desc.includes("tourist attraction") ||
      desc.includes("tourist spot") ||
      desc.includes("attraction")
    ) {
      categories.push("tourist_attraction");
    }
    if (
      desc.includes("business") ||
      desc.includes("company") ||
      desc.includes("office")
    ) {
      categories.push("business");
    }

    // Remove duplicates and lowercase categories
    const uniqueCategories = Array.from(
      new Set(categories.map((c) => c.toLowerCase()))
    );

    return {
      name: place.name,
      wiki_title: data.title,
      description: data.extract,
      image: data.thumbnail?.source || null,
      coordinates: data.coordinates || null,
      wikiUrl: data.content_urls?.desktop?.page || null,
      categories: uniqueCategories,
    };
  } catch (err) {
    return {
      name: place.name,
      categories: Array.isArray(place.category)
        ? place.category
        : [place.category],
      error: err.message,
    };
=======
// ------------------------------
// 1. Temple List (Static)
// ------------------------------



// ------------------------------
// 2. Wikipedia Data Enricher
// ------------------------------
async function fetchWikipediaData(place, retries = 3) {
  const searchTerms = [
    `${place.name} Nepal`,
    `${place.name}`,
    `${place.name} Kathmandu`,
    `${place.name} temple`,
    `${place.name} stupa`
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    for (const term of searchTerms) {
      try {
        console.log(`🔍 Searching: ${term}`);

        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        const bestMatch = searchData.query?.search?.[0]?.title;
        if (!bestMatch) continue;

        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`;
        const summaryRes = await fetch(summaryUrl);
        if (!summaryRes.ok) continue;

        const data = await summaryRes.json();
        const description = (data.extract || "").toLowerCase();

        const categories = Array.isArray(place.categories) ? [...place.categories] : [];

        // Dynamically add more categories based on keywords
        if (description.includes("buddhist")) categories.push("buddhist");
        if (description.includes("shiva")) categories.push("shiva");
        if (description.includes("vishnu")) categories.push("vishnu");
        if (description.includes("shakti") || description.includes("goddess")) categories.push("shakti_peeth");
        if (description.includes("syncretic") || (description.includes("buddhist") && description.includes("hindu")))
          categories.push("syncretic");
        if (description.includes("unesco") || description.includes("heritage")) categories.push("heritage_site");

        const uniqueCategories = Array.from(new Set(categories.map(c => c.toLowerCase())));

        return {
          name: place.name,
          wiki_title: data.title,
          description: data.extract,
          image: data.thumbnail?.source || null,
          coordinates: data.coordinates || null,
          wikiUrl: data.content_urls?.desktop?.page || null,
          categories: uniqueCategories,
          lastUpdated: new Date().toISOString(),
          searchQuery: term
        };
      } catch (err) {
        console.warn(`⚠️ Error for "${place.name}" (attempt ${attempt}): ${err.message}`);
      }
    }

    await new Promise(res => setTimeout(res, 1000 * attempt)); // exponential backoff
>>>>>>> origin/snk
  }

  return {
    name: place.name,
    categories: Array.isArray(place.categories) ? place.categories : [],
    error: `❌ Failed after ${retries} attempts.`,
    lastUpdated: new Date().toISOString()
  };
}

// ------------------------------
// 3. Run the Enrichment
// ------------------------------
async function enrichAllDestinations() {
  const enriched = [];
  let success = 0;
  let failed = 0;

  for (const place of categorizedDestinations) {
    console.log(`📌 Fetching: ${place.name}`);
    const data = await fetchWikipediaData(place);
    enriched.push(data);
    if (data.error) {
      failed++;
    } else {
      success++;
    }

    await new Promise(res => setTimeout(res, 500)); // delay for API rate limits
  }

<<<<<<< HEAD
  writeFileSync("restaurants.json", JSON.stringify(enriched, null, 2));
  console.log("✅ All done! Data saved to enriched_destinations.json");
=======
  writeFileSync("resturent.json", JSON.stringify(enriched, null, 2));
  console.log("\n✅ Done!");
  console.log(`🟢 Success: ${success}`);
  console.log(`🔴 Failed: ${failed}`);
  console.log(`📁 Output saved to: temple.json`);
>>>>>>> origin/snk
}

// ------------------------------
// 4. Start the Process
// ------------------------------
enrichAllDestinations();
