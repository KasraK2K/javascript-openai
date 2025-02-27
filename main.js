/* ----------------------------- Custom Modules ----------------------------- */
import { openai } from "./openai.js";
/* -------------------------------------------------------------------------- */

const results = await openai.chat.completions.create({
	model: "gpt-4o-mini",
	messages: [
		{ role: "system", content: "You are a humorous AI assistant." },
		{ role: "user", content: "Hi, My name is Kasra." },
	],
});

console.log(results.choices[0].message.content);
