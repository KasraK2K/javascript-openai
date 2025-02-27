/* ------------------------------ Dependencies ------------------------------ */
import { evaluate } from 'mathjs'
import dotenv from 'dotenv'
dotenv.config()
/* ----------------------------- Custom Modules ----------------------------- */
import { openai } from './openai.js'
/* -------------------------------------------------------------------------- */

const QUESTION = process.argv[2] || ''
const MESSAGES = [{ role: 'user', content: QUESTION }]

const functions = {
    calculate: async function ({ expression }) {
        console.log(`🧮 Calculating: ${expression} result should be: ${evaluate('1 + sin(4/2 deg) / 3 ^ 3 -1 * 3 + pi + max(3,2) % log(24, 10)')}`)
        try {
            return { result: evaluate(expression) }
        } catch (error) {
            console.error('❌ Calculation Error:', error.message)
            return { error: 'Invalid mathematical expression' }
        }
    },
}

async function getCompletion(messages) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            functions: [
                {
                    name: 'calculate',
                    description: 'Evaluate a mathematical expression',
                    parameters: {
                        type: 'object',
                        properties: {
                            expression: {
                                type: 'string',
                                description: 'The mathematical expression to be evaluated like "2 / (3 * 8)" or "7 + sin(90 deg) + log(1000, 10)"',
                            },
                        },
                        required: ['expression'],
                    },
                },
            ],
            temperature: 0,
        })

        return response.choices[0]?.message || {}
    } catch (error) {
        console.error('❌ OpenAI API Error:', error.message)
        return {}
    }
}

async function main() {
    while (true) {
        const response = await getCompletion(MESSAGES)

        if (response.function_call) {
            const { name, arguments: args } = response.function_call
            const functionToCall = functions[name]

            if (functionToCall) {
                try {
                    const params = JSON.parse(args)
                    const result = await functionToCall(params)

                    MESSAGES.push(
                        { role: 'assistant', content: '', function_call: { name, arguments: args } },
                        { role: 'function', name, content: JSON.stringify(result) },
                    )
                } catch (error) {
                    console.error(`❌ Function Execution Error: ${error.message}`)
                    break
                }
            } else {
                console.error(`❌ Unknown function called: ${name}`)
                break
            }
        } else {
            console.log('📝 Response:', response.content)
            break
        }
    }
}

main().catch(console.error)
