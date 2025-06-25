// src/components/DataManagement/steps/DeployStep.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Rocket,
  Database,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  ArrowLeft,
  Shield,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface DeployStepProps {
  currentFile: {
    original_filename: string;
    upload_status: string;
    total_rows: number;
    file_id: string;
    upload_id: number;
  };
  deploymentStats?: {
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    tablesUpdated: string[];
    startTime: string;
    endTime?: string;
    estimatedDuration?: number;
  };
  onStartNewImport: () => void;
  onViewData: () => void;
  onDownloadReport: () => void;
  onBack?: () => void;
  isDeploying?: boolean;
  deploymentProgress?: number;
}

interface DeploymentMetrics {
  totalRecords: number;
  processedRecords: number;
  successRate: number;
  failedRecords: number;
  processingSpeed: number; // records per second
  estimatedTimeRemaining: number; // seconds
}

export const DeployStep: React.FC<DeployStepProps> = ({
  currentFile,
  deploymentStats,
  onStartNewImport,
  onViewData,
  onDownloadReport,
  onBack,
  isDeploying = false,
  deploymentProgress = 0,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [metrics, setMetrics] = useState<DeploymentMetrics | null>(null);

  // Calculate deployment metrics
  useEffect(() => {
    if (deploymentStats) {
      const totalTime = deploymentStats.endTime
        ? new Date(deploymentStats.endTime).getTime() -
          new Date(deploymentStats.startTime).getTime()
        : Date.now() - new Date(deploymentStats.startTime).getTime();

      const totalTimeSeconds = totalTime / 1000;
      const processingSpeed =
        deploymentStats.recordsProcessed / totalTimeSeconds;
      const successRate =
        deploymentStats.recordsProcessed > 0
          ? (deploymentStats.recordsSuccessful /
              deploymentStats.recordsProcessed) *
            100
          : 0;

      setMetrics({
        totalRecords: currentFile.total_rows,
        processedRecords: deploymentStats.recordsProcessed,
        successRate,
        failedRecords: deploymentStats.recordsFailed,
        processingSpeed,
        estimatedTimeRemaining: isDeploying
          ? Math.max(
              0,
              (currentFile.total_rows - deploymentStats.recordsProcessed) /
                processingSpeed
            )
          : 0,
      });
    }
  }, [deploymentStats, currentFile.total_rows, isDeploying]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600)
      return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round(
      (seconds % 3600) / 60
    )}m`;
  };

  // Format processing speed
  const formatSpeed = (recordsPerSecond: number): string => {
    if (recordsPerSecond > 1000) {
      return `${(recordsPerSecond / 1000).toFixed(1)}k records/sec`;
    }
    return `${Math.round(recordsPerSecond)} records/sec`;
  };

  // Get deployment status color
  const getStatusColor = () => {
    if (isDeploying) return 'text-blue-600';
    if (currentFile.upload_status === 'deployed') return 'text-green-600';
    if (currentFile.upload_status === 'failed') return 'text-red-600';
    return 'text-gray-600';
  };

  // Get deployment status message
  const getStatusMessage = () => {
    if (isDeploying) return 'Deployment in progress...';
    if (currentFile.upload_status === 'deployed')
      return 'Deployment completed successfully!';
    if (currentFile.upload_status === 'failed') return 'Deployment failed';
    return 'Ready for deployment';
  };

  return (
    <div className="space-y-6">
      {/* Deployment Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDeploying ? (
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
              ) : currentFile.upload_status === 'deployed' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : currentFile.upload_status === 'failed' ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : (
                <Rocket className="h-6 w-6 text-blue-600" />
              )}
              <div>
                <CardTitle className={getStatusColor()}>
                  {getStatusMessage()}
                </CardTitle>
                <CardDescription>
                  {currentFile.original_filename} •{' '}
                  {currentFile.total_rows.toLocaleString()} total records
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                currentFile.upload_status === 'deployed'
                  ? 'default'
                  : 'secondary'
              }
              className="text-sm"
            >
              {currentFile.upload_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        {/* Deployment Progress */}
        {isDeploying && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Deployment Progress</span>
                  <span>{Math.round(deploymentProgress)}%</span>
                </div>
                <Progress value={deploymentProgress} className="h-2" />
              </div>

              {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-600">
                      {metrics.processedRecords.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-600">
                      {Math.round(metrics.successRate)}%
                    </div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-600">
                      {formatSpeed(metrics.processingSpeed)}
                    </div>
                    <div className="text-muted-foreground">Speed</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-semibold text-orange-600">
                      {formatDuration(metrics.estimatedTimeRemaining)}
                    </div>
                    <div className="text-muted-foreground">Remaining</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Deployment Results - Success */}
      {currentFile.upload_status === 'deployed' && deploymentStats && (
        <div className="space-y-6">
          {/* Success Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Deployment Successful!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your data has been successfully imported into the production
                  database.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {deploymentStats.recordsSuccessful.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Records Imported
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {deploymentStats.tablesUpdated.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tables Updated
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics
                        ? formatDuration(
                            (new Date(deploymentStats.endTime!).getTime() -
                              new Date(deploymentStats.startTime).getTime()) /
                              1000
                          )
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Time
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={onViewData} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    View Imported Data
                  </Button>
                  <Button variant="outline" onClick={onDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={onStartNewImport}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Import Another File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Deployment Details
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
            </CardHeader>
            {showDetails && (
              <CardContent className="space-y-4">
                {/* Processing Summary */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Processing Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>Total Records:</span>
                      <span className="font-medium">
                        {deploymentStats.recordsProcessed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded">
                      <span>Successful:</span>
                      <span className="font-medium text-green-600">
                        {deploymentStats.recordsSuccessful.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-50 rounded">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">
                        {deploymentStats.recordsFailed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded">
                      <span>Success Rate:</span>
                      <span className="font-medium text-blue-600">
                        {metrics ? Math.round(metrics.successRate) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tables Updated */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Database Tables Updated
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {deploymentStats.tablesUpdated.map((table, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-gray-50 rounded"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-mono text-sm">{table}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Deployment Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Started:</span>
                      <span className="font-mono">
                        {new Date(deploymentStats.startTime).toLocaleString()}
                      </span>
                    </div>
                    {deploymentStats.endTime && (
                      <div className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>Completed:</span>
                        <span className="font-mono">
                          {new Date(deploymentStats.endTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {deploymentStats.endTime
                          ? formatDuration(
                              (new Date(deploymentStats.endTime).getTime() -
                                new Date(deploymentStats.startTime).getTime()) /
                                1000
                            )
                          : 'In progress...'}
                      </span>
                    </div>
                    {metrics && (
                      <div className="flex justify-between p-2 bg-purple-50 rounded">
                        <span>Average Speed:</span>
                        <span className="font-medium">
                          {formatSpeed(metrics.processingSpeed)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Deployment Error State */}
      {currentFile.upload_status === 'failed' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                Deployment Failed
              </h3>
              <p className="text-muted-foreground mb-6">
                There was an error during the deployment process. Please review
                the error details and try again.
              </p>

              <Alert variant="destructive" className="mb-6 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error Details:</strong> Unable to deploy data to
                  production database. This could be due to data validation
                  errors, database connectivity issues, or insufficient
                  permissions.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back to Review
                </Button>
                <Button variant="outline" onClick={onDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
                <Button onClick={onStartNewImport}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Start New Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security and Compliance Notice */}
      {currentFile.upload_status === 'deployed' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">
                  Security & Compliance
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All data has been encrypted and stored securely</li>
                  <li>
                    • Import activities have been logged for audit purposes
                  </li>
                  <li>• Access controls and permissions have been applied</li>
                  <li>• Data retention policies are now in effect</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {!isDeploying && (
        <div className="flex justify-between">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Review
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={onStartNewImport}>Import Another File</Button>
          </div>
        </div>
      )}
    </div>
  );
};
