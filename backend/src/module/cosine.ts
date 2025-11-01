import { cosineSimilarity } from "../utils/RouteAlgorithms.js";

// 🧍‍♂️ User’s favorite destination (vectorized)
const fav = {
  pashupatinath: 1,
  temple: 3,
  hindu: 2,
  sacred: 1,
  religious: 2,
  site: 1,
  located: 1,
  near: 1,
  bagmati: 1,
  river: 1,
  famous: 1,
  for: 1,
  rituals: 1,
  and: 2,
  cultural: 1,
  importance: 1
};

// 🗺️ Destination candidates (vectorized descriptions)
const destinations = {
  champadevi: {
    champadevi: 1,
    hill: 2,
    popular: 1,
    hiking: 1,
    destination: 1,
    located: 1,
    on: 1,
    southwestern: 1,
    rim: 1,
    of: 2,
    kathmandu: 1,
    valley: 1,
    trail: 1,
    leads: 1,
    through: 1,
    lush: 1,
    pine: 1,
    forests: 1,
    to: 1,
    summit: 1,
    which: 1,
    hosts: 1,
    small: 1,
    buddhist: 2,
    and: 3,
    hindu: 2,
    shrine: 1,
    it: 1,
    offers: 1,
    excellent: 1,
    panoramic: 1,
    views: 1,
    city: 1,
    central: 1,
    western: 1,
    himalayan: 1,
    ranges: 1,
    nature: 1
  },

  swayambhunath: {
    swayambhunath: 1,
    stupa: 2,
    buddhist: 3,
    temple: 1,
    ancient: 1,
    located: 1,
    on: 1,
    hilltop: 1,
    offers: 1,
    panoramic: 1,
    view: 1,
    kathmandu: 1,
    valley: 1,
    monkeys: 1,
    and: 2,
    prayer: 1,
    flags: 1,
    make: 1,
    it: 1,
    unique: 1
  },

  garden_of_dreams: {
    garden: 2,
    of: 1,
    dreams: 1,
    neo: 1,
    classical: 1,
    located: 1,
    thamel: 1,
    area: 1,
    designed: 1,
    with: 1,
    ponds: 1,
    pavilions: 1,
    and: 1,
    peaceful: 1,
    environment: 1,
    perfect: 1,
    for: 1,
    relaxation: 1
  },

  patan_durbar_square: {
    patan: 2,
    durbar: 2,
    square: 2,
    historic: 1,
    palace: 1,
    temples: 1,
    architecture: 1,
    cultural: 1,
    heritage: 1,
    art: 1
  },

  bhaktapur_durbar_square: {
    bhaktapur: 2,
    durbar: 2,
    square: 2,
    medieval: 1,
    city: 1,
    temples: 1,
    pottery: 1,
    arts: 1,
    culture: 1
  },

  jawalakhel_zoo: {
    jawalakhel: 1,
    zoo: 2,
    nepal: 1,
    animals: 2,
    native: 1,
    exotic: 1,
    park: 1,
    conservation: 1
  },

  kirtipur: {
    kirtipur: 2,
    ancient: 1,
    town: 1,
    temples: 1,
    historic: 1,
    culture: 1,
    traditional: 1,
    streets: 1
  },

  nagarkot: {
    nagarkot: 2,
    hill: 1,
    sunrise: 1,
    view: 1,
    himalayas: 1,
    trekking: 1,
    nature: 1,
    scenic: 1
  },

  phulchowki: {
    phulchowki: 2,
    hill: 1,
    forest: 1,
    trekking: 1,
    biodiversity: 1,
    botanical: 1,
    views: 1
  },

  bhaktapur_pottery_square: {
    bhaktapur: 2,
    pottery: 2,
    square: 1,
    artisans: 1,
    craft: 1,
    traditional: 1,
    culture: 1
  }
};


// 🔍 Compute similarity between user preference and each destination
const results = Object.entries(destinations).map(([name, vector]) => ({
  name,
  similarity: cosineSimilarity(fav, vector)
}));

// 🔝 Sort by highest similarity
results.sort((a, b) => b.similarity - a.similarity);

console.log("Recommended destinations::");
results.forEach(r =>
  console.log(`${r.name}: ${r.similarity.toFixed(3)}`)
);
