'use client';

import { useState, useCallback } from 'react';
import { DocumentIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { StudentData, SubjectData, FileValidationResult } from '@/types';
import { parseExcelFile, validateExcelFile } from '@/lib/excelProcessor';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onDataParsed: (studentData: StudentData[], subjectData: SubjectData[]) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileUpload, onDataParsed, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);

  const processFile = useCallback(async (file: File) => {
    console.log('Starting file processing for:', file.name);
    setIsProcessing(true);
    setValidationResult(null);

    try {
      // Validate file
      console.log('Validating file...');
      const validation = validateExcelFile(file);
      setValidationResult(validation);

      if (!validation.isValid) {
        console.log('File validation failed:', validation.errors);
        setIsProcessing(false);
        return;
      }

      console.log('File validation passed, starting to parse...');
      
      // Show intermediate status
      setValidationResult({
        isValid: true,
        errors: [],
        warnings: ['กำลังประมวลผลไฟล์... กรุณารอสักครู่']
      });

      // Parse file
      const { studentData, subjectData } = await parseExcelFile(file);
      
      console.log('File parsed successfully:', {
        students: studentData.length,
        subjects: subjectData.length
      });

      // Update validation result to show success
      setValidationResult({
        isValid: true,
        errors: [],
        warnings: []
      });
      
      onFileUpload(file);
      onDataParsed(studentData, subjectData);
      
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์';
      
      setValidationResult({
        isValid: false,
        errors: [errorMessage],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
      console.log('File processing completed');
    }
  }, [onFileUpload, onDataParsed]);

  const handleFileSelect = (file: File) => {
    if (disabled || isProcessing) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );

    if (excelFile) {
      handleFileSelect(excelFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-400 bg-blue-50 scale-[1.02]' : 'border-gray-300'}
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 hover:bg-gray-50/50'}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          disabled={disabled || isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-3 sm:space-y-4">
          {isProcessing ? (
            <>
              <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <div>
                <p className="text-sm sm:text-base text-gray-600 font-medium">กำลังประมวลผลไฟล์...</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
              </div>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-base sm:text-lg font-medium text-gray-900">
                  <span className="hidden sm:inline">ลากและวางไฟล์ Excel หรือคลิกเพื่อเลือก</span>
                  <span className="sm:hidden">แตะเพื่อเลือกไฟล์ Excel</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  รองรับไฟล์ .xlsx และ .xls (ขนาดสูงสุด 10MB)
                </p>
              </div>
              <button
                type="button"
                disabled={disabled || isProcessing}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base"
              >
                <span className="sm:hidden">เลือกไฟล์</span>
                <span className="hidden sm:inline">📁 เลือกไฟล์</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-3">
          {validationResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium text-red-800 text-sm sm:text-base">พบข้อผิดพลาด:</h4>
                  <ul className="mt-1 text-red-700 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-xs sm:text-sm break-words">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium text-yellow-800 text-sm sm:text-base">คำเตือน:</h4>
                  <ul className="mt-1 text-yellow-700 space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-xs sm:text-sm break-words">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validationResult.isValid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                <p className="text-green-700 text-sm sm:text-base font-medium">
                  ✅ ไฟล์ถูกต้อง พร้อมประมวลผล
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}