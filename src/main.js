import { Agent } from './agents/BaseAgent.js';
import { WeatherTool } from './tools/WeatherTool.js';
import { TimeTool } from './tools/TimeTool.js';
import { AgentOrchestrator } from './orchestrator.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create Weather Agent
const weatherAgent = new Agent(
    'Weather Agent',
    'Provides weather information for a given location',
    [new WeatherTool()],
    'gpt-4o-mini'
);

// Create Time Agent
const timeAgent = new Agent(
    'Time Agent',
    'Provides the current time for a given city',
    [new TimeTool()],
    'gpt-4o-mini'
);

// Create AgentOrchestrator
const agentOrchestrator = new AgentOrchestrator([weatherAgent, timeAgent]);

// Run the orchestrator
agentOrchestrator.run();