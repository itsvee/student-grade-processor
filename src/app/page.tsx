'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';
import ProcessingStatus from '@/components/ProcessingStatus';
import { StudentData, SubjectData, SubjectConfig, ProcessingProgress } from '@/types';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [subjectConfigs, setSubjectConfigs] = useState<SubjectConfig[]>([]);
  const [semester, setSemester] = useState<number>(2);
  const [academicYear, setAcademicYear] = useState<number>(2567);
  const [termEducation, setTermEducation] = useState<string>('กลางภาค');
  const [groupNumber, setGroupNumber] = useState<string>('21019');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleDataParsed = (parsedStudentData: StudentData[], parsedSubjectData: SubjectData[]) => {
    setStudentData(parsedStudentData);
    setSubjectData(parsedSubjectData);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setProcessingProgress(null);
  };

  const handleProgressUpdate = (progress: ProcessingProgress) => {
    setProcessingProgress(progress);
  };

  const handleSubjectConfigUpdate = (configs: SubjectConfig[]) => {
    setSubjectConfigs(configs);
    // Update subjectData with the new configurations
    setSubjectData(prevData => 
      prevData.map(subject => {
        const config = configs.find(c => c.subjectCode === subject.subjectCode);
        return {
          ...subject,
          subjectName: config?.subjectName || subject.subjectName
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              ระบบประมวลผลคะแนนนักเรียน
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              ระบบประมวลผลคะแนนจากไฟล์ Excel อัตโนมัติ สร้างไฟล์แยกตามรายวิชา
            </p>
          </div>
          
          {/* Status Indicator */}
          {(file || isProcessing) && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2 text-sm">
                {isProcessing ? (
                  <>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-blue-700 font-medium">กำลังประมวลผล...</span>
                  </>
                ) : file ? (
                  <>
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                    <span className="text-green-700 font-medium">พร้อมประมวลผล</span>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Upload Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              อัปโหลดไฟล์ Excel
            </h2>
          </div>
          <FileUpload 
            onFileUpload={handleFileUpload}
            onDataParsed={handleDataParsed}
            disabled={isProcessing}
          />
        </section>

        {/* Preview Section */}
        {file && subjectData.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                ตัวอย่างข้อมูล
              </h2>
            </div>
            <FilePreview 
              file={file}
              studentData={studentData}
              subjectData={subjectData}
            />
          </section>
        )}


        {/* Processing Section */}
        {subjectData.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                ประมวลผลและดาวน์โหลด
              </h2>
            </div>
            <ProcessingStatus
              subjectData={subjectData}
              studentData={studentData}
              isProcessing={isProcessing}
              progress={processingProgress}
              semester={semester}
              academicYear={academicYear}
              termEducation={termEducation}
              groupNumber={groupNumber}
              onProcessingStart={handleProcessingStart}
              onProcessingComplete={handleProcessingComplete}
              onProgressUpdate={handleProgressUpdate}
              onSubjectConfigUpdate={handleSubjectConfigUpdate}
              onSemesterChange={setSemester}
              onAcademicYearChange={setAcademicYear}
              onTermEducationChange={setTermEducation}
              onGroupNumberChange={setGroupNumber}
            />
          </section>
        )}

        {/* Instructions/Help Section for empty state */}
        {!file && !isProcessing && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                วิธีการใช้งาน
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-800">
                <div className="flex flex-col items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
                  <p>อัปโหลดไฟล์ Excel ที่มีข้อมูลนักเรียนและรายวิชา</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
                  <p>ตรวจสอบข้อมูลที่แสดงในตัวอย่าง</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
                  <p>กดปุ่มประมวลผลเพื่อสร้างไฟล์แยกตามรายวิชา</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 space-y-2 sm:space-y-0">
            <p>ระบบประมวลผลคะแนนนักเรียน - สร้างด้วย Next.js</p>
            <p>รองรับไฟล์ Excel (.xlsx, .xls)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}