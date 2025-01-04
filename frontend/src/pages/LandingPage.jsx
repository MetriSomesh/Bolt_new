import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import axios from "axios";
// import { http://localhost:5000 } from "../config";
export function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      // const res = await axios.post(`${http://localhost:5000}/template`, {
      //   prompt: prompt.trim(),
      // });
      navigate("/workspace", { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-blue-400" />
            <span className="text-white font-semibold">Website Builder</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Build your website using AI
            </h1>
            <p className="text-gray-400 text-lg">
              Just describe what you want, and we'll generate it for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your website... (e.g., Create a modern portfolio website with a dark theme)"
                className="w-full h-32 bg-gray-800 text-white placeholder-gray-500 rounded-lg border border-gray-700 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                type="submit"
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Generate
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Press Generate or hit{" "}
              <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 text-xs">
                Enter
              </kbd>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
