"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, Award } from "lucide-react";
import { message } from "antd";
import { OverviewSkeleton } from "@/components/ui/OverviewSkeleton";
import { lato, orbitron } from "@/fonts/fonts";
import SafeImage from "@/components/ui/SafeImage";
import { QueueOverview } from "./QueueOverview";

// --- Sub-Components for the page ---

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  description: string;
  onClick?: () => void;
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
  onClick,
}: StatCardProps) => (
  <div
    style={{ borderColor: "#EE2C81", cursor: onClick ? "pointer" : "default" }}
    className={`bg-black/30 backdrop-blur-sm p-6 rounded-lg border-l-4 shadow-lg transition-all duration-200 ${
      onClick ? "hover:shadow-pink-500/30 hover:bg-black/40" : ""
    }`}
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? "button" : undefined}
    aria-label={onClick ? `Go to ${title} tab` : undefined}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-white/70">{title}</h3>
      <Icon className="w-5 h-5 text-pink-400" />
    </div>
    <div className="mt-2">
      <p className={`text-3xl font-bold text-white ${orbitron.className}`}>
        {value}
      </p>
      <p className="text-xs text-white/50 mt-1">{description}</p>
    </div>
  </div>
);

type GameStat = {
  gameImage: string;
  gameName: string;
  completed: number;
  verified: number;
  earnings: string;
};

const GameStatCard = ({ game }: { game: GameStat }) => (
  <div className="bg-[#3A0F2A]/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 flex items-center space-x-4 ">
    <SafeImage
      src={game.gameImage}
      alt={game.gameName}
      className="w-20 h-20 rounded-md object-cover"
      placeholder="/images/placeholder.png"
    />
    <div className="flex-1">
      <h4 className={`text-lg font-bold text-white ${orbitron.className}`}>
        {game.gameName}
      </h4>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-sm text-white/60">Completed</p>
          <p className="text-xl font-bold text-white">{game.completed}</p>
        </div>
        <div>
          <p className="text-sm text-white/60">Verified</p>
          <p className="text-xl font-bold text-cyan-400">{game.verified}</p>
        </div>
        <div>
          <p className="text-sm text-white/60">Earnings</p>
          <p className="text-xl font-bold text-green-400">
            ${parseFloat(game.earnings).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

export default function ProviderOverviewPage() {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchData = async (showSkeleton: boolean = false) => {
    try {
      if (!hasLoaded && showSkeleton) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await fetch("/api/provider-overview");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch overview.");
      }

      setOverviewData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      // @ts-ignore
      message.error((error?.message as string) || "something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (!hasLoaded) setHasLoaded(true);
    }
  };

  useEffect(() => {
    const id = setInterval(() => fetchData(false), 8000);
    fetchData(true);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <OverviewSkeleton />;
  }

  if (!overviewData) {
    return (
      <div className="text-center text-white/70">
        Could not load overview data. Please try again later.
      </div>
    );
  }

  const { provider, totalEarnings, totalCompleted, totalVerified, gameStats } =
    overviewData;

  // Handlers for stat cards to switch tabs
  interface SwitchTabEventDetail {
    tab: string;
  }

  type TabName = "earnings" | "orders" | string;

  const handleGoToTab = (tab: TabName) => {
    window.dispatchEvent(
      new CustomEvent<SwitchTabEventDetail>("provider-dashboard-switch-tab", {
        detail: { tab },
      })
    );
  };

  return (
    <div className={`p-4 md:p-6 ${lato.className}`}>
      {/* Header */}
      {/* ...existing code... */}

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon={DollarSign}
          title="Total Earnings"
          value={`$${parseFloat(totalEarnings).toFixed(2)}`}
          description="Earnings from all verified orders"
          onClick={() => handleGoToTab("earnings")}
        />
        <StatCard
          icon={CheckCircle}
          title="Completed Orders"
          value={totalCompleted}
          description="All orders marked as complete"
          onClick={() => handleGoToTab("orders")}
        />
        <StatCard
          icon={Award}
          title="Verified Orders"
          value={totalVerified}
          description="Orders verified and paid out"
          onClick={() => handleGoToTab("orders")}
        />
      </div>

      <div>
        <QueueOverview />
      </div>

      {/* Game-by-Game Performance */}
      <div>
        <h2
          className={`text-2xl font-bold text-white mb-6 ${orbitron.className}`}
        >
          Performance by Game
        </h2>
        {gameStats.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gameStats.map((game) => (
              <GameStatCard key={game.gameName} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#3A0F2A]/30 rounded-lg">
            <p className="text-white/70">
              No completed orders yet. Finish some orders to see your stats
              here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
