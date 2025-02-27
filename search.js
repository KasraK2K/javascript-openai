/* ------------------------------ Dependencies ------------------------------ */
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
/* -------------------------------------------------------------------------- */

const restaurants = [
	{
		id: 1,
		title: "Restaurant One",
		description: "A cozy Italian restaurant with authentic pasta dishes.",
	},
	{
		id: 2,
		title: "Sushi House",
		description: "Serving delicious sushi rolls and authentic Japanese cuisine.",
	},
	{
		id: 3,
		title: "Tacos El Ranchero",
		description: "Authentic Mexican tacos made with fresh ingredients daily.",
	},
	{
		id: 4,
		title: "Burger Joint",
		description: "Delicious burgers and sides, cooked to order.",
	},
	{
		id: 5,
		title: "Sweet Tooth Cafe",
		description: "Indulge in delicious pastries and sweet treats.",
	},
	{
		id: 6,
		title: "Seafood Market",
		description: "Fresh seafood dishes made to order with a great view of the ocean.",
	},
	{
		id: 7,
		title: "Thai Kitchen",
		description: "Authentic Thai dishes made with fresh ingredients and spices.",
	},
	{
		id: 8,
		title: "Pizza Palace",
		description: "Delicious pizzas with a variety of toppings and crust options.",
	},
	{
		id: 9,
		title: "Indian Cuisine",
		description: "Traditional Indian dishes made with authentic spices and flavors.",
	},
	{
		id: 10,
		title: "Vegetarian Garden",
		description: "Delicious vegetarian and vegan dishes made with fresh ingredients.",
	},
];

const createStore = () =>
	MemoryVectorStore.fromDocuments(
		restaurants.map(
			(restaurant) =>
				new Document({
					pageContent: `Title: ${restaurant.title}\n${restaurant.description}`,
					metadata: { source: restaurant.id, title: restaurant.title },
				})
		),
		new OpenAIEmbeddings()
	);

const search = async (query, count = 5) => {
	const store = await createStore();
	const results = await store.similaritySearchWithScore(query, count);
	// Sanitize Results
	for (const index in results) {
		const score = results[index][1];
		if (score < 0.81) delete results[index];
	}
	return results.filter((result) => result !== undefined);
};

console.log(await search("witch restaurant has best tacos?"));
