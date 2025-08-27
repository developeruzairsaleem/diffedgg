import React, { useEffect, useState } from "react";
import { lato, orbitron } from "@/fonts/fonts";
import { message } from "antd";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import GamesSkeleton from "@/components/ui/GamesSkeleton"; // Import the new Games skeleton

const GamesComponent = () => {
  const [numGamesMap, setNumGamesMap] = useState<{ [key: string]: number }>({});
  const [numTeammatesMap, setNumTeammatesMap] = useState<{
    [key: string]: number;
  }>({});
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 2. Set initial loading to true
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubpackage, setSelectedSubpackage] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentELO, setCurrentELO] = useState<number>(0);
  const [targetELO, setTargetELO] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // Reset selected service when game changes
  useEffect(() => {
    setSelectedService(null);
    setCurrentStep(selectedGame ? 2 : 1);
  }, [selectedGame]);

  // Reset step when service changes
  useEffect(() => {
    setCurrentStep(selectedService ? 3 : selectedGame ? 2 : 1);
  }, [selectedService]);

  // Reset ELO values when subpackage changes
  useEffect(() => {
    if (selectedSubpackage) {
      setCurrentELO(selectedSubpackage.minELO || 0);
      setTargetELO(selectedSubpackage.maxELO || 1000);
    }
  }, [selectedSubpackage]);

  // Calculate total price for dynamic pricing
  const calculateTotalPrice = () => {
    if (!selectedSubpackage) return 0;

    let basePrice = selectedSubpackage.price;

    // Add selected rank additional cost if a rank is selected
    if (
      Array.isArray(selectedSubpackage.ranks) &&
      selectedSubpackage.ranks.length > 0 &&
      selectedRank &&
      typeof selectedRank.additionalCost === "number"
    ) {
      basePrice += selectedRank.additionalCost;
    }

    // Multiply by number of games if > 1
    if (numGamesMap[selectedSubpackage.id] > 1) {
      basePrice *= numGamesMap[selectedSubpackage.id];
    }

    // Multiply by number of teammates if > 1
    if (numTeammatesMap[selectedSubpackage.id] > 1) {
      basePrice *= numTeammatesMap[selectedSubpackage.id];
    }

    // Dynamic pricing logic
    if (
      selectedSubpackage.dynamicPricing &&
      selectedSubpackage.basePricePerELO
    ) {
      const eloDifference = Math.abs(targetELO - currentELO);
      const eloCost = eloDifference * selectedSubpackage.basePricePerELO;
      return basePrice + eloCost;
    }

    return basePrice;
  };

  // Initialize maps when games are loaded
  useEffect(() => {
    if (games.length > 0) {
      const initialGamesMap: { [key: string]: number } = {};
      const initialTeammatesMap: { [key: string]: number } = {};

      games.forEach((game) => {
        game.services?.forEach((service: any) => {
          service.subpackages?.forEach((subpackage: any) => {
            // Initialize games map with 1 for all subpackages
            initialGamesMap[subpackage.id] = 1;

            // Initialize teammates map based on package type
            if (subpackage.type === "pergame") {
              // For pergame, use requiredProviders as default teammates
              initialTeammatesMap[subpackage.id] =
                subpackage.requiredProviders || 1;
            } else if (subpackage.type === "perteammate") {
              // For perteammate, default to 1 teammate
              initialTeammatesMap[subpackage.id] = 1;
            } else {
              // Default fallback
              initialTeammatesMap[subpackage.id] = 1;
            }
          });
        });
      });

      setNumGamesMap(initialGamesMap);
      setNumTeammatesMap(initialTeammatesMap);
    }
  }, [games]);

  // fetching games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // setLoading is already true, no need to set it again
        const response = await fetch("/api/games");
        if (!response.ok) {
          message.error("Can't fetch the games please reload to retry");
          // Keep loading false so user can see error and maybe a retry button
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (!data || data?.error) {
          message.error(
            data?.error || "something went wrong during games fetching"
          );
          setLoading(false); // Stop loading on error
          return;
        }

        setGames(data);
        // if (data.length > 0) {
        //   setSelectedGame(data[0]);
        // }
      } catch (error) {
        console.error("error fetching", error);
        message.error("Failed to fetch games.");
      } finally {
        setLoading(false); // Stop loading after success or failure
      }
    };

    fetchGames();
  }, []);

  const handleQuickPay = (subpackage: any) => {
    if (selectedSubpackage?.id !== subpackage.id) {
      setSelectedRank(null); // Only reset rank if switching subpackage
    }
    setSelectedSubpackage(subpackage);
    setIsModalOpen(true);
  };

  const handleCheckout = (subpackage: any) => {
    if (selectedSubpackage?.id !== subpackage.id) {
      setSelectedRank(null); // Only reset rank if switching subpackage
    }
    const choosedPackage = { ...subpackage };
    console.log("choosedPackage", choosedPackage);
    console.log("no of games", numGamesMap[selectedSubpackage.id]);
    console.log("no of teammates", numTeammatesMap[selectedSubpackage.id]);
    setSelectedSubpackage(subpackage);
    setIsCheckoutModalOpen(true);
  };
  const confirmCheckout = () => {
    if (!selectedSubpackage) return;

    router.push(
      `/dashboard/customer/checkout/${selectedSubpackage.id}?rankName=${
        selectedRank?.name || ""
      }&numberOfGames=${numGamesMap[selectedSubpackage.id]}&numberOfTeammates=${
        numTeammatesMap[selectedSubpackage.id]
      }
      `
    );
  };

  const confirmQuickPay = async () => {
    if (!selectedSubpackage) return;

    setIsPaying(true);
    try {
      const response = await fetch("/api/quick-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subpackageId: selectedSubpackage.id,
          currentELO: selectedSubpackage.dynamicPricing
            ? currentELO
            : undefined,
          targetELO: selectedSubpackage.dynamicPricing ? targetELO : undefined,
          // Send selected rank if any
          selectedRank: selectedRank ? selectedRank : undefined,
          // Send number of games and teammates
          numberOfGames: numGamesMap[selectedSubpackage.id],
          numberOfTeammates: numTeammatesMap[selectedSubpackage.id],
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success("Payment successful! Redirecting to your order.");
        router.push(`/dashboard/customer/orders/${result.data.id}/pending`);
      } else {
        message.error(result.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Quick pay error:", error);
      message.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsPaying(false);
      setIsModalOpen(false);
    }
  };

  // 3. Render the GamesSkeleton when loading is true
  if (loading) {
    return <GamesSkeleton />;
  }

  const steps = [
    { number: 1, title: "Select Game", completed: !!selectedGame },
    { number: 2, title: "Choose Service", completed: !!selectedService },
    { number: 3, title: "Pick Package", completed: false },
  ];

  const StepperComponent = () => (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep >= step.number
                  ? "border-pink-500 bg-pink-500 text-white"
                  : "border-gray-500 text-gray-400"
              }`}
            >
              {step.completed ? (
                <svg
                  className="w-6 h-6"
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
                step.number
              )}
            </div>
            <span
              className={`mt-2 block mx-auto text-center text-sm font-medium ${
                currentStep >= step.number ? "text-pink-400" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-20 h-0.5 mx-4 transition-all duration-300 ${
                currentStep > step.number ? "bg-pink-500" : "bg-gray-600"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-6 pt-0">
      <div className="max-w-7xl h-full mx-auto">
        {/* Stepper */}
        <StepperComponent />

        {/* Step 1: Game Selection */}
        {currentStep === 1 && (
          <div className="mb-2">
            <h2 className="text-4xl font-semibold text-white mb-4 text-center">
              Select Your Favourite Game
            </h2>
            <p className="text-gray-300 text-center mb-12 text-lg">
              Choose the game you want to boost your performance in
            </p>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {games.map((game, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedGame(game)}
                  className="relative group cursor-pointer rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div
                    className="rounded-xl p-1 h-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                    }}
                  >
                    <div className="bg-[#5E2047] h-full rounded-xl overflow-hidden">
                      <div className="aspect-[5/4] relative">
                        <SafeImage
                          src={game.image}
                          alt={game.name}
                          placeholder="/images/placeholder.png"
                          className="w-full h-full object-cover transition-transform duration-300 "
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {game.name}
                        </h3>
                        <p className="text-gray-200 text-sm">
                          {game?.services?.length || 0} services available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {currentStep === 2 && selectedGame && (
          <div className="mb-2">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-semibold text-white mb-4">
                Choose Your Service
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Select the type of service for{" "}
                <span className="text-pink-400 font-semibold">
                  {selectedGame.name}
                </span>
              </p>
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setCurrentStep(1);
                }}
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                ← Back to Games
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {selectedGame?.services?.map((service: any, index: any) => (
                <div
                  key={index}
                  onClick={() => setSelectedService(service)}
                  className="cursor-pointer group transition-all duration-300 transform hover:scale-105"
                >
                  <div
                    className="rounded-xl h-full p-1"
                    style={{
                      background:
                        "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                    }}
                  >
                    <div className="bg-[#5E2047] rounded-xl p-6 h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r p-3 from-pink-500 to-cyan-400 rounded-lg flex items-center justify-center mr-2">
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </div>
                        <h3
                          className={`${orbitron.className} text-xl font-bold text-white group-hover:text-pink-300 transition-colors`}
                        >
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-pink-400 font-medium">
                          {service?.subpackages?.length || 0} packages
                        </span>
                        <svg
                          className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-gray-400 text-lg">
                    No services available for this game yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Package Selection */}
        {currentStep === 3 && selectedService && (
          <div className="mb-2">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-semibold text-white mb-4">
                Choose Your Package
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Select a package from{" "}
                <span className="text-pink-400 font-semibold">
                  {selectedService.name}
                </span>{" "}
                service
              </p>
              <button
                onClick={() => {
                  setSelectedService(null);
                  setCurrentStep(2);
                }}
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                ← Back to Services
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {selectedService?.subpackages?.map(
                (item: any, itemIndex: any) => (
                  <div
                    key={item.id}
                    className="group transition-all duration-300 transform hover:scale-105"
                  >
                    <div
                      className="rounded-xl h-full p-1"
                      style={{
                        background:
                          "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                      }}
                    >
                      <div className="bg-[#5E2047] rounded-xl p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3
                              className={`${orbitron.className} text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors`}
                            >
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {item?.duration || "Flexible"}
                              </span>
                              {item?.dynamicPricing ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-1"></span>
                                  ELO-Based
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span>
                                  Fixed
                                </span>
                              )}
                            </div>

                            {/* Show ELO Difference if dynamicPricing and minELO/maxELO are present */}
                            {item.dynamicPricing &&
                              typeof item.minELO === "number" &&
                              typeof item.maxELO === "number" && (
                                <div className="mb-3">
                                  <div className="text-xs text-cyan-400 font-semibold">
                                    ELO Range:
                                  </div>
                                  <div className="text-lg text-cyan-300 font-bold">
                                    {item.minELO} - {item.maxELO}
                                  </div>
                                </div>
                              )}

                            {item.type === "perteammate" && (
                              <div className="flex flex-col items-start">
                                <div className="flex items-center gap-5 my-6">
                                  <span className="text-sm text-gray-300 font-semibold">
                                    No. of Games:
                                  </span>
                                  <div>
                                    <button
                                      type="button"
                                      className="px-2 rounded-full bg-red-900 text-white font-bold text-lg"
                                      onClick={() => {
                                        setNumGamesMap((prev) => ({
                                          ...prev,
                                          [item.id]: Math.max(
                                            1,
                                            (prev[item.id] || 1) - 1
                                          ),
                                        }));
                                      }}
                                    >
                                      -
                                    </button>
                                    <span className="px-3 py-1 rounded text-white font-bold text-lg">
                                      {numGamesMap[item.id]}
                                    </span>
                                    <button
                                      type="button"
                                      className="px-2 rounded-full bg-red-900 text-white font-bold text-lg"
                                      onClick={() => {
                                        setNumGamesMap((prev) => ({
                                          ...prev,
                                          [item.id]: (prev[item.id] || 1) + 1,
                                        }));
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-5 my-6">
                                  <span className="text-sm text-gray-300 font-semibold">
                                    No. of Teammates:
                                  </span>
                                  <div>
                                    <button
                                      type="button"
                                      className="px-2 rounded-full bg-red-900 text-white font-bold text-lg"
                                      onClick={() => {
                                        setNumTeammatesMap((prev) => ({
                                          ...prev,
                                          [item.id]: Math.max(
                                            1,
                                            (prev[item.id] || 1) - 1
                                          ),
                                        }));
                                      }}
                                    >
                                      -
                                    </button>
                                    <span className="px-3 py-1 rounded text-white font-bold text-lg">
                                      {numTeammatesMap[item.id]}
                                    </span>
                                    <button
                                      type="button"
                                      className="px-2 rounded-full bg-red-900 text-white font-bold text-lg"
                                      onClick={() => {
                                        setNumTeammatesMap((prev) => ({
                                          ...prev,
                                          [item.id]: (prev[item.id] || 1) + 1,
                                        }));
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* For pergame packages, show fixed teammate count */}
                            {item.type === "pergame" && (
                              <div className="flex flex-col items-start">
                                <div className="flex items-center gap-5 my-6">
                                  <span className="text-sm text-gray-300 font-semibold">
                                    No. of Games:
                                  </span>
                                  <div>
                                    <button
                                      type="button"
                                      className="px-2 rounded-full bg-red-900 text-white font-bold text-lg"
                                      onClick={() => {
                                        setNumGamesMap((prev) => ({
                                          ...prev,
                                          [item.id]: Math.max(
                                            1,
                                            (prev[item.id] || 1) - 1
                                          ),
                                        }));
                                      }}
                                    >
                                      -
                                    </button>
                                    <span className="px-3 py-1 rounded text-white font-bold text-lg">
                                      {numGamesMap[item.id]}
                                    </span>
                                    <button
                                      type="button"
                                      className="px-2 rounded-full bg-red-900 text-white font-bold text-lg"
                                      onClick={() => {
                                        setNumGamesMap((prev) => ({
                                          ...prev,
                                          [item.id]: (prev[item.id] || 1) + 1,
                                        }));
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-5 my-6">
                                  <span className="text-sm text-gray-300 font-semibold">
                                    No of Teammates:
                                  </span>
                                  <span className="px-3 py-1 rounded text-white font-bold text-lg bg-gray-600">
                                    {item.requiredProviders}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    (Fixed)
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Ranks Array Details - Selectable */}
                            {Array.isArray(item.ranks) &&
                              item.ranks.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm text-gray-300 font-semibold mb-1">
                                    Ranks:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {item.ranks.map(
                                      (rank: any, rankIdx: number) => (
                                        <button
                                          key={rankIdx}
                                          type="button"
                                          className={`px-3 py-1 rounded-full border-2 text-xs flex items-center gap-2 focus:outline-none transition-colors relative
                                         ${
                                           selectedSubpackage === item &&
                                           selectedRank?.name === rank.name
                                             ? "bg-pink-500 text-white border-pink-400 shadow-lg scale-105"
                                             : "bg-gray-700/40 text-gray-200 border-gray-600/30 hover:bg-pink-400 hover:text-white"
                                         }
                                       `}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSubpackage(item);
                                            setSelectedRank(
                                              selectedRank?.name === rank.name
                                                ? null
                                                : rank
                                            );
                                          }}
                                        >
                                          {selectedSubpackage === item &&
                                            selectedRank?.name ===
                                              rank.name && (
                                              <span className="absolute left-1 top-1">
                                                <svg
                                                  width="16"
                                                  height="16"
                                                  viewBox="0 0 20 20"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <circle
                                                    cx="10"
                                                    cy="10"
                                                    r="10"
                                                    fill="#fff"
                                                  />
                                                  <path
                                                    d="M6 10.5L9 13.5L14 8.5"
                                                    stroke="#EE2C81"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </svg>
                                              </span>
                                            )}
                                          <span className="font-bold ml-4">
                                            {rank.name}
                                          </span>
                                          <span className="text-cyan-400">
                                            +${rank.additionalCost}
                                          </span>
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-400">
                              ${item?.price}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed mb-6 flex-grow">
                          {item.description}
                        </p>

                        <div className="flex gap-3 mt-auto">
                          <button
                            className={`flex-1 px-4 py-2 flex cursor-pointer items-center justify-center ${lato.className} relative cursor-pointer group
                            bg-gradient-to-r from-pink-500 gap-3 via-purple-500 to-cyan-400
                            transition-all
                            hover:scale-105
                            rounded-lg
                            text-white font-semibold
                          `}
                            onClick={() => handleQuickPay(item)}
                          >
                            QuickPay
                          </button>
                          <button
                            className={`flex-1 px-4 py-2 flex cursor-pointer items-center justify-center ${lato.className} relative cursor-pointer group
                            border-2 border-pink-500 text-pink-400
                            transition-all
                            hover:scale-105 hover:bg-pink-500 hover:text-white
                            rounded-lg
                            font-semibold
                          `}
                            onClick={() => handleCheckout(item)}
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) || (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-400 text-lg">
                    No packages available for this service yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom QuickPay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md mx-4">
            <div
              className="rounded-2xl p-1"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-2xl p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3
                    className={`${orbitron.className} text-2xl font-bold text-white mb-2`}
                  >
                    Confirm Quick Pay
                  </h3>
                  <div
                    className="w-16 h-1 mx-auto rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #00C3FF 0%, #FFFF1C 100%)",
                    }}
                  />
                </div>

                {/* Package Details */}
                {selectedSubpackage && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">Package</span>
                        <span className="text-white font-semibold">
                          {selectedSubpackage.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">
                          Base Price
                        </span>
                        <span className="text-green-400 font-bold text-lg">
                          ${selectedSubpackage.price}
                        </span>
                      </div>

                      {/* Selected Rank Details */}
                      {Array.isArray(selectedSubpackage.ranks) &&
                        selectedSubpackage.ranks.length > 0 &&
                        selectedRank && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-300 text-sm">
                              Selected Rank
                            </span>
                            <span className="text-pink-400 font-semibold">
                              {selectedRank.name}{" "}
                              <span className="text-cyan-400">
                                (+${selectedRank.additionalCost})
                              </span>
                            </span>
                          </div>
                        )}
                      {/* Always show number of games */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">
                          No. of Games
                        </span>
                        <span className="text-pink-400 font-semibold">
                          {numGamesMap[selectedSubpackage.id]}
                        </span>
                      </div>
                      {/* Always show number of teammates */}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">
                          No. of Teammates
                        </span>
                        <span className="text-pink-400 font-semibold">
                          {numTeammatesMap[selectedSubpackage.id]}
                        </span>
                      </div>
                      {/* Conditionally show ELO range if dynamicPricing is true and minELO/maxELO are present */}
                      {selectedSubpackage.dynamicPricing &&
                        typeof selectedSubpackage.minELO === "number" &&
                        typeof selectedSubpackage.maxELO === "number" && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-cyan-400 text-sm font-semibold">
                              ELO Range
                            </span>
                            <span className="text-cyan-300 font-bold">
                              {selectedSubpackage.minELO} -{" "}
                              {selectedSubpackage.maxELO}
                            </span>
                          </div>
                        )}

                      {/* Dynamic Pricing ELO Sliders */}
                      {/* {selectedSubpackage.dynamicPricing &&
                        selectedSubpackage.basePricePerELO && (
                          <div className="space-y-4 pt-3 border-t border-gray-600/50">
                            <div className="text-center">
                              <span className="text-cyan-400 text-sm font-medium">
                                Dynamic Pricing: +$
                                {selectedSubpackage.basePricePerELO}/ELO
                              </span>
                            </div>

               
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-2">
                                <span>Current ELO</span>
                                <span className="text-white font-semibold">
                                  {currentELO}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={selectedSubpackage.minELO || 0}
                                max={selectedSubpackage.maxELO || 1000}
                                value={currentELO}
                                onChange={(e) =>
                                  setCurrentELO(Number(e.target.value))
                                }
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(90deg, #00C3FF 0%, #FFFF1C 100%)`,
                                }}
                              />
                            </div>

                           
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-2">
                                <span>Target ELO</span>
                                <span className="text-white font-semibold">
                                  {targetELO}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={selectedSubpackage.minELO || 0}
                                max={selectedSubpackage.maxELO || 1000}
                                value={targetELO}
                                onChange={(e) =>
                                  setTargetELO(Number(e.target.value))
                                }
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(90deg, #00C3FF 0%, #FFFF1C 100%)`,
                                }}
                              />
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300">
                                  ELO Difference
                                </span>
                                <span className="text-cyan-400 font-semibold">
                                  {Math.abs(targetELO - currentELO)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">
                                  Additional Cost
                                </span>
                                <span className="text-cyan-400 font-semibold">
                                  $
                                  {(
                                    Math.abs(targetELO - currentELO) *
                                    selectedSubpackage.basePricePerELO
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )} */}

                      {/* Total Price */}
                      <div className="pt-3 border-t border-gray-600/50">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">
                            Total Price
                          </span>
                          <span className="text-green-400 font-bold text-xl">
                            ${calculateTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        <div className="text-center text-gray-400 text-xs mt-1">
                          This amount will be deducted from your wallet balance
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmQuickPay}
                    disabled={isPaying}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                    }}
                  >
                    {isPaying ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      "Confirm & Pay"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal for continue to checkout */}
      {/* Custom QuickPay Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCheckoutModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md mx-4">
            <div
              className="rounded-2xl p-1"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-2xl p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3
                    className={`${orbitron.className} text-2xl font-bold text-white mb-2`}
                  >
                    Continue to Checkout
                  </h3>
                  <div
                    className="w-16 h-1 mx-auto rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #00C3FF 0%, #FFFF1C 100%)",
                    }}
                  />
                </div>

                {/* Package Details */}
                {selectedSubpackage && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">Package</span>
                        <span className="text-white font-semibold">
                          {selectedSubpackage.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">
                          Base Price
                        </span>
                        <span className="text-green-400 font-bold text-lg">
                          ${selectedSubpackage.price}
                        </span>
                      </div>
                      {/* Selected Rank Details */}
                      {Array.isArray(selectedSubpackage.ranks) &&
                        selectedSubpackage.ranks.length > 0 &&
                        selectedRank && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-300 text-sm">
                              Selected Rank
                            </span>
                            <span className="text-pink-400 font-semibold">
                              {selectedRank.name}{" "}
                              <span className="text-cyan-400">
                                (+${selectedRank.additionalCost})
                              </span>
                            </span>
                          </div>
                        )}
                      {/* Always show number of games */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm">
                          No. of Games
                        </span>
                        <span className="text-pink-400 font-semibold">
                          {numGamesMap[selectedSubpackage.id]}
                        </span>
                      </div>
                      {/* Always show number of teammates */}
                      {
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-300 text-sm">
                            No. of Teammates
                          </span>
                          <span className="text-pink-400 font-semibold">
                            {numTeammatesMap[selectedSubpackage.id]}
                          </span>
                        </div>
                      }
                      {/* Conditionally show ELO range if dynamicPricing is true and minELO/maxELO are present */}
                      {selectedSubpackage.dynamicPricing &&
                        typeof selectedSubpackage.minELO === "number" &&
                        typeof selectedSubpackage.maxELO === "number" && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-cyan-400 text-sm font-semibold">
                              ELO Range
                            </span>
                            <span className="text-cyan-300 font-bold">
                              {selectedSubpackage.minELO} -{" "}
                              {selectedSubpackage.maxELO}
                            </span>
                          </div>
                        )}
                      {/* Dynamic Pricing ELO Sliders */}
                      {/* {selectedSubpackage.dynamicPricing &&
                        selectedSubpackage.basePricePerELO && (
                          <div className="space-y-4 pt-3 border-t border-gray-600/50">
                            <div className="text-center">
                              <span className="text-cyan-400 text-sm font-medium">
                                Dynamic Pricing: +$
                                {selectedSubpackage.basePricePerELO}/ELO
                              </span>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-2">
                                <span>Current ELO</span>
                                <span className="text-white font-semibold">
                                  {currentELO}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={selectedSubpackage.minELO || 0}
                                max={selectedSubpackage.maxELO || 1000}
                                value={currentELO}
                                onChange={(e) =>
                                  setCurrentELO(Number(e.target.value))
                                }
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(90deg, #00C3FF 0%, #FFFF1C 100%)`,
                                }}
                              />
                            </div>

                           
                            <div>
                              <div className="flex justify-between text-sm text-gray-300 mb-2">
                                <span>Target ELO</span>
                                <span className="text-white font-semibold">
                                  {targetELO}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={selectedSubpackage.minELO || 0}
                                max={selectedSubpackage.maxELO || 1000}
                                value={targetELO}
                                onChange={(e) =>
                                  setTargetELO(Number(e.target.value))
                                }
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(90deg, #00C3FF 0%, #FFFF1C 100%)`,
                                }}
                              />
                            </div>

                            
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300">
                                  ELO Difference
                                </span>
                                <span className="text-cyan-400 font-semibold">
                                  {Math.abs(targetELO - currentELO)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">
                                  Additional Cost
                                </span>
                                <span className="text-cyan-400 font-semibold">
                                  $
                                  {(
                                    Math.abs(targetELO - currentELO) *
                                    selectedSubpackage.basePricePerELO
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )} */}

                      {/* Total Price */}
                      <div className="pt-3 border-t border-gray-600/50">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">
                            Total Price
                          </span>
                          <span className="text-green-400 font-bold text-xl">
                            ${calculateTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        <div className="text-center text-gray-400 text-xs mt-1">
                          This amount will be deducted on the checkout
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmCheckout}
                    disabled={isPaying}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
                    }}
                  >
                    {isPaying ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      "Continue to Checkout"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(90deg, #00c3ff 0%, #ffff1c 100%);
          cursor: pointer;
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(90deg, #00c3ff 0%, #ffff1c 100%);
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default GamesComponent;
