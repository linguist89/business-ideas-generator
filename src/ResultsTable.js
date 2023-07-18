import React from 'react';
import './ResultsTable.css';
import { getContextInfo } from './HelperFunctions';
import { collection, doc, onSnapshot } from "firebase/firestore";
import ContextDialog from './ContextDialog';
import { db } from './Firebase.js';

function ResultsTable({ products }) {
  const [backgroundTasks, setBackgroundTasks] = React.useState({});
  const [productsTaskId, setProductsTaskId] = React.useState([]);
  const [loading, setLoading] = React.useState({});

  React.useEffect(() => {
    let unsubscribe;
    console.log(loading);
    if (productsTaskId && productsTaskId.length > 0) {
      let currentTask = productsTaskId[0];
      unsubscribe = onSnapshot(doc(collection(db, 'context'), currentTask['taskId']),
        (doc) => {
          if (doc.exists()) {
            alert(JSON.stringify(doc.data()));
            console.log(doc.data());
            setBackgroundTasks(prevTasks => ({
              ...prevTasks,
              [currentTask['index']]: doc.data()['content']
            }));
            setLoading(prevLoading => ({ ...prevLoading, [currentTask['index']]: false }));

            // Remove current task from productsTaskId after fetching the data
            setProductsTaskId(prevTasks => prevTasks.filter(task => task['taskId'] !== currentTask['taskId']));
          }
        }, err => {
          console.log(err);
        });
    }

    return () => unsubscribe && unsubscribe();
    // eslint-disable-next-line
  }, [productsTaskId]);


  function contextButtonShow(index) {
    alert(JSON.stringify(backgroundTasks[index]));
  }

  async function contextButtonGet(product, index) {
    setLoading(prevLoading => ({ ...prevLoading, [index]: true }));
    let taskId = await getContextInfo(product);
    // Add the new task to productsTaskId
    setProductsTaskId(prevTasks => [...prevTasks, { taskId: taskId['content'][0], index: index }]);
  }

  return (
    <div className="ResultsTable">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Description</th>
            <th>Potential Clients</th>
            <th>Where to find the clients</th>
            <th>Get more info</th>
          </tr>
        </thead>
        <tbody>
          {
            products.map((product, index) => (
              <tr key={index}>
                <td>{product['title']}</td>
                <td>{product['description']}</td>
                <td>{product['audience']}</td>
                <td>{product['marketing']}</td>
                <td>
                  {
                    loading[index]
                      ? <span>Loading...</span>
                      : backgroundTasks[index]
                        ? <ContextDialog content={backgroundTasks[index]} title={product['title']}></ContextDialog>
                        : <button
                          onClick={async () => backgroundTasks[index] ? contextButtonShow(index) : contextButtonGet(product, index)}
                          className="solid-card-button"
                        >Get</button>

                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
