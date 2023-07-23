import './BodyComponent.css';
import './index.css';
import CustomTextarea from './CustomTextarea';
import React from 'react';
import { getBusinessIdeasOpenAITest } from './HelperFunctions';
import LandingImage from './static/images/lighbulb_shadow.png';
import ResultsTable from './ResultsTable';
import Spinner from './Spinner';
import './Buttons.css';
import { UserContext } from './App';
import LoginDialog from './LoginDialog';
import { db } from './Firebase.js';
import { doc, setDoc, collection, query, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import exampleIdeas from './exampleIdeas.json';

export const SelectedIdeaContext = React.createContext();

function BodyComponent() {
  const { user } = React.useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [focus, setFocus] = React.useState();
  const [trends, setTrends] = React.useState();
  const [cv, setCv] = React.useState();
  const [ideaResults, setIdeaResults] = React.useState([]);
  const [ideasLoading, setIdeasLoading] = React.useState(false);
  const [previousIdeas, setPreviousIdeas] = React.useState([]);
  const [selectedIdea, setSelectedIdea] = React.useState(null);

  /* Save to Firebase the token usage details */
  async function saveTokensToFirebase(tokens) {
    try {
      const tokensCollectionRef = collection(db, 'your_collection_name');
      const newTokenDoc = await addDoc(tokensCollectionRef, tokens);
      console.log("Documents successfully written!", newTokenDoc.id);
    } catch (error) {
      console.error("Error writing documents: ", error);
    }
  }

  // Function to update Firebase Firestore with used tokens
  async function updateFirebaseWithTokens(completion) {
    const completion_data = {
      'model': completion.data.model,
      'usage': completion.data.usage,
      'timestamp': new Date()
    };
    await saveTokensToFirebase(completion_data);
  }

  React.useEffect(() => {
    if (user && previousIdeas.length > 0) {
      const latestIdea = previousIdeas[0];
      loadIdea(latestIdea);
    }
  }, [user, previousIdeas]);

  React.useEffect(() => {
    if (!user) { // check if the user is logged out
      setIdeaResults([]);
      setPreviousIdeas([]);
      setFocus(null);
      setTrends(null);
      setCv(null);
    } else {
      const fetchIdeas = async () => {
        const userIdeasRef = collection(db, 'users', user.uid, 'ideas');
        const q = query(userIdeasRef);
        const querySnapshot = await getDocs(q);
        let allIdeas = [];
        querySnapshot.forEach((doc) => {
          allIdeas.push({ id: doc.id, data: doc.data() });
        });
        setPreviousIdeas(allIdeas);
      }
      fetchIdeas();
    }
  }, [user]);

  React.useEffect(() => {
    const fetchIdeas = async () => {
      if (user) {
        const userIdeasRef = collection(db, 'users', user.uid, 'ideas');
        const q = query(userIdeasRef);
        const querySnapshot = await getDocs(q);
        let allIdeas = [];
        querySnapshot.forEach((doc) => {
          allIdeas.push({ id: doc.id, data: doc.data() });
        });
        setPreviousIdeas(allIdeas);
      }
    }
    fetchIdeas();
  }, [user]);

  function loadIdea(ideaData) {
    setFocus(ideaData.data.focus);
    setIdeaResults(ideaData.data.ideas);
    setTrends(ideaData.data.trends);
    setCv(ideaData.data.cv);
    setSelectedIdea(ideaData.id);
  }

  async function deleteIdeaFromFirebase(ideaId) {
    const ideaRef = doc(db, 'users', user.uid, 'ideas', ideaId);
    await deleteDoc(ideaRef);
  }

  const scrollToIdeasGenerator = () => {
    const element = document.getElementById('ideas-generator');
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: rect.top - 70,
      behavior: 'smooth'
    });
  };

  async function saveIdeasToFirebase(searchData) {
    try {
      const userIdeasRef = collection(db, 'users', user.uid, 'ideas');
      const newIdeaDoc = doc(userIdeasRef);
      await setDoc(newIdeaDoc, searchData);
      console.log("Documents successfully written!");
      return newIdeaDoc.id;
    } catch (error) {
      console.error("Error writing documents: ", error);
    }
  }


  async function businessIdeasOpenAITest() {
    if (!user) {
      setShowLoginDialog(true);
    } else {
      setIdeasLoading(true);
      setIdeaResults([]);
      const results = await getBusinessIdeasOpenAITest(focus, trends, cv);
      // Save tokens to Firebase
      updateFirebaseWithTokens(results);

      let response = results.data.choices[0].message.content;
      let parsedResponse = JSON.parse(response);
      console.log(parsedResponse);
      // Adding the new fields to each object in the parsedResponse array
      parsedResponse = parsedResponse.map(item => ({
        ...item,
        'Consumer Pain Point': [],
        'Effort': [],
        'Time': [],
        'Creating the product': [],
        'Finding customers': [],
        'Selling product': []
      }));

      setIdeaResults(parsedResponse);
      const newIdeaID = await saveIdeasToFirebase({ focus, trends, cv, ideas: parsedResponse });
      setIdeasLoading(false);
      setSelectedIdea(newIdeaID);
      setPreviousIdeas(prevIdeas => [{ id: newIdeaID, data: { focus, trends, cv, ideas: parsedResponse } }, ...prevIdeas]);
    }
  }


  return (
    <>
      <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      <div className="body-component">
        <div className="left-section">
          <h1 className="title">Business Ideas</h1>
          <h2 className="subtitle">Generating the ideas, so you can build them without wasting time</h2>
          <div className="button-group">
            <button className="solid-button" onClick={scrollToIdeasGenerator}>Let's get ideas</button>
          </div>
        </div>
        <div className="right-section">
          <img src={LandingImage} alt="Custom" className="custom-image" />
        </div>
      </div>
      <>
        <div id="ideas-generator">
          <div className="previous-items-section">
            <h1 className="previous-items-title">
              {user ? 'Previously generated ideas' : 'Check out some examples below'}
            </h1>
            {user && previousIdeas && previousIdeas.length > 0 ?
              previousIdeas.map((idea, index) => (
                <div key={index} className="idea-item">
                  <button className={`button-link ${idea.id === selectedIdea ? 'selected-idea' : ''}`}
                    onClick={() => loadIdea(idea)}>
                    {idea.data.focus}
                  </button>
                  <button className="delete-button" onClick={() => { deleteIdeaFromFirebase(idea.id); setPreviousIdeas(previousIdeas.filter(i => i.id !== idea.id)) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#f70000" className="bi bi-trash-fill" viewBox="0 0 16 16" width="1rem" height="1rem">
                      <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z" />
                      <path fillRule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-.95-.68A1.993 1.993 0 0 0 8 1H6a1.993 1.993 0 0 0-.05.32A1 1 0 0 0 5 .32V1H2.5zm3 4a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zM4.118 4L4.5 3.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.382-.5zm2 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5zm3 .5a.5.5 0 0 1-.5-.5h-.5a.5.5 0 0 1 0 1h.5a.5.5 0 0 1 .5-.5z" />
                    </svg>
                  </button>
                </div>
              )) :
              user ? <p>You have no previously saved ideas</p> :
                exampleIdeas.map((exampleIdea, index) => (
                  <button className={`button-link`} key={index} onClick={() => loadIdea({ data: exampleIdea })}>
                    {exampleIdea.focus}
                  </button>
                ))
            }
          </div>
          <div className="generate-section">
            <h1 className="previous-items-title">Generate new ideas</h1>
            <CustomTextarea
              instructions="What do you want to do?"
              placeholder="What do you want to do?"
              infoSetter={setFocus}
              value={focus || "I want to make and sell eco-friendly candles"}
            ></CustomTextarea>
            <CustomTextarea
              instructions="What type of people are you hoping to sell to?"
              placeholder="What type of people are you hoping to sell to?"
              infoSetter={setTrends}
              value={trends || "Where I live people have high literacy, knowledge of the internet and high earning potential."}
            ></CustomTextarea>
            <CustomTextarea
              instructions="What are the 3 or 4 skills you want to focus on?"
              placeholder="What are the 3 or 4 skills you want to focus on?"
              infoSetter={setCv}
              value={cv || "DIY skills, Video Editing Skills and Danish language skills"}
            ></CustomTextarea>
            <div className="BodyComponentButtonDiv">
              <button
                className="solid-card-button"
                onClick={businessIdeasOpenAITest}
                disabled={ideasLoading}
              >
                {ideasLoading ? 'Generating...' : 'Generate Business Ideas'}
              </button>
            </div>
          </div>
        </div>
        <div className="table-section">
          {
            ideaResults.length > 0 ?
              <SelectedIdeaContext.Provider value={{ selectedIdea, setSelectedIdea }}>
                <ResultsTable products={ideaResults} title={focus} />
              </SelectedIdeaContext.Provider> :
              ideasLoading && <Spinner></Spinner>
          }
        </div>
      </>
    </>
  );
}

export default BodyComponent;
