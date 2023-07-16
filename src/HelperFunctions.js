export async function getBusinessIdeas(inputString) {
    const response = await fetch(`https://business-ideas.anvil.app/_/api/business_ideas`, {
        method: 'POST',
        body: inputString
    });
    const responseJson = response.json();
    return responseJson;
};

export async function getContextInfo(product){
    let productDict = {'Product': product[0], 
                       'Description':  product[1], 
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