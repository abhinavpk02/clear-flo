import {
  Car,
  Utensils,
  Home,
  Sparkles,
  Hand,
  Shirt,
  WashingMachine,
  SprayCan,
  Package,
  Container,
} from 'lucide-react';

/**
 * Real-Time Dynamic Icon Mapping Helper Function
 * Parses strings and detects keywords to assign minimal thin-line outline icons.
 */
export function getDynamicProductIcon(productName: string, category: string = '') {
  const text = (productName + ' ' + category).toLowerCase();

  // 1. Car wash / Car / Washer
  if (text.includes('car wash') || text.includes('car') || text.includes('washer') || text.includes('auto') || text.includes('vehicle')) {
    return Car;
  }

  // 2. Dish wash / Dish / Vessel
  if (text.includes('dish wash') || text.includes('dish') || text.includes('vessel') || text.includes('plate') || text.includes('utensil') || text.includes('kitchen')) {
    return Utensils;
  }

  // 3. Floor cleaner / Floor
  if (text.includes('floor cleaner') || text.includes('floor') || text.includes('tile') || text.includes('surface')) {
    return Home;
  }

  // 4. Hand wash / Hand
  if (text.includes('hand wash') || text.includes('hand') || text.includes('soap')) {
    return Hand;
  }

  // 5. Fabric / Clothes / Softener
  if (text.includes('fabric') || text.includes('clothes') || text.includes('softener') || text.includes('shirt')) {
    return Shirt;
  }

  // 6. Laundry / Machine / Top Load / Front Load
  if (text.includes('load') || text.includes('laundry') || text.includes('wash')) {
    return WashingMachine;
  }

  // 7. Glass / Window Spray
  if (text.includes('glass') || text.includes('window') || text.includes('spray')) {
    return SprayCan;
  }

  // Fallback -> Generic Package / Container icon
  return Package;
}
