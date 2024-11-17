import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Lock, LogOut } from 'lucide-react';
import Papa from 'papaparse';
import { useStore } from '../store';
import { RawPost } from '../utils/preprocessData';
import { env } from '../config/env';

const REQUIRED_COLUMNS = [
  'Network',
  'Message URL',
  'Date',
  'Message',
  'Type',
  'Content Type',
  'Profile',
  'Followers',
  'Engagements'
];

export function FileUpload() {
  const { setData, setError } = useStore();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === env.UPLOAD_PASSWORD) {
      setIsUnlocked(true);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setPassword('');
    setHasUploaded(false);
  };

  const validateColumns = (headers: string[]): boolean => {
    const normalizedHeaders = headers.map(h => h.trim());
    const missingColumns = REQUIRED_COLUMNS.filter(col => 
      !normalizedHeaders.includes(col) && 
      !normalizedHeaders.includes(col.replace(' ', '_'))
    );
    
    if (missingColumns.length > 0) {
      setError(`Missing required columns: ${missingColumns.join(', ')}`);
      return false;
    }
    return true;
  };

  const normalizeColumnName = (header: string): string => {
    return header.trim().replace(/^\uFEFF/, '').replace(/_/g, ' ');
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeColumnName,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV file: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields || [];
        if (!validateColumns(headers)) {
          return;
        }

        try {
          const validData = results.data
            .filter((row: any) => {
              return REQUIRED_COLUMNS.every(col => 
                row[col] !== undefined && 
                row[col] !== '' && 
                row[col] !== null
              );
            })
            .map((row: any) => ({
              Network: row['Network'],
              Message_URL: row['Message URL'],
              Date: row['Date'],
              Message: row['Message'],
              Type: row['Type'],
              Content_Type: row['Content Type'],
              Profile: row['Profile'],
              Followers: row['Followers'],
              Engagements: row['Engagements']
            })) as RawPost[];

          if (validData.length === 0) {
            setError('No valid data found in CSV file');
            return;
          }

          setData(validData);
          setHasUploaded(true);
        } catch (error) {
          setError(`Error processing CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
      error: (error: Error) => {
        setError(`Error reading CSV file: ${error.message}`);
      }
    });
  }, [setData, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: !isUnlocked
  });

  if (!isUnlocked) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Protected Upload</h3>
        </div>
        
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Enter password to unlock file upload
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
            />
            {showError && (
              <p className="mt-1 text-sm text-red-600">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Unlock Upload
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">File Upload</h3>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Exit Upload
        </button>
      </div>

      {!hasUploaded ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-500">Drop the CSV file here</p>
            ) : (
              <div>
                <p className="text-gray-600">Drag & drop a CSV file here, or click to select</p>
                <p className="text-sm text-gray-500 mt-1">
                  CSV must include all required columns
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span>Required CSV format:</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mt-2 font-mono text-xs overflow-x-auto">
              {REQUIRED_COLUMNS.join(', ')}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          <p className="font-medium">File uploaded successfully!</p>
          <p className="text-sm mt-1">You can now exit the upload interface or upload another file.</p>
        </div>
      )}
    </div>
  );
}