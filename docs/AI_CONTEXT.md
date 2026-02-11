# AI/Data Agent Context

You are the **AI/Data Agent** for Pioneer, a community-powered travel discovery platform.

## Project Overview

Pioneer is a social travel platform where users rate, review, and share travel experiences while discovering places through the trips of people they follow.

**App Name:** Pioneer
**Tagline:** "Discover Together"
**Launch City:** Lisbon, Portugal

## Your Responsibilities

You own AI/ML features and data pipelines:
- `/src/lib/ai/*` - AI/ML logic (TypeScript, called by backend)
- `/scripts/*` - Data processing scripts
- `/python/*` - Python ML services and scrapers
- `/data/*` - Raw and processed data files

## Off-Limits (Other Agents Own These)

- `/src/components/*` - Frontend Agent
- `/src/app/*` - Frontend Agent (pages) and Backend Agent (API routes)
- `/src/lib/db/*` - Backend Agent
- `/prisma/schema.prisma` - Main Agent

## Tech Stack

- **Python 3.11+** - ML/data scripts
- **TypeScript** - AI functions called by Next.js backend
- **OpenAI API** or **Claude API** - NLP, content generation
- **Google Places API** - Location data scraping
- **Pandas** - Data processing

## Key Files to Read First

1. `/docs/AI_FEATURES.md` - Detailed specs for each AI feature
2. `/src/types/place.ts` - Place data structure
3. `/src/types/trip.ts` - Trip data structure
4. `/src/types/review.ts` - Review data structure
5. `/prisma/schema.prisma` - Database models

---

## Phase 1 MVP Tasks

### 1. Lisbon Place Scraper

Build a Python script to pull places from Google Places API.

**File:** `/python/scraper/google_places.py`

```python
import requests
import json
import os
from typing import List, Dict

GOOGLE_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY')

# Categories to scrape (map to Pioneer's PlaceCategory)
CATEGORIES = {
    'restaurant': 'RESTAURANT',
    'cafe': 'CAFE',
    'bar': 'BAR',
    'night_club': 'NIGHTCLUB',
    'museum': 'MUSEUM',
    'art_gallery': 'GALLERY',
    'church': 'MONUMENT',
    'tourist_attraction': 'LANDMARK',
    'park': 'PARK',
    'point_of_interest': 'VIEWPOINT',
    'shopping_mall': 'MARKET',
    'store': 'SHOP',
}

def search_places(category: str, location: str = "38.7223,-9.1393", radius: int = 5000) -> List[Dict]:
    """Search for places in a category near a location."""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'location': location,
        'radius': radius,
        'type': category,
        'key': GOOGLE_API_KEY,
    }
    # Implement pagination with next_page_token
    # Return list of places with: place_id, name, rating, user_ratings_total, geometry, types
    pass

def get_place_details(place_id: str) -> Dict:
    """Get detailed info for a place."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    # Get: formatted_address, opening_hours, photos, reviews, etc.
    pass

def scrape_lisbon():
    """Main scraper function."""
    all_places = []
    for google_type, pioneer_category in CATEGORIES.items():
        places = search_places(google_type)
        for place in places:
            details = get_place_details(place['place_id'])
            all_places.append({
                **place,
                **details,
                'pioneer_category': pioneer_category
            })

    # Filter: rating > 4.0, review_count > 50
    filtered = [
        p for p in all_places
        if p.get('rating', 0) > 4.0 and p.get('user_ratings_total', 0) > 50
    ]

    # Save to /data/raw/lisbon_places.json
    with open('data/raw/lisbon_places.json', 'w') as f:
        json.dump(filtered, f, indent=2)

    print(f"Scraped {len(filtered)} places")
```

**Output:** `/data/raw/lisbon_places.json`

---

### 2. Content Enrichment with AI

Use OpenAI/Claude to generate engaging descriptions and metadata.

**File:** `/python/scraper/enricher.py`

```python
import openai
import json

def enrich_place(raw_place: dict) -> dict:
    """Use AI to generate rich content for a place."""

    prompt = f"""
    You are a travel writer creating content for Pioneer, a community-driven travel discovery app.

    Given this place data:
    Name: {raw_place['name']}
    Type: {raw_place.get('types', [])}
    Category: {raw_place.get('pioneer_category')}
    Rating: {raw_place.get('rating')}
    Reviews: {raw_place.get('user_ratings_total')}
    Address: {raw_place.get('formatted_address')}

    Generate a JSON object with:
    1. description: 2-3 engaging sentences describing the experience
    2. estimatedDuration: Estimated time to spend in minutes (15, 30, 45, 60, 90, 120, 180)
    3. priceLevel: FREE, BUDGET, MODERATE, EXPENSIVE, or LUXURY
    4. tags: Array of 3-5 tags from: foodie, romantic, adventurous, chill, artsy, historic, local-favorite, hidden-gem, instagram-worthy, budget-friendly, solo-friendly, group-friendly, outdoor, viewpoint, nightlife, cultural, quirky
    5. neighborhood: The neighborhood name (e.g., "Alfama", "Bairro Alto", "Baixa")

    Respond with valid JSON only.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4-turbo-preview",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    enriched = json.loads(response.choices[0].message.content)

    return {
        "name": raw_place['name'],
        "description": enriched['description'],
        "category": raw_place['pioneer_category'],
        "latitude": raw_place['geometry']['location']['lat'],
        "longitude": raw_place['geometry']['location']['lng'],
        "address": raw_place.get('formatted_address', ''),
        "neighborhood": enriched.get('neighborhood'),
        "estimatedDuration": enriched['estimatedDuration'],
        "priceLevel": enriched['priceLevel'],
        "tags": enriched['tags'],
        "googlePlaceId": raw_place['place_id'],
        "imageUrl": get_photo_url(raw_place),  # Implement this
    }

def get_photo_url(place: dict) -> str | None:
    """Get photo URL from Google Places photo reference."""
    if not place.get('photos'):
        return None
    photo_ref = place['photos'][0]['photo_reference']
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_ref}&key={GOOGLE_API_KEY}"
```

**Output:** `/data/processed/lisbon_places.json`

---

### 3. Database Loader

Script to load processed places into PostgreSQL.

**File:** `/scripts/load-places.ts`

```typescript
import { PrismaClient, PlaceCategory, PriceLevel } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function loadPlaces() {
  const data = JSON.parse(
    fs.readFileSync('data/processed/lisbon_places.json', 'utf-8')
  );

  // First, ensure Portugal and Lisbon exist
  const portugal = await prisma.country.upsert({
    where: { code: 'PT' },
    update: {},
    create: {
      name: 'Portugal',
      code: 'PT',
    },
  });

  const lisbon = await prisma.city.upsert({
    where: {
      name_countryId: { name: 'Lisbon', countryId: portugal.id }
    },
    update: {},
    create: {
      name: 'Lisbon',
      countryId: portugal.id,
      latitude: 38.7223,
      longitude: -9.1393,
      timezone: 'Europe/Lisbon',
    },
  });

  // Get or create a system user for scraped places
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@pioneer.app' },
    update: {},
    create: {
      email: 'system@pioneer.app',
      name: 'Pioneer',
      username: 'pioneer',
      onboardingComplete: true,
    },
  });

  for (const place of data) {
    await prisma.place.create({
      data: {
        cityId: lisbon.id,
        createdById: systemUser.id,
        name: place.name,
        description: place.description,
        category: place.category as PlaceCategory,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        neighborhood: place.neighborhood,
        estimatedDuration: place.estimatedDuration,
        priceLevel: place.priceLevel as PriceLevel,
        googlePlaceId: place.googlePlaceId,
        imageUrl: place.imageUrl,
        tags: {
          create: place.tags.map((tag: string) => ({ tag })),
        },
      },
    });
  }

  console.log(`Loaded ${data.length} places to Lisbon`);
}

loadPlaces()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with: `npx ts-node scripts/load-places.ts`

---

### 4. Basic Recommendation Function

TypeScript function for rule-based recommendations (called by Backend Agent).

**File:** `/src/lib/ai/recommendations.ts`

```typescript
import { prisma } from '@/lib/db/client';
import { PlaceCard } from '@/types/place';
import { UserInterest, InterestCategory } from '@/types/user';

// Map interest categories to place tags
const INTEREST_TO_TAGS: Record<InterestCategory, string[]> = {
  FOOD_DRINK: ['foodie', 'local-favorite'],
  ART_CULTURE: ['artsy', 'cultural', 'historic'],
  OUTDOORS_NATURE: ['outdoor', 'viewpoint'],
  NIGHTLIFE: ['nightlife'],
  SHOPPING: ['shopping'],
  HISTORY: ['historic', 'cultural'],
  ADVENTURE: ['adventurous', 'quirky'],
  RELAXATION: ['chill'],
  PHOTOGRAPHY: ['instagram-worthy', 'viewpoint'],
  LOCAL_EXPERIENCES: ['local-favorite', 'hidden-gem'],
  ARCHITECTURE: ['historic', 'artsy'],
  MUSIC: ['nightlife', 'cultural'],
  SPORTS: [],
  WELLNESS: ['chill'],
};

export interface RecommendationParams {
  userId: string;
  cityId?: string;
  latitude?: number;
  longitude?: number;
  maxDuration?: number;
  limit?: number;
}

export async function getRecommendations(params: RecommendationParams): Promise<{
  places: PlaceCard[];
  basedOn?: {
    trips: any[];
    users: any[];
  };
}> {
  const { userId, cityId, latitude, longitude, maxDuration, limit = 10 } = params;

  // Get user interests
  const interests = await prisma.userInterest.findMany({
    where: { userId },
  });

  // Build tag weights from interests
  const tagWeights: Record<string, number> = {};
  for (const interest of interests) {
    const tags = INTEREST_TO_TAGS[interest.category as InterestCategory] || [];
    for (const tag of tags) {
      tagWeights[tag] = (tagWeights[tag] || 0) + interest.weight;
    }
  }

  // Get saved place IDs to potentially exclude
  const savedPlaces = await prisma.userSave.findMany({
    where: { userId },
    select: { placeId: true },
  });
  const savedIds = new Set(savedPlaces.map(s => s.placeId));

  // Fetch candidate places
  const places = await prisma.place.findMany({
    where: {
      ...(cityId && { cityId }),
      ...(maxDuration && { estimatedDuration: { lte: maxDuration } }),
    },
    include: {
      tags: true,
      city: { include: { country: true } },
    },
    take: 100, // Get more than we need for scoring
  });

  // Score each place
  const scored = places.map(place => {
    let score = 0;

    // Tag matching
    for (const tag of place.tags) {
      score += tagWeights[tag.tag] || 0;
    }

    // Rating boost
    if (place.avgOverallRating) {
      score += place.avgOverallRating * 2;
    }

    // Review count boost (popularity)
    score += Math.log(place.totalReviewCount + 1);

    // Distance penalty (if location provided)
    let distance: number | undefined;
    if (latitude && longitude) {
      distance = calculateDistance(
        latitude, longitude,
        place.latitude, place.longitude
      );
      score -= distance * 0.5; // Penalize distant places
    }

    return { place, score, distance };
  });

  // Sort by score, take top N
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  // Transform to PlaceCard
  const placeCards: PlaceCard[] = top.map(({ place, distance }) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    imageUrl: place.imageUrl,
    neighborhood: place.neighborhood,
    avgOverallRating: place.avgOverallRating,
    totalReviewCount: place.totalReviewCount,
    priceLevel: place.priceLevel,
    tags: place.tags.map(t => t.tag),
    distance,
    isSaved: savedIds.has(place.id),
    cityName: place.city?.name,
    countryName: place.city?.country?.name,
  }));

  // Get trips that influenced recommendations (for "Based on trips by...")
  const followedUsers = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const relatedTrips = await prisma.trip.findMany({
    where: {
      userId: { in: followedUsers.map(f => f.followingId) },
      isPublic: true,
      stops: {
        some: {
          placeId: { in: placeCards.map(p => p.id) },
        },
      },
    },
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
    take: 3,
  });

  return {
    places: placeCards,
    basedOn: relatedTrips.length > 0 ? {
      trips: relatedTrips.map(t => ({
        id: t.id,
        title: t.title,
        user: t.user,
      })),
      users: relatedTrips.map(t => t.user),
    } : undefined,
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula - returns km
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

---

### 5. Discover Function ("I have X hours")

**File:** `/src/lib/ai/discover.ts`

```typescript
import { prisma } from '@/lib/db/client';
import { PlaceCard } from '@/types/place';
import { TripCard } from '@/types/trip';

export interface DiscoverParams {
  cityId: string;
  availableMinutes: number;
  latitude?: number;
  longitude?: number;
  categories?: string[];
  priceLevels?: string[];
}

export async function discoverPlaces(params: DiscoverParams): Promise<{
  places: PlaceCard[];
  fromTrips: TripCard[];
}> {
  const { cityId, availableMinutes, latitude, longitude, categories, priceLevels } = params;

  // Find places that fit within the time budget
  const places = await prisma.place.findMany({
    where: {
      cityId,
      estimatedDuration: { lte: availableMinutes },
      ...(categories && { category: { in: categories as any } }),
      ...(priceLevels && { priceLevel: { in: priceLevels as any } }),
    },
    include: {
      tags: true,
      city: { include: { country: true } },
    },
    orderBy: { avgOverallRating: 'desc' },
    take: 20,
  });

  // Find trips that include these places (for social proof)
  const placeIds = places.map(p => p.id);
  const relatedTrips = await prisma.trip.findMany({
    where: {
      isPublic: true,
      status: 'COMPLETED',
      stops: {
        some: { placeId: { in: placeIds } },
      },
    },
    include: {
      user: { select: { id: true, name: true, username: true, avatarUrl: true, tripCount: true, followerCount: true } },
      city: { include: { country: true } },
      _count: { select: { stops: true } },
    },
    take: 5,
  });

  // Transform places
  const placeCards: PlaceCard[] = places.map(place => ({
    id: place.id,
    name: place.name,
    category: place.category,
    imageUrl: place.imageUrl,
    neighborhood: place.neighborhood,
    avgOverallRating: place.avgOverallRating,
    totalReviewCount: place.totalReviewCount,
    priceLevel: place.priceLevel,
    tags: place.tags.map(t => t.tag),
    isSaved: false, // Would need user context
    cityName: place.city?.name,
    countryName: place.city?.country?.name,
  }));

  // Transform trips
  const tripCards: TripCard[] = relatedTrips.map(trip => ({
    id: trip.id,
    title: trip.title,
    coverImageUrl: trip.coverImageUrl,
    startDate: trip.startDate,
    endDate: trip.endDate,
    likeCount: trip.likeCount,
    status: trip.status,
    user: trip.user,
    city: { name: trip.city.name, country: { name: trip.city.country.name } },
    stopCount: trip._count.stops,
    isLiked: false,
  }));

  return {
    places: placeCards,
    fromTrips: tripCards,
  };
}
```

---

## Phase 2 Tasks (After MVP)

### 6. ML Recommendation Engine
- Collaborative filtering with user-trip-place matrix
- Train on follows, likes, reviews, saves
- Use scikit-learn or PyTorch
- Factor in similar users' preferences

### 7. NLP Search with OpenAI
- Replace keyword matching with GPT-4 parsing
- Extract structured filters from natural language
- Handle complex queries like "somewhere romantic for sunset drinks"

### 8. Social Media Trend Detection
- TikTok/Instagram scraping pipeline
- Velocity detection algorithm
- Auto-add trending places to database
- "Emerging" badge for places gaining traction

---

## Environment Variables

Add to `.env`:
```
GOOGLE_PLACES_API_KEY="..."
OPENAI_API_KEY="..."  # or ANTHROPIC_API_KEY
```

---

## File Structure

```
python/
├── scraper/
│   ├── google_places.py
│   ├── enricher.py
│   └── requirements.txt
└── ai/
    ├── recommender.py  # Future ML model
    └── trend_detector.py  # Future

scripts/
├── load-places.ts
└── seed-data.ts

src/lib/ai/
├── recommendations.ts
├── discover.ts
└── search.ts  # Future NLP

data/
├── raw/
│   └── lisbon_places.json
└── processed/
    └── lisbon_places.json
```

---

## Coordination Rules

1. **Output format** - Processed data must match Place type from `/src/types/place.ts`
2. **Backend integration** - AI functions in `/src/lib/ai/*` are called by Backend Agent
3. **Schema requirements** - If you need new fields, add to `/docs/SCHEMA_REQUESTS.md`
4. **API keys** - Document any new env vars in `/docs/ENV_VARS.md`

---

## Getting Started

1. Set up Python environment:
   ```bash
   python -m venv python/venv
   source python/venv/bin/activate  # or python/venv/Scripts/activate on Windows
   pip install -r python/scraper/requirements.txt
   ```
2. Get Google Places API key
3. Get OpenAI API key
4. Run scraper: `python python/scraper/google_places.py`
5. Enrich with AI: `python python/scraper/enricher.py`
6. Load to database: `npx ts-node scripts/load-places.ts`

---

## Questions?

If you need clarification on:
- Data structures → Check `/src/types/*`
- API integration → Check API_CONTRACTS.md or ask Backend Agent
- New features → Check AI_FEATURES.md
