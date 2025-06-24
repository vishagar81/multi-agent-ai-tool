import axios from 'axios';

export async function queryLLM(prompt, model = 'gpt-4o-mini') {
    const apiKey = process.env.OPENAI_API_KEY;
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const data = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.2
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
        const finalResponse = response.data.choices[0].message.content.trim();
        console.log(finalResponse);
        return finalResponse;
    } catch (error) {
        console.error('Error querying LLM:', error.message);
        throw error;
    }
}