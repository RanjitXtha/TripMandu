import { writeFileSync } from "fs";

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

  writeFileSync("resturent.json", JSON.stringify(enriched, null, 2));
  console.log("\n✅ Done!");
  console.log(`🟢 Success: ${success}`);
  console.log(`🔴 Failed: ${failed}`);
  console.log(`📁 Output saved to: temple.json`);
}

// ------------------------------
// 4. Start the Process
// ------------------------------
enrichAllDestinations();
