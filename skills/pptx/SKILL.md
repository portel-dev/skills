---
name: pptx
description: Comprehensive PowerPoint presentation creation with pptxgenjs. Create professional presentations with slides, text, images, charts, tables, and shapes. Use when you need to programmatically generate .pptx files.
license: Apache 2.0
---

# PPTX Presentation Creation with JavaScript

## Overview

This skill provides comprehensive PowerPoint presentation creation using `pptxgenjs`. Create professional presentations with slides, text boxes, images, charts, tables, shapes, and more - all in pure JavaScript/TypeScript.

## Quick Start

```javascript
const pptxgen = require('pptxgenjs');

// Create presentation
const pres = new pptxgen();

// Add a slide
const slide = pres.addSlide();

// Add text
slide.addText('Hello World!', {
  x: 1,
  y: 1,
  fontSize: 24,
  color: '000000'
});

// Save
const buffer = await pres.write({ outputType: 'arraybuffer' });
// buffer can be written to file or returned
```

## Core Concepts

### Presentation Properties

```javascript
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();

// Set presentation properties
pres.author = 'John Doe';
pres.company = 'Acme Corp';
pres.subject = 'Sales Report';
pres.title = 'Q4 2024 Results';

// Set layout (default is 10x7.5 inches - standard 4:3)
pres.layout = 'LAYOUT_16x9';  // Widescreen
// or
pres.layout = 'LAYOUT_4x3';   // Standard
```

### Slide Layouts

```javascript
// Standard slide
const slide1 = pres.addSlide();

// Slide with master layout
const slide2 = pres.addSlide({ masterName: 'TITLE_SLIDE' });

// Slide with custom background
const slide3 = pres.addSlide({
  bkgd: 'F1F1F1'  // Light gray background
});

// Slide with background image
const slide4 = pres.addSlide({
  bkgd: { data: 'image/png;base64,...' }
});
```

## Text and Formatting

### Basic Text

```javascript
slide.addText('Simple text', {
  x: 1,      // inches from left
  y: 1,      // inches from top
  w: 5,      // width
  h: 1,      // height
  fontSize: 18,
  color: '000000',
  bold: true,
  italic: false,
  underline: false,
  align: 'center',
  valign: 'middle'
});
```

### Text Box with Multiple Styles

```javascript
slide.addText([
  { text: 'Bold text', options: { bold: true } },
  { text: ' normal text ' },
  { text: 'italic text', options: { italic: true, color: 'FF0000' } }
], {
  x: 1,
  y: 2,
  w: 6,
  h: 1,
  fontSize: 14
});
```

### Bullet Lists

```javascript
slide.addText([
  { text: 'First item', options: { bullet: true } },
  { text: 'Second item', options: { bullet: true } },
  { text: 'Sub-item', options: { bullet: { indent: 27 } } },
  { text: 'Third item', options: { bullet: true } }
], {
  x: 1,
  y: 2,
  w: 6,
  h: 3
});
```

### Numbered Lists

```javascript
slide.addText([
  { text: 'Step 1', options: { bullet: { type: 'number' } } },
  { text: 'Step 2', options: { bullet: { type: 'number' } } },
  { text: 'Step 3', options: { bullet: { type: 'number' } } }
], {
  x: 1,
  y: 2,
  w: 6,
  h: 3
});
```

## Shapes and Images

### Rectangles and Shapes

```javascript
// Rectangle
slide.addShape(pres.ShapeType.rect, {
  x: 1,
  y: 1,
  w: 3,
  h: 2,
  fill: { color: '0088CC' },
  line: { color: '000000', width: 2 }
});

// Circle
slide.addShape(pres.ShapeType.ellipse, {
  x: 5,
  y: 1,
  w: 2,
  h: 2,
  fill: { color: 'FF0000' }
});

// Triangle
slide.addShape(pres.ShapeType.triangle, {
  x: 1,
  y: 4,
  w: 2,
  h: 2,
  fill: { color: '00FF00' }
});
```

### Lines and Arrows

```javascript
// Line
slide.addShape(pres.ShapeType.line, {
  x: 1,
  y: 3,
  w: 5,
  h: 0,
  line: { color: '000000', width: 3 }
});

// Arrow
slide.addShape(pres.ShapeType.rightArrow, {
  x: 2,
  y: 4,
  w: 3,
  h: 1,
  fill: { color: 'FFAA00' }
});
```

### Images

```javascript
// From file path
slide.addImage({
  path: './image.png',
  x: 1,
  y: 1,
  w: 4,
  h: 3
});

// From base64 data
slide.addImage({
  data: 'image/png;base64,iVBORw0KGgoAAAANS...',
  x: 1,
  y: 1,
  w: 4,
  h: 3
});

// With sizing options
slide.addImage({
  path: './logo.png',
  x: 0.5,
  y: 0.5,
  w: 1.5,
  h: 1,
  sizing: {
    type: 'contain',  // or 'cover', 'crop'
    w: 1.5,
    h: 1
  }
});
```

## Tables

### Basic Table

```javascript
const rows = [
  ['Name', 'Age', 'City'],
  ['John Doe', '30', 'New York'],
  ['Jane Smith', '25', 'Los Angeles'],
  ['Bob Johnson', '35', 'Chicago']
];

slide.addTable(rows, {
  x: 1,
  y: 1,
  w: 8,
  h: 3,
  fontSize: 12,
  border: { pt: 1, color: '000000' },
  fill: { color: 'F7F7F7' },
  color: '000000'
});
```

### Styled Table

```javascript
const tableData = [
  [
    { text: 'Name', options: { bold: true, fill: '0088CC', color: 'FFFFFF' } },
    { text: 'Age', options: { bold: true, fill: '0088CC', color: 'FFFFFF' } },
    { text: 'City', options: { bold: true, fill: '0088CC', color: 'FFFFFF' } }
  ],
  ['John Doe', '30', 'New York'],
  ['Jane Smith', '25', 'Los Angeles']
];

slide.addTable(tableData, {
  x: 1,
  y: 2,
  w: 8,
  colW: [3, 1.5, 3.5],  // Column widths
  rowH: [0.5, 0.4, 0.4], // Row heights
  fontSize: 12,
  border: { pt: 1, color: 'CFCFCF' },
  align: 'center',
  valign: 'middle'
});
```

## Charts

### Bar Chart

```javascript
const chartData = [
  {
    name: 'Q1',
    labels: ['Product A', 'Product B', 'Product C'],
    values: [15000, 23000, 18000]
  },
  {
    name: 'Q2',
    labels: ['Product A', 'Product B', 'Product C'],
    values: [18000, 25000, 21000]
  }
];

slide.addChart(pres.ChartType.bar, chartData, {
  x: 1,
  y: 1,
  w: 8,
  h: 4,
  title: 'Quarterly Sales',
  showTitle: true,
  showLegend: true,
  legendPos: 'r',  // right
  barDir: 'col',   // column (vertical bars)
  chartColors: ['0088CC', 'FF6600', '00CC88']
});
```

### Line Chart

```javascript
const lineData = [
  {
    name: 'Revenue',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [50000, 55000, 52000, 61000, 67000, 70000]
  }
];

slide.addChart(pres.ChartType.line, lineData, {
  x: 1,
  y: 1,
  w: 8,
  h: 4,
  title: 'Monthly Revenue',
  showTitle: true,
  chartColors: ['0088CC']
});
```

### Pie Chart

```javascript
const pieData = [
  {
    name: 'Market Share',
    labels: ['Product A', 'Product B', 'Product C', 'Others'],
    values: [35, 28, 22, 15]
  }
];

slide.addChart(pres.ChartType.pie, pieData, {
  x: 1,
  y: 1,
  w: 6,
  h: 5,
  title: 'Market Share Distribution',
  showPercent: true,
  showLegend: true,
  legendPos: 'r',
  chartColors: ['0088CC', 'FF6600', '00CC88', 'CCCCCC']
});
```

## Common Patterns

### Title Slide

```javascript
function createTitleSlide(pres, title, subtitle, author) {
  const slide = pres.addSlide();
  
  // Background
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { color: '0088CC' }
  });
  
  // Title
  slide.addText(title, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });
  
  // Subtitle
  slide.addText(subtitle, {
    x: 0.5,
    y: 3.7,
    w: 9,
    h: 0.8,
    fontSize: 24,
    color: 'FFFFFF',
    align: 'center'
  });
  
  // Author
  slide.addText(author, {
    x: 0.5,
    y: 6.5,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: 'FFFFFF',
    align: 'center',
    italic: true
  });
  
  return slide;
}
```

### Content Slide with Bullets

```javascript
function createContentSlide(pres, title, bullets) {
  const slide = pres.addSlide();
  
  // Title
  slide.addText(title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 32,
    bold: true,
    color: '0088CC'
  });
  
  // Bullets
  const bulletText = bullets.map(text => ({
    text: text,
    options: { bullet: true }
  }));
  
  slide.addText(bulletText, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 5,
    fontSize: 18
  });
  
  return slide;
}
```

### Data Visualization Slide

```javascript
async function createDataSlide(pres, title, data) {
  const slide = pres.addSlide();
  
  // Title
  slide.addText(title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 28,
    bold: true
  });
  
  // Chart
  slide.addChart(pres.ChartType.bar, data, {
    x: 1,
    y: 1.5,
    w: 6,
    h: 4,
    showLegend: true,
    legendPos: 'b'
  });
  
  // Key insights (text box)
  slide.addText('Key Insights:', {
    x: 7.5,
    y: 1.5,
    w: 2,
    h: 0.4,
    fontSize: 14,
    bold: true
  });
  
  slide.addText([
    { text: '• Growth of 25%', options: { bullet: true } },
    { text: '• Product B leads', options: { bullet: true } },
    { text: '• Q2 strongest', options: { bullet: true } }
  ], {
    x: 7.5,
    y: 2,
    w: 2,
    h: 3,
    fontSize: 12
  });
  
  return slide;
}
```

### Image Gallery Slide

```javascript
function createImageGallerySlide(pres, title, images) {
  const slide = pres.addSlide();
  
  // Title
  slide.addText(title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 28,
    bold: true
  });
  
  // Grid of images (2x2)
  const cols = 2;
  const rows = Math.ceil(images.length / cols);
  const imgWidth = 4;
  const imgHeight = 2.5;
  const spacing = 0.5;
  
  images.forEach((imgPath, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    slide.addImage({
      path: imgPath,
      x: 0.5 + col * (imgWidth + spacing),
      y: 1.5 + row * (imgHeight + spacing),
      w: imgWidth,
      h: imgHeight
    });
  });
  
  return slide;
}
```

## Complete Presentation Example

```javascript
const pptxgen = require('pptxgenjs');

async function createSalesPresentation(data) {
  const pres = new pptxgen();
  
  // Set properties
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'Sales Team';
  pres.company = 'Acme Corp';
  pres.title = 'Q4 Sales Report';
  
  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: '0088CC' };
  titleSlide.addText('Q4 2024 Sales Report', {
    x: 1,
    y: 2.5,
    w: 8,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });
  titleSlide.addText('Prepared by Sales Team', {
    x: 1,
    y: 4.2,
    w: 8,
    h: 0.5,
    fontSize: 20,
    color: 'FFFFFF',
    align: 'center'
  });
  
  // Executive Summary
  const summarySlide = pres.addSlide();
  summarySlide.addText('Executive Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 32,
    bold: true,
    color: '0088CC'
  });
  summarySlide.addText([
    { text: 'Revenue exceeded targets by 15%', options: { bullet: true } },
    { text: 'New customers increased 40%', options: { bullet: true } },
    { text: 'Customer satisfaction at 95%', options: { bullet: true } },
    { text: 'Launched 3 new products successfully', options: { bullet: true } }
  ], {
    x: 1,
    y: 1.8,
    w: 8,
    h: 3,
    fontSize: 20
  });
  
  // Revenue Chart
  const revenueSlide = pres.addSlide();
  revenueSlide.addText('Quarterly Revenue', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 28,
    bold: true
  });
  revenueSlide.addChart(pres.ChartType.bar, [
    {
      name: '2024',
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      values: data.revenue
    }
  ], {
    x: 1,
    y: 1.5,
    w: 8,
    h: 4.5,
    showTitle: false,
    showLegend: true,
    chartColors: ['0088CC']
  });
  
  // Customer Growth
  const customerSlide = pres.addSlide();
  customerSlide.addText('Customer Growth', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.75,
    fontSize: 28,
    bold: true
  });
  
  // Table
  const tableData = [
    [
      { text: 'Month', options: { bold: true, fill: '0088CC', color: 'FFFFFF' } },
      { text: 'New', options: { bold: true, fill: '0088CC', color: 'FFFFFF' } },
      { text: 'Total', options: { bold: true, fill: '0088CC', color: 'FFFFFF' } }
    ],
    ...data.customers.map(row => [row.month, row.new.toString(), row.total.toString()])
  ];
  
  customerSlide.addTable(tableData, {
    x: 2,
    y: 1.8,
    w: 6,
    fontSize: 14,
    border: { pt: 1, color: 'CFCFCF' },
    align: 'center'
  });
  
  // Thank You Slide
  const endSlide = pres.addSlide();
  endSlide.background = { color: '0088CC' };
  endSlide.addText('Thank You', {
    x: 1,
    y: 2.5,
    w: 8,
    h: 1.5,
    fontSize: 48,
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });
  endSlide.addText('Questions?', {
    x: 1,
    y: 4,
    w: 8,
    h: 0.8,
    fontSize: 28,
    color: 'FFFFFF',
    align: 'center'
  });
  
  // Generate
  return await pres.write({ outputType: 'arraybuffer' });
}
```

## Best Practices

### Error Handling

```javascript
async function safeCreatePresentation(data) {
  try {
    const pres = new pptxgen();
    
    // Add content...
    
    const buffer = await pres.write({ outputType: 'arraybuffer' });
    
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
function validatePresentationData(data) {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Presentation must have a title');
  }
  
  if (!data.slides || data.slides.length === 0) {
    throw new Error('Presentation must have at least one slide');
  }
  
  return true;
}
```

### Consistent Styling

```javascript
const theme = {
  colors: {
    primary: '0088CC',
    secondary: 'FF6600',
    text: '333333',
    background: 'FFFFFF'
  },
  fonts: {
    title: { size: 32, bold: true },
    heading: { size: 24, bold: true },
    body: { size: 16 }
  }
};

// Use throughout presentation
slide.addText(title, {
  ...theme.fonts.title,
  color: theme.colors.primary
});
```

## Package Installation

```bash
npm install pptxgenjs
```

Or use directly in code mode - NCP will use pre-installed package via `require('pptxgenjs')`.

## See Also

- For PDF: Use the `pdf` skill
- For DOCX: Use the `docx` skill
- For XLSX: Use the `xlsx` skill

## License

Apache 2.0
