import { queryLLM } from './llm/llmOps.js';
import { logMessage } from './logger.js';
import readline from 'readline';

export class AgentOrchestrator {
    constructor(agents) {
        this.agents = agents;
        this.memory = [];
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

    async orchestrateTask(userInput) {
        this.memory = this.memory.slice(-this.maxMemory);
        
        const context = this.memory.join('\n');
        console.log(`Context: ${context}`);

        const responseFormat = { action: '', input: '', next_action: '' };
        
        const getPrompt = (userInput) => {
            return `
                Use the context from memory to plan next steps.                
                Context:
                ${context}

                You are an expert intent classifier.
                You need will use the context provided and the user's input to classify the intent select the appropriate agent.                
                You will rewrite the input for the agent so that the agent can efficiently execute the task.                                                

                Here are the available agents and their descriptions:
                ${this.agents.map(agent => `- ${agent.name}: ${agent.description}`).join(', ')}

                User Input:
                ${userInput}              

                ###Guidelines###
                - Sometimes you might have to use multiple agent's to solve user's input. You have to do that in a loop.
                - The original userinput could have multiple tasks, you will use the context to understand the previous actions taken and the next steps you should take.
                - Read the context, take your time to understand, see if there were many tasks and if you executed them all
                - If there are no actions to be taken, then make the action "respond_to_user" with your final thoughts combining all previous responses as input.
                - Respond with "respond_to_user" only when there are no agents to select from or there is no next_action
                - You will return the agent name in the form of ${JSON.stringify(responseFormat)}
                - Always return valid JSON like ${JSON.stringify(responseFormat)} and nothing else.                

                `;
        };

        this.memory = this.memory.slice(-10);
        const prompt = getPrompt(userInput);
        const llmResponse = await queryLLM(prompt);

        const parsedResponse = this.jsonParser(llmResponse);
        console.log(`LLM Response: ${JSON.stringify(parsedResponse)}`);

        this.memory.push(`Orchestrator: ${JSON.stringify(parsedResponse)}`);

        let action, input;
        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
            action = parsedResponse.action || '';
            input = parsedResponse.input || '';
        } else {
            throw new Error('LLM response is not a dictionary as expected.');
        }

        console.log(`Action identified by LLM: ${action}`);

        if (action === 'respond_to_user') {
            return parsedResponse;
        }

        for (const agent of this.agents) {
            if (agent.name === action) {
                console.log('*******************Found Agent Name*******************************');
                const agentResponse = await agent.processInput(input);
                console.log(`${action} response: ${agentResponse}`);
                this.memory.push(`Agent Response for Task: ${agentResponse}`);
                console.log(this.memory);
                return agentResponse;
            }
        }
    }

    async run() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('LLM Agent: Hello! How can I assist you today?');
        
        const askQuestion = () => {
            return new Promise((resolve) => {
                rl.question('You: ', (answer) => {
                    resolve(answer);
                });
            });
        };

        let userInput = await askQuestion();
        this.memory.push(`User: ${userInput}`);

        while (true) {
            if (typeof userInput === 'string' && ['exit', 'bye', 'close'].includes(userInput.toLowerCase())) {
                console.log('See you later!');
                break;
            }

            if (typeof userInput === 'string') {
                const response = await this.orchestrateTask(userInput);
                console.log(`Final response of orchestrator ${JSON.stringify(response)}`);
                
                if (typeof response === 'object' && response.action === 'respond_to_user') {
                    logMessage(`Response from Agent: ${response.input}`, 'RESPONSE');
                    userInput = await askQuestion();
                    this.memory.push(`User: ${userInput}`);
                } else if (response === 'No action or agent needed') {
                    console.log('Response from Agent: ', response);
                    userInput = await askQuestion();
                } else {
                    userInput = response;
                }
            } else {
                console.log('Invalid user_input type. Expected a string.');
                break;
            }
        }

        rl.close();
    }
}