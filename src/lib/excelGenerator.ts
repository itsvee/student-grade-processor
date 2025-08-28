import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { SubjectData } from '@/types';

export async function generateExcelFiles(
  subjectData: SubjectData[]
): Promise<{ [subjectCode: string]: ArrayBuffer }> {
  const files: { [subjectCode: string]: ArrayBuffer } = {};

  for (const subject of subjectData) {
    const excelBuffer = await generateSubjectExcelFile(subject);
    files[subject.subjectCode] = excelBuffer;
  }

  return files;
}

export async function generateSubjectExcelFile(
  subject: SubjectData
): Promise<ArrayBuffer> {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Prepare data according to specification
  const data: (string | number)[][] = [];
  
  // Row 1: Title with subject code
  data.push([`แบบบันทึกคะแนนกลางภาค วิชา ${subject.subjectCode}`]);
  
  // Row 2: Academic year
  data.push(['ภาคเรียนที่ 2 ปีการศึกษา 2567']);
  
  // Row 3: Institution
  data.push(['ศูนย์การศึกษานอกระบบและการศึกษาตามอัธยาศัยอำเภอเมืองนครสวรรค์']);
  
  // Row 4: Table headers (merged header row)
  data.push([
    'ลำดับที่',
    'รหัสประจำตัว',
    'ชื่อ - นามสกุล',
    'คะแนนส่วนที่',
    '', '', '', '', '' // These will be merged
  ]);
  
  // Row 5: Sub-headers with numbers
  data.push([
    '', '', '',
    '1', '4', '5', '6', '7', '8'
  ]);

  // Student data rows (starting from row 6)
  subject.students.forEach((student, index) => {
    data.push([
      index + 1, // Sequential numbering
      student.studentId,
      student.fullName,
      9, // All score columns filled with 9
      9,
      9,
      9,
      9,
      9
    ]);
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, // ลำดับที่
    { wch: 15 }, // รหัสประจำตัว
    { wch: 25 }, // ชื่อ - นามสกุล
    { wch: 12 }, // คะแนนส่วนที่ 1
    { wch: 12 }, // คะแนนส่วนที่ 4
    { wch: 12 }, // คะแนนส่วนที่ 5
    { wch: 12 }, // คะแนนส่วนที่ 6
    { wch: 12 }, // คะแนนส่วนที่ 7
    { wch: 12 }  // คะแนนส่วนที่ 8
  ];

  // Merge cells for headers
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  
  // Merge title row (A1:I1)
  worksheet['!merges'].push({ s: { c: 0, r: 0 }, e: { c: 8, r: 0 } });
  
  // Merge academic year row (A2:I2)
  worksheet['!merges'].push({ s: { c: 0, r: 1 }, e: { c: 8, r: 1 } });
  
  // Merge institution row (A3:I3)
  worksheet['!merges'].push({ s: { c: 0, r: 2 }, e: { c: 8, r: 2 } });
  
  // Merge header cells as specified in CLAUDE.md
  // Row 4-5 (indices 3-4) merges for table headers
  worksheet['!merges'].push({ s: { c: 0, r: 3 }, e: { c: 0, r: 4 } }); // ลำดับที่
  worksheet['!merges'].push({ s: { c: 1, r: 3 }, e: { c: 1, r: 4 } }); // รหัสประจำตัว
  worksheet['!merges'].push({ s: { c: 2, r: 3 }, e: { c: 2, r: 4 } }); // ชื่อ - นามสกุล
  worksheet['!merges'].push({ s: { c: 3, r: 3 }, e: { c: 8, r: 3 } }); // คะแนนส่วนที่

  // Apply styles to headers
  const headerStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // Style title rows
  for (let i = 0; i < 3; i++) {
    const cellAddress = XLSX.utils.encode_cell({ c: 0, r: i });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        ...headerStyle,
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }

  // Style table headers (rows 4-5, indices 3-4)
  for (let row = 3; row <= 4; row++) {
    for (let col = 0; col < 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ c: col, r: row });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          ...headerStyle,
          fill: { fgColor: { rgb: 'E6E6FA' } }
        };
      }
    }
  }

  // Style data cells with borders
  const dataStyle = {
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  for (let row = 5; row < data.length; row++) {
    for (let col = 0; col < 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ c: col, r: row });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          ...dataStyle,
          alignment: { horizontal: col === 0 ? 'center' : 'left', vertical: 'center' }
        };
      }
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    cellStyles: true
  });

  return excelBuffer;
}

export async function downloadAsZip(files: { [subjectCode: string]: ArrayBuffer }): Promise<void> {
  const zip = new JSZip();

  // Add each Excel file to ZIP
  Object.entries(files).forEach(([subjectCode, buffer]) => {
    const fileName = `แบบบันทึกคะแนนกลางภาค-${subjectCode}.xlsx`;
    zip.file(fileName, buffer);
  });

  // Generate ZIP file
  const zipContent = await zip.generateAsync({ type: 'blob' });

  // Download ZIP file
  const url = URL.createObjectURL(zipContent);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'แบบบันทึกคะแนนทุกวิชา.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(buffer: ArrayBuffer, fileName: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}