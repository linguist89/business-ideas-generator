import React from 'react';
import { Page, Text, Document } from '@react-pdf/renderer';

const MyDocument = () => (
    <Document>
        <Page size="A4">
            <Text>Hello World!</Text>
        </Page>
    </Document>
);

export default MyDocument;
