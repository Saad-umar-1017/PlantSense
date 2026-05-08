const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Convert image to base64
const imageToBase64 = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { base64, mimeType };
};

// Identify plant species from image
const identifyPlant = async (imagePath) => {
  const { base64, mimeType } = imageToBase64(imagePath);

  const prompt = `You are an expert botanist. Analyze this plant image and provide exactly 3 possible species identifications.

For EACH prediction, respond in this EXACT JSON format (no markdown, no extra text, ONLY the JSON array):
[
  {
    "commonName": "Common name of the plant",
    "scientificName": "Scientific binomial name",
    "confidence": 92,
    "description": "Brief 1-2 sentence botanical description",
    "habitat": "Native habitat and typical growing regions",
    "growthCharacteristics": "Typical size, growth rate, leaf shape, flowering pattern",
    "generalCare": {
      "watering": "Watering frequency and amount guidance",
      "sunlight": "Light requirements (full sun, partial shade, etc.)",
      "soil": "Preferred soil type and pH",
      "temperature": "Ideal temperature range"
    }
  }
]

Rules:
- Return exactly 3 predictions sorted by confidence (highest first)
- Confidence values should be realistic percentages (0-100)
- The top prediction should have the highest confidence
- If you cannot identify the plant clearly, still provide best guesses with lower confidence scores
- ONLY return the JSON array, no other text`;

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Clean response — remove markdown fences if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const predictions = JSON.parse(cleaned);
    return predictions;
  } catch (error) {
    console.error('Groq Plant Identification Error:', error.message);
    throw new Error('Failed to identify plant. Please try again.');
  }
};

// Diagnose plant health from image
const diagnosePlantHealth = async (imagePath, speciesInfo = '') => {
  const { base64, mimeType } = imageToBase64(imagePath);

  const speciesContext = speciesInfo 
    ? `The plant is identified as: ${speciesInfo}. ` 
    : '';

  const prompt = `You are an expert plant pathologist. ${speciesContext}Analyze this plant image for any health issues including diseases, nutrient deficiencies, pest infestations, or environmental stress.

Respond in this EXACT JSON format (no markdown, no extra text, ONLY the JSON object):
{
  "overallHealth": "Healthy" or "Mild Issues" or "Moderate Issues" or "Severe Issues",
  "summary": "A 2-3 sentence overall assessment of the plant's health",
  "conditions": [
    {
      "name": "Name of the condition/disease/deficiency",
      "severity": "Mild" or "Moderate" or "Severe",
      "confidence": 85,
      "description": "Detailed explanation of the condition and its typical symptoms",
      "remedy": "Specific actionable steps to treat or address this condition"
    }
  ]
}

Rules:
- If the plant appears healthy, return overallHealth as "Healthy" with an empty conditions array
- If issues are found, list ALL detected conditions
- Confidence values should be realistic percentages (0-100)
- Remedies should be practical and specific
- Include at least severity, description, and remedy for each condition
- ONLY return the JSON object, no other text`;

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const diagnosis = JSON.parse(cleaned);
    return diagnosis;
  } catch (error) {
    console.error('Groq Health Diagnosis Error:', error.message);
    throw new Error('Failed to diagnose plant health. Please try again.');
  }
};

module.exports = { identifyPlant, diagnosePlantHealth };
