// src/components/ui/GamesSkeleton.tsx
import React from "react";

const GamesSkeleton = () => {
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pt-0 animate-pulse">
      <div className="max-w-6xl h-full mx-auto">
        {/* Stepper Skeleton */}
        <div className="flex items-center justify-center mb-8 sm:mb-10 md:mb-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-700 border-2 border-gray-600"></div>
                <div className="mt-1 sm:mt-2 h-3 sm:h-4 w-12 sm:w-16 md:w-20 bg-gray-700 rounded-md"></div>
              </div>
              {index < 2 && <div className="w-8 sm:w-12 md:w-20 h-0.5 mx-2 sm:mx-3 md:mx-4 bg-gray-600"></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Game Selection Skeleton */}
        <div className="mb-2">
          {/* Title and description */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="h-8 sm:h-9 md:h-10 bg-gray-700 rounded-md w-64 sm:w-80 md:w-96 mx-auto mb-3 sm:mb-4"></div>
            <div className="h-4 sm:h-5 md:h-6 bg-gray-700 rounded-md w-56 sm:w-72 md:w-80 mx-auto"></div>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg sm:rounded-xl p-1"
                style={{
                  background:
                    "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                }}
              >
                <div className="bg-[#5E2047] rounded-lg sm:rounded-xl overflow-hidden">
                  <div className="aspect-[5/4] bg-gray-700"></div>
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="h-5 sm:h-6 bg-gray-600 rounded-md w-3/4 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicesStepSkeleton = () => {
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pt-0 animate-pulse">
      <div className="max-w-7xl h-full mx-auto">
        {/* Stepper Skeleton */}
        <div className="flex items-center justify-center mb-8 sm:mb-10 md:mb-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 ${
                    index < 2
                      ? "bg-pink-500 border-pink-500"
                      : "bg-gray-700 border-gray-600"
                  }`}
                >
                  {index === 0 && (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white m-2 sm:m-2.5 md:m-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {index === 1 && (
                    <span className="text-white text-sm sm:text-base md:text-lg font-bold leading-8 sm:leading-10 md:leading-12 text-center block mt-1 sm:mt-1.5 md:mt-2">
                      2
                    </span>
                  )}
                </div>
                <div className="mt-1 sm:mt-2 h-3 sm:h-4 w-12 sm:w-16 md:w-20 bg-gray-700 rounded-md"></div>
              </div>
              {index < 2 && (
                <div
                  className={`w-8 sm:w-12 md:w-20 h-0.5 mx-2 sm:mx-3 md:mx-4 ${
                    index === 0 ? "bg-pink-500" : "bg-gray-600"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step 2: Service Selection Skeleton */}
        <div className="mb-2">
          {/* Title and description */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-8 sm:h-9 md:h-10 bg-gray-700 rounded-md w-64 sm:w-72 md:w-80 mx-auto mb-3 sm:mb-4"></div>
            <div className="h-5 sm:h-6 bg-gray-700 rounded-md w-72 sm:w-80 md:w-96 mx-auto mb-4 sm:mb-6"></div>
            <div className="h-3 sm:h-4 bg-gray-700 rounded-md w-24 sm:w-28 md:w-32 mx-auto"></div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg sm:rounded-xl p-1"
                style={{
                  background:
                    "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                }}
              >
                <div className="bg-[#5E2047] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 h-full">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-lg mr-3 sm:mr-4"></div>
                    <div className="h-5 sm:h-6 bg-gray-600 rounded-md w-24 sm:w-28 md:w-32"></div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-full"></div>
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-5/6"></div>
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-3/4"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-16 sm:w-20"></div>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PackagesStepSkeleton = () => {
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pt-0 animate-pulse">
      <div className="max-w-7xl h-full mx-auto">
        {/* Stepper Skeleton */}
        <div className="flex items-center justify-center mb-8 sm:mb-10 md:mb-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-pink-500 border-2 border-pink-500">
                  {index < 2 ? (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white m-2 sm:m-2.5 md:m-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-white text-sm sm:text-base md:text-lg font-bold leading-8 sm:leading-10 md:leading-12 text-center block mt-1 sm:mt-1.5 md:mt-2">
                      3
                    </span>
                  )}
                </div>
                <div className="mt-1 sm:mt-2 h-3 sm:h-4 w-12 sm:w-16 md:w-20 bg-gray-700 rounded-md"></div>
              </div>
              {index < 2 && <div className="w-8 sm:w-12 md:w-20 h-0.5 mx-2 sm:mx-3 md:mx-4 bg-pink-500"></div>}
            </div>
          ))}
        </div>

        {/* Step 3: Package Selection Skeleton */}
        <div className="mb-2">
          {/* Title and description */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-8 sm:h-9 md:h-10 bg-gray-700 rounded-md w-64 sm:w-72 md:w-80 mx-auto mb-3 sm:mb-4"></div>
            <div className="h-5 sm:h-6 bg-gray-700 rounded-md w-72 sm:w-80 md:w-96 mx-auto mb-4 sm:mb-6"></div>
            <div className="h-3 sm:h-4 bg-gray-700 rounded-md w-24 sm:w-28 md:w-32 mx-auto"></div>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg sm:rounded-xl p-1"
                style={{
                  background:
                    "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                }}
              >
                <div className="bg-[#5E2047] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="h-5 sm:h-6 bg-gray-600 rounded-md w-3/4 mb-2 sm:mb-3"></div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="h-5 sm:h-6 w-12 sm:w-14 md:w-16 bg-purple-500/20 rounded-full"></div>
                        <div className="h-5 sm:h-6 w-14 sm:w-16 md:w-20 bg-cyan-500/20 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="h-6 sm:h-7 md:h-8 bg-gray-600 rounded-md w-12 sm:w-14 md:w-16"></div>
                      <div className="h-2 sm:h-3 bg-gray-600 rounded-md w-8 sm:w-10 md:w-12 mt-1"></div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 mb-4 sm:mb-6 flex-grow">
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-full"></div>
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-5/6"></div>
                    <div className="h-3 sm:h-4 bg-gray-600 rounded-md w-4/6"></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
                    <div className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-lg"></div>
                    <div className="flex-1 h-9 sm:h-10 bg-transparent border-2 border-pink-500 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesSkeleton;
