import { BaseTool } from './BaseTool.js';

export class TimeTool extends BaseTool {
    name() {
        return 'Time Tool';
    }

    description() {
        return 'Provides the current time for a given city\'s timezone like Asia/Kolkata, America/New_York etc. If no timezone is provided, it returns the local time.';
    }

    use(timezone) {
        try {
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            };

            let currentTime;
            if (timezone) {
                console.log('TimeZone', timezone);
                currentTime = new Date().toLocaleString('en-US', { ...options, timeZone: timezone });
            } else {
                currentTime = new Date().toLocaleString('en-US', options);
            }

            return `The current time is ${currentTime}.`;
        } catch (error) {
            return `Invalid timezone: ${timezone}. Please provide a valid timezone like Asia/Kolkata or America/New_York.`;
        }
    }
}