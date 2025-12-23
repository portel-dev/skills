---
name: pdf
description: Comprehensive PDF manipulation toolkit for creating, merging, splitting, and analyzing PDF documents using JavaScript. Use when you need to programmatically process, generate, or analyze PDF documents.
license: Apache 2.0
---

# PDF Processing with JavaScript

## Overview

This skill provides comprehensive PDF processing capabilities using `pdf-lib`, the most powerful JavaScript library for PDF manipulation. All operations work entirely in JavaScript/TypeScript with no external dependencies.

## Quick Start

```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Create a simple PDF
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([600, 400]);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

page.drawText('Hello PDF World!', {
  x: 50,
  y: 350,
  size: 30,
  font: font,
  color: rgb(0, 0, 0),
});

const pdfBytes = await pdfDoc.save();
// pdfBytes can be written to file or returned
```

## Core Operations

### Creating PDFs

#### Basic Document
```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function createBasicPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText('My Document', {
    x: 50,
    y: 792,
    size: 24,
    font: font,
    color: rgb(0, 0, 0)
  });
  
  return await pdfDoc.save();
}
```

#### Multi-Page Document
```javascript
async function createMultiPagePDF() {
  const pdfDoc = await PDFDocument.create();
  
  // Page 1
  const page1 = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page1.drawText('Page 1', { x: 50, y: 750, size: 24, font });
  
  // Page 2
  const page2 = pdfDoc.addPage([595, 842]);
  page2.drawText('Page 2', { x: 50, y: 750, size: 24, font });
  
  return await pdfDoc.save();
}
```

#### With Custom Formatting
```javascript
async function createFormattedPDF() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const { width, height } = page.getSize();
  
  // Title
  page.drawText('Document Title', {
    x: 50,
    y: height - 50,
    size: 30,
    font: helveticaFont,
    color: rgb(0, 0.53, 0.71), // Blue
  });
  
  // Subtitle
  page.drawText('A subtitle in different font', {
    x: 50,
    y: height - 100,
    size: 18,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5), // Gray
  });
  
  // Body text
  const bodyText = 'This is body text in Courier font.';
  page.drawText(bodyText, {
    x: 50,
    y: height - 150,
    size: 12,
    font: courierFont,
    color: rgb(0, 0, 0),
  });
  
  return await pdfDoc.save();
}
```

### Merging PDFs

```javascript
async function mergePDFs(pdf1Bytes, pdf2Bytes, pdf3Bytes) {
  // Load existing PDFs
  const pdf1 = await PDFDocument.load(pdf1Bytes);
  const pdf2 = await PDFDocument.load(pdf2Bytes);
  const pdf3 = await PDFDocument.load(pdf3Bytes);
  
  // Create new document
  const mergedPdf = await PDFDocument.create();
  
  // Copy all pages from first PDF
  const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
  pages1.forEach((page) => mergedPdf.addPage(page));
  
  // Copy all pages from second PDF
  const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
  pages2.forEach((page) => mergedPdf.addPage(page));
  
  // Copy all pages from third PDF
  const pages3 = await mergedPdf.copyPages(pdf3, pdf3.getPageIndices());
  pages3.forEach((page) => mergedPdf.addPage(page));
  
  return await mergedPdf.save();
}
```

### Splitting PDFs

```javascript
async function splitPDF(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();
  const splitPDFs = [];
  
  for (let i = 0; i < pageCount; i++) {
    // Create new PDF for this page
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    
    const bytes = await newPdf.save();
    splitPDFs.push({
      pageNumber: i + 1,
      bytes: bytes
    });
  }
  
  return splitPDFs;
}
```

### Extracting Pages

```javascript
async function extractPages(pdfBytes, pageIndices) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();
  
  // Copy specified pages
  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  
  return await newPdf.save();
}

// Example: Extract pages 0, 2, and 4
const extractedPdf = await extractPages(originalPdf, [0, 2, 4]);
```

### Rotating Pages

```javascript
async function rotatePDF(pdfBytes, degrees) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  pages.forEach((page) => {
    page.setRotation({ angle: degrees });
  });
  
  return await pdfDoc.save();
}

// Rotate all pages 90 degrees clockwise
const rotated = await rotatePDF(originalPdf, 90);
```

### Modifying PDFs

#### Adding Text to Existing PDF
```javascript
async function addTextToPDF(pdfBytes, text, x, y) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  firstPage.drawText(text, {
    x: x,
    y: y,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  return await pdfDoc.save();
}
```

#### Adding Page Numbers
```javascript
async function addPageNumbers(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: width / 2 - 30,
      y: 30,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
  });
  
  return await pdfDoc.save();
}
```

### Embedding Images

```javascript
async function embedImage(pdfBytes, imageBytes, imageType) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  
  // Embed image (supports PNG and JPEG)
  let image;
  if (imageType === 'png') {
    image = await pdfDoc.embedPng(imageBytes);
  } else if (imageType === 'jpg' || imageType === 'jpeg') {
    image = await pdfDoc.embedJpg(imageBytes);
  }
  
  const { width, height } = page.getSize();
  const imgDims = image.scale(0.5);
  
  page.drawImage(image, {
    x: width / 2 - imgDims.width / 2,
    y: height / 2 - imgDims.height / 2,
    width: imgDims.width,
    height: imgDims.height,
  });
  
  return await pdfDoc.save();
}
```

### Reading PDF Metadata

```javascript
async function readMetadata(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  return {
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
    pageCount: pdfDoc.getPageCount(),
  };
}
```

### Setting PDF Metadata

```javascript
async function setMetadata(pdfBytes, metadata) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  if (metadata.title) pdfDoc.setTitle(metadata.title);
  if (metadata.author) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject) pdfDoc.setSubject(metadata.subject);
  if (metadata.creator) pdfDoc.setCreator(metadata.creator);
  if (metadata.producer) pdfDoc.setProducer(metadata.producer);
  if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);
  
  return await pdfDoc.save();
}
```

## Advanced Features

### Creating Forms

```javascript
async function createForm() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Add text fields
  const form = pdfDoc.getForm();
  
  const nameField = form.createTextField('user.name');
  nameField.setText('');
  nameField.addToPage(page, {
    x: 100,
    y: 700,
    width: 200,
    height: 20,
  });
  
  const emailField = form.createTextField('user.email');
  emailField.setText('');
  emailField.addToPage(page, {
    x: 100,
    y: 650,
    width: 200,
    height: 20,
  });
  
  // Labels
  page.drawText('Name:', { x: 50, y: 705, size: 12, font });
  page.drawText('Email:', { x: 50, y: 655, size: 12, font });
  
  return await pdfDoc.save();
}
```

### Drawing Shapes

```javascript
async function drawShapes() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Rectangle
  page.drawRectangle({
    x: 50,
    y: height - 150,
    width: 200,
    height: 100,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
    color: rgb(0.8, 0.9, 1), // Light blue fill
  });
  
  // Circle (using drawCircle if available, or ellipse)
  page.drawEllipse({
    x: 400,
    y: height - 100,
    xScale: 50,
    yScale: 50,
    color: rgb(1, 0.5, 0.5), // Light red
    borderColor: rgb(1, 0, 0),
    borderWidth: 2,
  });
  
  // Line
  page.drawLine({
    start: { x: 50, y: height - 200 },
    end: { x: 550, y: height - 200 },
    thickness: 3,
    color: rgb(0, 0, 0),
  });
  
  return await pdfDoc.save();
}
```

## Best Practices

### Memory Management
```javascript
// For large PDFs, process in chunks
async function processLargePDF(pdfBytes) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();
  const chunkSize = 10;
  
  for (let i = 0; i < pageCount; i += chunkSize) {
    const endIndex = Math.min(i + chunkSize, pageCount);
    const indices = Array.from({ length: endIndex - i }, (_, k) => i + k);
    
    // Process chunk
    const chunkPdf = await PDFDocument.create();
    const pages = await chunkPdf.copyPages(pdfDoc, indices);
    pages.forEach((page) => chunkPdf.addPage(page));
    
    // Do something with this chunk
    const chunkBytes = await chunkPdf.save();
    // Process or save chunkBytes
  }
}
```

### Error Handling
```javascript
async function safePDFOperation(pdfBytes) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // Operations...
    return {
      success: true,
      pdf: await pdfDoc.save()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
}
```

### Validation
```javascript
async function validatePDF(bytes) {
  try {
    const pdfDoc = await PDFDocument.load(bytes);
    const pageCount = pdfDoc.getPageCount();
    
    if (pageCount === 0) {
      return { valid: false, reason: 'PDF has no pages' };
    }
    
    return {
      valid: true,
      pageCount: pageCount,
      size: bytes.length
    };
  } catch (error) {
    return {
      valid: false,
      reason: 'Invalid PDF format',
      error: error.message
    };
  }
}
```

## Common Patterns

### Invoice Generator
```javascript
async function generateInvoice(invoiceData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = 792;
  
  // Header
  page.drawText('INVOICE', {
    x: 50,
    y: y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0.5)
  });
  
  y -= 40;
  
  // Invoice details
  page.drawText(`Invoice #: ${invoiceData.number}`, { x: 50, y, size: 12, font });
  y -= 20;
  page.drawText(`Date: ${invoiceData.date}`, { x: 50, y, size: 12, font });
  y -= 40;
  
  // Items header
  page.drawText('Description', { x: 50, y, size: 12, font: boldFont });
  page.drawText('Amount', { x: 450, y, size: 12, font: boldFont });
  y -= 25;
  
  // Items
  invoiceData.items.forEach(item => {
    page.drawText(item.description, { x: 50, y, size: 10, font });
    page.drawText(`$${item.amount.toFixed(2)}`, { x: 450, y, size: 10, font });
    y -= 20;
  });
  
  y -= 20;
  
  // Total
  const total = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  page.drawText('Total:', { x: 400, y, size: 12, font: boldFont });
  page.drawText(`$${total.toFixed(2)}`, { x: 450, y, size: 12, font: boldFont });
  
  return await pdfDoc.save();
}
```

## Package Installation

```bash
npm install pdf-lib
```

Or import directly in code mode - NCP will auto-install.

## See Also

- For DOCX: Use the `docx` skill
- For XLSX: Use the `xlsx` skill
- For PPTX: Use the `pptx` skill

## License

Apache 2.0
