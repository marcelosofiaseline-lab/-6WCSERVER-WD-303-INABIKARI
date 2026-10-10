// Run once:  npm run seed   (adds starter menu items if the menu is empty)
const connectToDatabase = require('./db');
const m = (category, name, price, description) => ({ category, name, price, description, available: true, createdAt: new Date() });
const items = [
  m('Appetizers', 'Gyoza (6 pcs)', 180, 'Pan-fried pork dumplings with ponzu dip'),
  m('Appetizers', 'Edamame', 120, 'Steamed soybeans with sea salt'),
  m('Appetizers', 'Spring Rolls (4 pcs)', 160, 'Crispy vegetable rolls with sweet chili'),
  m('Sushi & Sashimi', 'Salmon Nigiri (2 pcs)', 190, 'Fresh salmon over seasoned rice'),
  m('Sushi & Sashimi', 'California Maki (8 pcs)', 260, 'Crab, avocado and cucumber'),
  m('Sushi & Sashimi', 'Sashimi Platter', 520, 'Chef\'s selection of fresh fish'),
  m('Ramen & Noodles', 'Tonkotsu Ramen', 320, 'Rich pork broth, chashu, egg, nori'),
  m('Ramen & Noodles', 'Beef Lo Mein', 280, 'Wok-tossed egg noodles with beef and greens'),
  m('Ramen & Noodles', 'Dan Dan Noodles', 270, 'Spicy sesame and chili noodles'),
  m('Rice & Mains', 'Chicken Katsu Don', 290, 'Crispy cutlet and egg over rice'),
  m('Rice & Mains', 'Yangzhou Fried Rice', 240, 'Shrimp, ham, egg and scallion'),
  m('Rice & Mains', 'Sweet & Sour Pork', 310, 'Crispy pork, pineapple, peppers'),
  m('Dim Sum', 'Siomai (4 pcs)', 150, 'Steamed pork and shrimp dumplings'),
  m('Dim Sum', 'Har Gow (4 pcs)', 190, 'Translucent shrimp dumplings'),
  m('Desserts', 'Mochi Trio', 170, 'Matcha, mango and strawberry'),
  m('Desserts', 'Mango Pomelo Sago', 150, 'Chilled coconut dessert'),
  m('Drinks', 'Iced Matcha Latte', 140, ''),
  m('Drinks', 'Jasmine Tea (pot)', 110, ''),
];
(async () => {
  const db = await connectToDatabase();
  if (await db.collection('menu').countDocuments()) console.log('Menu already has items - skipped.');
  else console.log(`Inserted ${(await db.collection('menu').insertMany(items)).insertedCount} menu items.`);
  process.exit(0);
})();
