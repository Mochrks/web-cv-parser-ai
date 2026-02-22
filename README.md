<h1 align="center" style="font-family: 'Poppins', sans-serif; font-size: 2.5em; font-weight: bold;">CV Parser: PDF to JSON with AI</h1>

<p align="center">
  <img src="https://skillicons.dev/icons?i=next,react,typescript,openai" alt="Tech Stack Icons" />
</p>

### Project Overview

This project is a web application built with Next.js that allows users to upload CV files in PDF format, parse them, and convert the content into structured JSON using OpenAI's language model. It streamlines the process of extracting relevant information from CVs for easier data management and analysist.

### Tech Stack & Dependencies
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)
![PDF-parser](https://img.shields.io/badge/PDF-parser-red?style=flat-square)

### Setup & Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/Mochrks/cv-parser-ai.git
    cd cv-parser-ai
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Configure Environment Variables**
    Create a `.env` file in the root directory and add:
    ```
    OPENAI_API_KEY=your_openai_api_key
    ```

4. **Run the development server**
    ```bash
    npm run dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Features

- PDF Upload: Users can upload CV files in PDF format.
- PDF Parsing: Extracts text content from uploaded PDF files.
- AI-Powered Conversion: Utilizes OpenAI's model to convert parsed text into structured JSON.


### How It Works

1. **File Upload**: User uploads a CV in PDF format.
2. **PDF Parsing**: The application uses PDF.js to extract text content from the PDF.
3. **AI Processing**: The extracted text is sent to OpenAI's model with a custom prompt to structure the data.
4. **JSON Generation**: The AI model returns a structured JSON representation of the CV data.


### API Routes

- `POST api/process-pdf`: Handles PDF file upload and parsing.
- `POST api/generate-json`: Sends parsed text to OpenAI for conversion to JSON.

### Library
- **Pdf-parser**
- **Lucide-react icon**
- **TailwindCSS**


# Explain API
## PDF Parser API Endpoint api/process-pdf

A simple API endpoint to convert PDF files to text using Next.js.

## How It Works

1. **Receive Request**
   - Endpoint only accepts POST method
   - Receives PDF file in base64 format

2. **Main Process**
   - Converts base64 to buffer
   - Extracts text from PDF using pdf-parse
   - Returns result in JSON format

## Code Explanation

```typescript
// Required imports
import type { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check for POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get file content from request body
        const { fileContent } = req.body;
        
        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(fileContent.split(',')[1], 'base64');
        
        // Parse PDF to text
        const pdfData = await pdfParse(pdfBuffer);
        const text = pdfData.text;
        
        // Send success response
        return res.status(200).json({ text });
    } catch (error) {
        // Handle error
        console.error('Error processing PDF:', error);
        return res.status(500).json({ error: 'Failed to process PDF' });
    }
}

```

# CV Text to JSON Converter API Endpoint api/generate-json

A Next.js API endpoint that converts CV/Resume text into structured JSON format using OpenAI's GPT model.

## How It Works

1. **Receive Request**
   - Endpoint only accepts POST method
   - Receives CV text in request body

2. **Main Process**
   - Sends text to OpenAI API with specific CV structure instructions
   - Processes response and converts to structured JSON
   - Returns JSON result using format by props

## Code Explanation

```typescript
// Required imports
import type { NextApiRequest, NextApiResponse } from 'next';
import { CV_STRUCTURE_INSTRUCTIONS } from '@/utils/cvStructure';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check for POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get CV text from request body
        const { text } = req.body;

        // Make request to OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: CV_STRUCTURE_INSTRUCTIONS
                    },
                    {
                        role: "user",
                        content: `Convert the following CV/Resume text into JSON:\n\n${text}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            }),
        });

        if (!response.ok) {
            throw new Error('OpenAI API request failed');
        }

        // Process and return JSON response
        const data = await response.json();
        return res.status(200).json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        // Handle error
        console.error('Error generating JSON:', error);
        return res.status(500).json({ error: 'Failed to generate JSON' });
    }
}
```

### References

#### OpenAI API
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/batch)
- [OpenAI Usage Limits & Models](https://platform.openai.com/settings/proj_faNnMWIcZmaJA2BGogaqwArx/limits)
- [OpenAI API Keys](https://platform.openai.com/api-keys)

#### Articles
- [Next.js 15 Data Fetching Example with OpenAI Keyword Extractor Project](https://medium.com/@pether.maciejewski/next-js-15-data-fetching-example-with-openai-keyword-extractor-project-fa67e7be1a6c)

## Connect with me:
[![GitHub](https://img.shields.io/badge/GitHub-333?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mochrks)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@Gdvisuel)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/mochrks)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/mochrks)
[![Behance](https://img.shields.io/badge/Behance-1769FF?style=for-the-badge&logo=behance&logoColor=white)](https://behance.net/mochrks)
[![Dribbble](https://img.shields.io/badge/Dribbble-EA4C89?style=for-the-badge&logo=dribbble&logoColor=white)](https://dribbble.com/mochrks)
---
