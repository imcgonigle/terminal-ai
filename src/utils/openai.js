import OpenAI from "openai";

import { config } from "../../config.js";

// Single shared OpenAI client used by every feature.
// Prefers environment variables over config.js so deployment credentials
// don't require code changes.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID || config.OPENAI_ORG_ID,
});

export default openai;
