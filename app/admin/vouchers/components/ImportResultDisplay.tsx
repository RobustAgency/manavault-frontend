'use client';

import { CheckCircle2Icon, AlertCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImportResult } from './useVoucherImport';

interface ImportResultDisplayProps {
  result: ImportResult;
}

export const ImportResultDisplay = ({ result }: ImportResultDisplayProps) => {
  return (
    <div className={`p-4 rounded-lg border ${
      result.success 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start gap-3">
        {result.success ? (
          <CheckCircle2Icon className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <p className={`font-medium ${
            result.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {result.message}
          </p>
          
          {result.imported_count !== undefined && (
            <div className="flex gap-4 mt-2">
              {result.imported_count > 0 && (
                <Badge variant="filled" color="success">
                  {result.imported_count} Imported
                </Badge>
              )}
              {result.failed_count !== undefined && result.failed_count > 0 && (
                <Badge variant="filled" color="error">
                  {result.failed_count} Failed
                </Badge>
              )}
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-red-900">Errors:</p>
              <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                {result.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-red-700">
                    And {result.errors.length - 5} more errors...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

