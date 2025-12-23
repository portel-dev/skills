---
name: docx
description: Comprehensive Word document creation with the docx JavaScript library. Create professional documents with formatting, tables, images, headers, footers, and more. Use when you need to programmatically generate or create .docx files.
license: Apache 2.0
---

# DOCX Document Creation with JavaScript

## Overview

This skill provides comprehensive Word document creation using the `docx` JavaScript library. Create professional documents with full formatting support, tables, images, headers, footers, and more - all in pure JavaScript/TypeScript.

## Quick Start

```javascript
const { Document, Paragraph, TextRun, Packer } = require('docx');

// Create a simple document
const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new TextRun('Hello World!')
        ]
      })
    ]
  }]
});

// Generate buffer
const buffer = await Packer.toBuffer(doc);
// buffer can be written to file or returned
```

## Core Concepts

### Document Structure

```javascript
const { Document, Paragraph, TextRun } = require('docx');

const doc = new Document({
  sections: [
    {
      properties: {},  // Section properties (margins, page size, etc.)
      headers: {},     // Header definitions
      footers: {},     // Footer definitions
      children: []     // Content (Paragraphs, Tables, etc.)
    }
  ]
});
```

### Text Formatting

```javascript
const { Paragraph, TextRun, AlignmentType, UnderlineType } = require('docx');

// Basic formatting
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 200 },
  children: [
    new TextRun({ text: 'Bold text', bold: true }),
    new TextRun({ text: 'Italic text', italics: true }),
    new TextRun({ 
      text: 'Underlined', 
      underline: { type: UnderlineType.SINGLE, color: 'FF0000' }
    }),
    new TextRun({ 
      text: 'Colored text', 
      color: 'FF0000', 
      size: 28,  // 14pt (size in half-points)
      font: 'Arial'
    }),
    new TextRun({ text: 'Highlighted', highlight: 'yellow' }),
    new TextRun({ text: 'Strikethrough', strike: true }),
    new TextRun({ text: 'Superscript', superScript: true }),
    new TextRun({ text: 'Subscript', subScript: true })
  ]
})
```

## Creating Documents

### Professional Document with Styles

```javascript
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Arial', size: 24 }  // 12pt default
      }
    },
    paragraphStyles: [
      {
        id: 'Title',
        name: 'Title',
        basedOn: 'Normal',
        run: { size: 56, bold: true, color: '000000' },
        paragraph: { 
          spacing: { before: 240, after: 120 }, 
          alignment: AlignmentType.CENTER 
        }
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        run: { size: 32, bold: true, color: '000000' },
        paragraph: { 
          spacing: { before: 240, after: 240 },
          outlineLevel: 0
        }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        run: { size: 28, bold: true, color: '000000' },
        paragraph: { 
          spacing: { before: 180, after: 180 },
          outlineLevel: 1
        }
      }
    ]
  },
  sections: [{
    children: [
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun('Document Title')]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun('Section 1')]
      }),
      new Paragraph({
        children: [new TextRun('Body text goes here.')]
      })
    ]
  }]
});
```

### Lists (Bulleted and Numbered)

```javascript
const { Paragraph, TextRun, AlignmentType } = require('docx');

const doc = new Document({
  sections: [{
    children: [
      // Bulleted list
      new Paragraph({
        text: 'First item',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: 'Second item',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: 'Nested item',
        bullet: { level: 1 }
      }),
      
      // Numbered list
      new Paragraph({
        text: 'Step 1',
        numbering: { reference: 'my-numbering', level: 0 }
      }),
      new Paragraph({
        text: 'Step 2',
        numbering: { reference: 'my-numbering', level: 0 }
      })
    ]
  }],
  numbering: {
    config: [{
      reference: 'my-numbering',
      levels: [{
        level: 0,
        format: 'decimal',
        text: '%1.',
        alignment: AlignmentType.LEFT
      }]
    }]
  }
});
```

### Tables

```javascript
const { Table, TableRow, TableCell, Paragraph, WidthType, BorderStyle } = require('docx');

new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Name', bold: true })],
          shading: { fill: 'CCCCCC' }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Age', bold: true })],
          shading: { fill: 'CCCCCC' }
        }),
        new TableCell({
          children: [new Paragraph({ text: 'City', bold: true })],
          shading: { fill: 'CCCCCC' }
        })
      ]
    }),
    // Data rows
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('John Doe')] }),
        new TableCell({ children: [new Paragraph('30')] }),
        new TableCell({ children: [new Paragraph('New York')] })
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Jane Smith')] }),
        new TableCell({ children: [new Paragraph('25')] }),
        new TableCell({ children: [new Paragraph('Los Angeles')] })
      ]
    })
  ]
})
```

### Headers and Footers

```javascript
const { Document, Header, Footer, Paragraph, TextRun, AlignmentType } = require('docx');

const doc = new Document({
  sections: [{
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Company Name - Confidential',
                color: '666666',
                size: 20
              })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun('Page '),
              new TextRun({
                children: ['PAGE_NUMBER']
              }),
              new TextRun(' of '),
              new TextRun({
                children: ['TOTAL_PAGES']
              })
            ]
          })
        ]
      })
    },
    children: [
      new Paragraph({ text: 'Document content...' })
    ]
  }]
});
```

### Images

```javascript
const { Document, Paragraph, ImageRun, Media } = require('docx');
const fs = require('fs');

// Read image file
const imageBuffer = fs.readFileSync('./image.png');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: 400,
              height: 300
            }
          })
        ]
      })
    ]
  }]
});
```

### Page Breaks

```javascript
const { Paragraph, PageBreak } = require('docx');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ text: 'Content on page 1' }),
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ text: 'Content on page 2' })
    ]
  }]
});
```

## Advanced Features

### Table of Contents

```javascript
const { Document, Paragraph, TableOfContents, HeadingLevel } = require('docx');

const doc = new Document({
  sections: [{
    children: [
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-5'
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun('Chapter 1')]
      }),
      new Paragraph({ text: 'Content...' }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun('Section 1.1')]
      })
    ]
  }]
});
```

### Hyperlinks

```javascript
const { Document, Paragraph, ExternalHyperlink, TextRun } = require('docx');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new TextRun('Visit '),
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: 'our website',
                style: 'Hyperlink'
              })
            ],
            link: 'https://example.com'
          })
        ]
      })
    ]
  }]
});
```

### Footnotes

```javascript
const { Document, Paragraph, TextRun, Footnote, FootnoteReferenceRun } = require('docx');

const footnote = new Footnote({
  children: [
    new Paragraph({
      children: [new TextRun('This is a footnote.')]
    })
  ]
});

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        children: [
          new TextRun('Some text'),
          new FootnoteReferenceRun(footnote),
          new TextRun(' more text.')
        ]
      })
    ]
  }]
});
```

## Common Patterns

### Business Letter

```javascript
const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx');

async function createBusinessLetter(letterData) {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,    // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        // Company header
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: letterData.companyName,
              bold: true,
              size: 24
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun(letterData.companyAddress)]
        }),
        
        // Spacing
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        
        // Date
        new Paragraph({
          children: [new TextRun(letterData.date)]
        }),
        
        new Paragraph({ text: '' }),
        
        // Recipient
        new Paragraph({
          children: [new TextRun(letterData.recipientName)]
        }),
        new Paragraph({
          children: [new TextRun(letterData.recipientAddress)]
        }),
        
        new Paragraph({ text: '' }),
        
        // Salutation
        new Paragraph({
          children: [new TextRun(`Dear ${letterData.recipientName},`)]
        }),
        
        new Paragraph({ text: '' }),
        
        // Body
        ...letterData.paragraphs.map(text => 
          new Paragraph({
            children: [new TextRun(text)],
            spacing: { after: 200 }
          })
        ),
        
        new Paragraph({ text: '' }),
        
        // Closing
        new Paragraph({
          children: [new TextRun('Sincerely,')]
        }),
        
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '' }),
        
        new Paragraph({
          children: [new TextRun(letterData.senderName)]
        }),
        new Paragraph({
          children: [new TextRun(letterData.senderTitle)]
        })
      ]
    }]
  });
  
  return await Packer.toBuffer(doc);
}
```

### Invoice

```javascript
const { Document, Paragraph, Table, TableRow, TableCell, TextRun, 
        AlignmentType, WidthType, BorderStyle } = require('docx');

async function createInvoice(invoiceData) {
  const doc = new Document({
    sections: [{
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'INVOICE',
              bold: true,
              size: 48
            })
          ],
          spacing: { after: 400 }
        }),
        
        // Invoice details
        new Paragraph({
          children: [new TextRun(`Invoice #: ${invoiceData.number}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Date: ${invoiceData.date}`)]
        }),
        new Paragraph({
          children: [new TextRun(`Due Date: ${invoiceData.dueDate}`)],
          spacing: { after: 400 }
        }),
        
        // Items table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Description', bold: true })],
                  shading: { fill: 'CCCCCC' }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'Quantity', bold: true })],
                  shading: { fill: 'CCCCCC' }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'Price', bold: true })],
                  shading: { fill: 'CCCCCC' }
                }),
                new TableCell({
                  children: [new Paragraph({ text: 'Total', bold: true })],
                  shading: { fill: 'CCCCCC' }
                })
              ]
            }),
            // Items
            ...invoiceData.items.map(item =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(item.description)] }),
                  new TableCell({ children: [new Paragraph(item.quantity.toString())] }),
                  new TableCell({ children: [new Paragraph(`$${item.price.toFixed(2)}`)] }),
                  new TableCell({ children: [new Paragraph(`$${(item.quantity * item.price).toFixed(2)}`)] })
                ]
              })
            ),
            // Total
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('')], columnSpan: 3 }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Total: $${invoiceData.total.toFixed(2)}`,
                          bold: true
                        })
                      ]
                    })
                  ],
                  shading: { fill: 'EEEEEE' }
                })
              ]
            })
          ]
        })
      ]
    }]
  });
  
  return await Packer.toBuffer(doc);
}
```

### Report with Charts

```javascript
const { Document, Paragraph, Table, TableRow, TableCell, HeadingLevel } = require('docx');

async function createReport(reportData) {
  const doc = new Document({
    sections: [{
      children: [
        // Title page
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [new TextRun(reportData.title)]
        }),
        new Paragraph({
          children: [new TextRun(`Date: ${reportData.date}`)],
          spacing: { after: 400 }
        }),
        
        // Executive Summary
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun('Executive Summary')]
        }),
        new Paragraph({
          children: [new TextRun(reportData.summary)],
          spacing: { after: 400 }
        }),
        
        // Data table
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun('Key Metrics')]
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] })
              ]
            }),
            ...Object.entries(reportData.metrics).map(([key, value]) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(key)] }),
                  new TableCell({ children: [new Paragraph(value.toString())] })
                ]
              })
            )
          ]
        })
      ]
    }]
  });
  
  return await Packer.toBuffer(doc);
}
```

## Best Practices

### Error Handling

```javascript
async function safeCreateDocument(data) {
  try {
    const doc = new Document({
      sections: [{ children: [/* content */] }]
    });
    
    const buffer = await Packer.toBuffer(doc);
    
    return {
      success: true,
      buffer: buffer,
      size: buffer.length
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
function validateDocumentData(data) {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Document must have a title');
  }
  
  if (!data.sections || data.sections.length === 0) {
    throw new Error('Document must have at least one section');
  }
  
  return true;
}
```

## Package Installation

```bash
npm install docx
```

Or use directly in code mode - NCP will use pre-installed package via `require('docx')`.

## See Also

- For PDF: Use the `pdf` skill
- For XLSX: Use the `xlsx` skill
- For PPTX: Use the `pptx` skill

## License

Apache 2.0
