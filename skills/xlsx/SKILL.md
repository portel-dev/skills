---
name: xlsx
description: Comprehensive Excel spreadsheet creation and manipulation with the xlsx (SheetJS) library. Create workbooks, format cells, add formulas, charts, and more. Use when you need to programmatically generate or process .xlsx files.
license: Apache 2.0
---

# XLSX Spreadsheet Creation with JavaScript

## Overview

This skill provides comprehensive Excel spreadsheet creation using the `xlsx` (SheetJS) library. Create workbooks, manipulate worksheets, format cells, add formulas, and more - all in pure JavaScript/TypeScript.

## Quick Start

```javascript
const XLSX = require('xlsx');

// Create workbook
const wb = XLSX.utils.book_new();

// Create worksheet from data
const ws = XLSX.utils.aoa_to_sheet([
  ['Name', 'Age', 'City'],
  ['John', 30, 'New York'],
  ['Jane', 25, 'Los Angeles']
]);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

// Generate buffer
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
// buffer can be written to file or returned
```

## Core Concepts

### Workbook Structure

```javascript
const XLSX = require('xlsx');

// Create new workbook
const workbook = XLSX.utils.book_new();

// Workbook properties
workbook.Props = {
  Title: 'Sales Report',
  Subject: 'Q4 Results',
  Author: 'John Doe',
  Company: 'Acme Corp',
  CreatedDate: new Date()
};

// Add worksheets
XLSX.utils.book_append_sheet(workbook, worksheet1, 'Sales');
XLSX.utils.book_append_sheet(workbook, worksheet2, 'Summary');
```

### Creating Worksheets

#### From Array of Arrays

```javascript
const data = [
  ['Name', 'Age', 'City'],
  ['John Doe', 30, 'New York'],
  ['Jane Smith', 25, 'Los Angeles'],
  ['Bob Johnson', 35, 'Chicago']
];

const ws = XLSX.utils.aoa_to_sheet(data);
```

#### From JSON

```javascript
const jsonData = [
  { Name: 'John Doe', Age: 30, City: 'New York' },
  { Name: 'Jane Smith', Age: 25, City: 'Los Angeles' },
  { Name: 'Bob Johnson', Age: 35, City: 'Chicago' }
];

const ws = XLSX.utils.json_to_sheet(jsonData);
```

#### From Object (Key-Value Pairs)

```javascript
const data = {
  'A1': { v: 'Name', t: 's' },
  'B1': { v: 'Age', t: 'n' },
  'C1': { v: 'City', t: 's' },
  'A2': { v: 'John', t: 's' },
  'B2': { v: 30, t: 'n' },
  'C2': { v: 'New York', t: 's' }
};

const ws = { ...data };
ws['!ref'] = 'A1:C2';  // Define range
```

## Cell Formatting

### Cell References

```javascript
// Access cell by reference
ws['A1'] = { v: 'Hello', t: 's' };  // String
ws['B1'] = { v: 123, t: 'n' };      // Number
ws['C1'] = { v: true, t: 'b' };     // Boolean
ws['D1'] = { v: new Date(), t: 'd' }; // Date

// Cell types:
// 's' = string
// 'n' = number
// 'b' = boolean
// 'd' = date
// 'e' = error
// 'z' = stub (empty)
```

### Column Widths

```javascript
ws['!cols'] = [
  { wch: 20 },  // Column A width
  { wch: 10 },  // Column B width
  { wch: 15 },  // Column C width
  { wch: 12 }   // Column D width
];
```

### Row Heights

```javascript
ws['!rows'] = [
  { hpt: 25 },  // Row 1 height
  { hpt: 18 },  // Row 2 height
  { hpt: 18 }   // Row 3 height
];
```

### Merging Cells

```javascript
ws['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }  // Merge A1:C1
];
// s = start, e = end, r = row, c = column (0-indexed)
```

## Formulas

### Adding Formulas

```javascript
const ws = XLSX.utils.aoa_to_sheet([
  ['Item', 'Quantity', 'Price', 'Total'],
  ['Widget A', 10, 5.99, { f: 'B2*C2' }],
  ['Widget B', 5, 12.50, { f: 'B3*C3' }],
  ['Widget C', 8, 7.25, { f: 'B4*C4' }],
  ['Total', '', '', { f: 'SUM(D2:D4)' }]
]);
```

### Common Formulas

```javascript
// SUM
{ f: 'SUM(A1:A10)' }

// AVERAGE
{ f: 'AVERAGE(B1:B10)' }

// IF condition
{ f: 'IF(A1>100,"High","Low")' }

// VLOOKUP
{ f: 'VLOOKUP(A2,Table1,2,FALSE)' }

// CONCATENATE
{ f: 'CONCATENATE(A1," ",B1)' }

// COUNT
{ f: 'COUNT(A1:A10)' }

// MAX/MIN
{ f: 'MAX(A1:A10)' }
{ f: 'MIN(A1:A10)' }
```

## Styling (with xlsx-style or similar)

### Basic Cell Styling

```javascript
ws['A1'].s = {
  font: {
    name: 'Arial',
    sz: 14,
    bold: true,
    color: { rgb: 'FF0000' }
  },
  fill: {
    fgColor: { rgb: 'FFFF00' }
  },
  alignment: {
    horizontal: 'center',
    vertical: 'center'
  },
  border: {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  }
};
```

## Common Patterns

### Sales Report

```javascript
const XLSX = require('xlsx');

function createSalesReport(salesData) {
  const wb = XLSX.utils.book_new();
  
  // Summary worksheet
  const summaryData = [
    ['Sales Report - Q4 2024'],
    [],
    ['Metric', 'Value'],
    ['Total Sales', salesData.totalSales],
    ['Total Orders', salesData.totalOrders],
    ['Average Order', salesData.avgOrder],
    ['Top Product', salesData.topProduct]
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Merge title
  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
  ];
  
  // Set column widths
  wsSummary['!cols'] = [
    { wch: 20 },
    { wch: 15 }
  ];
  
  // Details worksheet
  const detailsData = [
    ['Order ID', 'Date', 'Customer', 'Product', 'Quantity', 'Price', 'Total']
  ];
  
  salesData.orders.forEach(order => {
    detailsData.push([
      order.id,
      order.date,
      order.customer,
      order.product,
      order.quantity,
      order.price,
      { f: `E${detailsData.length + 1}*F${detailsData.length + 1}` }
    ]);
  });
  
  // Add totals row
  const lastRow = detailsData.length + 1;
  detailsData.push([
    'TOTAL',
    '',
    '',
    '',
    { f: `SUM(E2:E${lastRow - 1})` },
    '',
    { f: `SUM(G2:G${lastRow - 1})` }
  ]);
  
  const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
  
  // Column widths
  wsDetails['!cols'] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 }
  ];
  
  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Details');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

### Financial Statement

```javascript
function createFinancialStatement(financialData) {
  const data = [
    ['Income Statement'],
    ['Year Ended: ' + financialData.year],
    [],
    ['Revenue'],
    ['Product Sales', financialData.productSales],
    ['Service Revenue', financialData.serviceRevenue],
    ['Total Revenue', { f: 'B5+B6' }],
    [],
    ['Expenses'],
    ['Cost of Goods Sold', financialData.cogs],
    ['Operating Expenses', financialData.opex],
    ['Total Expenses', { f: 'B10+B11' }],
    [],
    ['Net Income', { f: 'B7-B12' }]
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Merge title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }
  ];
  
  // Column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 }
  ];
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Income Statement');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

### Employee Roster

```javascript
function createEmployeeRoster(employees) {
  const wb = XLSX.utils.book_new();
  
  // Employee list
  const employeeData = [
    ['Employee Roster'],
    [],
    ['ID', 'Name', 'Department', 'Title', 'Hire Date', 'Salary']
  ];
  
  employees.forEach(emp => {
    employeeData.push([
      emp.id,
      emp.name,
      emp.department,
      emp.title,
      emp.hireDate,
      emp.salary
    ]);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(employeeData);
  
  // Merge title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
  ];
  
  // Column widths
  ws['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 }
  ];
  
  // Department summary
  const depts = [...new Set(employees.map(e => e.department))];
  const summaryData = [
    ['Department Summary'],
    [],
    ['Department', 'Count', 'Avg Salary']
  ];
  
  depts.forEach(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const avgSalary = deptEmps.reduce((sum, e) => sum + e.salary, 0) / deptEmps.length;
    summaryData.push([
      dept,
      deptEmps.length,
      avgSalary.toFixed(2)
    ]);
  });
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Merge title
  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
  ];
  
  // Column widths
  wsSummary['!cols'] = [
    { wch: 20 },
    { wch: 10 },
    { wch: 15 }
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

### Inventory Tracker

```javascript
function createInventoryTracker(inventory) {
  const data = [
    ['Inventory Report'],
    ['Date: ' + new Date().toISOString().split('T')[0]],
    [],
    ['SKU', 'Product Name', 'Category', 'In Stock', 'Reorder Level', 'Status', 'Value']
  ];
  
  inventory.items.forEach(item => {
    const status = item.inStock <= item.reorderLevel ? 'REORDER' : 'OK';
    const value = { f: `D${data.length + 1}*${item.unitPrice}` };
    
    data.push([
      item.sku,
      item.name,
      item.category,
      item.inStock,
      item.reorderLevel,
      status,
      value
    ]);
  });
  
  // Add totals
  const lastRow = data.length;
  data.push([
    '',
    'TOTAL',
    '',
    { f: `SUM(D5:D${lastRow})` },
    '',
    '',
    { f: `SUM(G5:G${lastRow})` }
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Merge title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
  ];
  
  // Column widths
  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 }
  ];
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

## Reading Excel Files

### Read from Buffer

```javascript
const XLSX = require('xlsx');

function readExcelFile(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return data;
}
```

### Read Specific Range

```javascript
function readRange(buffer, sheetName, range) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[sheetName];
  
  const data = XLSX.utils.sheet_to_json(worksheet, {
    range: range  // e.g., 'A1:D10'
  });
  
  return data;
}
```

### Extract Formulas

```javascript
function extractFormulas(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const formulas = [];
  
  for (let cell in worksheet) {
    if (cell[0] === '!') continue;
    if (worksheet[cell].f) {
      formulas.push({
        cell: cell,
        formula: worksheet[cell].f,
        value: worksheet[cell].v
      });
    }
  }
  
  return formulas;
}
```

## Best Practices

### Error Handling

```javascript
function safeCreateWorkbook(data) {
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
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
function validateData(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  if (data.length === 0) {
    throw new Error('Data cannot be empty');
  }
  
  if (!Array.isArray(data[0])) {
    throw new Error('Data must be an array of arrays');
  }
  
  return true;
}
```

### Memory Management

```javascript
// For large datasets, process in chunks
function processLargeDataset(largeData, chunkSize = 1000) {
  const wb = XLSX.utils.book_new();
  
  for (let i = 0; i < largeData.length; i += chunkSize) {
    const chunk = largeData.slice(i, i + chunkSize);
    const ws = XLSX.utils.aoa_to_sheet(chunk);
    XLSX.utils.book_append_sheet(wb, ws, `Chunk_${Math.floor(i / chunkSize) + 1}`);
  }
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

## CSV Operations

### Convert CSV to Excel

```javascript
function csvToExcel(csvContent) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.read(csvContent, { type: 'string' }).Sheets.Sheet1;
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
```

### Export Excel to CSV

```javascript
function excelToCsv(excelBuffer) {
  const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return csv;
}
```

## Package Installation

```bash
npm install xlsx
```

Or use directly in code mode - NCP will use pre-installed package via `require('xlsx')`.

## See Also

- For PDF: Use the `pdf` skill
- For DOCX: Use the `docx` skill
- For PPTX: Use the `pptx` skill
- For CSV: Use `papaparse` or `csv-parser`

## License

Apache 2.0
