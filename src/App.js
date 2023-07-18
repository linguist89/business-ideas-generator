import './App.css';
import './index.css';
import CustomTextarea from './CustomTextarea';
import React from 'react';
import { getBusinessIdeas } from './HelperFunctions';
import ResultsTable from './ResultsTable';
import Header from './Header';
import Spinner from './Spinner';
import { db } from './Firebase.js';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import './Buttons.css';

export const UserContext = React.createContext(null);

function App() {
  const [user, setUser] = React.useState(null);
  const [entrepreneurType, setEntrepreneurType] = React.useState();
  const [focus, setFocus] = React.useState();
  const [trends, setTrends] = React.useState();
  const [cv, setCv] = React.useState();
  const [businessIdeasTaskId, setBusinessIdeasTaskId] = React.useState();
  const [backgroundTasks, setBackgroundTasks] = React.useState({});
  const [ideaResults, setIdeaResults] = React.useState([]);
  const [ideasLoading, setIdeasLoading] = React.useState(false);

  React.useEffect(() => {
    if (backgroundTasks[businessIdeasTaskId]) {
      console.log(`backgroundTasks Status: ${backgroundTasks[businessIdeasTaskId]['status']}`);
      try {
        let resultsString = backgroundTasks[businessIdeasTaskId]['content'];
        console.log(`resultsString type: ${typeof resultsString}`);
        console.log(`resultsString: ${resultsString}`);
        resultsString = resultsString.replace(/\(/g, "[").replace(/\)/g, "]").replace(/'/g, "\"");
        let results = JSON.parse(resultsString);
        setIdeaResults(results);
        setIdeasLoading(false);
      } catch (error) {
        console.error('Error parsing the resultsString: ', error);
        businessIdeas();
      }
    }
  // eslint-disable-next-line
  }, [backgroundTasks, businessIdeasTaskId]);

  React.useEffect(() => {
    let unsubscribe;
    if (businessIdeasTaskId && typeof businessIdeasTaskId === 'string') {
      const documentRef = doc(collection(db, 'tasks'), businessIdeasTaskId);

      unsubscribe = onSnapshot(documentRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setBackgroundTasks(prevTasks => ({
            ...prevTasks,
            [businessIdeasTaskId]: docSnapshot.data()
          }));
        }
      }, err => {
        console.log(err);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [businessIdeasTaskId]);

  async function businessIdeas() {
    setIdeasLoading(true);
    setIdeaResults([]);
    const string_output = `${focus} SPLIT${trends} SPLIT${cv}`
    const task = await getBusinessIdeas(string_output);
    if (task['status'] === "OK") {
      setBusinessIdeasTaskId(task['content'][0]);
    } else {
      alert("There has been an error");
    }

  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Header></Header>
      <div className="App">
        <CustomTextarea
          instructions="What is your idea?"
          placeholder="What is your idea?"
          infoSetter={setFocus}
          defaultValue="I want to create an app that helps people learn Python"
        ></CustomTextarea>
        <CustomTextarea
          instructions="What type of people are you hoping to sell to?"
          placeholder="What type of people are you hoping to sell to?"
          infoSetter={setTrends}
          defaultValue="Where I live people have high literacy, knowledge of the internet and high earning potential."
        ></CustomTextarea>
        <CustomTextarea
          instructions="What are the 3 or 4 skills you want to focsu on?"
          placeholder="What are the 3 or 4 skills you want to focsu on?"
          infoSetter={setCv}
          defaultValue="Python, React, Video Editing Skills and Danish language skills"
        ></CustomTextarea>
      </div>
      <div className="AppButtonDiv">
        <button
          className="solid-card-button"
          onClick={businessIdeas}
          size="xl"
        >Generate Business Ideas</button>
      </div>
      {
        ideaResults.length > 0 ?
          <ResultsTable products={ideaResults}></ResultsTable> :
          ideasLoading && <Spinner></Spinner>
      }
    </UserContext.Provider>
  );
}

export default App;
