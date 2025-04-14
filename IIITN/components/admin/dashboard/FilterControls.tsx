import { useState } from "react";
import { Search, Filter, ArrowUpDown, DollarSign, GraduationCap, BarChart4 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface FilterControlsProps {
  branches: string[];
  minCGPA: number;
  maxCGPA: number;
  minSalary: number;
  maxSalary: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  branchFilter: string;
  setBranchFilter: (branch: string) => void;
  cgpaFilter: number | null;
  setCgpaFilter: (cgpa: number | null) => void;
  salaryFilter: number | null;
  setSalaryFilter: (salary: number | null) => void;
// Update this in your component/props interface
internFilter: 'all' | 'intern' | 'fte' | 'both' | 'none' | 'noplacement';
setInternFilter: (type: 'all' | 'intern' | 'fte' | 'both' | 'none' | 'noplacement') => void;
  salaryPercentFilter: number | null;
  setSalaryPercentFilter: (percent: number | null) => void;
  sortField: string;
  setSortField: (field: 'name' | 'cgpa' | 'branch' | 'salary') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  children: React.ReactNode;
}

export function FilterControls({
  branches,
  minCGPA,
  maxCGPA,
  minSalary,
  maxSalary,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  branchFilter,
  setBranchFilter,
  cgpaFilter,
  setCgpaFilter,
  salaryFilter,
  setSalaryFilter,
  internFilter,
  setInternFilter,
  salaryPercentFilter,
  setSalaryPercentFilter,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  children
}: FilterControlsProps) {
  const [salaryPercentValue, setSalaryPercentValue] = useState<number>(salaryPercentFilter || 0);
  
  // CGPA filter states
  const [cgpaInputValue, setCgpaInputValue] = useState('');
  const [cgpaError, setCgpaError] = useState<string>('');
  
  // Salary filter states
  const [salaryInputValue, setSalaryInputValue] = useState('');
  const [salaryError, setSalaryError] = useState<string>('');




  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-5 mb-6 ">
          {/* Apple-style tab list with soft rounded corners and neutral colors */}
          <TabsList className="p-1 bg-gray-100/80 rounded-xl backdrop-blur-sm shadow-inner ">
            <TabsTrigger
              value="all"
              className="px-4 py-2 rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-gray-900 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
            >
              All Students
            </TabsTrigger>
            <TabsTrigger
              value="placed"
              className="px-4 py-2 rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-green-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
            >
              Placed
            </TabsTrigger>
            <TabsTrigger
              value="unplaced"
              className="px-4 py-2 rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-amber-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
            >
              Unplaced
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="px-4 py-2 rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-blue-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="px-4 py-2 rounded-lg text-gray-700 data-[state=active]:!bg-white data-[state=active]:!text-red-800 data-[state=active]:!font-medium data-[state=active]:!shadow-sm transition-all duration-200"
            >
              Inactive
            </TabsTrigger>
          </TabsList>

          {/* Apple-style search input with soft shadows */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Search students..."
                className="pl-10 w-64 h-10 bg-white/80 border-0 rounded-xl shadow-sm ring-1 ring-gray-200/50 focus-visible:ring-2 focus-visible:ring-gray-300 transition-shadow  text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter controls with Apple-style design */}
        <div className="flex flex-wrap items-center gap-3 p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ring-gray-100 mb-6">
          {/* Branch Filter - Apple style select */}
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px] h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-300 transition-all text-gray-700">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent className="rounded-xl overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm text-gray-700">
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>{branch}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CGPA Filter - Apple style popover */}
          {/* CGPA Filter - Apple style popover with manual input */}
          <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 
          ${cgpaFilter ? 'bg-gray-100/70 text-gray-900 font-medium' : 'bg-white text-gray-700 hover:text-gray-700'}
          shadow-sm transition-all duration-200`}
        >
          <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
          {cgpaFilter ? `CGPA: ≥ ${cgpaFilter}` : 'CGPA Filter'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 rounded-xl border-0 overflow-hidden shadow-lg bg-white/95 backdrop-blur-md transition-all duration-200">
        <div className="p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Filter by CGPA</h4>

          {/* Manual CGPA Input with proper validation */}
          <div className="space-y-3">
            <div className="pt-2">
              <label className="text-sm text-gray-700 font-medium mb-1 block">Enter CGPA value</label>
              <Input
                type="number"
                min={minCGPA}
                max={maxCGPA}
                step="0.1"
                value={cgpaInputValue}
                onChange={(e) => setCgpaInputValue(e.target.value)}
                placeholder="Enter value (0-10)"
                className={`h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:!ring-1 focus:ring-gray-300 text-gray-700 ${cgpaError ? 'ring-red-500' : 'focus:ring-gray-300'}`}
              />
              {cgpaError && <p className="text-xs text-red-500 mt-1">{cgpaError}</p>}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setCgpaFilter(null);
                setCgpaError('');
                document.body.click();
              }}
              className="rounded-xl border-0 ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                {
                  const parsed = parseFloat(cgpaInputValue.trim());
                  if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
                    setCgpaFilter(parsed);
                    setCgpaError('');
                  } else {
                    setCgpaError('Enter a value between 0 and 10');
                  }
                }
                document.body.click(); // Close popover on Apply
              }}
              className="rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

          {/* Salary Filter - Apple style popover */}
          <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 
            ${salaryFilter ? 'bg-gray-100/70 text-gray-900 font-medium' : 'bg-white text-gray-700 hover:text-gray-700 '}
            shadow-sm transition-all duration-200`}
        >
          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
          {salaryFilter ? `Salary: ≥ ${salaryFilter}L` : 'Salary Filter'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 rounded-xl border-0 overflow-hidden shadow-lg bg-white/95 backdrop-blur-md">
        <div className="p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Filter by Salary Package</h4>

          {/* Manual Salary Input */}
          <div className="space-y-3">
            <div className="pt-2">
              <label className="text-sm text-gray-700 font-medium mb-1 block">Enter salary value</label>
              <Input
                type="number"
                min={minSalary}
                max={maxSalary}
                value={salaryInputValue}
                onChange={(e) => setSalaryInputValue(e.target.value)}
                placeholder={`Enter salary (${minSalary}L - ${maxSalary}L)`}
                className={`h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:!ring-1 focus:ring-gray-300 text-gray-700 ${salaryError ? 'ring-red-500' : 'focus:ring-gray-300'}`}
              />
              {salaryError && <p className="text-xs text-red-500 mt-1">{salaryError}</p>}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSalaryFilter(null);
                setSalaryInputValue('');  // Clear the input value when resetting
                setSalaryError('');
                document.body.click();
              }}
              className="rounded-xl border-0 ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700"
            >
              Clear
            </Button>
            <Button
              onClick={()=>{
                const parsed = parseFloat(salaryInputValue.trim());
                if (!isNaN(parsed) && parsed >= minSalary && parsed <= maxSalary) {
                  setSalaryFilter(parsed);
                  setSalaryError('');
                } else {
                  setSalaryError(`Enter a valid salary between ${minSalary}L and ${maxSalary}L`);
                }
              }}
              className="rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>

{/* Placement Type Filter - Apple style select */}
<Select
  value={internFilter}
  onValueChange={(value: string) => setInternFilter(value as "all" | "intern" | "fte" | "both" | "none" | "noplacement")}>
  <SelectTrigger className="w-[180px] h-9 rounded-xl bg-white border-0 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-300 transition-all text-gray-700">
    <SelectValue placeholder="Placement Type" />
  </SelectTrigger>
  <SelectContent className="rounded-xl overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm text-gray-700">
    <SelectItem value="all">All Types</SelectItem>
    <SelectItem value="intern">Intern Only</SelectItem>
    <SelectItem value="fte">FTE Only</SelectItem>
    <SelectItem value="both">Both</SelectItem>
    <SelectItem value="none">Not Placed (No FTE)</SelectItem>
    <SelectItem value="noplacement">No Placement At All</SelectItem>
  </SelectContent>
</Select>

          {/* Special Percentage Salary Filter - Apple style */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 
                  ${salaryPercentFilter ? 'bg-gray-100/70 text-gray-900 font-medium' : 'bg-white text-gray-700 hover:text-gray-700'}
                  shadow-sm transition-all duration-200`}
              >
                <BarChart4 className="h-4 w-4 mr-2 text-gray-500" />
                {salaryPercentFilter ? `Salary %: ${salaryPercentFilter}%` : 'Salary % Filter'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-xl border-0 overflow-hidden shadow-lg bg-white/95 backdrop-blur-md">
              <div className="p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Salary Percentage Filter</h4>
                <p className="text-sm text-gray-600">
                  Show unplaced students OR placed students with salary ≥ the specified percentage.
                </p>
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>0%</span>
                      <span className="font-medium text-gray-900">{salaryPercentValue}%</span>
                      <span>100%</span>
                    </div>
                    <Slider
                      value={[salaryPercentValue]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value: number[]) => setSalaryPercentValue(value[0])}
                      className="py-4"
                    />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSalaryPercentFilter(null);
                        setSalaryPercentValue(0);
                      }}
                      className="rounded-xl border-0 ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => {
                        setSalaryPercentFilter(salaryPercentValue);
                        document.body.click();
                      }}
                      className="rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sorting Options - Apple style dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-xl border-0 ring-1 ring-gray-200 hover:ring-gray-300 bg-white shadow-sm transition-all duration-200 text-gray-700 hover:text-gray-700"
              >
                <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                Sort: {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] p-1 rounded-xl border-0 shadow-lg bg-white/95 backdrop-blur-md"
            >
              <DropdownMenuLabel className="px-3 py-2 text-gray-600 text-xs font-medium">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={() => { setSortField('name'); setSortDirection('asc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setSortField('name'); setSortDirection('desc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setSortField('cgpa'); setSortDirection('desc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                CGPA (Highest first)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setSortField('cgpa'); setSortDirection('asc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                CGPA (Lowest first)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setSortField('branch'); setSortDirection('asc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                Branch (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setSortField('salary'); setSortDirection('desc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                Salary (Highest first)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setSortField('salary'); setSortDirection('asc'); }}
                className="px-3 py-2 rounded-lg focus:bg-gray-100 cursor-default text-gray-800"
              >
                Salary (Lowest first)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Render children (table content) */}
        <div className="transition-all duration-300">
          {children}
        </div>
      </Tabs>
    </div>
  );
}