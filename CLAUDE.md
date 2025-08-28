# Student Grade Processing System - CLAUDE.md

## Project Overview
Create a modern web application that automates the processing of student grade data from Excel files. The system should eliminate the manual, time-consuming process of filtering and copying student data for each subject, replacing it with an automated solution that generates separate Excel files for each subject.

## Tech Stack Requirements
- **Frontend Framework**: Next.js with TypeScript (for modern web development with excellent Excel handling)
- **Styling**: Tailwind CSS
- **Excel Processing**: SheetJS (xlsx library) for reading and writing Excel files
- **File Handling**: Native HTML5 File API for upload, JSZip for bundling multiple output files
- **UI Components**: Headless UI or similar for modern interface components

## Core Functionality

### 1. Input File Processing
The application must read Excel files with the following structure:
- **Row 1**: Table headers
- **Column A**: อันดับ (Rank)  
- **Column B**: รหัสนักศึกษา (Student ID)
- **Column C**: ชื่อ - นามสกุล (Full Name)
- **Columns D-I**: คะแนน (Scores) - 6 columns of score data
- **Columns J onwards**: รหัสรายวิชา (Subject Codes) as column headers
  - Cells contain `*` (asterisk) to indicate student enrollment in that subject

### 2. Automated Processing Logic
For each subject column (J onwards):
1. Identify the subject code from the column header (e.g., "ทช.31001")
2. Filter students who have `*` in that subject column
3. Extract their data: Student ID (Column B), Full Name (Column C)
4. Generate a separate Excel file for each subject

### 3. Output File Generation
Each output Excel file must have this exact structure:

**Row 1**: `แบบบันทึกคะแนนกลางภาค วิชา {รหัสวิชา}` (replace {รหัสวิชา} with actual subject code)
**Row 2**: `ภาคเรียนที่ 2 ปีการศึกษา 2567`
**Row 3**: `ศูนย์การศึกษานอกระบบและการศึกษาตามอัธยาศัยอำเภอเมืองนครสวรรค์`

**Rows 4-5**: Table headers with merged cells:
- **Column A**: `ลำดับที่`
- **Column B**: `รหัสประจำตัว`  
- **Column C**: `ชื่อ - นามสกุล`
- **Columns D-I**: `คะแนนส่วนที่` with numbers `1, 4, 5, 6, 7, 8` respectively

**Row 6 onwards**: Student data:
- **Column A**: Sequential numbering (1, 2, 3...)
- **Column B**: Student ID from input file
- **Column C**: Full Name from input file  
- **Columns D-I**: All cells filled with number `9`

## User Interface Requirements

### Main Page Layout
```
┌─────────────────────────────────────────┐
│            Header Section               │
│     "ระบบประมวลผลคะแนนนักเรียน"          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           Upload Section                │
│    [📁 เลือกไฟล์ Excel]                 │
│    Drag & Drop Zone                     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│          Preview Section                │
│   Show file info & detected subjects   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Processing Section              │
│    [🚀 ประมวลผลและดาวน์โหลด]           │
│    Progress indicator                   │
└─────────────────────────────────────────┘
```

### Key UI Features
1. **File Upload Area**: Drag-and-drop zone with file selection button
2. **File Validation**: Show file name, size, and validation status
3. **Subject Preview**: Display detected subject codes and student counts
4. **Processing Status**: Progress bar during file processing
5. **Download Options**: 
   - Download all files as ZIP
   - Individual file downloads
6. **Error Handling**: Clear error messages for invalid files

## Technical Implementation Details

### File Processing Workflow
```typescript
// 1. File Upload & Validation
const validateExcelFile = (file: File) => {
  // Check file type, size, basic structure
}

// 2. Parse Input Excel
const parseInputExcel = (buffer: ArrayBuffer) => {
  // Use SheetJS to read Excel
  // Extract student data and subject columns
  // Return structured data object
}

// 3. Process Each Subject  
const processSubjects = (data: StudentData) => {
  // For each subject column:
  // - Filter enrolled students (marked with *)
  // - Generate output Excel structure
  // - Apply formatting and styling
}

// 4. Generate Output Files
const generateOutputFiles = (subjectData: SubjectData[]) => {
  // Create Excel files using SheetJS
  // Apply proper formatting and cell merging
  // Return array of file buffers
}
```

### Excel Formatting Requirements
- Merge cells for headers where specified
- Apply appropriate borders and styling
- Ensure Thai text renders correctly
- Use consistent number formatting

### Error Handling
- Invalid file format detection
- Missing required columns
- Empty subject columns
- File processing errors
- Network/download errors

## Performance Considerations
- Handle large Excel files (up to 1000+ students)
- Efficient memory usage during processing
- Non-blocking UI during file operations
- Progress indicators for long operations

## Development Priorities
1. **Phase 1**: Core file processing functionality
2. **Phase 2**: User interface and file upload
3. **Phase 3**: Advanced features and error handling
4. **Phase 4**: Performance optimization and testing

## Testing Requirements
- Unit tests for Excel processing functions
- Integration tests for file upload/download
- Test with sample Excel files matching the exact format
- Cross-browser compatibility testing

## Deployment Considerations
- Static hosting compatible (Vercel, Netlify)
- No server-side requirements for basic functionality
- Progressive Web App (PWA) capabilities for offline use
- Mobile-responsive design

## Success Criteria
- Reduce processing time from 1+ hours to under 5 minutes
- Eliminate manual copy-paste errors
- Generate correctly formatted Excel files for all subjects
- Intuitive user interface requiring no training
- Handle typical class sizes (20-50 students per subject)

## Additional Features (Future Enhancements)
- Batch processing multiple input files
- Custom template configuration
- Export to other formats (PDF, CSV)
- Data validation and duplicate detection
- Audit trail and processing logs