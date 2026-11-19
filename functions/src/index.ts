import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI, SchemaType as Type } from "@google/generative-ai";
import express from "express";
import cors from "cors";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Type Declarations
interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  imageUrl: string;
  stock: number;
  tags: string[];
}

/**
 * Endpoint 1: Seed Catalog
 * Accessible at GET/POST /api/seed
 * Populates Firestore with realistic products if catalog is empty.
 */
app.post("/seed", async (req, res) => {
  try {
    const productsRef = db.collection("products");
    const snapshot = await productsRef.limit(1).get();

    if (!snapshot.empty && req.body.force !== true) {
       res.status(200).json({ message: "Catalog already seeded. Use { force: true } to override." });
       return;
    }

    // Delete existing products if forced
    if (req.body.force === true) {
      const allDocs = await productsRef.get();
      const batch = db.batch();
      allDocs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    const initialProducts: Omit<CatalogItem, "id">[] = [
      {
        sku: "FRUIT-APL-01",
        name: "Fresh Red Apples",
        description: "Sweet and crunchy organic red apples, packed with nutrients.",
        price: 3.49,
        unit: "500g",
        category: "fruits-vegetables",
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
        stock: 50,
        tags: ["fresh", "organic", "vegan", "vegetarian", "gluten-free"]
      },
      {
        sku: "FRUIT-BAN-01",
        name: "Organic Bananas",
        description: "Rich in potassium, perfect for morning shakes or quick snacks.",
        price: 1.99,
        unit: "1 bunch (approx. 5 units)",
        category: "fruits-vegetables",
        imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
        stock: 40,
        tags: ["fresh", "organic", "vegan", "vegetarian", "gluten-free", "kid-friendly"]
      },
      {
        sku: "VEG-TOM-01",
        name: "Roma Tomatoes",
        description: "Juicy vine-ripened tomatoes, great for salads, sauces, and curries.",
        price: 2.79,
        unit: "500g",
        category: "fruits-vegetables",
        imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400",
        stock: 35,
        tags: ["fresh", "vegan", "vegetarian", "gluten-free"]
      },
      {
        sku: "DAIRY-MILK-01",
        name: "Whole Milk 1L",
        description: "High-calcium organic milk from pasture-fed cows.",
        price: 2.29,
        unit: "1 Bottle",
        category: "dairy-eggs",
        imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
        stock: 25,
        tags: ["fresh", "organic", "vegetarian", "calcium-rich"]
      },
      {
        sku: "DAIRY-EGG-01",
        name: "Free-Range Large Eggs",
        description: "Grade A fresh eggs, sourced from local ethical farms.",
        price: 4.89,
        unit: "12 Pack",
        category: "dairy-eggs",
        imageUrl: "https://images.unsplash.com/photo-1516448424440-9dbca97779c1?w=400",
        stock: 30,
        tags: ["fresh", "keto", "high-protein", "vegetarian"]
      },
      {
        sku: "GRAIN-QUN-01",
        name: "Organic White Quinoa",
        description: "High-protein ancient grain, perfect gluten-free rice substitute.",
        price: 4.99,
        unit: "500g",
        category: "grocery-pantry",
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
        stock: 45,
        tags: ["organic", "vegan", "vegetarian", "gluten-free", "high-protein"]
      },
      {
        sku: "GRAIN-OAT-01",
        name: "Rolled Oats",
        description: "Whole grain oats, ideal for morning breakfast oatmeal and cookies.",
        price: 2.99,
        unit: "1kg",
        category: "grocery-pantry",
        imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400",
        stock: 50,
        tags: ["vegan", "vegetarian", "high-fiber"]
      },
      {
        sku: "PANTRY-CNY-01",
        name: "Organic Coconut Curry Sauce",
        description: "Mild aromatic curry base loaded with coconut cream and spices.",
        price: 3.99,
        unit: "350ml jar",
        category: "grocery-pantry",
        imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400",
        stock: 20,
        tags: ["vegan", "vegetarian", "gluten-free", "quick-meal"]
      },
      {
        sku: "VEG-AVO-01",
        name: "Hass Avocados",
        description: "Creamy, rich in healthy fats, perfect for salads and guacamole.",
        price: 4.50,
        unit: "3 pack",
        category: "fruits-vegetables",
        imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
        stock: 15,
        tags: ["fresh", "keto", "vegan", "vegetarian", "gluten-free"]
      },
      {
        sku: "PANTRY-CKP-01",
        name: "Canned Organic Chickpeas",
        description: "Pre-cooked garbanzo beans, ready for salads or hummus preparation.",
        price: 1.49,
        unit: "400g can",
        category: "grocery-pantry",
        imageUrl: "https://images.unsplash.com/photo-1536304997881-a372c179924b?w=400",
        stock: 60,
        tags: ["organic", "vegan", "vegetarian", "gluten-free", "high-fiber"]
      }
    ];

    const batch = db.batch();
    initialProducts.forEach((product) => {
      const docRef = productsRef.doc();
      batch.set(docRef, { ...product, id: docRef.id });
    });

    await batch.commit();
    res.status(200).json({ message: "Successfully seeded catalog with 10 products.", count: 10 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint 2: Generate AI Meal Plan & Groceries
 * POST /api/generate-plan
 */
app.post("/generate-plan", async (req, res) => {
  try {
    const { household, preferences, customNote } = req.body;
    
    // Fallbacks
    const adults = household?.adults || 1;
    const children = household?.children || 0;
    const budget = preferences?.budget || 100;
    const days = preferences?.days || 5;
    const dietaryRestrictions = preferences?.dietaryRestrictions || [];
    const allergies = preferences?.allergies || [];

    // 1. Query the Catalog to obtain item parameters (avoiding over-loading prompt context)
    const productSnapshot = await db.collection("products").get();
    const catalog: Omit<CatalogItem, "description" | "imageUrl">[] = [];
    
    productSnapshot.forEach((doc) => {
      const data = doc.data() as CatalogItem;
      if (data.stock > 0) {
        catalog.push({
          id: doc.id,
          sku: data.sku,
          name: data.name,
          price: data.price,
          unit: data.unit,
          category: data.category,
          stock: data.stock,
          tags: data.tags
        });
      }
    });

    // 2. Setup Gemini Model or Mock if API Key is not set
    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Returning mock dynamic schedule data.");
      const mockResult = generateMockPlan(catalog, budget, days, dietaryRestrictions, allergies);
      res.status(200).json({ status: "success", data: mockResult });
      return;
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Compile prompt constraints
    const systemPrompt = `You are the SmartCart AI Grocery Planner.
Your task is to analyze user preferences and generate:
1. A structured meal plan calendar for ${days} days.
2. A matching shopping list composed ONLY of products in the inventory catalog provided below.

Rules:
- Strictly recommend products from the catalog. Map their SKUs exactly.
- Total cost of recommended items (quantity needed * price) MUST NOT exceed the budget of $${budget}.
- Quantities: Scale appropriate portions based on household sizes of ${adults} adults and ${children} children.
- Allergen Restrictions: Ensure no recommended items contain tags corresponding to user allergies: [${allergies.join(", ")}].
- Dietary Filters: Prioritize products matching dietary filters: [${dietaryRestrictions.join(", ")}].
- Output format must strictly match the requested JSON Schema. No explanatory wrapper text.

CATALOG DATABASE:
${JSON.stringify(catalog)}`;

    const promptInput = `Household: ${adults} Adults, ${children} Children.
Dietary Filters: ${dietaryRestrictions.join(", ")}.
Allergies: ${allergies.join(", ")}.
Budget Ceiling: $${budget}.
Duration: ${days} days.
Custom notes: "${customNote || "None"}".`;

    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Input:\n${promptInput}` }] }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                totalEstimatedCost: { type: Type.NUMBER },
                budgetCompliance: { type: Type.BOOLEAN },
                caloriesPerDayAverage: { type: Type.NUMBER }
              },
              required: ["totalEstimatedCost", "budgetCompliance"]
            },
            mealPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING }
                },
                required: ["day", "breakfast", "lunch", "dinner"]
              }
            },
            recommendedGroceries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sku: { type: Type.STRING },
                  name: { type: Type.STRING },
                  quantityNeeded: { type: Type.NUMBER },
                  matchedPrice: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["sku", "name", "quantityNeeded", "matchedPrice"]
              }
            }
          },
          required: ["summary", "mealPlan", "recommendedGroceries"]
        }
      }
    });

    const outputText = response.response.text();
    const resultJson = JSON.parse(outputText);

    res.status(200).json({ status: "success", data: resultJson });
  } catch (error: any) {
    console.error("Meal planner generation error: ", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint 3: Transactional Checkout
 * POST /api/checkout
 */
app.post("/checkout", async (req, res) => {
  const { userId, items, address, paymentMethodId } = req.body;

  if (!userId || !items || items.length === 0 || !address) {
     res.status(400).json({ error: "Missing required parameters." });
     return;
  }

  try {
    const orderId = "ord_" + Math.random().toString(36).substr(2, 9);
    const orderRef = db.collection("orders").doc(orderId);

    // Run checkout logic within a transaction to maintain stock consistency
    const result = await db.runTransaction(async (transaction) => {
      let subtotal = 0;
      const verifiedItems: any[] = [];

      for (const cartItem of items) {
        const productRef = db.collection("products").doc(cartItem.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Product ${cartItem.productId} does not exist in catalog.`);
        }

        const productData = productDoc.data() as CatalogItem;

        if (productData.stock < cartItem.quantity) {
          throw new Error(`Insufficient inventory for product "${productData.name}". Available: ${productData.stock}`);
        }

        // Deduct inventory
        const newStock = productData.stock - cartItem.quantity;
        transaction.update(productRef, { stock: newStock });

        subtotal += productData.price * cartItem.quantity;
        verifiedItems.push({
          productId: cartItem.productId,
          name: productData.name,
          price: productData.price,
          quantity: cartItem.quantity,
          sku: productData.sku
        });
      }

      // Calculations
      const deliveryFee = subtotal > 15 ? 0 : 3.99;
      const tax = parseFloat((subtotal * 0.08).toFixed(2));
      const total = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

      const orderPayload = {
        id: orderId,
        userId,
        items: verifiedItems,
        billing: {
          subtotal,
          deliveryFee,
          tax,
          total
        },
        deliveryAddress: address,
        status: "placed",
        paymentStatus: paymentMethodId ? "paid" : "pending",
        paymentMethod: "mock-payment-gateway",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      transaction.set(orderRef, orderPayload);

      // Clear the user's cart document
      const cartRef = db.collection("carts").doc(userId);
      transaction.set(cartRef, { items: [], updatedAt: Date.now() });

      return { orderId, total };
    });

    res.status(200).json({
      status: "success",
      orderId: result.orderId,
      chargeAmount: result.total,
      estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 mins delivery
    });
  } catch (error: any) {
    console.error("Checkout process failed: ", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mock generator used if Gemini API key is missing
 */
function generateMockPlan(
  catalog: any[],
  budget: number,
  days: number,
  dietaryRestrictions: string[],
  allergies: string[]
) {
  // Filter products by allergy exclusions
  const safeCatalog = catalog.filter((item) => {
    return !allergies.some((allergen) => item.tags.includes(allergen));
  });

  // Filter products by dietary restriction tags
  let prioritized = safeCatalog.filter((item) => {
    return dietaryRestrictions.every((pref) => item.tags.includes(pref));
  });

  if (prioritized.length === 0) prioritized = safeCatalog;

  const mealPlan: any[] = [];
  const recommendedGroceries: any[] = [];
  let totalCost = 0;

  // Generate day-by-day plan
  for (let i = 1; i <= days; i++) {
    mealPlan.push({
      day: i,
      breakfast: "Healthy Oatmeal bowl topped with fresh fruits",
      lunch: "Steamed Quinoa salad tossed with seasoned vegetables",
      dinner: "Delicious organic slow-cooked stew"
    });
  }

  // Choose 3-4 random safe items that fit inside the budget
  const selectedItems = prioritized.slice(0, 4);
  selectedItems.forEach((item) => {
    const qty = 2;
    if (totalCost + (item.price * qty) <= budget) {
      recommendedGroceries.push({
        sku: item.sku,
        name: item.name,
        quantityNeeded: qty,
        matchedPrice: item.price,
        reason: `Versatile dietary ingredient for breakfast and lunch preparations.`
      });
      totalCost += item.price * qty;
    }
  });

  return {
    summary: {
      totalEstimatedCost: parseFloat(totalCost.toFixed(2)),
      budgetCompliance: totalCost <= budget,
      caloriesPerDayAverage: 1950
    },
    mealPlan,
    recommendedGroceries
  };
}

export const api = functions.https.onRequest(app);
