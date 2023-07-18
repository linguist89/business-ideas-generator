import { openai } from './OpenAI.js';

export async function getBusinessIdeas(inputString) {
    const response = await fetch(`https://business-ideas.anvil.app/_/api/business_ideas`, {
        method: 'POST',
        body: inputString
    });
    const responseJson = response.json();
    return responseJson;
};

export async function getContextInfo(product) {
    let productDict = {
        'Product': product[0],
        'Description': product[1],
        'Potential Clients ': product[2],
        'Where to find clients': product[3]
    }
    const response = await fetch(`https://business-ideas.anvil.app/_/api/business_ideas_context`, {
        method: 'POST',
        body: JSON.stringify(productDict)
    });
    const responseJson = response.json();
    return responseJson;
}

export async function getBusinessIdeasOpenAITest(focus, trends, cv) {
    let question = "I'm looking to start a business and I need product or service ideas based on my cover letter. I have  provided a focus (that which I want as my main purpose in the business), trends (the current business landscape where I live) and cover letter (the skills and competencies that I bring to the table). Give me product ideas, potential clients and where to find these clients based on these factors."
    let output_instructions = 'The output should in the following format Python list of tuples [("product", "description", "potential clients", "where to find the clients"), ...]. Do not number the items. NOTHING ELSE'
    let full_prompt = `${question}\nFocus: ${focus} and I need 10 similar ideas. Also\nType: ${trends}\nCover Letter: ${cv}\n${output_instructions}`

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a knowledgeable assistant." },
            { role: "user", content: full_prompt }
        ],
    });
    return completion;
}

