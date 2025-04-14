"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Search, Plus, ThumbsUp } from "lucide-react";
import axios from "axios";
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

// Types
interface Topic {
  _id: string;
  title: string;
  company: string;
  content: string;
  tags: string[];
  createdBy: {
    userId: string;
    name: string;
    email?: string;
  };
  likes: {
    count: number;
  };
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
}

interface Company {
  name: string;
  count: number;
}

interface ForumPageProps {
  userId?: string;
}

const ForumPage: React.FC<ForumPageProps> = ({ userId = "guest" }) => {
  // States
  const [topics, setTopics] = useState<Topic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch topics with Axios
  const fetchTopics = useCallback(
    async (refresh = false) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("limit", "10");
        if (lastCreatedAt && !refresh) {
          params.append("lastCreatedAt", lastCreatedAt);
        }
        if (searchParams.get("search")) {
          params.append("search", searchParams.get("search") || "");
        }
        if (activeCompany) {
          params.append("company", activeCompany);
        }

        const response = await axios.get("/api/forum", { params });
        const data = response.data;

        if (refresh) {
          setTopics(data.topics);
        } else {
          setTopics((prev) => [...prev, ...data.topics]);
        }
        setLastCreatedAt(data.lastCreatedAt);
        setHasMore(data.hasMore);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load topics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [lastCreatedAt, searchParams, activeCompany]
  );

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const response = await axios.get("/api/forum/companies");
      setCompanies(response.data.companies || []);
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchTopics(true);
  }, [fetchTopics, activeCompany]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) {
      params.set("search", searchInput);
    }
    router.push(`/student/forum?${params.toString()}`);
  };

  // Handle company filter
  const handleCompanyClick = (companyName: string) => {
    if (activeCompany === companyName) {
      setActiveCompany(null); // Clear filter if already active
    } else {
      setActiveCompany(companyName);
    }
    setLastCreatedAt(null); // Reset pagination when changing filter
  };

  // // Handle like
  // const handleLike = async (topicId: string) => {
  //   try {
  //     const response = await axios.post(`/api/forum/topics/${topicId}/vote`, {
  //       userId,
  //     });

  //     // Update the topic in the list with the updated like status
  //     if (response.data.topic) {
  //       setTopics(prevTopics =>
  //         prevTopics.map(topic =>
  //           topic._id === topicId ? { ...topic,
  //             likes: response.data.topic.likes,
  //             isLiked: response.data.topic.isLiked
  //           } : topic
  //         )
  //       );
  //     }
  //   } catch (err) {
  //     console.error(`Error liking topic ${topicId}:`, err);
  //   }
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Forum Discussions</h1>
        <Link href="/student/forum/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Company Sidebar */}
        <div className="w-64 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>Filter by company</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {companiesLoading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-1">
                  {companies.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">
                      No companies found
                    </p>
                  ) : (
                    <div>
                      {/* All topics option */}
                      <Button
                        variant={activeCompany === null ? "secondary" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => setActiveCompany(null)}
                      >
                        All Companies
                        <Badge variant="outline" className="ml-auto">
                          {companies.reduce(
                            (acc, company) => acc + company.count,
                            0
                          )}
                        </Badge>
                      </Button>

                      <Separator className="my-2" />

                      {companies.map((company) => (
                        <Button
                          key={company.name}
                          variant={
                            activeCompany === company.name
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start text-left"
                          onClick={() => handleCompanyClick(company.name)}
                        >
                          {company.name}
                          <Badge variant="outline" className="ml-auto">
                            {company.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search topics..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-12"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1 rounded-full"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Filter indicator */}
          {activeCompany && (
            <div className="mb-4 flex items-center">
              <p className="text-sm">
                Filtering by company: <strong>{activeCompany}</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCompany(null)}
              >
                Clear filter
              </Button>
            </div>
          )}

          {/* Topics List */}
          {loading && topics.length === 0 ? (
            <Card>
              <CardContent className="p-6">Loading topics...</CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="text-red-500 p-6">{error}</CardContent>
            </Card>
          ) : (
            <div>
              {topics.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    {activeCompany
                      ? `No topics found for company: ${activeCompany}`
                      : "No topics found"}
                  </CardContent>
                </Card>
              ) : (
                topics.map((topic) => (
                  <Card key={topic._id} className="mb-4">
                    <CardHeader className="pb-2">
                      <CardTitle>
                        <Link
                          href={`/student/forum/${topic._id}`}
                          className="hover:underline"
                        >
                          {topic.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{topic.company}</Badge>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {topic.createdBy.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{topic.createdBy.name}</span>
                          <span className="text-gray-500">
                            • {formatDistanceToNow(new Date(topic.createdAt))}{" "}
                            ago
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2">{topic.content}</p>
                      {topic.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {topic.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {/* Like count display (not clickable) */}
                      <div className="flex items-center text-muted-foreground">
                        <ThumbsUp
                          className={`w-4 h-4 mr-1.5 ${
                            topic.isLiked ? "fill-blue-600 text-blue-600" : ""
                          }`}
                        />
                        <span>
                          {topic.likes?.count || 0}{" "}
                          {topic.likes?.count === 1 ? "Like" : "Likes"}
                        </span>
                      </div>

                      {/* Comments link (remains clickable) */}
                      <Link
                        href={`/student/forum/${topic._id}`}
                        className="flex items-center text-muted-foreground hover:text-blue-500"
                      >
                        <MessageSquare className="w-4 h-4 mr-1.5" />
                        {topic.commentsCount || 0}{" "}
                        {topic.commentsCount === 1 ? "Comment" : "Comments"}
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
              {hasMore && (
                <Button
                  onClick={() => fetchTopics()}
                  disabled={loading}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              )}
              {!hasMore && topics.length > 0 && (
                <p className="text-center text-muted-foreground mt-4">
                  No more topics to load.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
