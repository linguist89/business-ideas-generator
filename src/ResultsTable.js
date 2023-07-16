import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import './ResultsTable.css';
import { Button, Spinner } from 'flowbite-react';
import { getContextInfo } from './HelperFunctions';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import ContextModal from './ContextModal';

// Initialize Firebase outside of component
if (!firebase.apps.length) {
    firebase.initializeApp({
      "apiKey": process.env.REACT_APP_apiKey,
      "authDomain": process.env.REACT_APP_authDomain,
      "projectId": process.env.REACT_APP_projectId,
      "storageBucket": process.env.REACT_APP_storageBucket,
      "messagingSenderId2": process.env.REACT_APP_messagingSenderId2,
      "appId": process.env.REACT_APP_appId,
      "measurementId": process.env.REACT_APP_measurementId
    });
  } else {
    firebase.app(); // if already initialized, use that one
    }
  
  const db = firebase.firestore();

function ResultsTable({ products }) {
    const [backgroundTasks, setBackgroundTasks] = React.useState({});
    const [productsTaskId, setProductsTaskId] = React.useState([]);
    const [loading, setLoading] = React.useState({});

    React.useEffect(() => {
        let unsubscribe;
        //console.log(`ResultsTable useEffect starting ...`);
        //console.log(`ResultsTable useEffect productTaskId: ${JSON.stringify(productsTaskId['taskId'])}`);
        //console.log(`ResultsTable useEffect productTaskId type: ${typeof productsTaskId['taskId']}`);
        //console.log(productsTaskId['taskId']);
        console.log(loading);
        if (productsTaskId && productsTaskId.length > 0) {
          let currentTask = productsTaskId[0];
          unsubscribe = db.collection('context').doc(currentTask['taskId'])
            .onSnapshot((doc) => {
              if (doc.exists) {
                alert(JSON.stringify(doc.data()));
                console.log(doc.data());
                setBackgroundTasks(prevTasks => ({
                  ...prevTasks,
                  [currentTask['index']]: doc.data()['content']
                }));
                setLoading(prevLoading => ({...prevLoading, [currentTask['index']]: false}));

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
        setLoading(prevLoading => ({...prevLoading, [index]: true}));
        let taskId = await getContextInfo(product);
        // Add the new task to productsTaskId
        setProductsTaskId(prevTasks => [...prevTasks, {taskId: taskId['content'][0], index: index}]);
      }   

      return (
        <div className="ResultsTable">
            <Table>
                <Thead>
                    <Tr>
                        <Th>Product</Th>
                        <Th>Description</Th>
                        <Th>Potential Clients</Th>
                        <Th>Where to find the clients</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        products.map((product, index) => (
                            <Tr key={index}>
                                <Td>{product[0]}</Td>
                                <Td>{product[1]}</Td>
                                <Td>{product[2]}</Td>
                                <Td>{product[3]}</Td>
                                <Td>
                                  {
                                      loading[index] 
                                      ? <Spinner animation="border" /> 
                                      : backgroundTasks[index]
                                          ? <ContextModal content={backgroundTasks[index]} title={product[0]}></ContextModal>
                                          : <Button
                                              onClick={async () => backgroundTasks[index] ? contextButtonShow(index) : contextButtonGet(product, index)}
                                              size="sm"
                                            >Get</Button>
                                          
                                  }
                                </Td>
                            </Tr>
                        ))
                    }
                </Tbody>
            </Table>
        </div>
    );
}

export default ResultsTable;
