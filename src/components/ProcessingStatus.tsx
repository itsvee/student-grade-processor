'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon, PlayIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StudentData, SubjectData, ProcessingProgress } from '@/types';
import { generateExcelFiles, downloadAsZip } from '@/lib/excelGenerator';
import StudentListModal from './StudentListModal';

interface ProcessingStatusProps {
  subjectData: SubjectData[];
  studentData: StudentData[];
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  onProcessingStart: () => void;
  onProcessingComplete: () => void;
  onProgressUpdate: (progress: ProcessingProgress) => void;
}

interface ProcessingError {
  message: string;
  subjectCode?: string;
  timestamp: Date;
}

export default function ProcessingStatus({
  subjectData,
  studentData,
  isProcessing,
  progress,
  onProcessingStart,
  onProcessingComplete,
  onProgressUpdate
}: ProcessingStatusProps) {
  const [generatedFiles, setGeneratedFiles] = useState<{ [key: string]: Blob }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<ProcessingError[]>([]);
  const [processingStats, setProcessingStats] = useState<{
    started?: Date;
    completed?: Date;
    filesGenerated: number;
    totalSize: number;
  }>({ filesGenerated: 0, totalSize: 0 });
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clearErrors = () => {
    setErrors([]);
  };

  const addError = (message: string, subjectCode?: string) => {
    const error: ProcessingError = {
      message,
      subjectCode,
      timestamp: new Date()
    };
    setErrors(prev => [...prev, error]);
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (start: Date, end: Date): string => {
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    return seconds < 60 ? `${seconds} วินาที` : `${Math.floor(seconds / 60)} นาที ${seconds % 60} วินาที`;
  };

  const handleViewStudents = (subject: SubjectData) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
  };

  const handleProcessAll = async () => {
    onProcessingStart();
    setIsGenerating(true);
    setErrors([]);
    
    const startTime = new Date();
    setProcessingStats(prev => ({ ...prev, started: startTime, filesGenerated: 0, totalSize: 0 }));

    try {
      const totalSteps = subjectData.length + 1; // +1 for ZIP creation
      let totalSize = 0;

      for (let i = 0; i < subjectData.length; i++) {
        const subject = subjectData[i];
        
        onProgressUpdate({
          currentStep: `กำลังสร้างไฟล์สำหรับ ${subject.subjectCode} (${subject.students.length} คน)`,
          completedSteps: i,
          totalSteps,
          progress: (i / totalSteps) * 100
        });

        try {
          const excelBuffer = await generateExcelFiles([subject]);
          const blob = new Blob([excelBuffer[subject.subjectCode]], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          totalSize += blob.size;
          setGeneratedFiles(prev => ({
            ...prev,
            [subject.subjectCode]: blob
          }));

          setProcessingStats(prev => ({ 
            ...prev, 
            filesGenerated: prev.filesGenerated + 1,
            totalSize: totalSize
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'ข้อผิดพลาดไม่ทราบสาเหตุ';
          addError(`ไม่สามารถสร้างไฟล์สำหรับ ${subject.subjectCode}: ${errorMessage}`, subject.subjectCode);
          console.error(`Error generating file for ${subject.subjectCode}:`, error);
        }
      }

      onProgressUpdate({
        currentStep: `กำลังรวมไฟล์เป็น ZIP (${formatFileSize(totalSize)})`,
        completedSteps: totalSteps - 1,
        totalSteps,
        progress: 95
      });

      // Generate all files for ZIP (only successful ones)
      const successfulSubjects = subjectData.filter(subject => 
        generatedFiles[subject.subjectCode] !== undefined
      );
      
      if (successfulSubjects.length === 0) {
        throw new Error('ไม่สามารถสร้างไฟล์ใดๆ ได้');
      }

      const allFiles = await generateExcelFiles(successfulSubjects);
      
      // Download as ZIP
      await downloadAsZip(allFiles);

      const completedTime = new Date();
      setProcessingStats(prev => ({ ...prev, completed: completedTime }));

      onProgressUpdate({
        currentStep: `เสร็จสิ้น - สร้างไฟล์ ${successfulSubjects.length} ไฟล์`,
        completedSteps: totalSteps,
        totalSteps,
        progress: 100
      });

      // Show completion message after a delay
      setTimeout(() => {
        if (errors.length === 0) {
          onProgressUpdate({
            currentStep: `✅ สำเร็จแล้ว! ใช้เวลา ${formatDuration(startTime, completedTime)}`,
            completedSteps: totalSteps,
            totalSteps,
            progress: 100
          });
        }
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประมวลผล';
      addError(errorMessage);
      console.error('Error processing files:', error);
      
      onProgressUpdate({
        currentStep: '❌ เกิดข้อผิดพลาด',
        completedSteps: 0,
        totalSteps: subjectData.length + 1,
        progress: 0
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        onProcessingComplete();
      }, errors.length > 0 ? 0 : 2000); // Keep progress visible longer if successful
    }
  };

  const handleDownloadIndividual = async (subjectCode: string) => {
    try {
      const subject = subjectData.find(s => s.subjectCode === subjectCode);
      if (!subject) {
        addError(`ไม่พบข้อมูลรายวิชา ${subjectCode}`);
        return;
      }

      const excelBuffer = await generateExcelFiles([subject]);
      const blob = new Blob([excelBuffer[subjectCode]], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      setGeneratedFiles(prev => ({
        ...prev,
        [subjectCode]: blob
      }));

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `แบบบันทึกคะแนนกลางภาค-${subjectCode}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ข้อผิดพลาดไม่ทราบสาเหตุ';
      addError(`ไม่สามารถดาวน์โหลดไฟล์ ${subjectCode}: ${errorMessage}`, subjectCode);
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">
                  พบข้อผิดพลาด ({errors.length} ข้อ)
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <span className="font-mono text-xs text-red-500">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                      {error.subjectCode && (
                        <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                          {error.subjectCode}
                        </span>
                      )}
                      <p className="mt-1">{error.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800 p-1"
              title="ล้างข้อผิดพลาด"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Processing Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleProcessAll}
          disabled={isProcessing || subjectData.length === 0}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>กำลังประมวลผล...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              <span>ประมวลผลและดาวน์โหลดทั้งหมด</span>
            </>
          )}
        </button>
      </div>

      {/* Enhanced Progress Bar */}
      {progress && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-900">
                {progress.currentStep}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-blue-700">
                {progress.completedSteps}/{progress.totalSteps}
              </span>
              <span className="text-xs text-blue-600 ml-2">
                {Math.round(progress.progress)}%
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
          {processingStats.started && (
            <div className="flex justify-between text-xs text-blue-600 mt-2">
              <span>เริ่มเมื่อ: {processingStats.started.toLocaleTimeString()}</span>
              {processingStats.filesGenerated > 0 && (
                <span>
                  สร้างแล้ว: {processingStats.filesGenerated} ไฟล์ 
                  {processingStats.totalSize > 0 && ` (${formatFileSize(processingStats.totalSize)})`}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subject List with Individual Downloads */}
      {subjectData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            ดาวน์โหลดแยกตามรายวิชา
            {processingStats.filesGenerated > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {processingStats.filesGenerated}/{subjectData.length} พร้อม
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {subjectData.map((subject, index) => (
              <div key={index} className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-lg">{subject.subjectCode}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {subject.students.length} นักเรียน
                      {generatedFiles[subject.subjectCode] && (
                        <span className="ml-2 text-green-600 font-medium">• พร้อมดาวน์โหลด</span>
                      )}
                    </p>
                    
                    {/* Show some student names preview */}
                    <div className="mt-2 text-xs text-gray-500">
                      {subject.students.slice(0, 3).map(student => student.fullName).join(', ')}
                      {subject.students.length > 3 && ` และอีก ${subject.students.length - 3} คน`}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    {generatedFiles[subject.subjectCode] && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleViewStudents(subject)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>ดูรายชื่อ</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownloadIndividual(subject.subjectCode)}
                    disabled={isGenerating}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200 text-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>ดาวน์โหลด</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
          สรุปข้อมูล
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{subjectData.length}</div>
            <div className="text-sm text-blue-800">รายวิชา</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{studentData.length}</div>
            <div className="text-sm text-blue-800">นักเรียนทั้งหมด</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-green-600">
              {processingStats.filesGenerated}/{subjectData.length}
            </div>
            <div className="text-sm text-blue-800">ไฟล์ที่สร้างแล้ว</div>
          </div>
        </div>
        {processingStats.totalSize > 0 && (
          <div className="mt-3 text-center">
            <span className="text-sm text-blue-700">
              ขนาดไฟล์รวม: {formatFileSize(processingStats.totalSize)}
            </span>
          </div>
        )}
      </div>

      {/* Student List Modal */}
      <StudentListModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subject={selectedSubject}
        allStudentData={studentData}
      />
    </div>
  );
}