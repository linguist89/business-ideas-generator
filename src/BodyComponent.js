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

function BodyComponent() {
  const { user } = React.useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [focus, setFocus] = React.useState();
  const [trends, setTrends] = React.useState();
  const [cv, setCv] = React.useState();
  const [ideaResults, setIdeaResults] = React.useState([]);
  const [ideasLoading, setIdeasLoading] = React.useState(false);

  const scrollToIdeasGenerator = () => {
    const element = document.getElementById('ideas-generator');
    const rect = element.getBoundingClientRect();
    window.scrollTo({
      top: rect.top - 70,
      behavior: 'smooth'
    });
  };

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
      setIdeasLoading(false);
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
          {
            ideaResults.length > 0 ?
              <ResultsTable products={ideaResults}></ResultsTable> :
              ideasLoading && <Spinner></Spinner>
          }
        </div>
      </>
    </>
  );
}

export default BodyComponent;
