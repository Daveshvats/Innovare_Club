import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authenticatedRequest } from "@/lib/api";
import { Upload, FileText, Users, CheckCircle, AlertCircle } from "lucide-react";

interface CSVUploadProps {
  onSuccess?: () => void;
}

export default function CSVUpload({ onSuccess }: CSVUploadProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      setPreview(data.slice(0, 5)); // Show first 5 rows
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await authenticatedRequest("/api/admin/users/bulk", "POST", formData);
      toast({
        title: "Success",
        description: "Users imported successfully",
      });
      setFile(null);
      setPreview([]);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import users",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "username,email,password\njohn_doe,john@example.com,password123\njane_smith,jane@example.com,password456";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white border-tech-grey/20">
      <CardHeader>
        <CardTitle className="text-tech-dark font-tech flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk User Import
        </CardTitle>
        <CardDescription className="font-tech">
          Upload a CSV file to import multiple users at once
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file" className="font-tech">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="font-tech"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="font-tech"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            {file && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-tech-blue hover:bg-tech-purple text-white font-tech"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Users
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* File Info */}
        {file && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium font-tech">File selected: {file.name}</span>
            </div>
            <p className="text-sm text-blue-600 mt-1 font-tech">
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-tech-dark font-tech">Preview (First 5 rows)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-tech-grey/20">
                <thead>
                  <tr className="bg-tech-grey/10">
                    {Object.keys(preview[0] || {}).map((header) => (
                      <th key={header} className="px-3 py-2 text-left font-medium text-tech-dark border-b border-tech-grey/20">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-b border-tech-grey/20">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-tech-grey">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800 font-tech">
              <p className="font-medium mb-1">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>First row should contain headers: username, email, password</li>
                <li>Each subsequent row should contain user data</li>
                <li>Passwords will be hashed automatically</li>
                <li>Users will be created with "pending" status</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
