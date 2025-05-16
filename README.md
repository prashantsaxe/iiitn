This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# .env File Configuration

This `.env` file is used to configure environment variables for your application. Please review the file for the necessary settings.

### Accepted Excel File Formats

The system supports the following Excel file formats for upload:

- **File Types:**
  - `.xlsx` (Excel Workbook)
  - `.xls` (Excel 97-2003 Workbook)

- **File Naming Convention (Optional):**
  - Files should have a descriptive name (e.g., `student_data.xlsx`, `placement_details.xls`).
  - Avoid special characters in filenames (e.g., use `-` or `_` instead of spaces).

### Accepted Excel Fields

The Excel file must contain the following fields:

| **Field Name**         | **Description**                                      | **Required/Optional**   |
|------------------------|------------------------------------------------------|-------------------------|
| **Full Name**           | The full name of the student.                        | Required                |
| **Email Address**       | The student's email address.                         | Required                |
| **Password**            | The password for the student account.                | Required                |
| **Branch**              | The branch the student belongs to (e.g., CSE, ECE).  | Required                |
| **Phone Number**        | The student's contact number.                        | Required                |
| **CGPA**                | The student's CGPA (e.g., 8.5).                      | Required                |
| **Active Backlogs**     | The number of active backlogs the student has.       | Required                |
| **Gender**              | The gender of the student (male, female, or other).  | Required                |
| **Hometown**            | The student's hometown.                              | Required                |
| **Date of Birth**       | The student's date of birth (format: YYYY-MM-DD).    | Required                |
| **10th Marks**          | The student's 10th grade marks percentage.           | Required                |
| **12th Marks**          | The student's 12th grade marks percentage.           | Required                |
| **Photo URL**           | A URL to the student's photo (optional).             | Optional                |
| **LinkedIn Profile**    | LinkedIn profile URL (optional).                     | Optional                |
| **GitHub Profile**      | GitHub profile URL (optional).                       | Optional                |
| **Twitter Profile**     | Twitter profile URL (optional).                      | Optional                |
| **Portfolio URL**       | Personal portfolio website URL (optional).           | Optional                |
| **Placed**              | Whether the student has been placed (true/false).    | Required                |
| **Package**             | The offered package (salary) in INR.                 | Optional                |
| **Placement Type**      | The type of placement (intern, fte, or both).        | Optional                |
| **Company**             | The company that made the offer.                     | Optional                |
| **Offer Date**          | The date the offer was made (format: YYYY-MM-DD).    | Optional                |
| **Account Status**      | The account status of the student (active, inactive, blocked). | Required |

### Example:

```env
# Accepted File Extensions
EXCEL_FILE_EXTENSIONS=.xlsx,.xls

# Allowed File Names (Optional)
EXCEL_FILE_NAMES=student_data.xlsx,placement_details.xls

# Accepted File Types for the application
ACCEPTED_FILE_TYPES="xlsx,xls"
