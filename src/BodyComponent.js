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
import { doc, setDoc, collection, query, getDocs } from 'firebase/firestore';

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

  const loadIdea = (ideaData) => {
    setFocus(ideaData.data.focus);
    setIdeaResults(ideaData.data.ideas);
    setTrends(ideaData.data.trends);
    setCv(ideaData.data.cv);
    setSelectedIdea(ideaData.id);
    scrollToTableSection();
  }


  const scrollToIdeasGenerator = () => {
    const element = document.getElementById('ideas-generator');
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: rect.top - 70,
      behavior: 'smooth'
    });
  };

  const scrollToTableSection = () => {
    const element = document.getElementById('table-section');
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
      let response = results.data.choices[0].message.content;
      let parsedResponse = JSON.parse(response);
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
          <div className="generate-section">
            <CustomTextarea
              instructions="What is your idea?"
              placeholder="What is your idea?"
              infoSetter={setFocus}
              defaultValue="I want to make and sell eco-friendly candles"
            ></CustomTextarea>
            <CustomTextarea
              instructions="What type of people are you hoping to sell to?"
              placeholder="What type of people are you hoping to sell to?"
              infoSetter={setTrends}
              defaultValue="Where I live people have high literacy, knowledge of the internet and high earning potential."
            ></CustomTextarea>
            <CustomTextarea
              instructions="What are the 3 or 4 skills you want to focus on?"
              placeholder="What are the 3 or 4 skills you want to focus on?"
              infoSetter={setCv}
              defaultValue="DIY skills, Video Editing Skills and Danish language skills"
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
          <div className="previous-items-section">
            <h1 className="previous-items-title">Previously generated ideas</h1>
            {previousIdeas && previousIdeas.length > 0 ?
              previousIdeas.map((idea, index) => (
                <button className={`button-link ${idea.id === selectedIdea ? 'selected-idea' : ''}`}
                  key={index}
                  onClick={() => loadIdea(idea)}>
                  {idea.data.focus}
                </button>
              )) :
              <p>You have no previously saved ideas</p>
            }
          </div>
        </div>
        <div className="table-section">
          {
            ideaResults.length > 0 ?
              <ResultsTable products={ideaResults} title={focus}></ResultsTable> :
              ideasLoading && <Spinner></Spinner>
          }
        </div>
      </>
    </>
  );
}

export default BodyComponent;
