import React, { useEffect, useState } from 'react';
import './ResultsTable.css';
import { getContextInfoOpenAITest, getStartingInfoOpenAITest } from './HelperFunctions';
import ContextDialog from './ContextDialog';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from './static/images/site_logo.png';
import { SelectedIdeaContext } from './BodyComponent';
import { UserContext } from './App';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './Firebase.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function sanitizeTitle(title) {
  const sanitizedTitle = title.replace(/[^a-zA-Z]/g, '_'); // Replace non-alphabetic characters with underscores
  return sanitizedTitle.slice(0, 50); // Take the first 20 characters
}

function ResultsTable({ products, title }) {
  const { user } = React.useContext(UserContext);
  const [ideaContexts, setIdeaContexts] = React.useState([]);
  const [loading, setLoading] = React.useState({});
  const [startLoading, setStartLoading] = React.useState({});
  const [creatingPdf, setCreatingPdf] = React.useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  const { selectedIdea } = React.useContext(SelectedIdeaContext);
  const [selectedAccordionIndex, setSelectedAccordionIndex] = useState(null);

  useEffect(() => {
    fetch(logo)
      .then(response => response.blob())
      .then(blob => {
        var reader = new FileReader();
        reader.onload = function () {
          setLogoBase64(this.result);
        }
        reader.readAsDataURL(blob);
      });
  }, []);

  async function handleStartButtonClick(product, index, retryCount = 0) {
    if (ideaContexts[index] && ideaContexts[index]['Creating the product']) {
      alert(JSON.stringify(ideaContexts[index]));
    } else {
      setStartLoading(prevStartLoading => ({ ...prevStartLoading, [index]: true }));
      try {
        const results = await getStartingInfoOpenAITest(product);
        console.log("Results");
        console.log(results);

        setIdeaContexts(prevTasks => {
          const newTasks = [...prevTasks];
          newTasks[index] = { ...newTasks[index], ...results };
          return newTasks;
        });

        const ideaDoc = doc(db, 'users', user.uid, 'ideas', selectedIdea);
        await updateDoc(ideaDoc, {
          ideas: products.map((p, i) => i === index ? { ...p, ...results } : p)
        });
      } catch (error) {
        console.error(error);
        if (retryCount < 5) {
          console.log(`Retrying... (${retryCount + 1})`);
          handleStartButtonClick(product, index, retryCount + 1);
        }
      } finally {
        setStartLoading(prevStartLoading => ({ ...prevStartLoading, [index]: false }));
      }
    }
  }

  async function handleButtonClick(product, index, retryCount = 0) {
    if (ideaContexts[index]) {
      alert(JSON.stringify(ideaContexts[index]));
    } else {
      setLoading(prevLoading => ({ ...prevLoading, [index]: true }));
      try {
        const results = await getContextInfoOpenAITest(product);
        console.log("Results");
        console.log(results);
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

        const ideaDoc = doc(db, 'users', user.uid, 'ideas', selectedIdea);
        await updateDoc(ideaDoc, {
          ideas: products.map((p, i) => i === index ? { ...p, ...parsedResults } : p)
        });
      } catch (error) {
        console.error(error);
        if (retryCount < 5) {
          console.log(`Retrying... (${retryCount + 1})`);
          handleButtonClick(product, index, retryCount + 1);
        }
      } finally {
        setLoading(prevLoading => ({ ...prevLoading, [index]: false }));
      }
    }
  }

  async function createAndDownloadPdf(title) {
    setCreatingPdf(true);

    const sanitizedTitle = sanitizeTitle(title);
    const filename = `${sanitizedTitle}.pdf`;

    const docDefinition = {
      pageSize: 'A4',
      content: [
        {
          text: title,
          style: 'header',
          alignment: 'center'
        },
        '\n',
        ...products.map((product, index) => ({
          stack: [
            { text: `Product:\n ${product.product}`, style: 'subheader' },
            { text: `Description:\n ${product.description}\n\n` },
            { text: `Potential Clients:\n ${product.potentialClients}\n\n` },
            { text: `Where to find the clients:\n ${product.whereToFindClients}\n\n` },
            { text: `Consumer Pain Point:\n ${product['Consumer Pain Point'].map(obj => obj.point).join('\n')}\n\n` },
            { text: `Effort:\n ${product['Effort'].map(obj => obj.point).join('\n')}\n\n` },
            { text: `Time:\n ${product['Time'].map(obj => Object.values(obj)[0]).join('\n')}\n\n` },
          ],
          margin: [20, 20, 20, 20]
        })),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      },
      header: function (currentPage, pageCount) {
        return [
          {
            image: logoBase64,
            width: 50,
            alignment: 'left',
            margin: [10, 10, 0, 0]
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            margin: [0, 30, 10, 0]
          }
        ];
      },
    };

    await pdfMake.createPdf(docDefinition).download(filename);
    setCreatingPdf(false);
  }

  return (
    <div className="ResultsTable">
      <button className="solid-card-button" onClick={() => createAndDownloadPdf(title)}>
        {creatingPdf ? 'Creating PDF...' : 'Download PDF'}
      </button>
      <table id="table-section">
        <thead>
          <tr>
            <th>Product</th>
            <th>Description</th>
            <th>Potential Clients</th>
            <th>Where to find the clients</th>
            <th>More Info</th>
          </tr>
        </thead>
        <tbody>
          {
            products.map((product, index) => (
              <>
                <tr key={index}>
                  <td>{product['product']}</td>
                  <td>{product['description']}</td>
                  <td>{product['potentialClients']}</td>
                  <td>{product['whereToFindClients']}</td>
                  <td>
                    <button onClick={() => setSelectedAccordionIndex(selectedAccordionIndex === index ? null : index)} className="solid-card-button">
                      {selectedAccordionIndex === index ? "Less info" : "More info"}
                    </button>
                  </td>
                </tr>
                {selectedAccordionIndex === index && (
                  <tr>
                    <td colSpan="5">
                      <div className="MoreInfoWrapper">
                        <div>
                          {
                            product['Creating the product'].length > 0 && product['Finding customers'].length > 0 && product['Selling product'].length > 0
                              ? <button className="solid-card-button" onClick={() => {
                                alert(`${product['Creating the product']}\n\n${product['Finding customers']}\n\n${product['Selling product']}`)
                              }}>How to start</button>
                              : startLoading[index]
                                ? <span>Loading...</span>
                                : <button
                                  onClick={() => handleStartButtonClick(product, index)}
                                  className="solid-card-button"
                                >Find out how to start</button>
                          }

                        </div>
                        <div>
                          {
                            product['Consumer Pain Point'].length > 0 && product['Effort'].length > 0 && product['Time'].length > 0
                              ? <ContextDialog content={product} title={product['product']}></ContextDialog>
                              : loading[index]
                                ? <span>Loading...</span>
                                : ideaContexts[index]
                                  ? <ContextDialog content={ideaContexts[index]} title={product['product']}></ContextDialog>
                                  : <button
                                    onClick={() => handleButtonClick(product, index)}
                                    className="solid-card-button"
                                  >Get Offering Optimization</button>
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
