# ระบบประมวลผลคะแนนนักเรียน (Student Grade Processing System)

A modern web application built with Next.js and TypeScript that automates the processing of student grade data from Excel files. This system eliminates manual, time-consuming processes by automatically generating separate Excel files for each subject.

## 🚀 Features

- **Excel File Processing**: Automatically reads and validates Excel files with student grade data
- **Subject Separation**: Generates individual Excel files for each subject based on student enrollment
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and Headless UI
- **File Validation**: Comprehensive validation with clear error messages
- **Progress Tracking**: Real-time progress indication during processing
- **Bulk Download**: Download all files as a ZIP or individual files
- **Thai Language Support**: Full Thai language interface and content

## 🛠 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI with Heroicons
- **Excel Processing**: SheetJS (xlsx library)
- **File Handling**: JSZip for bundling multiple files
- **Development**: ESLint, PostCSS, Autoprefixer

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-grade-processor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

### Input File Format

The system expects Excel files (.xlsx or .xls) with the following structure:

- **Row 1**: Table headers
- **Column A**: อันดับ (Rank)
- **Column B**: รหัสนักศึกษา (Student ID)
- **Column C**: ชื่อ - นามสกุล (Full Name)
- **Columns D-I**: คะแนน (Scores) - 6 columns of score data
- **Columns J onwards**: รหัสรายวิชา (Subject Codes) as column headers
  - Cells contain `*` (asterisk) to indicate student enrollment in that subject

### Processing Steps

1. **Upload File**: Drag and drop or select an Excel file
2. **Validation**: System validates file format and structure
3. **Preview**: Review detected subjects and student data
4. **Process**: Click "ประมวลผลและดาวน์โหลดทั้งหมด" to generate files
5. **Download**: Get individual files or download all as ZIP

### Output File Format

Each generated Excel file contains:

- **Header Information**: Subject code, academic term, institution name
- **Table Structure**: Sequential numbering, student ID, full name, and score columns
- **Data**: All enrolled students with score placeholders (filled with 9)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main application page
├── components/            # React components
│   ├── FileUpload.tsx    # File upload and validation
│   ├── FilePreview.tsx   # Data preview component
│   └── ProcessingStatus.tsx # Processing and download
├── lib/                   # Utility libraries
│   ├── excelProcessor.ts # Excel parsing logic
│   └── excelGenerator.ts # Excel generation logic
└── types/                 # TypeScript type definitions
    └── index.ts          # Application types
```

## 🔨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🧪 Development

### Adding New Features

1. Follow the existing project structure
2. Use TypeScript for type safety
3. Follow Tailwind CSS conventions for styling
4. Test with sample Excel files matching the expected format

### Code Style

- Use TypeScript strict mode
- Follow Next.js and React best practices
- Use Tailwind CSS utility classes
- Maintain consistent Thai language labeling

## 📄 License

This project is developed for educational and administrative use in processing student grade data.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with sample files
5. Submit a pull request

## 📞 Support

For issues or questions about the system, please refer to the project documentation or create an issue in the repository.