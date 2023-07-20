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
    let question = "I'm looking to start a business and I need product or service ideas based on my cover letter. I have provided a focus (that which I want as my main purpose in the business), trends (the current business landscape where I live) and cover letter (the skills and competencies that I bring to the table). Give me product ideas, potential clients and where to find these clients based on these factors."
    let output_instructions = 'Give me 10 items and the output should be in the following JSON format: [{"product": "product name", "description": "product description", "potentialClients": "potential clients", "whereToFindClients": "where to find clients"}, ...]. Do not number the items. NOTHING ELSE'
    let full_prompt = `${question}\nFocus: ${focus}\nType: ${trends}\nCover Letter: ${cv}\n${output_instructions}`

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You are a knowledgeable assistant." },
            { role: "user", content: full_prompt }
        ],
        temperature: 1
    });
    return completion;
}


export async function getContextInfoOpenAITest(businessIdea) {
    let questions = {
        "Consumer Pain Point": "What are 10 consumer pain points in relation to this idea?",
        "Effort": "What are 10 things that can be done to minimize the consumers effort in getting the solution?",
        "Time": "What are 10 things that can be done to minimize the consumers time in getting the solution?"
    };

    let businessIdeaString = Object.entries(businessIdea).map(([key, value]) => `${key}: ${value}`).join('\n');
    let output_instructions = 'Give me 10 items and the output should be in the following JSON format: [{"point": "description"}, ...]. Do not number the items. NOTHING ELSE'
    let tempResultsDict = {};

    for (let [title, question] of Object.entries(questions)) {
        let content = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are a knowledgeable assistant." },
                { "role": "user", "content": `${question}\n${businessIdeaString}\n${output_instructions}` }
            ],
            temperature: 1
        });

        // Check if 'content' and 'content.choices' exist and it's not empty, then only access the 'message.content'.
        if (content) {
            tempResultsDict[title] = content.data.choices[0].message.content;
        } else {
            console.log('Error: No content or choices available.');
        }
    }

    return tempResultsDict;
}



