import OpenAI from "openai";

import { config } from "../../config.js";

// Create a single shared OpenAI client used by all features.
// API key and org ID are read from environment variables first, falling back to
// the values in config.js so both deployment and local development are supported.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID || config.OPENAI_ORG_ID,
});

export default openai;
