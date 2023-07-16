import './App.css';
import './index.css';
import CustomTextarea from './CustomTextarea';
import React from 'react';
import { getBusinessIdeas } from './HelperFunctions';
import ResultsTable from './ResultsTable';
import Header from './Header';
import Spinner from './Spinner';
import { Button } from 'flowbite-react';
import { db } from './Firebase.js';
import { collection, doc, onSnapshot } from 'firebase/firestore';

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
    const string_output = `${entrepreneurType} SPLIT${focus} SPLIT${trends} SPLIT${cv}`
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
          instructions="What type of entrepreneur?"
          placeholder="What type of entrepreneur?"
          infoSetter={setEntrepreneurType}
          defaultValue="Technopreneur"
        ></CustomTextarea>
        <CustomTextarea
          instructions="What is your focus?"
          placeholder="What is your focus?"
          infoSetter={setFocus}
          defaultValue="I want to create an App that helps people learn languages based on their personality."
        ></CustomTextarea>
        <CustomTextarea
          instructions="What are the trends of your region?"
          placeholder="What are the trends of your region? (Could be What type of people are you hoping to sell to?)"
          infoSetter={setTrends}
          defaultValue="Where I live people have high literacy, knowledge of the internet and high earning potential."
        ></CustomTextarea>
        <CustomTextarea
          instructions="Enter your CV"
          placeholder="Enter your CV"
          infoSetter={setCv}
          defaultValue="Python, ReactJS and Video editing skills."
        ></CustomTextarea>
      </div>
      <div className="AppButtonDiv">
        <Button
          onClick={businessIdeas}
          size="xl"
        >Generate Business Ideas</Button>
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
