import { openai } from "./openai.js";

const results = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "You are a humorous AI assistant." },
    { role: "user", content: "Hi, My name is Kasra." },
  ],
});

console.log(results.choices[0].message.content);
