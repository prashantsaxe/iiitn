'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Search, Plus, ThumbsUp } from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

// Types
interface Topic {
  // ...existing code...
}

interface Company {
  // ...existing code...
}

interface ForumPageProps {
  userId?: string;
}

const ForumClientComponent: React.FC<ForumPageProps> = ({ userId = "guest" }) => {
  // States
  // ...existing code...
  const router = useRouter();
  const searchParams = useSearchParams(); // This is now correctly in a Client Component

  // Fetch topics with Axios
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  // Handle company filter
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  
  const fetchTopics = useCallback(async (resetPage = false) => {
    try {
      setLoadingTopics(true);
      const searchQuery = searchParams.get('search') || '';
      const companyFilter = activeCompany || '';
      
      const response = await axios.get('/api/topics', {
        params: { search: searchQuery, company: companyFilter }
      });
      
      setTopics(response.data);
      setLoadingTopics(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoadingTopics(false);
    }
  }, [searchParams, activeCompany]);
  
  // Fetch companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCompanies = async () => {
    try {
      // Fetch companies logic should be here
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setLoading(false);
    }
  };
  
  const handleCompanyFilter = (companyId: string | null) => {
    setActiveCompany(companyId);
  };
  
  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchTopics(true);
    // Removed fetchTopics from dependency array as it causes infinite loops if not memoized perfectly with all its own dependencies.
    // The activeCompany change will trigger this.
  }, [activeCompany, searchParams]); // searchParams added to re-fetch on query change

  // Handle search
  // ...existing code...
  // Handle company filter
  // ...existing code...
  // Handle like
  // const handleLike = async (topicId: string) => {
  // ...existing code...
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your entire forum page JSX structure goes here */}
      <p>Forum content will be rendered here.</p>
      <p>Search query from URL: {searchParams.get('search') || 'none'}</p>
    </div>
  );
};

export default ForumClientComponent;
