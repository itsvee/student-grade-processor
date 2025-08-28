import * as XLSX from 'xlsx';
import { StudentData, SubjectData, FileValidationResult } from '@/types';

export function validateExcelFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (!validTypes.includes(file.type)) {
    errors.push('ประเภทไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ .xlsx หรือ .xls');
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    warnings.push('ไฟล์มีขนาดใหญ่ (เกิน 10MB) อาจใช้เวลาในการประมวลผลนาน');
  }

  // Check file name
  if (file.name.length > 200) {
    warnings.push('ชื่อไฟล์ยาวเกินไป');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export async function parseExcelFile(file: File): Promise<{
  studentData: StudentData[];
  subjectData: SubjectData[];
}> {
  return new Promise((resolve, reject) => {
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      reject(new Error('การประมวลผลไฟล์ใช้เวลานานเกินไป (หมดเวลา)'));
    }, 30000); // 30 second timeout

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        clearTimeout(timeoutId);
        const data = e.target?.result;
        if (!data) {
          reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
          return;
        }

        console.log('File read successfully, parsing Excel...');
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('ไฟล์ Excel ไม่มี worksheet'));
          return;
        }

        console.log('Available sheets:', workbook.SheetNames);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        if (!worksheet) {
          reject(new Error('ไม่สามารถอ่าน worksheet แรกได้'));
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Parsed JSON data rows:', jsonData.length);

        if (!Array.isArray(jsonData) || jsonData.length < 3) {
          reject(new Error('ไฟล์ Excel ไม่มีข้อมูลหรือรูปแบบไม่ถูกต้อง (ต้องมีอย่างน้อย 3 แถว)'));
          return;
        }

        // Check if first row is group info and second row has headers
        let headerRowIndex = 0;
        let dataStartIndex = 1;
        
        // Look for the header row (should contain 'ที่', 'รหัสนักศึกษา', 'ชื่อ - นามสกุล')
        for (let i = 0; i < Math.min(3, jsonData.length); i++) {
          const row = jsonData[i] as (string | number)[];
          if (row && row.length > 2) {
            const col1 = String(row[0] || '').trim();
            const col2 = String(row[1] || '').trim();
            const col3 = String(row[2] || '').trim();
            
            if ((col1 === 'ที่' || col1.includes('อันดับ')) && 
                (col2.includes('รหัส') || col2.includes('student')) && 
                (col3.includes('ชื่อ') || col3.includes('นาม'))) {
              headerRowIndex = i;
              dataStartIndex = i + 1;
              break;
            }
          }
        }

        const headers = jsonData[headerRowIndex] as (string | number)[];
        console.log('Headers found at row', headerRowIndex + 1, ':', headers);
        
        if (!headers || headers.length < 10) {
          reject(new Error('รูปแบบไฟล์ไม่ถูกต้อง (ต้องมีอย่างน้อย 10 คอลัมน์)'));
          return;
        }

        const studentData: StudentData[] = [];
        const subjectCounts: { [key: string]: { studentId: string; fullName: string }[] } = {};

        // Find subject columns (starting from column J, index 9)
        const subjectColumns: { [key: string]: number } = {};
        for (let i = 9; i < headers.length; i++) {
          const header = headers[i];
          if (header) {
            let subjectCode = '';
            if (typeof header === 'string') {
              subjectCode = header.trim();
            } else if (typeof header === 'number') {
              subjectCode = String(header).trim();
            }
            
            // Remove extra spaces and clean up the subject code
            if (subjectCode) {
              subjectCode = subjectCode.replace(/\s+/g, '').replace(/\s+$/, '');
              if (subjectCode) {
                subjectColumns[subjectCode] = i;
                subjectCounts[subjectCode] = [];
              }
            }
          }
        }

        console.log('Subject columns found:', Object.keys(subjectColumns));

        if (Object.keys(subjectColumns).length === 0) {
          reject(new Error('ไม่พบคอลัมน์รายวิชา (คอลัมน์ J เป็นต้นไป)'));
          return;
        }

        // Process student rows (starting from dataStartIndex)
        let studentsProcessed = 0;
        for (let i = dataStartIndex; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[];
          
          if (!row || row.length < 3) {
            console.log(`Skipping row ${i + 1}: insufficient data`);
            continue;
          }

          const rank = parseInt(String(row[0] || 0)) || studentsProcessed + 1;
          const studentId = String(row[1] || '').trim();
          const fullName = String(row[2] || '').trim();

          if (!studentId || !fullName) {
            console.log(`Skipping row ${i + 1}: missing student ID or name`);
            continue;
          }

          // Parse scores (columns D-I, indices 3-8)
          const scores: number[] = [];
          for (let j = 3; j <= 8; j++) {
            const scoreValue = row[j];
            const score = typeof scoreValue === 'number' ? scoreValue : parseFloat(String(scoreValue || 0)) || 0;
            scores.push(score);
          }

          // Parse subject enrollments
          const subjects: { [key: string]: boolean } = {};
          for (const [subjectCode, colIndex] of Object.entries(subjectColumns)) {
            const cellValue = String(row[colIndex] || '').trim();
            // Check for '*' with or without spaces
            const isEnrolled = cellValue.includes('*');
            subjects[subjectCode] = isEnrolled;

            if (isEnrolled) {
              subjectCounts[subjectCode].push({ studentId, fullName });
            }
          }

          studentData.push({
            rank,
            studentId,
            fullName,
            scores,
            subjects
          });

          studentsProcessed++;
          console.log(`Processed student ${studentsProcessed}: ${studentId} - ${fullName}`);
        }

        console.log(`Processed ${studentsProcessed} students`);

        // Create subject data
        const subjectData: SubjectData[] = Object.entries(subjectCounts)
          .filter(([, students]) => students.length > 0)
          .map(([subjectCode, students]) => ({
            subjectCode,
            students
          }));

        console.log(`Found ${subjectData.length} subjects with enrolled students`);

        if (studentData.length === 0) {
          reject(new Error('ไม่พบข้อมูลนักเรียนที่ถูกต้อง'));
          return;
        }

        if (subjectData.length === 0) {
          reject(new Error('ไม่พบรายวิชาที่มีนักเรียนลงทะเบียน'));
          return;
        }

        console.log('Parsing completed successfully');
        resolve({ studentData, subjectData });

      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error parsing Excel file:', error);
        const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
        reject(new Error(`เกิดข้อผิดพลาดในการอ่านไฟล์ Excel: ${errorMessage}`));
      }
    };

    reader.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('FileReader error:', error);
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    };

    reader.onabort = () => {
      clearTimeout(timeoutId);
      reject(new Error('การอ่านไฟล์ถูกยกเลิก'));
    };

    console.log('Starting file read...');
    reader.readAsArrayBuffer(file);
  });
}