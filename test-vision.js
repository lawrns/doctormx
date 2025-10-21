#!/usr/bin/env node
/**
 * Test Vision Analysis
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testVision() {
  try {
    console.log('🔧 Testing OpenAI Vision API...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical assistant. Analyze the provided image and describe what you see."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this medical image."
            },
            {
              type: "image_url",
              image_url: {
                url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    console.log('✅ Vision API test successful!');
    console.log('Response:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Vision API test failed:', error.message);
  }
}

testVision();
