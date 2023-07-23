import React, { useEffect, useState } from 'react';
import './ResultsTable.css';
import { getContextInfoOpenAITest } from './HelperFunctions';
import ContextDialog from './ContextDialog';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import logo from './static/images/site_logo.png';  // adjust this import path as needed
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
  const [creatingPdf, setCreatingPdf] = React.useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  const { selectedIdea, setSelectedIdea } = React.useContext(SelectedIdeaContext);

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

    // Sanitize the title and create the filename for the PDF
    const sanitizedTitle = sanitizeTitle(title);
    const filename = `${sanitizedTitle}.pdf`;

    const docDefinition = {
      pageSize: 'A4',
      content: [
        // Title Page
        {
          text: title,
          style: 'header',
          alignment: 'center'
        },
        // Line break
        '\n',
        // Products
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
          margin: [20, 20, 20, 20]  // [left, top, right, bottom]
        })),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],  // [left, top, right, bottom]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]  // [left, top, right, bottom]
        }
      },
      header: function (currentPage, pageCount) {
        return [
          {
            image: logoBase64,
            width: 50, // Adjust as necessary
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
                    product['Consumer Pain Point'].length > 0 && product['Effort'].length > 0 && product['Time'].length > 0
                      ? <ContextDialog content={product} title={product['product']}></ContextDialog>
                      : loading[index]
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

    </div >
  );
}

export default ResultsTable;
