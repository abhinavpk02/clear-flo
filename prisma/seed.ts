import { prisma } from '../src/lib/db';

async function main() {
  console.log('Seeding initial products with Car Wash, Dish Wash, Floor Cleaner, Hand Wash, Fabric, and Laundry...');

  // 1. Settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'ClearFlo Liquid Detergents',
      businessAddress: 'Plot 42, Industrial Development Plot, Kalamassery, Kochi, Kerala - 683109',
      businessPhone: '+91 94471 23456',
      businessGstin: '32ABCDE1234F1Z5',
      bankName: 'Federal Bank, Kalamassery Branch',
      accountNo: '15420200087654',
      ifscCode: 'FDRL0001542',
      upiId: 'clearflo@federal',
      qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=clearflo@federal&pn=ClearFlo%20Detergents&cu=INR',
    },
  });

  // 2. Initial Products
  const products = [
    {
      name: '5L CAN car washer liquid concentrate',
      category: 'Auto Care',
      unit: '5L Can',
      priceInPaise: 68000, // Rs. 680.00
      stock: 100,
      hsnCode: '34022090',
      iconName: 'Car',
      description: 'High-foam car wash shampoo and pressure washer detergent.',
    },
    {
      name: '5L CAN dish wash gel lemon concentrate',
      category: 'Dish Care',
      unit: '5L Can',
      priceInPaise: 48000, // Rs. 480.00
      stock: 150,
      hsnCode: '34022090',
      iconName: 'Utensils',
      description: 'Tough grease cutting liquid dish wash gel.',
    },
    {
      name: '5L CAN floor cleaner disinfectant',
      category: 'Surface Care',
      unit: '5L Can',
      priceInPaise: 38000, // Rs. 380.00
      stock: 200,
      hsnCode: '34029090',
      iconName: 'Home',
      description: 'Disinfectant floor cleaner with 99.9% germ protection.',
    },
    {
      name: '5L CAN hand wash herbal anti-bacterial',
      category: 'Hand Care',
      unit: '5L Can',
      priceInPaise: 42000, // Rs. 420.00
      stock: 110,
      hsnCode: '34029090',
      iconName: 'Hand',
      description: 'Gentle moisturizing anti-bacterial liquid hand wash.',
    },
    {
      name: '5L CAN fabric softener rose conditioner',
      category: 'Fabric Care',
      unit: '5L Can',
      priceInPaise: 45000, // Rs. 450.00
      stock: 80,
      hsnCode: '34029090',
      iconName: 'Shirt',
      description: 'Long-lasting fragrance and static-free soft clothes.',
    },
    {
      name: '5L CAN top load laundry liquid detergent',
      category: 'Laundry Detergent',
      unit: '5L Can',
      priceInPaise: 55000, // Rs. 550.00
      stock: 120,
      hsnCode: '34022090',
      iconName: 'WashingMachine',
      description: 'High efficiency liquid detergent for washing machines.',
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
