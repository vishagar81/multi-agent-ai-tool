import axios from 'axios';
import { BaseTool } from './BaseTool.js';

export class WeatherTool extends BaseTool {
    name() {
        return 'Weather Tool';
    }

    description() {
        return 'Provides weather information for a given location. The payload is just the location. Example: New York';
    }

    async use(location) {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
        
        try {
            const response = await axios.get(url);
            const data = response.data;
            
            if (data.cod === 200) {
                const temp = data.main.temp;
                const description = data.weather[0].description;
                const result = `The weather in ${location} is currently ${description} with a temperature of ${temp}°C.`;
                console.log(result);
                return result;
            } else {
                return `Sorry, I couldn't find weather information for ${location}.`;
            }
        } catch (error) {
            return `Sorry, I couldn't find weather information for ${location}.`;
        }
    }
}