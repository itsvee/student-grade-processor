'use client';

import { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SubjectData, SubjectConfig } from '@/types';

interface SubjectConfigurationProps {
  subjectData: SubjectData[];
  onSubjectConfigUpdate: (configs: SubjectConfig[]) => void;
}

export default function SubjectConfiguration({ 
  subjectData, 
  onSubjectConfigUpdate 
}: SubjectConfigurationProps) {
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState<{ [key: string]: SubjectConfig }>(() => {
    const initial: { [key: string]: SubjectConfig } = {};
    subjectData.forEach(subject => {
      initial[subject.subjectCode] = {
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName || '',
        subjectUnit: subject.subjectUnit || ''
      };
    });
    return initial;
  });

  const handleEdit = (subjectCode: string) => {
    setEditingSubject(subjectCode);
  };

  const handleSave = (subjectCode: string) => {
    setEditingSubject(null);
    onSubjectConfigUpdate(Object.values(configurations));
  };

  const handleCancel = () => {
    setEditingSubject(null);
    // Reset to original values if needed
  };

  const handleConfigChange = (subjectCode: string, field: 'subjectName' | 'subjectUnit', value: string) => {
    setConfigurations(prev => ({
      ...prev,
      [subjectCode]: {
        ...prev[subjectCode],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        กำหนดชื่อวิชาและหน่วยกิต
      </h3>
      
      <div className="space-y-3">
        {subjectData.map((subject) => {
          const config = configurations[subject.subjectCode];
          const isEditing = editingSubject === subject.subjectCode;
          
          return (
            <div key={subject.subjectCode} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded font-medium">
                      {subject.subjectCode}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({subject.students.length} นักเรียน)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อวิชา
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={config.subjectName}
                          onChange={(e) => handleConfigChange(subject.subjectCode, 'subjectName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น คณิตศาสตร์พื้นฐาน"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                          {config.subjectName || 'ไม่ได้กำหนด'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        หน่วยกิต
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={config.subjectUnit}
                          onChange={(e) => handleConfigChange(subject.subjectCode, 'subjectUnit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เช่น 3 หน่วยกิต"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                          {config.subjectUnit || 'ไม่ได้กำหนด'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(subject.subjectCode)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                        title="บันทึก"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="ยกเลิก"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(subject.subjectCode)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      title="แก้ไข"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p>
          <strong>หมายเหตุ:</strong> หากไม่กำหนดชื่อวิชาและหน่วยกิต จะใช้รหัสวิชาเป็นชื่อในไฟล์ Excel
        </p>
      </div>
    </div>
  );
}