import React from 'react';
import './ResultsTable.css';
import { getContextInfoOpenAITest } from './HelperFunctions';
import ContextDialog from './ContextDialog';

function ResultsTable({ products }) {
  const [ideaContexts, setIdeaContexts] = React.useState([]);
  const [loading, setLoading] = React.useState({});

  async function handleButtonClick(product, index) {
    if (ideaContexts[index]) {
      alert(JSON.stringify(ideaContexts[index]));
    } else {
      setLoading(prevLoading => ({ ...prevLoading, [index]: true }));
      try {
        const results = await getContextInfoOpenAITest(product);
        console.log("Results");
        console.log(results);
        // Parsing the JSON string results into JavaScript objects
        const parsedResults = {
          "Consumer Pain Point": JSON.parse(results["Consumer Pain Point"]),
          "Effort": JSON.parse(results["Effort"]),
          "Time": JSON.parse(results["Time"])
        };
        setIdeaContexts(prevTasks => {
          const newTasks = [...prevTasks];
          newTasks[index] = parsedResults;
          return newTasks;
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(prevLoading => ({ ...prevLoading, [index]: false }));
      }
    }
  }

  async function downloadPdf(products) {
    const response = await fetch('/.netlify/functions/create-pdf', {
      method: 'POST',
      body: JSON.stringify(products),
      headers: { 'Content-Type': 'application/json' },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-document.pdf`;
    link.click();
  }

  return (
    <div className="ResultsTable">
      <button className="solid-card-button" onClick={() => downloadPdf(products)}>Download Pdf</button>
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
                <td>{product['product']}</td>
                <td>{product['description']}</td>
                <td>{product['potentialClients']}</td>
                <td>{product['whereToFindClients']}</td>
                <td>
                  {
                    loading[index]
                      ? <span>Loading...</span>
                      : ideaContexts[index]
                        ? <ContextDialog content={ideaContexts[index]} title={product['product']}></ContextDialog>
                        : <button
                          onClick={() => handleButtonClick(product, index)}
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
