# AI Features Specification

This document details all AI features to be implemented for Pioneer.

## Features Overview

| # | Feature | Phase | Priority |
|---|---------|-------|----------|
| 1 | Personalization/Recommendation Engine | MVP + Phase 2 | Core |
| 2 | Natural Language Activity Search | Phase 2 | High |
| 3 | Social Media Trend Detection | Phase 3 | Differentiator |
| 4 | Time-Based Itinerary Generation | Phase 2-3 | Core |
| 5 | Activity Content Generation | Ongoing | Operational |
| 7 | Smart Notifications | Phase 4 | Engagement |

---

## Feature 1: Recommendation Engine

### MVP Version (Rule-Based)
Simple scoring algorithm based on:
- User interest weights → activity tag matching
- Trending boost
- Rating boost
- Distance penalty

**Location:** `/src/lib/ai/recommendations.ts`

### Phase 2 Version (ML)
Full collaborative + content-based filtering.

**Approach:**
```
User-Activity Matrix:
┌────────────────────────────────────────┐
│         Activity1  Activity2  Activity3│
│ User1      5          0          3     │  (5=completed, 3=saved, 0=none)
│ User2      0          4          5     │
│ User3      3          5          0     │
└────────────────────────────────────────┘

Content Features (per activity):
- Category embeddings
- Tag embeddings
- Duration normalized
- Cost level encoded
- Location cluster

User Features (per user):
- Interest vector
- Historical interaction embedding
- Time-of-day preference
- Cost preference (inferred)
```

**Training:**
- Implicit feedback: views, saves, completions
- Explicit feedback: ratings
- Train weekly on accumulated data

**Inference:**
- Generate top-N candidates
- Re-rank by context (location, time, weather)
- Diversify (don't show 5 coffee shops in a row)

**Tech:** Python + scikit-learn (MVP) → PyTorch (scale)

---

## Feature 2: Natural Language Search

### MVP Version (Keyword Matching)
Map keywords to tags, query database.

**Location:** `/src/lib/ai/search.ts`

### Phase 2 Version (LLM Parsing)

**Flow:**
```
User query: "something chill outdoors, not too touristy, good for photos"
                              ↓
                    LLM (GPT-4 / Claude)
                              ↓
Structured output:
{
  "vibes": ["relaxed", "peaceful"],
  "setting": "outdoor",
  "crowd_preference": "avoid_crowds",
  "photography": true,
  "exclude_tags": ["touristy"]
}
                              ↓
                    Database Query
                              ↓
                    Ranked Results
```

**Prompt Template:**
```
You are a travel activity search parser. Extract structured filters from the user's query.

Query: "{user_query}"

Respond with JSON:
{
  "vibes": [],           // From: relaxed, energetic, romantic, adventurous, cultural
  "setting": null,       // indoor, outdoor, or null
  "time_of_day": null,   // morning, afternoon, evening, night, or null
  "cost_levels": [],     // From: free, cheap, moderate, expensive
  "duration_max": null,  // minutes, or null
  "include_tags": [],    // Tags to prioritize
  "exclude_tags": [],    // Tags to avoid
  "crowd_preference": null,  // avoid_crowds, any, or null
  "weather_sensitive": null  // true if they want indoor backup options
}
```

---

## Feature 3: Social Media Trend Detection

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION                          │
├─────────────────────────────────────────────────────────────┤
│ Sources:                                                    │
│ - TikTok: #lisbonhiddengem #lisbonfoodie #lisbonsecrets    │
│ - Instagram: Location tags in Lisbon area                   │
│ - Reddit: r/lisbon, r/portugal                             │
│                                                             │
│ Method: Apify actors or custom scrapers                     │
│ Frequency: Every 6 hours                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSING                               │
├─────────────────────────────────────────────────────────────┤
│ 1. Extract location mentions                                │
│    - Geotags                                                │
│    - Mentioned place names                                  │
│    - Landmark references                                    │
│                                                             │
│ 2. Classify content type                                    │
│    - Restaurant/Cafe                                        │
│    - Viewpoint                                              │
│    - Shop/Market                                            │
│    - Activity/Experience                                    │
│    - Event (time-limited)                                   │
│                                                             │
│ 3. Sentiment analysis                                       │
│    - Positive/Negative/Neutral                              │
│    - Extract specific praise/complaints                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    TREND SCORING                            │
├─────────────────────────────────────────────────────────────┤
│ velocity = (mentions_this_week - mentions_last_week)        │
│            / mentions_last_week                             │
│                                                             │
│ trend_score = velocity * sentiment_score * uniqueness       │
│                                                             │
│ Labels:                                                     │
│ - EMERGING: velocity > 0.5, total_mentions < 100           │
│ - HOT: velocity > 0.2, total_mentions > 100                │
│ - PEAKED: velocity < 0, total_mentions > 500               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE UPDATE                          │
├─────────────────────────────────────────────────────────────┤
│ - Match to existing activities (fuzzy name matching)        │
│ - Create new activities if novel (mark as TRENDING source)  │
│ - Update ActivityTrending table                             │
│ - Flag for human review if confidence < threshold           │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Notes

**Legal considerations:**
- TikTok: No official API. Use Apify's TikTok actor (paid, compliant)
- Instagram: Official API limited. Graph API needs business account
- Prioritize user submissions with social links (fully legal)
- Partner with influencers for content licensing

**Storage:**
```sql
-- New table for raw social mentions
social_mentions (
  id, platform, post_url, author,
  content, location_text, geotag_lat, geotag_lng,
  likes, comments, shares,
  fetched_at, processed, matched_activity_id
)
```

---

## Feature 4: Itinerary Generation

### Algorithm

```
Input:
├── available_minutes: 180
├── start_location: (lat, lng)
├── user_preferences: { interests, cost_levels, exclude_ids }
└── context: { time_of_day, weather }

Step 1: Candidate Selection
├── Filter by: duration fits, cost acceptable, not excluded
├── Score by: preference match, rating, trending
└── Select top 20 candidates

Step 2: Constraint Satisfaction
├── Total duration ≤ available_minutes (including walking)
├── Walking time between activities (Google Directions API)
├── Time-of-day appropriateness (don't suggest bars at 10am)
└── Weather consideration (skip outdoor if raining)

Step 3: Route Optimization
├── Start from user location
├── Greedy nearest neighbor for simplicity
├── Or: 2-opt improvement for better routes
└── Calculate total walking time/distance

Step 4: Narrative Generation (LLM)
├── For each activity, generate "reason" text
├── Explain why this fits their preferences
└── Add practical tips (best order, timing suggestions)

Output:
├── items: [{ activity, startTime, endTime, walkingMinutes, reason }]
├── totalDuration: 175
└── totalWalkingDistance: 1200
```

### LLM Prompt for Narrative

```
You are creating a personalized itinerary explanation for a traveler.

User preferences: {preferences}
Activity sequence: {activities}
Context: {time_of_day}, {weather}

For each activity, write a brief (1 sentence) reason why it's perfect for them.
Be specific to their preferences. Sound like a knowledgeable local friend.

Example output:
[
  { "activityId": "...", "reason": "Best pastel de nata in the city—you said you love local food spots" },
  { "activityId": "...", "reason": "Hidden viewpoint with golden hour light, perfect for your photography interest" }
]
```

---

## Feature 5: Content Generation

### Use Cases

**A. Initial Enrichment (during scraping)**
Turn raw Google Places data into engaging content.

**B. Seasonal Updates**
Refresh descriptions for seasons:
- Winter: "Warm up with..."
- Summer: "Beat the heat at..."

**C. Personalized Descriptions (Future)**
Dynamically adjust description based on user:
- For foodie: Emphasize culinary aspects
- For photographer: Emphasize visual opportunities

### Prompt Templates

**Basic Enrichment:**
```
You are a travel writer for a spontaneous discovery app targeting young travelers.

Write content for this place:
Name: {name}
Type: {types}
Rating: {rating} ({review_count} reviews)
Location: {address}

Generate:
1. tagline (catchy, max 50 chars)
2. description (2-3 sentences, engaging, practical)
3. insiderTip (one sentence, actionable)

Tone: Friendly, slightly irreverent, like a local friend giving advice.
Avoid: Generic tourist-speak, clichés like "hidden gem" overuse.
```

**Review Summarization:**
```
Analyze these {n} reviews for {place_name}:

{reviews}

Extract:
1. What locals love (2-3 points)
2. What to watch out for (1-2 points)
3. Best time to visit (based on review patterns)
4. Pro tip from a reviewer

Be specific and practical.
```

---

## Feature 7: Smart Notifications

### Trigger Types

| Trigger | Logic | Example |
|---------|-------|---------|
| Proximity | User within 500m of saved activity | "You're 5 min from Manteigaria!" |
| Time-aware | Calendar gap + saved activity nearby | "2 hours until dinner. That viewpoint you saved is 10 min away" |
| Weather | Weather changes + relevant saved activities | "Sun's out! Perfect for that rooftop bar" |
| Urgency | Ephemeral activity expiring soon | "Pop-up market closes in 2 hours" |
| Discovery | New trending activity nearby | "New: rooftop bar locals are buzzing about" |

### Scoring Model

```
notification_score =
    relevance_weight * relevance_score +
    timing_weight * timing_score +
    engagement_weight * user_engagement_history

Where:
- relevance_score: How well activity matches user (0-1)
- timing_score: Is this a good time to notify? (0-1)
  - Penalize: during sleep hours, during saved calendar events
  - Boost: idle time, weekend afternoons
- user_engagement_history: Does user act on notifications? (0-1)
  - Track: open rate, click-through, actual visits
```

### Rate Limiting

- Max 3 notifications per day
- Minimum 2 hours between notifications
- Decay: If user ignores an activity 3x, stop notifying about it
- Respect quiet hours (inferred or set)

---

## Data Requirements

### For Recommendations
- User interests (from onboarding)
- User interaction history (views, saves, completions)
- Activity attributes (tags, duration, cost, location)
- At least 1000 user interactions for ML model

### For Trend Detection
- 2+ weeks of social media data for baseline
- Place name matching database
- Geolocation data for Lisbon neighborhoods

### For Itineraries
- Walking time between activities (cache common routes)
- Activity opening hours
- Weather API integration

---

## API Costs Estimation

| Feature | API | Est. Cost/1000 uses |
|---------|-----|---------------------|
| Content generation | GPT-4 | $0.50-1.00 |
| NLP search | GPT-4 turbo | $0.10-0.30 |
| Itinerary narrative | GPT-4 | $0.20-0.50 |
| Trend classification | GPT-3.5 | $0.01-0.05 |

Consider caching, batching, and using smaller models where quality allows.
