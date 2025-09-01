"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { message } from "antd";
import { OrdersSkeleton } from "@/components/ui/OrderCardSkeleton"; // Adjust path
import { OrderAssignmentCard } from "./Order-Assignment-Card"; // Adjust path

// It's good practice to define a type for your data
type Assignment = {
  id: string;
  // Add other properties of assignment here
};

export default function ProviderOrdersPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  // State for the main page skeleton
  const [isPageLoading, setIsPageLoading] = useState(true);
  // Separate state for the refresh button's spinner
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch("/api/provider-assignments");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data.");
      }

      setAssignments(data);
      return { success: true }; // Return success status
    } catch (error: any) {
      console.error("Fetch error:", error);
      message.error(error.message || "Something went wrong");
      return { success: false }; // Return failure status
    }
  }, []);

  // Effect for the initial data load
  useEffect(() => {
    setIsPageLoading(true);
    fetchAssignments().finally(() => {
      setIsPageLoading(false);
    });
  }, [fetchAssignments]);

  // Effect for auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if not currently refreshing manually and page is not loading
      if (!isRefreshing && !isPageLoading) {
        fetchAssignments();
      }
    }, 5000); // 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchAssignments, isRefreshing, isPageLoading]);

  // Handler for the refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await fetchAssignments();
    if (result.success) {
      message.success("Assignments refreshed!");
    }
    // Always stop the spinner after the fetch is complete
    setIsRefreshing(false);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Assignments</h1>
        <Button
          onClick={handleRefresh}
          // The button is disabled if either the page is loading or it's currently refreshing
          disabled={isPageLoading || isRefreshing}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          {/* The spinner is now controlled by the isRefreshing state */}
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Content Area */}
      {isPageLoading ? (
        <OrdersSkeleton />
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1  gap-6">
          {assignments.map((assignment) => (
            <OrderAssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-black/20 rounded-lg border border-white/10">
          <p className="text-white/80 text-lg">
            You have no order assignments at the moment.
          </p>
          <p className="text-white/50 mt-2">
            Check back later for new coaching opportunities!
          </p>
        </div>
      )}
    </div>
  );
}
