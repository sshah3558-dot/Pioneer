import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Countries
  const usa = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: { name: 'United States', code: 'US', imageUrl: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f04?w=800' },
  });

  const italy = await prisma.country.upsert({
    where: { code: 'IT' },
    update: {},
    create: { name: 'Italy', code: 'IT', imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800' },
  });

  const japan = await prisma.country.upsert({
    where: { code: 'JP' },
    update: {},
    create: { name: 'Japan', code: 'JP', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  });

  const france = await prisma.country.upsert({
    where: { code: 'FR' },
    update: {},
    create: { name: 'France', code: 'FR', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  });

  const portugal = await prisma.country.upsert({
    where: { code: 'PT' },
    update: {},
    create: { name: 'Portugal', code: 'PT', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800' },
  });

  const spain = await prisma.country.upsert({
    where: { code: 'ES' },
    update: {},
    create: { name: 'Spain', code: 'ES', imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800' },
  });

  const uk = await prisma.country.upsert({
    where: { code: 'GB' },
    update: {},
    create: { name: 'United Kingdom', code: 'GB', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
  });

  const indonesia = await prisma.country.upsert({
    where: { code: 'ID' },
    update: {},
    create: { name: 'Indonesia', code: 'ID', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  });

  console.log('Countries created.');

  // Cities
  const newYork = await prisma.city.upsert({
    where: { name_countryId: { name: 'New York', countryId: usa.id } },
    update: {},
    create: { name: 'New York', countryId: usa.id, latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
  });

  const rome = await prisma.city.upsert({
    where: { name_countryId: { name: 'Rome', countryId: italy.id } },
    update: {},
    create: { name: 'Rome', countryId: italy.id, latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  });

  const tokyo = await prisma.city.upsert({
    where: { name_countryId: { name: 'Tokyo', countryId: japan.id } },
    update: {},
    create: { name: 'Tokyo', countryId: japan.id, latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
  });

  const paris = await prisma.city.upsert({
    where: { name_countryId: { name: 'Paris', countryId: france.id } },
    update: {},
    create: { name: 'Paris', countryId: france.id, latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  });

  const lisbon = await prisma.city.upsert({
    where: { name_countryId: { name: 'Lisbon', countryId: portugal.id } },
    update: {},
    create: { name: 'Lisbon', countryId: portugal.id, latitude: 38.7223, longitude: -9.1393, timezone: 'Europe/Lisbon', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800' },
  });

  const barcelona = await prisma.city.upsert({
    where: { name_countryId: { name: 'Barcelona', countryId: spain.id } },
    update: {},
    create: { name: 'Barcelona', countryId: spain.id, latitude: 41.3874, longitude: 2.1686, timezone: 'Europe/Madrid', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
  });

  const london = await prisma.city.upsert({
    where: { name_countryId: { name: 'London', countryId: uk.id } },
    update: {},
    create: { name: 'London', countryId: uk.id, latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
  });

  const bali = await prisma.city.upsert({
    where: { name_countryId: { name: 'Bali', countryId: indonesia.id } },
    update: {},
    create: { name: 'Bali', countryId: indonesia.id, latitude: -8.3405, longitude: 115.092, timezone: 'Asia/Makassar', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  });

  console.log('Cities created.');

  // Create a system user for seeded places
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@pioneer.app' },
    update: {},
    create: {
      email: 'system@pioneer.app',
      name: 'Pioneer',
      username: 'pioneer',
      onboardingComplete: true,
      avatarUrl: 'https://ui-avatars.com/api/?name=Pioneer&background=667eea&color=fff',
    },
  });

  // Places
  const places = [
    { name: 'Manteigaria', cityId: lisbon.id, category: 'CAFE' as const, latitude: 38.7103, longitude: -9.1422, address: 'R. do Loreto 2, Lisbon', neighborhood: 'Chiado', description: 'Famous for their freshly baked pastel de nata.', priceLevel: 'BUDGET' as const, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800' },
    { name: 'Time Out Market', cityId: lisbon.id, category: 'MARKET' as const, latitude: 38.7069, longitude: -9.1456, address: 'Av. 24 de Julho 49, Lisbon', neighborhood: 'Cais do Sodre', description: 'Food hall with top Lisbon chefs under one roof.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' },
    { name: 'Miradouro da Graca', cityId: lisbon.id, category: 'VIEWPOINT' as const, latitude: 38.7178, longitude: -9.1305, address: 'Largo da Graca, Lisbon', neighborhood: 'Graca', description: 'Stunning panoramic views of Lisbon.', priceLevel: 'FREE' as const, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800' },
    { name: 'Tsukiji Outer Market', cityId: tokyo.id, category: 'MARKET' as const, latitude: 35.6654, longitude: 139.7707, address: 'Tsukiji, Chuo City, Tokyo', neighborhood: 'Tsukiji', description: 'Fresh sushi and street food paradise.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
    { name: 'Sensoji Temple', cityId: tokyo.id, category: 'MONUMENT' as const, latitude: 35.7148, longitude: 139.7967, address: 'Asakusa, Taito City, Tokyo', neighborhood: 'Asakusa', description: 'Ancient Buddhist temple with iconic Thunder Gate.', priceLevel: 'FREE' as const, imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800' },
    { name: 'Colosseum', cityId: rome.id, category: 'MONUMENT' as const, latitude: 41.8902, longitude: 12.4922, address: 'Piazza del Colosseo, Rome', neighborhood: 'Centro Storico', description: 'Iconic ancient Roman amphitheater.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
    { name: 'Trastevere', cityId: rome.id, category: 'HIDDEN_GEM' as const, latitude: 41.8847, longitude: 12.4699, address: 'Trastevere, Rome', neighborhood: 'Trastevere', description: 'Charming neighborhood with authentic Roman dining.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800' },
    { name: 'Eiffel Tower', cityId: paris.id, category: 'LANDMARK' as const, latitude: 48.8584, longitude: 2.2945, address: 'Champ de Mars, Paris', neighborhood: '7th arrondissement', description: 'Iconic iron lattice tower on the Champ de Mars.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800' },
    { name: 'Le Marais', cityId: paris.id, category: 'HIDDEN_GEM' as const, latitude: 48.8566, longitude: 2.3622, address: 'Le Marais, Paris', neighborhood: 'Le Marais', description: 'Historic neighborhood with trendy cafes and galleries.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800' },
    { name: 'Central Park', cityId: newYork.id, category: 'PARK' as const, latitude: 40.7829, longitude: -73.9654, address: 'Central Park, New York', neighborhood: 'Manhattan', description: 'Iconic 843-acre urban park in Manhattan.', priceLevel: 'FREE' as const, imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800' },
    { name: 'Chelsea Market', cityId: newYork.id, category: 'MARKET' as const, latitude: 40.7424, longitude: -74.0061, address: '75 9th Ave, New York', neighborhood: 'Chelsea', description: 'Food hall and shopping mall in a former factory.', priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800' },
    { name: 'La Sagrada Familia', cityId: barcelona.id, category: 'MONUMENT' as const, latitude: 41.4036, longitude: 2.1744, address: 'Carrer de Mallorca, Barcelona', neighborhood: 'Eixample', description: "Gaudi's unfinished masterpiece basilica.", priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
    { name: 'Borough Market', cityId: london.id, category: 'MARKET' as const, latitude: 51.5055, longitude: -0.0910, address: '8 Southwark St, London', neighborhood: 'Southwark', description: "London's most renowned food market.", priceLevel: 'MODERATE' as const, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
    { name: 'Tegallalang Rice Terraces', cityId: bali.id, category: 'VIEWPOINT' as const, latitude: -8.4312, longitude: 115.2795, address: 'Tegallalang, Gianyar, Bali', neighborhood: 'Ubud', description: 'Dramatic rice paddies with a beautiful valley setting.', priceLevel: 'BUDGET' as const, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  ];

  for (const place of places) {
    await prisma.place.upsert({
      where: { googlePlaceId: `seed_${place.name.toLowerCase().replace(/\s+/g, '_')}` },
      update: {},
      create: {
        ...place,
        createdById: systemUser.id,
        googlePlaceId: `seed_${place.name.toLowerCase().replace(/\s+/g, '_')}`,
      },
    });
  }

  console.log(`${places.length} places created.`);

  // Forums
  const forums = [
    { name: 'General Travel', slug: 'general-travel', description: 'General travel tips, advice, and stories' },
    { name: 'Europe Travel', slug: 'europe-travel', description: 'All things Europe - from Western Europe to the Balkans' },
    { name: 'Asia Travel', slug: 'asia-travel', description: 'Explore the diverse cultures and cuisines of Asia' },
    { name: 'Budget Travel', slug: 'budget-travel', description: 'Tips and tricks for traveling on a budget' },
  ];

  for (const forum of forums) {
    await prisma.forum.upsert({
      where: { slug: forum.slug },
      update: {},
      create: forum,
    });
  }

  console.log(`${forums.length} forums created.`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
    prisma.$disconnect();
  });
