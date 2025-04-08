import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function Dashboard() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const router = useRouter();
  const acceptableFileInputcsv = ".csv, .txt, .tsv, .xls, .xlsx, .json";

  const onFileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const csvFile = e.target.files?.[0];
    if (!csvFile) return;

    Papa.parse<Record<string, string>>(csvFile, {
      skipEmptyLines: true,
      header: true,
      complete: function (result : any) {
        setCsvData(result.data);
      },
    });
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.authenticated) {
          setIsAuth(true);
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.push("/signin");
      }
    }
    checkAuth();
  }, [router]);

  if (isAuth === null) return <p>Checking authentication...</p>;

  return (
    <>
      <h1>Welcome to your Dashboard</h1>
      <div className="mt-4">
        <label htmlFor="csvFileSelector">
          <Button asChild>
            <span>
              <Upload /> Upload CSV file
            </span>
          </Button>
        </label>
        <input
          type="file"
          accept={acceptableFileInputcsv}
          onChange={onFileChangeHandler}
          id="csvFileSelector"
          className="hidden"
        />
      </div>

      {csvData.length > 0 && (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(csvData[0]).map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, idx) => (
                    <TableCell key={idx}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}