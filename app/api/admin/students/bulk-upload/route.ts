import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Student, studentInterface } from '@/lib/db/models/student';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getServerAuthSession } from '@/lib/auth';
import * as XLSX from 'xlsx'; // For backup export

// Server-side Zod schema (password is optional for updates if not provided)
const studentValidationSchemaServer = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(), // Optional: only hash and update if provided
  branch: z.string().min(1),
  phoneNumber: z.string().min(1),
  cgpa: z.number().min(0).max(10),
  activeBacklogs: z.number().min(0),
  gender: z.enum(["male", "female", "other"]),
  hometown: z.string().min(1),
  dob: z.date(),
  education: z.object({
    tenthMarks: z.number().min(0).max(100),
    twelfthMarks: z.number().min(0).max(100),
  }),
  photo: z.string().url().optional().or(z.literal('')),
  socialMedia: z.object({ /* ... */ }).deepPartial().optional(),
  placement: z.object({
    offerDate: z.date().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
    package: z.number().optional(),
    type: z.enum(["intern", "fte", "both"]).optional(),
  }).deepPartial().optional(),
  accountStatus: z.enum(["active", "inactive", "blocked"]).default("active").optional(),
});

type StudentInput = z.infer<typeof studentValidationSchemaServer>;
type OperationMode = "append" | "replace" | "update";

interface RequestBody {
  students: StudentInput[];
  mode: OperationMode;
}

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body: RequestBody = await request.json();
    const { students: studentsInput, mode } = body;

    if (!Array.isArray(studentsInput) || !mode) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    let replacedCount = 0; // Specifically for replace mode
    const detailedErrors: { index?: number, email?: string, error: string }[] = [];
    let backupFileUrl: string | null = null; // Placeholder for backup file link

    // --- REPLACE MODE ---
    if (mode === 'replace') {
      // 1. Backup (Optional: actual file generation is complex here, simulate or log)
      // For a real backup, you'd fetch, convert to Excel, and store/provide a download.
      // const existingStudents = await Student.find({}).lean();
      // if (existingStudents.length > 0) {
      //   const worksheet = XLSX.utils.json_to_sheet(existingStudents);
      //   const workbook = XLSX.utils.book_new();
      //   XLSX.utils.book_append_sheet(workbook, worksheet, "BackupStudents");
      //   // XLSX.writeFile(workbook, `backup_students_${Date.now()}.xlsx`); // Server-side save
      //   backupFileUrl = `/api/download-backup?file=backup_students_${Date.now()}.xlsx`; // Needs another API
      //   console.log(`Simulated backup of ${existingStudents.length} students.`);
      // }
      console.log('REPLACE MODE: Simulating backup of existing student data.');

      // 2. Delete existing data
      const deleteResult = await Student.deleteMany({});
      console.log(`REPLACE MODE: Deleted ${deleteResult.deletedCount} existing students.`);
      replacedCount = deleteResult.deletedCount || 0; // How many were there before

      // 3. Proceed to insert new data (treated like append after delete)
      // Fall through to the append/insert logic
    }

    // --- APPEND and UPDATE LOGIC ---
    for (let i = 0; i < studentsInput.length; i++) {
      const studentData = studentsInput[i];
      // Coerce date strings to Date objects
      if (studentData.dob && typeof studentData.dob === 'string') {
        studentData.dob = new Date(studentData.dob);
      }
      if (studentData.placement?.offerDate && typeof studentData.placement.offerDate === 'string') {
        studentData.placement.offerDate = new Date(studentData.placement.offerDate);
      }

      const validationResult = studentValidationSchemaServer.safeParse(studentData);
      if (!validationResult.success) {
        failedCount++;
        detailedErrors.push({ index: i, email: studentData.email, error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') });
        continue;
      }

      const validatedStudent = validationResult.data;
      let studentToSave = { ...validatedStudent };

      // Hash password only if it's provided
      if (validatedStudent.password) {
        studentToSave.password = await bcrypt.hash(validatedStudent.password, 10);
      } else {
        // For update mode, if password is not provided, remove it from the object
        // so it doesn't overwrite existing password with undefined.
        // For append/replace, a default password should be handled if schema requires it.
        if (mode === 'update') {
          delete studentToSave.password;
        } else { // Append or Replace
            // If password is truly optional in schema and not provided, it's fine.
            // If schema requires it, you should have a default or error earlier.
            // For this example, assuming schema allows optional password or it's defaulted.
            if (!studentToSave.password) { // If still no password after optional check
                // This case implies password was not in Excel and not defaulted.
                // If your studentInterface *requires* a password, this will fail at DB level
                // or you should assign a default here.
                // For now, we'll let it pass if Zod schema allows optional.
            }
        }
      }


      if (mode === 'update') {
        try {
          const existingStudent = await Student.findOne({ email: studentToSave.email });
          if (existingStudent) {
            // If password is not in studentToSave, it won't be in $set, so existing password is kept
            await Student.updateOne({ email: studentToSave.email }, { $set: studentToSave });
            updatedCount++;
          } else {
            // Student not found, insert as new (if password was provided it's hashed)
            if (!studentToSave.password) { // If new student and no password from excel
                studentToSave.password = await bcrypt.hash('defaultPassword123', 10); // Assign a default
            }
            await Student.create(studentToSave);
            insertedCount++;
          }
        } catch (e: any) {
          failedCount++;
          detailedErrors.push({ email: studentToSave.email, error: `DB Update/Insert Error: ${e.message}` });
        }
      } else { // Append or (Replace after delete)
        try {
          // For append/replace, if password wasn't in Excel, ensure it's set (e.g. default)
          if (!studentToSave.password) {
            studentToSave.password = await bcrypt.hash('defaultPassword123', 10); // Default for new students
          }
          await Student.create(studentToSave);
          insertedCount++;
        } catch (e: any) {
          failedCount++;
          // Check for duplicate key error (code 11000 for MongoDB)
          if (e.code === 11000) {
            detailedErrors.push({ email: studentToSave.email, error: `Duplicate email. Student not added.` });
          } else {
            detailedErrors.push({ email: studentToSave.email, error: `DB Insert Error: ${e.message}` });
          }
        }
      }
    }

    const status = failedCount > 0 ? (insertedCount > 0 || updatedCount > 0 ? 207 : 400) : 201; // 207 Multi-Status, 400 Bad Request, 201 Created
    let message = `Operation finished.`;
    if (mode === 'replace') message = `Data replacement finished.`;
    else if (mode === 'update') message = `Data update finished.`;
    else if (mode === 'append') message = `Data append finished.`;


    return NextResponse.json({
      message,
      data: {
        insertedCount,
        updatedCount,
        failedCount,
        replacedCount: mode === 'replace' ? replacedCount : undefined, // Only relevant for replace
        backupFileUrl: mode === 'replace' ? backupFileUrl : undefined,
      },
      detailedErrors: detailedErrors.length > 0 ? detailedErrors : undefined,
    }, { status });

  } catch (error) {
    console.error(`Error in bulk student upload (mode: ${ (request as any).body?.mode || 'unknown' }):`, error);
    return NextResponse.json({ error: 'Failed to process student data', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}