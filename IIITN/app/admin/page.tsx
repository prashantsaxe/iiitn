"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiUsers, FiUserCheck, FiUserX, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Student } from '@/lib/db/models/student';
import React from 'react';

// Types for our data
interface StudentData {
  _id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  placement: {
    placed: boolean;
    company?: string;
    package?: number;
    type?: 'intern' | 'fte' | 'both';
  };
  accountStatus: 'active' | 'inactive';
  photo?: string;
}

// Dashboard statistics type
interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  averageCGPA: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    placedStudents: 0,
    unplacedStudents: 0,
    averageCGPA: 0
  });
  
  // Filtering and sorting states
  const [placementFilter, setPlacementFilter] = useState<'all' | 'placed' | 'unplaced'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'cgpa' | 'branch'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique branches for filter dropdown
  const branches = Array.from(new Set(students.map(s => s.branch)));
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchStudents();
    }
  }, [status]);
  
  useEffect(() => {
    if (students.length > 0) {
      // Calculate dashboard stats
      const totalStudents = students.length;
      const placedStudents = students.filter(s => s.placement.placed).length;
      const unplacedStudents = totalStudents - placedStudents;
      const averageCGPA = students.reduce((sum, student) => sum + student.cgpa, 0) / totalStudents;
      
      setStats({
        totalStudents,
        placedStudents,
        unplacedStudents,
        averageCGPA
      });
      
      // Apply initial filtering and sorting
      applyFiltersAndSort();
    }
  }, [students]);
  
  // Apply filtering and sorting when any filter/sort parameter changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [placementFilter, branchFilter, sortField, sortDirection, searchTerm]);
  
  async function fetchStudents() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data);
        setFilteredStudents(result.data);
      } else {
        setError(result.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  function applyFiltersAndSort() {
    let filtered = [...students];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.email.toLowerCase().includes(term) ||
        s.branch.toLowerCase().includes(term)
      );
    }
    
    // Apply placement filter
    if (placementFilter !== 'all') {
      filtered = filtered.filter(s => 
        placementFilter === 'placed' ? s.placement.placed : !s.placement.placed
      );
    }
    
    // Apply branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(s => s.branch === branchFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'branch') {
        return sortDirection === 'asc' 
          ? a.branch.localeCompare(b.branch) 
          : b.branch.localeCompare(a.branch);
      } else { // cgpa
        return sortDirection === 'asc' 
          ? a.cgpa - b.cgpa 
          : b.cgpa - a.cgpa;
      }
    });
    
    setFilteredStudents(filtered);
  }
  
  function toggleSortDirection() {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 max-w-md bg-red-50 rounded-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-700">You need to be logged in as an administrator to access this dashboard.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => window.location.href = '/auth/signin'}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <FiUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Total Students</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <FiUserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Placed Students</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.placedStudents}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <FiUserX className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Unplaced Students</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.unplacedStudents}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <div className="h-6 w-6 text-purple-600 font-bold text-center">GPA</div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Average CGPA</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.averageCGPA.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters section */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Students</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                id="search"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="placement" className="block text-sm font-medium text-gray-700">Placement Status</label>
              <select
                id="placement"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value as 'all' | 'placed' | 'unplaced')}
              >
                <option value="all">All Students</option>
                <option value="placed">Placed Only</option>
                <option value="unplaced">Unplaced Only</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
              <select
                id="branch"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700">Sort By</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  id="sort"
                  className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as 'name' | 'cgpa' | 'branch')}
                >
                  <option value="name">Name</option>
                  <option value="cgpa">CGPA</option>
                  <option value="branch">Branch</option>
                </select>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                  onClick={toggleSortDirection}
                >
                  {sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Students table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Student Records</h2>
            <span className="text-sm text-gray-500">Showing {filteredStudents.length} of {students.length} students</span>
          </div>
          
          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No students match your filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CGPA
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Backlog
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
                              alt={student.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{student.branch}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">{student.cgpa.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${student.activeBacklogs > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {student.activeBacklogs}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.placement.placed ? (
                          <div>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Placed
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {student.placement.company} - ₹{(student.placement.package! / 100000).toFixed(1)}L
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Not Placed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.accountStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.accountStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href={`/admin/students/${student._id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </a>
                        <a href={`/admin/students/${student._id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}