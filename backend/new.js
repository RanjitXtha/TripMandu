import { writeFileSync } from "fs";

// Your destinations list

// Keyword-based category detection
const categorizedDestinations = [
  { name: "Garden of Dreams", categories: ["park", "garden", "tourist_attraction", "nature"] },
  { name: "Central Zoo, Jawalakhel", categories: ["zoo", "park", "tourist_attraction", "nature", "entertainment"] },
  { name: "Phulchowki Hill", categories: ["hill", "nature", "park", "hiking", "tourist_attraction"] },
  { name: "Shivapuri Nagarjun National Park", categories: ["national_park", "nature", "forest", "hiking", "park", "wildlife"] },
  { name: "Godavari Botanical Garden", categories: ["botanical_garden", "park", "nature", "garden", "tourist_attraction"] },
  { name: "Nagarkot Hill Station", categories: ["hill", "nature", "tourist_attraction", "viewpoint"] },
  { name: "Bishnumati River Park", categories: ["park", "nature", "river", "recreation"] },
  { name: "Dakshinkali Temple and Surrounding Forest", categories: ["temple", "nature", "forest", "park", "religious"] },
  { name: "Basantapur Durbar Square Garden", categories: ["garden", "historic", "park", "heritage_site"] },
  { name: "Rani Pokhari", categories: ["pond", "historic", "park", "heritage_site", "tourist_attraction"] },
  { name: "Patan Durbar Square Gardens", categories: ["garden", "historic", "park", "heritage_site"] },
  { name: "Nagarjun Forest Reserve", categories: ["forest", "nature", "park", "wildlife"] },
  { name: "Balaju Water Garden", categories: ["garden", "park", "nature", "water_feature"] },
  { name: "Tribhuvan Park", categories: ["park", "recreation", "nature", "tourist_attraction"] },
  { name: "Pashupatinath Riverfront Park", categories: ["park", "nature", "river", "religious"] },
  { name: "Budhanilkantha Garden Area", categories: ["garden", "park", "nature", "religious"] }
];


// Fetch Wikipedia data with multi-strategy search
async function fetchWikipediaData(place, retries = 3) {
  const searchTerms = [
    `${place.name} Nepal`,
    `${place.name}`,
    `${place.name} Kathmandu`,
    `${place.name} stupa`,
    `${place.name} monastery`
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    for (const term of searchTerms) {
      try {
        console.log(`Fetching data for: ${place.name} (attempt ${attempt}/${retries}) using term: "${term}"`);

        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);

        if (!searchRes.ok) {
          throw new Error(`Search API returned ${searchRes.status}`);
        }

        const searchData = await searchRes.json();
        const bestMatch = searchData.query?.search?.[0]?.title;

        if (!bestMatch) continue;

        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`;
        const summaryRes = await fetch(summaryUrl);

        if (!summaryRes.ok) {
          throw new Error(`Summary API returned ${summaryRes.status}`);
        }

        const data = await summaryRes.json();
        const description = (data.extract || "").toLowerCase();
        const categories = Array.isArray(place.categories) ? [...place.categories] : [];

        // Add categories based on description
        for (const [category, keywords] of Object.entries(categoryMappings)) {
          if (keywords.some(keyword => description.includes(keyword))) {
            categories.push(category);
          }
        }

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
        console.warn(`Attempt ${attempt} failed for ${place.name} using term "${term}": ${err.message}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Retry delay
  }

  return {
    name: place.name,
    categories: Array.isArray(place.categories) ? place.categories : [],
    error: `Failed after ${retries} attempts.`,
    lastUpdated: new Date().toISOString()
  };
}

// Main enrichment function
async function enrichAllDestinations() {
  const enriched = [];
  const total = categorizedDestinations.length;
  let successful = 0;
  let failed = 0;

  console.log(`Starting enrichment of ${total} destinations...\n`);

  for (let i = 0; i < categorizedDestinations.length; i++) {
    const place = categorizedDestinations[i];
    const progress = `[${i + 1}/${total}]`;

    try {
      const data = await fetchWikipediaData(place);
      enriched.push(data);

      if (data.error) {
        failed++;
        console.log(`${progress} ❌ ${place.name}: ${data.error}`);
      } else {
        successful++;
        console.log(`${progress} ✅ ${place.name}: Found ${data.categories.length} categories`);
      }
    } catch (err) {
      failed++;
      console.log(`${progress} ❌ ${place.name}: Unexpected error - ${err.message}`);
      enriched.push({
        name: place.name,
        categories: Array.isArray(place.categories) ? place.categories : [],
        error: `Unexpected error: ${err.message}`,
        lastUpdated: new Date().toISOString()
      });
    }

    const delay = 500 + Math.random() * 300; // Random jitter for rate limiting
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const output = {
    metadata: {
      totalDestinations: total,
      successful: successful,
      failed: failed,
      generatedAt: new Date().toISOString(),
      script: "Enhanced Kathmandu Destinations Enricher"
    },
    destinations: enriched
  };

  writeFileSync("enriched_destinations.json", JSON.stringify(output, null, 2));

  console.log(`\n🎉 Enrichment complete!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Data saved to enriched_destinations.json`);

  // Category distribution summary
  const categoryStats = {};
  enriched.forEach(dest => {
    dest.categories.forEach(cat => {
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
  });

  console.log(`\n📊 Category distribution:`);
  Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
}

// Start process
enrichAllDestinations().catch(console.error);
