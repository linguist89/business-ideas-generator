import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.REACT_APP_Open_AI_api_key,
});

export const openai = new OpenAIApi(configuration);
