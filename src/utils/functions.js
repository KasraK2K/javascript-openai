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
        console.log(`🧮 Calculating: ${expression}`)
        try {
            return { result: evaluate(expression) }
        } catch (error) {
            console.error('❌ Calculation Error:', error.message)
            return { error: 'Invalid mathematical expression' }
        }
    },
    generateImage: async function ({ prompt }) {
        console.log('🎨 Generating Image')
        try {
            const result = await openai.images.generate({ prompt })
            return result.data[0].url
        } catch (error) {
            console.error('❌ Generating Image Error:', error.message)
            return { error: 'Invalid generation image prompt' }
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
                {
                    name: 'generateImage',
                    description: 'Generate image based on a prompt',
                    parameters: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'The prompt to generate the image',
                            },
                        },
                        required: ['prompt'],
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
