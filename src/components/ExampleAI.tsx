"use client";
import React, { useState } from "react";

interface TextInputProps {
  // eslint-disable-next-line no-unused-vars
  extractKeywords: (text: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ extractKeywords }) => {
  // console.log('API Key:', process.env.TEST)
  const [text, setText] = useState("");

  const submitText = () => {
    console.log("submission is working");
    extractKeywords(text);
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-72 mt-4 p-4 border-2 border-gray-300 rounded-lg text-slate-300 focus:outline-none bg-transparent"
      />
      <button
        onClick={submitText}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-800 rounded-lg font-bold"
      >
        Send
      </button>
    </div>
  );
};

const TextOutput = ({ keywords }: { keywords: string[] }) => {
  const text = keywords;

  return (
    <div className="flex flex-col gap-4 bg-blue-900 p-4 rounded-lg">
      <div className="rounded-lg">
        <h1 className="text-slate-200 text-xl font-bold mb-4">Response:</h1>
        <div>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
};

export default function ExampleAI() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const extractKeywords = async (text: string) => {
    "use server";
    console.log(text);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "How to explain in text:\n\n" + text,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", options);

    if (!response.ok) {
      console.error("Error:", response.statusText);
      setLoading(false);
      return;
    }

    const json = await response.json();
    const data = json.choices[0].message.content;

    console.log(data);
    setKeywords(data);
    setLoading(false);
  };

  return (
    <div className="w-full ">
      <h1 className="text-4xl font-bold text-center pt-20">Example AI </h1>
      <div className="mt-24 p-10 max-w-6xl mx-auto ">
        <div className="w-full ">
          <h1 className="text-4xl font-bold">AI Explain</h1>

          <div className="flex w-full items-start space-x-12">
            <div className="w-[320px] md:w-[1450px]">
              <TextInput extractKeywords={extractKeywords} />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-20  max-auto  items-start space-x-12">
        {loading ? (
          <>Loading</>
        ) : (
          <div className="mt-4">
            <TextOutput keywords={keywords} />
          </div>
        )}
      </div>
    </div>
  );
}
