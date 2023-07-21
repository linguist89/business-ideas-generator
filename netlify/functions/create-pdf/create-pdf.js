import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import MyDocument from '../../src/MyDocument';

export async function handler(event, context) {
  try {
    const buffer = await renderToBuffer(<MyDocument />);
    return {
      isBase64Encoded: true,
      statusCode: 200,
      headers: {
        'Content-type': 'application/pdf'
      },
      body: buffer.toString('base64')
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: 'An error occurred while generating the PDF'
    };
  }
}
