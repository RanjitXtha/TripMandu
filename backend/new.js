import { writeFileSync } from "fs";


const categorizedDestinations = [
  { name: "Amitabha Monastery", categories: ["buddhist", "monastery", "religious", "tourist_attraction"] },
  { name: "Benchen Monastery", categories: ["buddhist", "monastery", "religious"] },
  { name: "Boudhanath", categories: ["buddhist", "stupa", "temple", "religious", "heritage_site"] },
  { name: "Ka-Nying Shedrub Ling", categories: ["buddhist", "monastery", "religious"] },
  { name: "Kindo Baha", categories: ["buddhist", "monastery", "religious"] },
  { name: "Kopan Monastery", categories: ["buddhist", "monastery", "religious", "tourist_attraction"] },
  { name: "Pranidhipurna Mahavihar", categories: ["buddhist", "monastery", "religious"] },
  { name: "Seto Gumba", categories: ["buddhist", "monastery", "religious", "tourist_attraction"] },
  { name: "Swayambhunath", categories: ["buddhist", "stupa", "temple", "religious", "heritage_site"] },
  { name: "Tergar Osel Ling Monastery", categories: ["buddhist", "monastery", "religious"] },
  { name: "Tharlam Monastery", categories: ["buddhist", "monastery", "religious"] },
  { name: "Vidhyeshvari Vajra Yogini Temple", categories: ["buddhist", "temple", "religious"] },
  { name: "Hiranya Varna Mahavihar", categories: ["buddhist", "monastery", "religious", "heritage_site"] }
];



// Enhanced Wikipedia API fetch helper with better error handling and retries
async function fetchWikipediaData(place, retries = 3) {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(place.name + " Nepal")}&format=json&origin=*`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching data for: ${place.name} (attempt ${attempt}/${retries})`);
      
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        throw new Error(`Search API returned ${searchRes.status}`);
      }
      
      const searchData = await searchRes.json();
      const bestMatch = searchData.query?.search?.[0]?.title;
      
      if (!bestMatch) {
        return { 
          name: place.name, 
          categories: Array.isArray(place.category) ? place.category : [place.category], 
          error: "No Wikipedia match found.",
          searchAttempted: place.name + " Nepal"
        };
      }

      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`;
      const summaryRes = await fetch(summaryUrl);
      
      if (!summaryRes.ok) {
        throw new Error(`Summary API returned ${summaryRes.status}`);
      }

      const data = await summaryRes.json();

      // Normalize place.category to array
      const categories = Array.isArray(place.category) ? [...place.category] : [place.category];
      const desc = (data.extract || "").toLowerCase();

      // Enhanced category detection with more specific keywords
      const categoryMappings = {
        religious: ["temple", "stupa", "buddha", "hindu", "shrine", "sacred", "deity", "worship", "pilgrimage", "vishnu", "shiva", "ganesh"],
        historic: ["durbar", "palace", "historic", "heritage", "ancient", "medieval", "built in", "century", "dynasty", "architecture", "unesco"],
        market: ["market", "bazaar", "shopping", "commercial", "trade", "vendors", "mall", "shops"],
        natural: ["garden", "lake", "pond", "park", "hill", "mountain", "forest", "nature", "botanical", "wildlife", "valley", "gorge"],
        monastery: ["monastery", "gompa", "vihara", "mahavihar", "monks", "buddhist monastery", "abbey", "nunnery"],
        museum: ["museum", "gallery", "collection", "artifacts", "exhibits", "art", "cultural center"],
        tourist_attraction: ["tourist", "attraction", "visitors", "sightseeing", "landmark", "viewpoint", "cable car", "trekking"],
        hotel: ["hotel", "resort", "lodge", "guest house", "accommodation", "stay", "hospitality"],
        restaurant: ["restaurant", "dining", "food", "cuisine", "meal", "kitchen", "eatery"],
        cafe: ["cafe", "coffee", "bakery", "tea", "bistro", "coffeehouse"],
        entertainment: ["bar", "club", "nightlife", "casino", "music", "entertainment", "pub"],
        village: ["village", "town", "settlement", "community", "traditional", "ethnic"],
        business: ["business", "company", "office", "commercial", "service"]
      };

      // Add categories based on description keywords
      for (const [category, keywords] of Object.entries(categoryMappings)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
          categories.push(category);
        }
      }

      // Remove duplicates and lowercase categories
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
        searchQuery: place.name + " Nepal"
      };
      
    } catch (err) {
      console.warn(`Attempt ${attempt} failed for ${place.name}: ${err.message}`);
      if (attempt === retries) {
        return { 
          name: place.name, 
          categories: Array.isArray(place.category) ? place.category : [place.category], 
          error: `Failed after ${retries} attempts: ${err.message}`,
          lastUpdated: new Date().toISOString()
        };
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Enhanced main function with progress tracking and better error handling
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
        categories: Array.isArray(place.category) ? place.category : [place.category],
        error: `Unexpected error: ${err.message}`,
        lastUpdated: new Date().toISOString()
      });
    }

    // Rate limiting with random jitter to avoid overwhelming the API
    const delay = 500 + Math.random() * 300;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Save results with metadata
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

  writeFileSync("monument.json", JSON.stringify(output, null, 2));
  
  console.log(`\n🎉 Enrichment complete!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Data saved to enriched_destinations.json`);
  
  // Save a summary of categories
  const categoryStats = {};
  enriched.forEach(dest => {
    dest.categories.forEach(cat => {
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
  });
  
  console.log(`\n📊 Category distribution:`);
  Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
}

// Run the enrichment
enrichAllDestinations().catch(console.error);