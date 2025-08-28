'use client';

import { DocumentTextIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { StudentData, SubjectData } from '@/types';

interface FilePreviewProps {
  file: File;
  studentData: StudentData[];
  subjectData: SubjectData[];
}

export default function FilePreview({ file, studentData, subjectData }: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-500">
              ขนาดไฟล์: {formatFileSize(file.size)} | 
              จำนวนนักเรียน: {studentData.length} คน
            </p>
          </div>
        </div>
      </div>

      {/* Subject Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="w-5 h-5 mr-2" />
          รายวิชาที่พบ ({subjectData.length} วิชา)
        </h3>
        
        {subjectData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectData.map((subject, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-blue-900">{subject.subjectCode}</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {subject.students.length} นักเรียน
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    วิชาที่ {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <AcademicCapIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>ไม่พบข้อมูลรายวิชา</p>
          </div>
        )}
      </div>

      {/* Sample Student Data */}
      {studentData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ตัวอย่างข้อมูลนักเรียน (แสดง 5 รายการแรก)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    อันดับ
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รหัสนักเรียน
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ชื่อ - นามสกุล
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    จำนวนวิชาที่ลงทะเบียน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentData.slice(0, 5).map((student, index) => {
                  const registeredSubjects = Object.values(student.subjects).filter(Boolean).length;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.rank}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {registeredSubjects} วิชา
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {studentData.length > 5 && (
              <div className="text-center py-3 text-sm text-gray-500 bg-gray-50 rounded-b-lg">
                และอีก {studentData.length - 5} รายการ
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}