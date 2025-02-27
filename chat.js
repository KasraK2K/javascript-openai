/* ------------------------------ Node Modules ------------------------------ */
import readline from "node:readline";
/* ----------------------------- Custom Modules ----------------------------- */
import { openai } from "./openai.js";
/* -------------------------------------------------------------------------- */

/* -------------------------------- Constants ------------------------------- */
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
/* -------------------------------------------------------------------------- */

/**
 * @param {{role: 'assistant' | 'function' | 'system' | 'tool' | 'user'; content: string}} history
 * @param {string} message
 * @returns {{role: "assistant"; content: string}}
 */
async function newMessage(history, message) {
	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [...history, message],
		temperature: 2,
	});

	return response.choices[0].message;
}

/**
 * @param {string} userInput
 * @returns {{role: "user"; content: string}}
 */
function formatMessage(userInput) {
	return { role: "user", content: userInput };
}

function chat() {
	const history = [
		{
			role: "system",
			content: "You are an AI assistant.",
		},
	];

	function start() {
		rl.question("You: ", async (userInput) => {
			if (userInput.toLowerCase() === "exit") {
				rl.close();
				return;
			}

			const userMessage = formatMessage(userInput);
			const response = await newMessage(history, userMessage);
			history.push(userMessage, response);
			console.log(`\n\nAI: ${response.content}`);

			start();
		});
	}

	console.log("AI: how can I help you today?");
	start();
}

console.log("Chatbot initialized. type 'exit' to end the chat");

chat();
