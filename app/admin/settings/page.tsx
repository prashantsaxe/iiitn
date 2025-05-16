"use client";

import React, { useState, useCallback, JSX } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// ... (studentValidationSchema remains the same)
const studentValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  branch: z.string().min(1, "Branch is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  cgpa: z.number().min(0).max(10),
  activeBacklogs: z.number().min(0),
  gender: z.enum(["male", "female", "other"]),
  hometown: z.string().min(1, "Hometown is required"),
  dob: z.date({ coerce: true }),
  education: z.object({
    tenthMarks: z.number().min(0).max(100),
    twelfthMarks: z.number().min(0).max(100),
  }),
  photo: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
  }).optional(),
  placement: z.object({
    placed: z.boolean(),
    package: z.number().optional(),
    type: z.enum(["intern", "fte", "both"]).optional(),
    company: z.string().optional(),
    offerDate: z.date({ coerce: true }).optional(),
  }).optional(),
  accountStatus: z.enum(["active", "inactive", "blocked"]).default("active").optional(),
});

type ParsedStudent = z.infer<typeof studentValidationSchema>;
type OperationMode = "append" | "replace" | "update";

type UploadStatusType = { type: 'success' | 'error'; message: string | JSX.Element };


export default function AdminSettingsPage() {
  const [rawJsonData, setRawJsonData] = useState<any[]>([]); // For raw preview
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatusType | null>(null);
  const [operationMode, setOperationMode] = useState<OperationMode>("append");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadStatus(null);
    setValidationErrors([]);
    setParsedStudents([]);
    setRawJsonData([]); // Reset raw data
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      setIsProcessing(true);
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, {
            raw: false, // Keep false for better date handling with cellDates
            dateNF: 'yyyy-mm-dd', // Helps if cellDates isn't perfect
          });

          setRawJsonData(jsonData.slice(0, 5)); // Store first 5 raw rows for preview

          const students: ParsedStudent[] = [];
          const errors: string[] = [];

          jsonData.forEach((row, index) => {
            // Excel row numbers are typically 1-based, and headers are row 1.
            // So, data starts at Excel row 2, which is index 0 here.
            const excelRowNumber = index + 2;

            const mappedRow = {
              name: row["Full Name"] || row["name"],
              email: row["Email Address"] || row["email"],
              password: row["Password"] || row["password"],
              branch: row["Branch"] || row["branch"],
              phoneNumber: row["Phone Number"] || row["phoneNumber"],
              cgpa: parseFloat(row["CGPA"] || row["cgpa"]),
              activeBacklogs: parseInt(row["Active Backlogs"] || row["activeBacklogs"], 10),
              gender: (row["Gender"] || row["gender"])?.toLowerCase(),
              hometown: row["Hometown"] || row["hometown"],
              dob: row["Date of Birth"] || row["dob"],
              education: {
                tenthMarks: parseFloat(row["10th Marks"] || row.education?.tenthMarks),
                twelfthMarks: parseFloat(row["12th Marks"] || row.education?.twelfthMarks),
              },
              placement: {
                placed: String(row["Placed"] || row.placement?.placed).toLowerCase() === 'true',
                package: row.placement?.package ? parseFloat(row.placement.package) : undefined,
                type: row.placement?.type,
                company: row.placement?.company,
                offerDate: row.placement?.offerDate,
              },
              accountStatus: (row["Account Status"] || row.accountStatus)?.toLowerCase() || "active",
              photo: row["Photo URL"] || row["photo"],
              socialMedia: {
                linkedin: row["LinkedIn Profile"] || row.socialMedia?.linkedin,
                github: row["GitHub Profile"] || row.socialMedia?.github,
                twitter: row["Twitter Profile"] || row.socialMedia?.twitter,
                portfolio: row["Portfolio URL"] || row.socialMedia?.portfolio,
              }
            };

            const validationResult = studentValidationSchema.safeParse(mappedRow);
            if (validationResult.success) {
              students.push(validationResult.data);
            } else {
              errors.push(
                `Excel Row ${excelRowNumber}: ${validationResult.error.errors.map((e) => `${e.path.join('.')} - ${e.message}`).join('; ')}`
              );
            }
          });

          setParsedStudents(students);
          setValidationErrors(errors);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          setValidationErrors(["Failed to parse Excel file. Ensure it's a valid .xlsx or .xls file and the format is correct."]);
          setRawJsonData([]); // Clear raw data on parsing error
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  }, [operationMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

 const handleSeedData = async () => {
    if (parsedStudents.length === 0) {
      setUploadStatus({ type: 'error', message: 'No valid student data to seed. Please check the file or validation errors.' });
      return;
    }

    setIsProcessing(true);
    setUploadStatus(null);
    try {
      const response = await fetch('/api/admin/students/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents, mode: operationMode }),
      });

      const result = await response.json();

      if (response.ok || response.status === 207) {
        const backendData = result.data || {};
        const processed = backendData.processedCount || 0;
        const inserted = backendData.insertedCount || 0;
        const updated = backendData.updatedCount || 0;
        const replaced = backendData.replacedCount || 0; // This is from backend for 'replace' mode
        const failedDB = backendData.failedCount || 0;

        const messageParts: JSX.Element[] = [];
        messageParts.push(<span key="mainMsg">{result.message || `Operation successful.`}</span>);

        if (processed > 0 || inserted > 0 || updated > 0 || (operationMode === 'replace' && replaced >=0) || failedDB > 0) {
            messageParts.push(<br key="br1" />);
            messageParts.push(<span key="processed" className="mr-2">Attempted: {processed}.</span>);
        }

        if (inserted > 0) {
          messageParts.push(<span key="inserted" className="text-green-600 dark:text-green-400 mr-2">Added: {inserted}.</span>);
        }
        if (updated > 0) {
          messageParts.push(<span key="updated" className="text-orange-600 dark:text-orange-400 mr-2">Updated: {updated}.</span>);
        }
        if (operationMode === 'replace' && replaced >= 0) { // Show even if 0 for clarity in replace mode
          messageParts.push(<span key="replaced" className="text-purple-600 dark:text-purple-400 mr-2">Old Records Deleted: {replaced}.</span>);
        }
        if (failedDB > 0) {
          messageParts.push(<span key="failed" className="text-red-600 dark:text-red-400">Failed in DB: {failedDB}.</span>);
        }

        if (backendData.backupFileUrl && operationMode === 'replace') {
          messageParts.push(<br key="br2" />);
          messageParts.push(<span key="backup">Previous data backed up.</span>);
        }
        
        // Display detailed errors from backend if any
        if (result.detailedErrors && result.detailedErrors.length > 0) {
            messageParts.push(<br key="br3" />);
            messageParts.push(<strong key="details-title">Details of DB failures:</strong>);
            const errorList = result.detailedErrors.map((err: {email?: string, error: string}, index: number) => (
                <li key={`detail-${index}`} className="text-xs">
                    {err.email ? `Email ${err.email}: ` : ''}{err.error}
                </li>
            ));
            messageParts.push(<ul key="details-ul" className="list-disc list-inside max-h-20 overflow-y-auto">{errorList}</ul>)
        }


        setUploadStatus({ type: 'success', message: <>{messageParts}</> });
        setParsedStudents([]);
        setRawJsonData([]);
        setValidationErrors([]);
        setFileName(null);
      } else {
        // For error messages, also try to display detailedErrors if present
        let errorMessage: string | JSX.Element = result.error || `Failed to process data. Status: ${response.status}`;
        if (result.detailedErrors && result.detailedErrors.length > 0) {
            const errorDetails = result.detailedErrors.map((err: {email?: string, error: string}, index: number) => (
                 <li key={`err-detail-${index}`} className="text-xs">
                    {err.email ? `Email ${err.email}: ` : ''}{err.error}
                </li>
            ));
            errorMessage = <>
                {errorMessage}
                <br />
                <strong>Details:</strong>
                <ul className="list-disc list-inside max-h-20 overflow-y-auto">{errorDetails}</ul>
            </>;
        }
        setUploadStatus({ type: 'error', message: errorMessage });
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      setUploadStatus({ type: 'error', message: 'An unexpected error occurred during seeding. Check console for details.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Student Data Bulk Upload</h1>

      {/* Operation Mode Selection */}
      <div className="mb-6 p-4 border rounded-lg bg-card">
        <Label className="text-lg font-semibold mb-2 block">Operation Mode:</Label>
        <RadioGroup
          value={operationMode}
          onValueChange={(value: OperationMode) => setOperationMode(value)}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="append" id="append" />
            <Label htmlFor="append">Append Data (Add new students, skip duplicates)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="update" id="update" />
            <Label htmlFor="update">Update Existing (Match by email, update fields; optionally add new)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="replace" id="replace" />
            <Label htmlFor="replace">Replace All Data (Backup old, then insert new)</Label>
          </div>
        </RadioGroup>
        {operationMode === 'replace' && (
            <Alert variant="destructive" className="mt-3 text-sm">
                <AlertTitle>Warning!</AlertTitle>
                <AlertDescription>
                Replace mode will first attempt to backup existing student data, then delete ALL current students, and then insert the new data. This is a destructive operation.
                </AlertDescription>
            </Alert>
        )}
         {operationMode === 'update' && (
            <Alert variant="default" className="mt-3 text-sm">
                <AlertDescription>
                Update mode will try to match students by email. If a password column is present and filled in your Excel, it will be updated. Otherwise, existing passwords remain unchanged. New students (not matched by email) will be added.
                </AlertDescription>
            </Alert>
        )}
      </div>

      {/* File Dropzone */}
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">Drop the Excel file here ...</p>
        ) : (
          <p>Drag 'n' drop an Excel file here, or click to select file (.xlsx, .xls)</p>
        )}
      </div>

      {fileName && <p className="mt-4 text-sm">Selected file: {fileName}</p>}
      {isProcessing && <Progress value={50} className="w-full mt-4" />} {/* Or use an indeterminate progress bar */}

      {/* Upload Status Messages */}
      {uploadStatus && (
        <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'} className="mt-4">
          <AlertTitle>{uploadStatus.type === 'success' ? 'Operation Successful!' : 'Operation Failed!'}</AlertTitle>
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* 1. Raw Data Preview (if file processed) */}
      {rawJsonData.length > 0 && !isProcessing && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Raw Data Preview (First 5 rows from Excel):</h3>
          <div className="overflow-x-auto bg-muted/50 p-4 rounded-md shadow text-xs">
            <pre>{JSON.stringify(rawJsonData, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* 2. Validation Errors (Red Rows) */}
      {validationErrors.length > 0 && !isProcessing && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-2">
            Rows with Validation Errors (These will NOT be processed):
          </h3>
          <ul className="list-disc list-inside bg-red-500/10 p-4 rounded-md max-h-60 overflow-y-auto">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-400">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Qualified Students (Blue Rows) */}
{parsedStudents.length > 0 && !isProcessing && (
  <div className="mt-6 space-y-4">
    <h3 className="text-xl font-semibold text-primary">
      Students Qualified for Processing ({parsedStudents.length})
    </h3>

    <div className="overflow-x-auto rounded-lg border bg-gradient-to-br from-muted/10 to-muted/30 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <tr>
            <th className="sticky left-0 z-10 bg-primary/5 px-4 py-3 text-left font-semibold text-primary/90 backdrop-blur-sm">
              Intended Action
            </th>
            {Object.keys(parsedStudents[0]).map((key) => (
              <th
                key={key}
                className="px-4 py-3 text-left font-semibold text-primary/80 capitalize"
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {parsedStudents.map((student, rowIndex) => {
            let intendedActionText = "";
            let actionColorClass = "";
            let rowHighlightClass = "";

            switch (operationMode) {
              case "append":
                intendedActionText = "Add (if new)";
                actionColorClass = "text-emerald-600 dark:text-emerald-300 font-medium";
                rowHighlightClass = "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10";
                break;
              case "update":
                intendedActionText = "Update / Add";
                actionColorClass = "text-amber-600 dark:text-amber-300 font-medium";
                rowHighlightClass = "hover:bg-amber-50/50 dark:hover:bg-amber-900/10";
                break;
              case "replace":
                intendedActionText = "Replace All";
                actionColorClass = "text-violet-600 dark:text-violet-300 font-medium";
                rowHighlightClass = "hover:bg-violet-50/50 dark:hover:bg-violet-900/10";
                break;
            }

            return (
              <tr
                key={rowIndex}
                className={`${rowHighlightClass} ${
                  rowIndex % 2 === 0 
                    ? "bg-white dark:bg-gray-950" 
                    : "bg-gray-50/80 dark:bg-gray-900/80"
                } transition-colors duration-150`}
              >
                <td className={`sticky left-0 z-10 px-4 py-3 ${actionColorClass} ${
                  rowIndex % 2 === 0 
                    ? "bg-white dark:bg-gray-950" 
                    : "bg-gray-50/80 dark:bg-gray-900/80"
                } backdrop-blur-sm`}>
                  {intendedActionText}
                </td>

                {Object.keys(student).map((key) => {
                  const value = student[key as keyof ParsedStudent];
                  let displayValue: string | JSX.Element = "";

                  if (value instanceof Date) {
                    displayValue = value.toISOString().split('T')[0]; // YYYY-MM-DD
                  } else if (typeof value === 'object' && value !== null) {
                    const objEntries = Object.entries(value)
                      .filter(([_, val]) => val !== undefined && val !== null && val !== '')
                      .map(([objKey, objVal]) => (
                        <div key={objKey} className="text-xs">
                          <span className="font-medium text-primary/70 dark:text-primary/60 capitalize">
                            {objKey.replace(/([A-Z])/g, ' $1').trim()}:
                          </span> 
                          <span className="ml-1 text-gray-700 dark:text-gray-300">
                            {String(objVal)}
                          </span>
                        </div>
                      ));
                    displayValue = objEntries.length > 0 ? 
                      <div className="space-y-0.5">{objEntries}</div> : 
                      <span className="text-gray-400/80 dark:text-gray-500">N/A</span>;
                  } else if (typeof value === 'boolean') {
                    displayValue = value ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-rose-500/80 dark:text-rose-400">No</span>
                    );
                  } else {
                    displayValue = (value === null || value === undefined || String(value).trim() === "")
                      ? <span className="text-gray-400/80 dark:text-gray-500">N/A</span>
                      : <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
                  }

                  return (
                    <td key={key} className="px-4 py-3 align-top">
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <Button
        onClick={handleSeedData}
        disabled={isProcessing}
        className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-primary/30 transition-all"
      >
        {isProcessing
          ? <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Processing...</span>
          : `Process ${parsedStudents.length} Qualified Students (${operationMode} mode)`}
      </Button>

      {validationErrors.length > 0 && (
        <div className="flex-1 text-sm text-amber-600 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-2 rounded-md border border-amber-200 dark:border-amber-800/50">
          <span className="font-medium">Note:</span> Only valid students listed above will be processed. {validationErrors.length} row(s) with errors were skipped.
        </div>
      )}
    </div>
  </div>
)}

      {/* Message if a file was processed but no students passed validation and no raw data to show */}
      {fileName && !isProcessing && parsedStudents.length === 0 && rawJsonData.length === 0 && (
         <p className="mt-4 text-muted-foreground">
           {validationErrors.length > 0
             ? "No students passed validation. Please check the errors listed above or the file format."
             : "No student data found in the uploaded file, or the file could not be parsed."}
         </p>
       )}
    </div>
  );
}