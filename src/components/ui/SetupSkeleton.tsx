import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SetupSkeleton() {
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 animate-pulse">
      {/* Header */}
      <div className="h-20 sm:h-24 md:h-32 bg-gray-800/50 rounded-lg flex items-end p-3 sm:p-4">
        <div className="h-8 sm:h-9 md:h-10 bg-gray-700/50 rounded w-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (Details) */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="h-5 sm:h-6 bg-gray-700/50 rounded w-24 sm:w-32"></div>
            </CardHeader>
            <CardContent className="flex items-center space-x-3 sm:space-x-4 pt-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600/50"></div>
              <div className="h-4 sm:h-5 bg-gray-700/50 rounded w-20 sm:w-24"></div>
            </CardContent>
          </Card>
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="h-5 sm:h-6 bg-gray-700/50 rounded w-24 sm:w-32"></div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="h-3 sm:h-4 bg-gray-700/50 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-700/50 rounded w-5/6"></div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Chat & Actions) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="h-5 sm:h-6 bg-gray-700/50 rounded w-32 sm:w-40"></div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="h-6 sm:h-8 bg-gray-800/50 rounded-full w-full"></div>
              <div className="h-8 sm:h-10 bg-gray-700/50 rounded-md w-28 sm:w-36 ml-auto"></div>
            </CardContent>
          </Card>
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 h-64 sm:h-80 md:h-96">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="h-5 sm:h-6 bg-gray-700/50 rounded w-20 sm:w-24"></div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
