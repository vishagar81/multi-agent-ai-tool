import { queryLLM } from '../llm/llmOps.js';

export class Agent {
    constructor(name, description, tools, model) {
        this.memory = [];
        this.name = name;
        this.description = description;
        this.tools = tools;
        this.model = model;
        this.maxMemory = 10;
    }

    jsonParser(inputString) {
        console.log(typeof inputString);
        
        try {
            const jsonDict = JSON.parse(inputString);
            
            if (typeof jsonDict === 'object' && jsonDict !== null) {
                return jsonDict;
            }
            
            throw new Error('Invalid JSON response');
        } catch (error) {
            throw new Error('Invalid JSON response');
        }
    }

    async processInput(userInput) {
        this.memory.push(`User: ${userInput}`);
        
        const context = this.memory.join('\n');
        const toolDescriptions = this.tools.map(tool => `- ${tool.name()}: ${tool.description()}`).join('\n');
        const responseFormat = { action: '', args: '' };

        const prompt = `Context:
        ${context}

        Available tools:
        ${toolDescriptions}

        Based on the user's input and context, decide if you should use a tool or respond directly.        
        If you identify a action, respond with the tool name and the arguments for the tool.        
        If you decide to respond directly to the user then make the action "respond_to_user" with args as your response in the following format.

        Response Format:
        ${JSON.stringify(responseFormat)}

        `;

        const response = await queryLLM(prompt);
        this.memory.push(`Agent: ${response}`);

        const responseDict = this.jsonParser(response);

        // Check if any tool can handle the input
        for (const tool of this.tools) {
            const currentResponse = Array.isArray(responseDict) ? responseDict[0] : responseDict;
            if (tool.name().toLowerCase() === currentResponse.action.toLowerCase()) {
                return await tool.use(currentResponse.args);
            }
        }

        return responseDict;
    }
}