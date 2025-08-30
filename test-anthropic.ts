import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('API Key preview:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');

// Now test Anthropic
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testAnthropic() {
  try {
    console.log('\n🧪 Testing Anthropic connection...');
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: "You are a helpful cooking assistant.",
      messages: [
        {
          role: "user",
          content: "Just say 'Hello from Claude!' - this is a connection test."
        }
      ],
      max_tokens: 50,
    });

    console.log('✅ Success! Response:');
    console.log('Response type:', response.content[0].type);
    if (response.content[0].type === 'text') {
      console.log('Text content:', response.content[0].text);
    }
    
  } catch (error: any) {
    console.error('❌ Anthropic test failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.status) {
      console.error('Status code:', error.status);
    }
    if (error.error) {
      console.error('Error details:', error.error);
    }
  }
}

testAnthropic().then(() => {
  console.log('\n✨ Test completed');
}).catch((err) => {
  console.error('Test failed:', err);
});
