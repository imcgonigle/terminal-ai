import OpenAI from "openai";

import config from "../../config.json" with {type: "json"};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID || config.OPENAI_ORG_ID,
});

export default openai;
