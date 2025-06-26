// src/components/DataManagement/steps/UploadStep.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { UploadedFile } from '@/types/dataManagement';
import {
  Upload,
  FileText,
  AlertCircle,
  Eye,
  Database,
  CheckCircle,
  RefreshCw,
  X,
  FolderOpen,
  FileCheck,
  Clock,
  HardDrive,
  Zap,
} from 'lucide-react';

interface UploadStepProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: (file: File) => Promise<void>;
  onProcessFile: (file: UploadedFile) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  uploadedFiles,
  onFileUpload,
  onProcessFile,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process selected files
  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const validExtensions = ['.csv', '.xls', '.xlsx'];

      return (
        validTypes.includes(file.type) ||
        validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
      );
    });

    if (validFiles.length === 0) {
      alert('Please select valid CSV or Excel files only.');
      return;
    }

    if (validFiles.length > 1) {
      alert('Please upload one file at a time.');
      return;
    }

    setSelectedFiles(validFiles);

    // Auto-upload the first valid file
    if (validFiles[0]) {
      await onFileUpload(validFiles[0]);
      setSelectedFiles([]);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'default';
      case 'ready':
      case 'validated':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'staged':
      case 'mapped':
      case 'validated':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Data File</CardTitle>
          <CardDescription>
            Upload CSV or Excel files to begin the data import process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Drag & Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
              ${
                isUploading
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-4">
                <RefreshCw className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                <div>
                  <h3 className="text-lg font-medium">Uploading...</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please wait while your file is being uploaded
                  </p>
                  <Progress
                    value={uploadProgress}
                    className="w-full max-w-xs mx-auto"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(uploadProgress)}% complete
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">
                    {dragActive
                      ? 'Drop your file here'
                      : 'Drag & drop your file here'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" className="mt-2">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-2">File Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Supported formats: CSV (.csv), Excel (.xls, .xlsx)</li>
              <li>• Maximum file size: 50 MB</li>
              <li>• First row should contain column headers</li>
              <li>• Avoid special characters in column names</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} •{' '}
                        {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedFiles((files) =>
                        files.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Uploaded Files ({uploadedFiles.length})
            </CardTitle>
            <CardDescription>
              Manage your uploaded files and track their processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.upload_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {file.original_filename}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <HardDrive className="h-3 w-3 mr-1" />
                          {formatFileSize(file.file_size)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </span>
                        {file.total_rows && (
                          <span className="flex items-center">
                            <Database className="h-3 w-3 mr-1" />
                            {file.total_rows.toLocaleString()} rows
                          </span>
                        )}
                      </div>
                      {file.error_message && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {file.error_message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <Badge
                      variant={getStatusColor(file.upload_status)}
                      className="text-xs"
                    >
                      <span className="flex items-center">
                        {getStatusIcon(file.upload_status)}
                        <span className="ml-1 capitalize">
                          {file.upload_status.replace('_', ' ')}
                        </span>
                      </span>
                    </Badge>

                    <div className="flex space-x-1">
                      {file.upload_status === 'uploaded' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProcessFile(file)}
                          disabled={isUploading}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                      )}

                      {(file.upload_status === 'staged' ||
                        file.upload_status === 'mapped' ||
                        file.upload_status === 'validated') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProcessFile(file)}
                          disabled={isUploading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      )}

                      {file.upload_status === 'deployed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to view deployed data
                            console.log(
                              'View deployed data for file:',
                              file.file_id
                            );
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Data
                        </Button>
                      )}

                      {file.upload_status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProcessFile(file)}
                          disabled={isUploading}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {uploadedFiles.length === 0 && !isUploading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-sm mb-2">
                  1. Upload Your File
                </h3>
                <p className="text-xs text-muted-foreground">
                  Drag and drop or select your CSV/Excel file to begin
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-sm mb-2">2. Review & Map</h3>
                <p className="text-xs text-muted-foreground">
                  Analyze your data and map fields to database columns
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-sm mb-2">3. Deploy</h3>
                <p className="text-xs text-muted-foreground">
                  Validate and deploy your data to the production database
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> For best results, ensure your CSV file has
          clean column headers and consistent data formats. Excel files should
          have data in the first worksheet.
        </AlertDescription>
      </Alert>
    </div>
  );
};
